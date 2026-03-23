import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat-service';
import type { DomainListResponse, ConversationDomainsResponse } from '@raweval/types';

export function useDomains() {
  return useQuery<DomainListResponse>({
    queryKey: ['chat', 'domains'],
    queryFn: () => chatService.getDomains(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useSessionDomains(sessionId: number | null | undefined) {
  return useQuery<ConversationDomainsResponse>({
    queryKey: ['chat', 'session-domains', sessionId],
    queryFn: () => chatService.getSessionDomains(sessionId!),
    enabled: !!sessionId && sessionId > 0,
    staleTime: 1000 * 30, // 30 seconds
  });
}
