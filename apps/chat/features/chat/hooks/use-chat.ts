'use client';

import { useCallback, useEffect, useState } from 'react';
import { useProjectsStore } from '@/stores/projects-store';
import { useChatStore } from '@/stores/chat-store';
import { useUiStore } from '@/stores/ui-store';
import { isApiError } from '@/lib/errors';
import { useChatSession } from '../api/get-chat-session';
import { useMarkMessageFailed } from '../api/mark-message-failed';
import { useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat-service';
import { chatKeys } from '@/lib/react-query/query-keys';
import { useRouter } from 'next/navigation';
import type { MarkMessageFailedRequest } from '@raweval/types';

export function useChat(pathId?: string) {
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const touchProject = useProjectsStore((s) => s.touchProject);
  const projects = useProjectsStore((s) => s.projects);

  const projectId =
    pathId ?? (selectedProjectId === 'p1' ? 'p1' : (selectedProjectId ?? 'p1'));
  const currentProject = projects.find((p) => p.id === projectId);
  const backendSessionId =
    currentProject?.backendId ??
    (projectId !== 'p1' && !isNaN(Number(projectId))
      ? Number(projectId)
      : undefined);

  const messagesByProject = useChatStore((s) => s.messagesByProject);
  const selectedModel = useChatStore((s) => s.selectedModel);
  const sendUserMessage = useChatStore((s) => s.sendUserMessage);
  const appendAssistantMessage = useChatStore((s) => s.appendAssistantMessage);
  const appendToken = useChatStore((s) => s.appendToken);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const setIsStreaming = useChatStore((s) => s.setIsStreaming);
  const setMessages = useChatStore((s) => s.setMessages);
  const webSearchEnabled = useChatStore((s) => s.webSearchEnabled);
  const getMessages = useChatStore((s) => s.getMessages);
  const clearProject = useChatStore((s) => s.clearProject);

  const queryClient = useQueryClient();
  const router = useRouter();

  const messages = (messagesByProject[projectId] ?? []).map((m) => ({
    ...m,
    createdAt: new Date(m.createdAt),
  }));

  const [error, setError] = useState<string | null>(null);
  const [markingWrong, setMarkingWrong] = useState<Set<string>>(new Set());
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  // -------------------------------------------------------------------------
  // Auto-fetch session messages from backend using React Query
  // -------------------------------------------------------------------------
  const { data: sessionData, isLoading: isSessionLoading } =
    useChatSession(backendSessionId);

  // Update local store when query data changes (or derive completely from query)
  useEffect(() => {
    if (sessionData?.messages && sessionData.messages.length > 0) {
      // Group assistant messages by turn_number to reconstruct multi-model groups
      const turnGroups = new Map<number, string>();
      const rawMsgs: any[] = sessionData.messages;

      // First pass: find turns with multiple assistant messages (multi-model)
      const turnCounts = new Map<number, number>();
      for (const m of rawMsgs) {
        if (m.role === 'assistant' && m.turn_number != null) {
          turnCounts.set(m.turn_number, (turnCounts.get(m.turn_number) || 0) + 1);
        }
      }
      // Assign groupIds to turns with 2+ assistant messages
      for (const [turn, count] of turnCounts) {
        if (count > 1) {
          turnGroups.set(turn, `group_restored_${backendSessionId}_${turn}`);
        }
      }

      const formattedMessages = rawMsgs.map(
        (m: any, idx: number) => ({
          id: m.id ? String(m.id) : `${backendSessionId}-${idx}`,
          role: m.role || 'user',
          content: m.content || '',
          model: m.model || undefined,
          provider: m.provider || undefined,
          isFailed: m.metadata?.marked_failed === true,
          latencyMs: m.latency_ms ?? undefined,
          tokensUsed: m.tokens_used != null ? { total: m.tokens_used } : undefined,
          groupId: m.role === 'assistant' && m.turn_number != null
            ? turnGroups.get(m.turn_number)
            : undefined,
          createdAt: new Date(
            m.created_at || m.timestamp || sessionData.created_at || Date.now()
          ).getTime(),
        })
      );
      // Only set messages if the store is empty for this project to avoid overwriting optimistic updates
      // during active typing
      if (messages.length === 0) {
        setMessages(projectId, formattedMessages);
      }
    }
  }, [sessionData, backendSessionId, projectId, setMessages, messages.length]);

  const markMessageFailedMutation = useMarkMessageFailed();

  // -------------------------------------------------------------------------
  // Send Message — uses new /chat/sessions/{id}/messages endpoint
  // -------------------------------------------------------------------------
  const sendMessage = useCallback(
    async (content: string, images?: string[], files?: File[]) => {
      sendUserMessage(projectId, content, images);
      touchProject(projectId);
      setError(null);
      setUpgradeRequired(false);

      try {
        // Collect image files from data URLs
        const imageFiles: File[] = [];
        if (images?.length) {
          for (const imageUrl of images) {
            try {
              if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
                const blob = await fetch(imageUrl).then((r) => r.blob());
                const ext = blob.type.split('/')[1] || 'png';
                imageFiles.push(
                  new File([blob], `image-${Date.now()}.${ext}`, {
                    type: blob.type,
                  })
                );
              }
            } catch {
              // skip invalid images
            }
          }
        }

        const allFiles = [...imageFiles, ...(files ?? [])];

        let activeBackendId = backendSessionId;
        let targetProjectId = projectId;

        // 1) Ensure backend session exists
        if (!activeBackendId) {
          const newSession = await chatService.createSession({
            workflow_type: 'single_model',
          });
          activeBackendId = newSession.id;
          targetProjectId = String(activeBackendId);

          const existingMsgs = getMessages(projectId);
          if (existingMsgs.length > 0) {
            setMessages(targetProjectId, existingMsgs);
          }

          router.replace(`/chat/${activeBackendId}`);

          useProjectsStore
            .getState()
            .loadProjects()
            .catch((err) => {
              console.error('Failed to sync projects on new chat', err);
            });
        }

        // 2) Upload files and collect attachment IDs
        let attachmentIds: number[] = [];
        if (allFiles.length > 0) {
          for (const file of allFiles) {
            try {
              const att = await chatService.uploadAttachment(
                activeBackendId,
                file
              );
              attachmentIds.push(att.attachment_id);
            } catch (uploadErr) {
              console.error('File upload failed:', uploadErr);
            }
          }
        }

        // Determine if we're in compare mode
        const currentCompareMode = useChatStore.getState().compareMode;
        const currentSelectedModels = useChatStore.getState().selectedModels;
        const isComparing = currentCompareMode && currentSelectedModels.length > 1;

        if (isComparing) {
          // --- Multi-model compare mode ---
          const groupId = `group_${Date.now()}`;
          const tempIds: Record<string, string> = {};

          for (const m of currentSelectedModels) {
            const key = `${m.provider}:${m.model}`;
            const tid = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            tempIds[key] = tid;

            const currentMsgs = useChatStore.getState().getMessages(targetProjectId);
            useChatStore.getState().setMessages(targetProjectId, [
              ...currentMsgs,
              {
                id: tid,
                role: 'assistant' as const,
                content: '',
                createdAt: Date.now(),
                isStreaming: true,
                model: m.model,
                provider: m.provider,
                groupId,
              },
            ]);
          }

          await chatService.streamMessage(
            activeBackendId,
            content,
            {
              models: currentSelectedModels.map((m) => ({
                provider: m.provider,
                model: m.model,
              })),
              temperature: 0.7,
              attachmentIds:
                attachmentIds.length > 0 ? attachmentIds : undefined,
              webSearch: webSearchEnabled,
            },
            {
              onChunk: (provider, model, delta) => {
                const key = `${provider}:${model}`;
                const tid = tempIds[key];
                if (tid) appendToken(targetProjectId, tid, delta);
              },
              onModelComplete: (data) => {
                const key = `${data.provider}:${data.model}`;
                const tid = tempIds[key];
                if (tid) {
                  setIsStreaming(targetProjectId, tid, false);
                  updateMessage(targetProjectId, tid, {
                    latencyMs: data.latency_ms,
                    tokensUsed: data.tokens_used,
                  });
                }
              },
              onModelError: (data) => {
                const key = `${data.provider}:${data.model}`;
                const tid = tempIds[key];
                if (tid) {
                  setIsStreaming(targetProjectId, tid, false);
                  updateMessage(targetProjectId, tid, {
                    modelError: data.error,
                    content: `⚠️ **Error:** ${data.error}`,
                  });
                }
              },
              onDone: () => {
                // Ensure all are marked done
                for (const tid of Object.values(tempIds)) {
                  setIsStreaming(targetProjectId, tid, false);
                }
                touchProject(targetProjectId);

                if (activeBackendId) {
                  queryClient.invalidateQueries({
                    queryKey: chatKeys.session(activeBackendId),
                  });
                  queryClient.invalidateQueries({
                    queryKey: chatKeys.sessions(),
                  });
                }

                useProjectsStore
                  .getState()
                  .loadProjects()
                  .catch(console.error);
              },
              onError: (err) => {
                for (const tid of Object.values(tempIds)) {
                  setIsStreaming(targetProjectId, tid, false);
                }
                const msg = isApiError(err)
                  ? err.message || 'Failed to send message.'
                  : err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred.';
                setError(msg);
              },
            }
          );
        } else {
          // --- Single model mode (existing behavior) ---
          const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          appendAssistantMessage(targetProjectId, '', false, tempId, true);
          setIsStreaming(targetProjectId, tempId, true);

          // 3) Start streaming the message
          await chatService.streamMessage(
            activeBackendId,
            content,
            {
              model: selectedModel.provider,
              modelName: selectedModel.model,
              models: [
                {
                  provider: selectedModel.provider,
                  model: selectedModel.model,
                },
              ],
              temperature: 0.7,
              attachmentIds:
                attachmentIds.length > 0 ? attachmentIds : undefined,
              webSearch: webSearchEnabled,
            },
            {
              onChunk: (_provider, _model, delta) => {
                // Stream content natively to the placeholder
                appendToken(targetProjectId, tempId, delta);
              },
              onDone: (_data) => {
                setIsStreaming(targetProjectId, tempId, false);
                touchProject(targetProjectId);

                if (activeBackendId) {
                  queryClient.invalidateQueries({
                    queryKey: chatKeys.session(activeBackendId),
                  });
                  queryClient.invalidateQueries({
                    queryKey: chatKeys.sessions(),
                  });
                }

                // Reload sidebar projects so the new session title appears
                useProjectsStore
                  .getState()
                  .loadProjects()
                  .catch(console.error);
              },
              onError: (err) => {
                setIsStreaming(targetProjectId, tempId, false);

                // Reuse existing robust error extraction
                if (isApiError(err)) {
                  if (err.statusCode === 402) {
                    setUpgradeRequired(true);
                    setError(
                      'This model requires a subscription upgrade. Please upgrade your plan to continue.'
                    );
                    return;
                  }
                  if (err.statusCode === 403) {
                    const resData = err.response as any;
                    const nestedMsgObj =
                      resData?.error?.message ||
                      resData?.message ||
                      resData?.error ||
                      resData;
                    if (
                      nestedMsgObj?.error === 'SUBSCRIPTION_REQUIRED' ||
                      nestedMsgObj?.code === 'SUBSCRIPTION_REQUIRED'
                    ) {
                      const dispMsg =
                        nestedMsgObj?.message ||
                        'This model requires a premium subscription. Please upgrade your plan to use it.';
                      appendAssistantMessage(
                        targetProjectId,
                        `⚠️ **Subscription Required**\n\n${dispMsg}`,
                        false
                      );
                      openUpgradeModal();
                      return;
                    }
                  }
                  if (err.statusCode === 429) {
                    setError(
                      'Rate limit exceeded. Please wait a moment before sending another message.'
                    );
                    return;
                  }
                }
                const msg = isApiError(err)
                  ? err.message || 'Failed to send message.'
                  : err.message || 'An unexpected error occurred.';
                setError(msg);
                appendAssistantMessage(targetProjectId, `Error: ${msg}`, false);
              },
            }
          );
        }
      } catch (err) {
        // any synchronous errors before stream initialization
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      appendAssistantMessage,
      appendToken,
      updateMessage,
      backendSessionId,
      projectId,
      selectedModel,
      sendUserMessage,
      touchProject,
      webSearchEnabled,
      setIsStreaming,
      getMessages,
      setMessages,
      clearProject,
      router,
    ]
  );

  // -------------------------------------------------------------------------
  // Mark As Wrong — uses /api/v1/chat/sessions/{session_id}/messages/{message_id}/mark-failed
  // -------------------------------------------------------------------------
  const markAsWrong = useCallback(
    async (messageId: string, request?: MarkMessageFailedRequest) => {
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      const message = messages[messageIndex];

      if (!message || message.role !== 'assistant') return;

      // Prevent double-submitting
      if (markingWrong.has(messageId)) return;
      setMarkingWrong((prev) => new Set([...prev, messageId]));

      try {
        if (!backendSessionId) {
          throw new Error(
            'No backend session linked to this conversation. Please wait for the first message to process.'
          );
        }

        // Extract a numeric message ID.
        // IDs can be:
        //   "456"           → backend numeric ID (use directly)
        //   "333-2"         → fallback format backendSessionId-index (need to look up from session data)
        //   "temp_123_abc"  → temp streaming ID (not yet confirmed by backend)
        let numericMessageId: number | undefined;

        // First try: parse the ID directly as a number
        const directParse = parseInt(messageId, 10);
        if (!isNaN(directParse) && String(directParse) === messageId) {
          numericMessageId = directParse;
        }

        // Second try: if it's a fallback "sessionId-index" format, look up the real ID
        // from the session data returned by React Query
        if (numericMessageId === undefined && sessionData?.messages) {
          // Find the message in backend data by matching content or index
          const localMsg = messages[messageIndex];
          if (localMsg) {
            // Try to find by matching content in backend messages
            const backendMsg = sessionData.messages.find(
              (m: any) =>
                m.role === 'assistant' &&
                m.content &&
                localMsg.content &&
                m.content.slice(0, 100) === localMsg.content.slice(0, 100)
            );
            if (backendMsg?.id) {
              numericMessageId = typeof backendMsg.id === 'number'
                ? backendMsg.id
                : parseInt(String(backendMsg.id), 10);
            }
          }
        }

        // Third try: for "sessionId-index" format, use the index to find the nth assistant message
        if (numericMessageId === undefined && messageId.includes('-') && sessionData?.messages) {
          const idx = parseInt(messageId.split('-')[1] || '', 10);
          if (!isNaN(idx) && sessionData.messages[idx]?.id) {
            numericMessageId = typeof sessionData.messages[idx].id === 'number'
              ? sessionData.messages[idx].id
              : parseInt(String(sessionData.messages[idx].id), 10);
          }
        }

        if (!numericMessageId || isNaN(numericMessageId)) {
          setError('Error: Could not resolve message ID. Please reload and try again.');
          setTimeout(() => setError(null), 5000);
          setMarkingWrong((prev) => {
            const next = new Set(prev);
            next.delete(messageId);
            return next;
          });
          return;
        }

        markMessageFailedMutation.mutate(
          { sessionId: backendSessionId, messageId: numericMessageId, request },
          {
            onSuccess: () => {
              // Update the message in the store to show as failed
              const currentMsgs = useChatStore.getState().getMessages(projectId);
              const updated = currentMsgs.map((m) =>
                m.id === messageId ? { ...m, isFailed: true } : m
              );
              setMessages(projectId, updated);

              setError(
                "✓ Marked as failed! Our workbench team will review this response. You'll receive your wallet credit upon successful QC."
              );
              setTimeout(() => setError(null), 6000);
            },
            onError: (err: unknown) => {
              const msg = isApiError(err)
                ? err.message || 'Failed to mark message as wrong.'
                : 'An unexpected error occurred. Please try again.';
              setError(`Error: ${msg}`);
              setTimeout(() => setError(null), 5000);
            },
            onSettled: () => {
              setMarkingWrong((prev) => {
                const next = new Set(prev);
                next.delete(messageId);
                return next;
              });
            },
          }
        );
      } catch {
        // synchronous errors before mutation
        setMarkingWrong((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }
    },
    [messages, backendSessionId, markingWrong, markMessageFailedMutation, sessionData]
  );

  const approveMessage = useCallback((_messageId: string) => {
    // Placeholder — approve endpoint not yet in API
  }, []);

  return {
    messages,
    isSessionLoading,
    sendMessage,
    markAsWrong,
    approveMessage,
    error,
    markingWrong,
    upgradeRequired,
  };
}
