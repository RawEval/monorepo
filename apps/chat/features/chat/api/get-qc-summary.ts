import { useQuery } from '@tanstack/react-query';
import { qcService } from '@/services/qc-service';

export function useQCAnalysis(conversationId?: number, model?: string) {
  return useQuery({
    queryKey: ['qc-analysis', conversationId, model],
    queryFn: () => qcService.getAnalysis(conversationId!, model),
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });
}

export function useQCStatus(conversationId?: number, model?: string) {
  return useQuery({
    queryKey: ['qc-status', conversationId, model],
    queryFn: () => qcService.getStatus(conversationId!, model),
    enabled: !!conversationId,
    staleTime: 10 * 1000,
  });
}

export function useFailedSessions(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ['failed-sessions', params],
    queryFn: () => qcService.getFailedSessions(params),
    staleTime: 30 * 1000,
  });
}
