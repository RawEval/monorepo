/**
 * QC Service — Quality Control pipeline
 */
import { api } from '@/lib/api';
import type {
  QCSummaryResponse,
  PaginatedFailedPromptsWithQC,
  CreateAppealRequest,
  AppealCreateResponse,
} from '@raweval/types';

interface QCAnalysisParams {
  page?: number;
  page_size?: number;
  status?: string;
}

class QCService {
  async getFailedSessions(params?: QCAnalysisParams): Promise<PaginatedFailedPromptsWithQC> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return api.get<PaginatedFailedPromptsWithQC>(
      `/chat/sessions?failed_only=true${query ? `&${query}` : ''}`
    );
  }

  async getAnalysis(conversationId: number, model?: string): Promise<QCSummaryResponse> {
    const query = model ? `?model=${model}` : '';
    return api.get<QCSummaryResponse>(`/chat/failure/analysis/${conversationId}${query}`);
  }

  async getStatus(conversationId: number, model?: string): Promise<unknown> {
    const query = model ? `?model=${model}` : '';
    return api.get<unknown>(`/chat/failure/status/${conversationId}${query}`);
  }

  async getEntropy(conversationId: number): Promise<unknown> {
    return api.get<unknown>(`/chat/failure/analysis/${conversationId}/entropy`);
  }

  async getJudges(conversationId: number): Promise<unknown> {
    return api.get<unknown>(`/chat/failure/analysis/${conversationId}/judges`);
  }

  async getAttribution(conversationId: number): Promise<unknown> {
    return api.get<unknown>(`/chat/failure/analysis/${conversationId}/attribution`);
  }

  async createAppeal(qcCaseId: number, justification: string): Promise<AppealCreateResponse> {
    const data: CreateAppealRequest = { qc_case_id: qcCaseId, justification };
    return api.post<AppealCreateResponse>('/chat/failure/appeals', data);
  }

  async createDispute(conversationId: number, reason: string): Promise<unknown> {
    return api.post<unknown>(`/chat/failure/disputes`, { conversation_id: conversationId, reason });
  }
}

export const qcService = new QCService();
