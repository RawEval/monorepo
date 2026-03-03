'use client';

import { useCallback, useEffect, useState } from 'react';
import { useProjectsStore } from '@/stores/projects-store';
import { useChatStore } from '@/stores/chat-store';
import { useUiStore } from '@/stores/ui-store';
import { isApiError } from '@/lib/errors';
import { getStoredToken } from '@/lib/auth';
import { useChatSession } from '../api/get-chat-session';
import { useSendMessage } from '../api/send-message';
import { useMarkMessageFailed } from '../api/mark-message-failed';

export function useChat() {
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const touchProject = useProjectsStore((s) => s.touchProject);
  const setBackendId = useProjectsStore((s) => s.setBackendId);
  const projects = useProjectsStore((s) => s.projects);

  const projectId = selectedProjectId ?? 'p1';
  const currentProject = projects.find((p) => p.id === projectId);
  const backendSessionId = currentProject?.backendId;

  const messagesByProject = useChatStore((s) => s.messagesByProject);
  const selectedModel = useChatStore((s) => s.selectedModel);
  const typingByProject = useChatStore((s) => s.typingByProject);
  const sendUserMessage = useChatStore((s) => s.sendUserMessage);
  const appendAssistantMessage = useChatStore((s) => s.appendAssistantMessage);
  const setTyping = useChatStore((s) => s.setTyping);
  const setMessages = useChatStore((s) => s.setMessages);

  const messages = (messagesByProject[projectId] ?? []).map((m) => ({
    ...m,
    createdAt: new Date(m.createdAt),
  }));
  const isTyping = Boolean(typingByProject[projectId]);

  const [error, setError] = useState<string | null>(null);
  const [markingWrong, setMarkingWrong] = useState<Set<string>>(new Set());
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  // -------------------------------------------------------------------------
  // Auto-fetch session messages from backend using React Query
  // -------------------------------------------------------------------------
  const { data: sessionData } = useChatSession(backendSessionId);

  // Update local store when query data changes (or derive completely from query)
  useEffect(() => {
    if (sessionData?.messages && sessionData.messages.length > 0) {
      const formattedMessages = sessionData.messages.map(
        (m: any, idx: number) => ({
          id: m.id ? String(m.id) : `${backendSessionId}-${idx}`,
          role: m.role || 'user',
          content: m.content || '',
          createdAt: new Date(
            m.timestamp || sessionData.created_at || Date.now()
          ).getTime(),
        })
      );
      // Only set messages if the store is empty for this project to avoid overwriting optimistic updates
      // during active typing
      if (messages.length === 0 && !isTyping) {
        setMessages(projectId, formattedMessages);
      }
    }
  }, [
    sessionData,
    backendSessionId,
    projectId,
    setMessages,
    messages.length,
    isTyping,
  ]);

  const sendMessageMutation = useSendMessage();
  const markMessageFailedMutation = useMarkMessageFailed();

  // -------------------------------------------------------------------------
  // Send Message — uses new /chat/sessions/{id}/messages endpoint
  // -------------------------------------------------------------------------
  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      sendUserMessage(projectId, content, images);
      touchProject(projectId);
      setTyping(projectId, true);
      setError(null);
      setUpgradeRequired(false);

      try {
        let userId: number | undefined;
        const token = getStoredToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
            userId = payload.sub ?? payload.user_id ?? payload.id;
          } catch {
            // token decode failed — backend infers user from auth header
          }
        }

        // Convert data-URL images to File objects for upload
        const files: File[] = [];
        if (images?.length) {
          for (const imageUrl of images) {
            try {
              if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
                const blob = await fetch(imageUrl).then((r) => r.blob());
                files.push(new File([blob], 'image.png', { type: blob.type }));
              }
            } catch {
              // skip invalid images
            }
          }
        }

        // Fire the mutation instead of calling service directly
        sendMessageMutation.mutate(
          {
            message: content,
            options: {
              sessionId: projectId,
              backendSessionId,
              userId,
              model: selectedModel.provider,
              modelName: selectedModel.model,
              models: [
                {
                  provider: selectedModel.provider,
                  model: selectedModel.model,
                },
              ],
              temperature: 0.7,
              files: files.length > 0 ? files : undefined,
            },
          },
          {
            onSuccess: (response) => {
              if (
                response.backendSessionId &&
                response.backendSessionId !== backendSessionId
              ) {
                setBackendId(projectId, response.backendSessionId);
                // Dynamically update the URL to point to the new chat session without reloading the page
                window.history.pushState(
                  {},
                  '',
                  `/chat?id=${response.backendSessionId}`
                );
              }
              // Always reload to get updated AI-generated titles
              useProjectsStore.getState().loadProjects();

              setTyping(projectId, false);
              appendAssistantMessage(
                projectId,
                response.content,
                response.verified
              );
              touchProject(projectId);
            },
            onError: (err: any) => {
              setTyping(projectId, false);
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
                  // Handle multiple deep nested paths from backend: { error: { message: { error: ... } } }
                  const nestedMsgObj =
                    resData?.error?.message ||
                    resData?.message ||
                    resData?.error ||
                    resData;
                  if (
                    nestedMsgObj?.error === 'SUBSCRIPTION_REQUIRED' ||
                    nestedMsgObj?.code === 'SUBSCRIPTION_REQUIRED'
                  ) {
                    const defaultMsg =
                      'This model requires a premium subscription. Please upgrade your plan to use it.';
                    const dispMsg = nestedMsgObj?.message || defaultMsg;
                    appendAssistantMessage(
                      projectId,
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
                ? err.message || 'Failed to send message. Please try again.'
                : 'An unexpected error occurred. Please try again.';
              setError(msg);
              appendAssistantMessage(projectId, `Error: ${msg}`, false);
            },
          }
        );
      } catch (err) {
        // any synchronous errors before mutation
        setTyping(projectId, false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      appendAssistantMessage,
      backendSessionId,
      projectId,
      selectedModel,
      sendUserMessage,
      setTyping,
      touchProject,
      setBackendId,
    ]
  );

  // -------------------------------------------------------------------------
  // Mark As Wrong — uses /api/v1/chat/failure/mark-failed
  // -------------------------------------------------------------------------
  const markAsWrong = useCallback(
    async (messageId: string) => {
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

        // The UI might use complex IDs like '123-0' if the backend ID wasn't directly mapped,
        // but if `message.id` is the real numeric ID from the backend, we use it directly.
        // We'll attempt to extract a numeric message ID.
        let numericMessageId: number;
        if (messageId.includes('-')) {
          const parts = messageId.split('-');
          numericMessageId = parseInt(parts[1] || '0', 10);
        } else {
          numericMessageId = parseInt(messageId, 10);
        }

        markMessageFailedMutation.mutate(
          { sessionId: backendSessionId, messageId: numericMessageId },
          {
            onSuccess: () => {
              setError(
                "✓ Marked as wrong! Our workbench team will review this response. You'll receive your wallet credit upon successful QC."
              );
              setTimeout(() => setError(null), 6000);
            },
            onError: (err: any) => {
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
      } catch (err) {
        // synchronous errors before mutation
        setMarkingWrong((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }
    },
    [messages, backendSessionId, markingWrong]
  );

  const approveMessage = useCallback((_messageId: string) => {
    // Placeholder — approve endpoint not yet in API
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    markAsWrong,
    approveMessage,
    error,
    markingWrong,
    upgradeRequired,
  };
}
