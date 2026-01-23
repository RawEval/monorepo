'use client';

import { useCallback, useState } from 'react';
import { useProjectsStore } from '@/stores/projects-store';
import { useChatStore } from '@/stores/chat-store';
import { chatService } from '@/services/chat-service';
import { isApiError } from '@raweval/api-client';
import { getStoredToken } from '@raweval/auth';

export function useChat() {
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const touchProject = useProjectsStore((s) => s.touchProject);

  // Use Zustand selectors properly to subscribe to state changes
  const projectId = selectedProjectId ?? 'p1';

  // Subscribe to messagesByProject to get reactive updates
  const messagesByProject = useChatStore((s) => s.messagesByProject);
  const typingByProject = useChatStore((s) => s.typingByProject);
  const sendUserMessage = useChatStore((s) => s.sendUserMessage);
  const appendAssistantMessage = useChatStore((s) => s.appendAssistantMessage);
  const setTyping = useChatStore((s) => s.setTyping);

  // Get messages for current project - this will react to changes
  const messages = (messagesByProject[projectId] ?? []).map((m) => ({
    ...m,
    createdAt: new Date(m.createdAt),
  }));
  const isTyping = Boolean(typingByProject[projectId]);

  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      sendUserMessage(projectId, content, images);
      touchProject(projectId);
      setTyping(projectId, true);
      setError(null);

      try {
        // Get user ID from token (extract from JWT or get from API)
        // For now, we'll pass undefined and let the backend handle it
        // In production, you'd decode the JWT token to get user ID
        const token = getStoredToken();
        let userId: number | undefined;

        // Try to extract user ID from token (basic implementation)
        // In production, use a proper JWT decoder
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1] || ''));
            userId = payload.sub || payload.user_id || payload.id;
          } catch {
            // If token decode fails, try to get from API
            // For now, we'll let the backend handle it
          }
        }

        // Convert images (string URLs) to File objects if needed
        // For now, we'll handle this in the service
        const files: File[] = [];
        if (images && images.length > 0) {
          // If images are data URLs or URLs, convert them
          // This is a simplified version - you may need to handle this differently
          for (const imageUrl of images) {
            try {
              if (imageUrl.startsWith('data:')) {
                // Convert data URL to File
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], 'image.png', { type: blob.type });
                files.push(file);
              } else if (imageUrl.startsWith('http')) {
                // Fetch and convert URL to File
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], 'image.png', { type: blob.type });
                files.push(file);
              }
            } catch {
              // Skip invalid images
            }
          }
        }

        // Call real API
        const response = await chatService.sendMessage(content, {
          sessionId: projectId,
          userId,
          model: 'openai',
          modelName: 'gpt-4o',
          temperature: 0.7,
          files: files.length > 0 ? files : undefined,
        });

        setTyping(projectId, false);
        appendAssistantMessage(projectId, response.content, response.verified);
        touchProject(projectId);
      } catch (err) {
        setTyping(projectId, false);
        if (isApiError(err)) {
          setError(err.message || 'Failed to send message. Please try again.');
          appendAssistantMessage(
            projectId,
            `Error: ${err.message || 'Failed to get response. Please try again.'}`,
            false
          );
        } else {
          setError('An unexpected error occurred. Please try again.');
          appendAssistantMessage(
            projectId,
            'Error: An unexpected error occurred. Please try again.',
            false
          );
        }
      }
    },
    [
      appendAssistantMessage,
      projectId,
      sendUserMessage,
      setTyping,
      touchProject,
    ]
  );

  const markAsWrong = useCallback(
    async (messageId: string) => {
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      const message = messages[messageIndex];

      if (!message || message.role !== 'assistant') {
        return;
      }

      // Find the preceding user message (the prompt)
      // This assumes messages are ordered chronologically
      const precedingUserMessage = messages[messageIndex - 1];
      const userContent =
        precedingUserMessage?.role === 'user'
          ? precedingUserMessage.content
          : 'Unknown prompt';

      try {
        // Use ingestAndFlagMessage to handle ID resolution between LLM Host and Main API
        // We default to 'gpt-4o' since we don't store model name in messages yet
        await chatService.ingestAndFlagMessage(
          userContent,
          message.content,
          'gpt-4o'
        );
        alert(
          "Response marked as wrong! It will be reviewed by our workbench team. You'll be notified when QA is complete."
        );
      } catch (err) {
        if (isApiError(err)) {
          alert(`Error: ${err.message || 'Failed to mark message as wrong.'}`);
        } else {
          alert('An unexpected error occurred. Please try again.');
        }
      }
    },
    [messages]
  );

  const approveMessage = useCallback((messageId: string) => {
    console.log('Approving message:', messageId);
  }, []);

  const requestHuman = useCallback((messageId?: string) => {
    console.log('Requesting human assistance for message:', messageId);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    markAsWrong,
    approveMessage,
    requestHuman,
    error,
  };
}
