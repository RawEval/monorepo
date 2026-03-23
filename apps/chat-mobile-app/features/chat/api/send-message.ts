import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatKeys } from '@/lib/react-query/query-keys';
import { chatService, type SendMessageOptions } from '@/services/chat-service';
import type { ChatMessage } from '@/features/chat/types';

interface SendMessageParams {
  sessionId: number;
  message: string;
  options?: Omit<SendMessageOptions, 'sessionId' | 'backendSessionId'>;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<ChatMessage & { backendSessionId?: number }, Error, SendMessageParams>({
    mutationFn: ({ sessionId, message, options }) =>
      chatService.sendMessage(sessionId, message, options),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.session(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
    },
  });
}
