import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat-service';
import { chatKeys } from '@/lib/react-query/query-keys';

interface MarkMessageFailedArgs {
  sessionId: number;
  messageId: number;
}

export function useMarkMessageFailed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, messageId }: MarkMessageFailedArgs) =>
      chatService.markMessageFailed(sessionId, messageId),
    onSuccess: (_, variables) => {
      // Invalidate the session query to reload the updated states
      queryClient.invalidateQueries({
        queryKey: chatKeys.session(variables.sessionId),
      });
    },
  });
}
