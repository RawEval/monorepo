import { useQuery } from '@tanstack/react-query';
import { chatKeys } from '@/lib/react-query/query-keys';
import { chatService } from '@/services/chat-service';

export function useModels(provider?: string) {
  return useQuery<unknown>({
    queryKey: [...chatKeys.models(), provider ?? 'all'],
    queryFn: () => chatService.getAvailableModels(provider),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
