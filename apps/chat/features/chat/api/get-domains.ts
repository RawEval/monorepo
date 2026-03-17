import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat-service';

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: () => chatService.getDomains(),
    staleTime: 60 * 60 * 1000, // 1 hour - domains rarely change
  });
}

export function useSessionDomains(sessionId?: number) {
  return useQuery({
    queryKey: ['session-domains', sessionId],
    queryFn: () => chatService.getSessionDomains(sessionId!),
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  });
}
