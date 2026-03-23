import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatKeys } from '@/lib/react-query/query-keys';
import { chatService } from '@/services/chat-service';
import type { MarkMessageFailedRequest, MarkMessageFailedResponse } from '@raweval/types';

interface MarkMessageFailedParams {
  sessionId: number;
  messageId: number;
  request?: MarkMessageFailedRequest;
}

export function useMarkMessageFailed() {
  const queryClient = useQueryClient();

  return useMutation<MarkMessageFailedResponse, Error, MarkMessageFailedParams>({
    mutationFn: ({ sessionId, messageId, request }) =>
      chatService.markMessageFailed(sessionId, messageId, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.session(variables.sessionId),
      });
    },
  });
}
