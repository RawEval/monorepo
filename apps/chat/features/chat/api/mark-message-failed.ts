import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat-service';
import { chatKeys } from '@/lib/react-query/query-keys';
import type { MarkMessageFailedRequest } from '@raweval/types';

interface MarkMessageFailedArgs {
  sessionId: number;
  messageId: number;
  request?: MarkMessageFailedRequest;
}

export function useMarkMessageFailed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, messageId, request }: MarkMessageFailedArgs) =>
      chatService.markMessageFailed(sessionId, messageId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.session(variables.sessionId),
      });
    },
  });
}
