import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat-service';
import { chatKeys } from '@/lib/react-query/query-keys';

export function useChatSession(sessionId: number | undefined) {
  return useQuery({
    queryKey: sessionId ? chatKeys.session(sessionId) : [],
    queryFn: () => chatService.getChatSessionById(sessionId!, true, false),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // keep session data fresh for 5 mins
  });
}
