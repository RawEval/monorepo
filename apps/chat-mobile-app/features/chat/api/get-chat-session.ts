import { useQuery } from '@tanstack/react-query';
import { chatKeys } from '@/lib/react-query/query-keys';
import { chatService } from '@/services/chat-service';
import type { SessionDetail } from '@raweval/types';

export function useChatSession(sessionId: number | null | undefined) {
  return useQuery<SessionDetail>({
    queryKey: chatKeys.session(sessionId ?? 0),
    queryFn: () => chatService.getChatSessionById(sessionId!),
    enabled: !!sessionId && sessionId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
