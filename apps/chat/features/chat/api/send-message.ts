import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, SendMessageOptions } from '@/services/chat-service';
import { chatKeys } from '@/lib/react-query/query-keys';

interface SendMessageArgs {
  message: string;
  options: SendMessageOptions;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ message, options }: SendMessageArgs) =>
      chatService.executeChatSession(message, options),
    onSuccess: (data) => {
      // If we know the backendSessionId, invalidate its history query
      // so it refetches cleanly with the new message and response
      if (data.backendSessionId) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.session(data.backendSessionId),
        });

        // Also invalidate the sessions list so the summary updates
        queryClient.invalidateQueries({
          queryKey: chatKeys.sessions(),
        });
      }
    },
  });
}
