import { useQuery } from '@tanstack/react-query';
import { qcService } from '@/services/qc-service';

export function useQCSummary(conversationId?: number, failedModel?: string) {
  return useQuery({
    queryKey: ['qc-summary', conversationId, failedModel],
    queryFn: () => qcService.getSummary(conversationId!, failedModel),
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });
}

export function useFailedPromptPayouts(params?: {
  status?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['failed-prompt-payouts', params],
    queryFn: () => qcService.getFailedPromptPayouts(params),
    staleTime: 30 * 1000,
  });
}
