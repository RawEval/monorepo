import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat-service';
import { chatKeys } from '@/lib/react-query/query-keys';

export function useModels(provider?: string) {
  return useQuery({
    queryKey: provider ? [...chatKeys.models(), provider] : chatKeys.models(),
    queryFn: () => chatService.getAvailableModels(provider),
    staleTime: 60 * 60 * 1000, // 1 hour (models don't change often)
  });
}
