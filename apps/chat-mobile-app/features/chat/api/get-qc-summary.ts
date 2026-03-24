import { useQuery } from '@tanstack/react-query';
import { qcService } from '@/services/qc-service';
import type { QCSummaryResponse, PaginatedFailedPromptsWithQC } from '@raweval/types';

export function useQCAnalysis(conversationId: number | null | undefined, model?: string) {
  return useQuery<QCSummaryResponse>({
    queryKey: ['qc', 'analysis', conversationId, model],
    queryFn: () => qcService.getAnalysis(conversationId!, model),
    enabled: !!conversationId,
    staleTime: 1000 * 30,
  });
}

export function useQCStatus(conversationId: number | null | undefined, model?: string) {
  return useQuery<unknown>({
    queryKey: ['qc', 'status', conversationId, model],
    queryFn: () => qcService.getStatus(conversationId!, model),
    enabled: !!conversationId,
    staleTime: 1000 * 10,
  });
}

export function useFailedSessions(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}) {
  return useQuery<PaginatedFailedPromptsWithQC>({
    queryKey: ['qc', 'failed-sessions', params],
    queryFn: () => qcService.getFailedSessions(params),
    staleTime: 1000 * 30,
  });
}
