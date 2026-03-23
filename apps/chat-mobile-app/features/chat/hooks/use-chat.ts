/**
 * useChat — Main chat orchestration hook.
 * Supports single-model and multi-model (compare) streaming.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useShallow } from 'zustand/shallow';

import { chatKeys } from '@/lib/react-query/query-keys';
import { logger } from '@/lib/logger';
import { useChatSession } from '@/features/chat/api/get-chat-session';
import { chatService } from '@/services/chat-service';
import { useChatStore } from '@/stores/chat-store';
import { useProjectsStore } from '@/stores/projects-store';
import { isApiError } from '@/lib/errors';
import type { ChatMessage } from '@/features/chat/types';
import type { MarkMessageFailedRequest } from '@raweval/types';

interface UseChatReturn {
  messages: ChatMessage[];
  isSessionLoading: boolean;
  sendMessage: (content: string, images?: string[]) => Promise<void>;
  markAsWrong: (messageId: string, request?: MarkMessageFailedRequest) => Promise<void>;
  error: string | null;
  markingWrong: Set<string>;
  upgradeRequired: boolean;
}

export function useChat(): UseChatReturn {
  const queryClient = useQueryClient();

  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const projects = useProjectsStore((s) => s.projects);
  const touchProject = useProjectsStore((s) => s.touchProject);
  const setBackendId = useProjectsStore((s) => s.setBackendId);

  const sendUserMessage = useChatStore((s) => s.sendUserMessage);
  const appendAssistantMessage = useChatStore((s) => s.appendAssistantMessage);
  const appendToken = useChatStore((s) => s.appendToken);
  const setIsStreaming = useChatStore((s) => s.setIsStreaming);
  const setMessages = useChatStore((s) => s.setMessages);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const getMessages = useChatStore((s) => s.getMessages);
  const selectedModel = useChatStore((s) => s.selectedModel);
  const compareMode = useChatStore((s) => s.compareMode);
  const selectedModels = useChatStore((s) => s.selectedModels);
  const webSearchEnabled = useChatStore((s) => s.webSearchEnabled);

  const projectId = selectedProjectId ?? 'p1';
  const currentProject = projects.find((p) => p.id === projectId);
  const backendSessionId = currentProject?.backendId;

  const messages = useChatStore(useShallow((s) => s.messagesByProject[projectId] ?? []));

  const [error, setError] = useState<string | null>(null);
  const [markingWrong, setMarkingWrong] = useState<Set<string>>(new Set());
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const isSendingRef = useRef(false);
  const backendIdRef = useRef(backendSessionId);
  backendIdRef.current = backendSessionId;

  const { data: sessionData, isLoading: isSessionLoading } = useChatSession(
    backendSessionId && backendSessionId > 0 ? backendSessionId : null
  );

  // Sync backend messages
  useEffect(() => {
    if (!sessionData?.messages || !projectId || messages.length > 0) return;
    const rawMsgs = sessionData.messages as Record<string, unknown>[];

    // Detect multi-model groups by turn_number
    const turnCounts = new Map<number, number>();
    for (const m of rawMsgs) {
      if (m.role === 'assistant' && m.turn_number != null) {
        turnCounts.set(m.turn_number as number, (turnCounts.get(m.turn_number as number) ?? 0) + 1);
      }
    }
    const turnGroups = new Map<number, string>();
    for (const [turn, count] of turnCounts) {
      if (count > 1) turnGroups.set(turn, `group_${backendSessionId}_${turn}`);
    }

    // Build attachment lookup from session-level attachments
    const sessionAttachments = (sessionData.attachments ?? []) as Record<string, unknown>[];
    const imageUrlMap = new Map<number, string[]>();
    for (const att of sessionAttachments) {
      const contentType = String(att.content_type ?? '');
      const url = String(att.s3_url ?? att.url ?? '');
      const msgId = att.message_id as number | undefined;
      if (url && contentType.startsWith('image/') && msgId) {
        if (!imageUrlMap.has(msgId)) imageUrlMap.set(msgId, []);
        imageUrlMap.get(msgId)!.push(url);
      }
    }

    const formatted: ChatMessage[] = rawMsgs.map((m, idx) => {
      const msgId = m.id as number | undefined;
      // Collect images from: session attachments, message-level attachments, or inline
      const msgAttachments = (m.attachments ?? []) as Record<string, unknown>[];
      const inlineImages = msgAttachments
        .filter((a) => String(a.content_type ?? '').startsWith('image/'))
        .map((a) => String(a.s3_url ?? a.url ?? ''))
        .filter(Boolean);
      const sessionImages = msgId ? (imageUrlMap.get(msgId) ?? []) : [];
      const allImages = [...new Set([...inlineImages, ...sessionImages])];

      return {
        id: msgId ? String(msgId) : `${backendSessionId}-${idx}`,
        role: (m.role as string) === 'user' ? ('user' as const) : ('assistant' as const),
        content: String(m.content ?? ''),
        verified: false,
        createdAt: m.created_at ? new Date(m.created_at as string).getTime() : Date.now(),
        model: (m.model as string) ?? undefined,
        provider: (m.provider as string) ?? undefined,
        isFailed: !!(m.metadata as Record<string, unknown> | undefined)?.marked_failed,
        groupId: m.role === 'assistant' && m.turn_number != null ? turnGroups.get(m.turn_number as number) : undefined,
        images: allImages.length > 0 ? allImages : undefined,
      };
    });
    setMessages(projectId, formatted);
  }, [sessionData, backendSessionId, projectId, setMessages, messages.length]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 8000);
    return () => clearTimeout(t);
  }, [error]);

  // ---------------------------------------------------------------------------
  // Send Message — supports single & multi-model
  // ---------------------------------------------------------------------------
  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      if (!content.trim() || isSendingRef.current) return;
      isSendingRef.current = true;
      setError(null);
      setUpgradeRequired(false);

      sendUserMessage(projectId, content, images);
      touchProject(projectId);

      try {
        let sessionId = backendIdRef.current;
        if (!sessionId) {
          const session = await chatService.createSession({ workflow_type: 'single_model' });
          sessionId = session.id;
          setBackendId(projectId, sessionId);
          backendIdRef.current = sessionId;
        }

        // Upload images/files and collect attachment IDs
        const attachmentIds: number[] = [];
        if (images?.length) {
          for (const uri of images) {
            try {
              const filename = uri.split('/').pop() ?? `image_${Date.now()}.jpg`;
              const resp = await chatService.uploadAttachment(sessionId, {
                uri,
                name: filename,
                type: 'image/jpeg',
              } as unknown as File);
              if (resp.attachment_id) attachmentIds.push(resp.attachment_id);
            } catch (e) {
              logger.warn('[useChat] Image upload failed:', e);
            }
          }
        }

        const isComparing = compareMode && selectedModels.length > 1;

        if (isComparing) {
          // --- MULTI-MODEL COMPARE ---
          const groupId = `group_${Date.now()}`;
          const tempIds: Record<string, string> = {};

          for (const m of selectedModels) {
            const key = `${m.provider}:${m.model}`;
            const tid = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            tempIds[key] = tid;
            appendAssistantMessage(projectId, '', false, tid, true, m.model, m.provider, groupId);
          }

          await chatService.streamMessage(
            sessionId,
            content,
            {
              models: selectedModels.map((m) => ({ provider: m.provider, model: m.model })),
              temperature: 0.7,
              webSearch: webSearchEnabled,
              attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
            },
            {
              onChunk: (provider, model, delta) => {
                const tid = tempIds[`${provider}:${model}`];
                if (tid) appendToken(projectId, tid, delta);
              },
              onModelComplete: (data) => {
                const d = data as Record<string, unknown>;
                const tid = tempIds[`${d.provider}:${d.model}`];
                if (tid) {
                  setIsStreaming(projectId, tid, false);
                  if (d.message_id) updateMessage(projectId, tid, { id: String(d.message_id) });
                }
              },
              onModelError: (data) => {
                const tid = tempIds[`${data.provider}:${data.model}`];
                if (tid) {
                  setIsStreaming(projectId, tid, false);
                  updateMessage(projectId, tid, { content: `Error: ${data.error}`, modelError: data.error });
                }
              },
              onDone: () => {
                for (const tid of Object.values(tempIds)) setIsStreaming(projectId, tid, false);
                touchProject(projectId);
                const sid = backendIdRef.current;
                if (sid) {
                  queryClient.invalidateQueries({ queryKey: chatKeys.session(sid) });
                  queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
                  // Fetch updated title from backend
                  chatService.getChatSessionById(sid, false, false).then((s) => {
                    if (s.title) useProjectsStore.getState().renameProject(projectId, s.title);
                  }).catch(() => {});
                }
                useProjectsStore.getState().loadProjects().catch(() => {});
              },
              onError: (err) => {
                for (const tid of Object.values(tempIds)) setIsStreaming(projectId, tid, false);
                setError(err instanceof Error ? err.message : 'Multi-model request failed.');
              },
            }
          );
        } else {
          // --- SINGLE MODEL ---
          const tempId = `temp_${Date.now()}`;
          appendAssistantMessage(projectId, '', false, tempId, true, selectedModel.model, selectedModel.provider);

          await chatService.streamMessage(
            sessionId,
            content,
            {
              model: selectedModel.provider,
              modelName: selectedModel.model,
              models: [{ provider: selectedModel.provider, model: selectedModel.model }],
              temperature: 0.7,
              webSearch: webSearchEnabled,
              attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
            },
            {
              onChunk: (_p, _m, delta) => appendToken(projectId, tempId, delta),
              onModelComplete: (data) => {
                setIsStreaming(projectId, tempId, false);
                const d = data as Record<string, unknown>;
                if (d.message_id) updateMessage(projectId, tempId, { id: String(d.message_id) });
              },
              onModelError: (data) => {
                setIsStreaming(projectId, tempId, false);
                updateMessage(projectId, tempId, { content: `Error: ${data.error}`, isFailed: true });
              },
              onDone: () => {
                setIsStreaming(projectId, tempId, false);
                touchProject(projectId);
                const sid = backendIdRef.current;
                if (sid) {
                  queryClient.invalidateQueries({ queryKey: chatKeys.session(sid) });
                  queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
                  // Fetch updated title from backend
                  chatService.getChatSessionById(sid, false, false).then((sess) => {
                    if (sess.title) useProjectsStore.getState().renameProject(projectId, sess.title);
                  }).catch(() => {});
                }
                useProjectsStore.getState().loadProjects().catch(() => {});
              },
              onError: (err) => {
                setIsStreaming(projectId, tempId, false);
                if (isApiError(err)) {
                  if (err.statusCode === 402) { setUpgradeRequired(true); setError('Subscription required.'); return; }
                  if (err.statusCode === 429) { setError('Rate limit reached. Wait a moment.'); return; }
                }
                setError(err instanceof Error ? err.message : 'Failed to send message.');
              },
            }
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message.');
      } finally {
        isSendingRef.current = false;
      }
    },
    [
      projectId, selectedModel, compareMode, selectedModels, webSearchEnabled,
      sendUserMessage, touchProject, setBackendId,
      appendAssistantMessage, appendToken, setIsStreaming, updateMessage,
      queryClient,
    ]
  );

  // Mark As Wrong
  const markAsWrong = useCallback(
    async (messageId: string, request?: MarkMessageFailedRequest) => {
      const sid = backendIdRef.current;
      if (markingWrong.has(messageId) || !sid) {
        if (!sid) setError('No backend session yet.');
        return;
      }
      setMarkingWrong((prev) => new Set(prev).add(messageId));
      try {
        let numericId = parseInt(messageId, 10);
        if (isNaN(numericId) && sessionData?.messages) {
          const local = messages.find((m) => m.id === messageId);
          if (local) {
            const backend = (sessionData.messages as Record<string, unknown>[]).find(
              (m) => m.role === 'assistant' && String(m.content ?? '').slice(0, 80) === local.content.slice(0, 80)
            );
            if (backend?.id) numericId = Number(backend.id);
          }
        }
        if (isNaN(numericId) || numericId <= 0) { setError('Cannot resolve message ID.'); return; }
        await chatService.markMessageFailed(sid, numericId, request);
        const current = getMessages(projectId);
        setMessages(projectId, current.map((m) => (m.id === messageId ? { ...m, isFailed: true } : m)));
        setError('Marked as failed. QC team will review.');
      } catch (err) {
        setError(isApiError(err) ? err.message : 'Failed to mark message.');
      } finally {
        setMarkingWrong((prev) => { const n = new Set(prev); n.delete(messageId); return n; });
      }
    },
    [projectId, markingWrong, messages, sessionData, getMessages, setMessages]
  );

  return { messages, isSessionLoading, sendMessage, markAsWrong, error, markingWrong, upgradeRequired };
}
