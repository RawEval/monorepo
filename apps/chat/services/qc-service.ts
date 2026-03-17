/**
 * QC Service
 *
 * QC pipeline results, appeals, and disputes via /api/v1/chat/qc/*.
 */

import { api } from '@/lib/api';
import type {
  PaginatedFailedPromptsWithQC,
  QCSummaryResponse,
  CreateAppealRequest,
  AppealCreateResponse,
  AppealListResponse,
  MarkQCWrongRequest,
  QCDisputeResponse,
  FailedPromptPayoutListResponse,
} from '@raweval/types';

class QCService {
  /** List failed prompts with QC info */
  async getFailedPrompts(params?: {
    status?: string;
    qc_status?: string;
    verdict?: string;
    domain?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedFailedPromptsWithQC> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<PaginatedFailedPromptsWithQC>(
      `/chat/qc/failed-prompts${query ? `?${query}` : ''}`
    );
  }

  /** Get full QC summary for a conversation */
  async getSummary(conversationId: number, failedModel?: string): Promise<QCSummaryResponse> {
    const query = failedModel ? `?failed_model=${encodeURIComponent(failedModel)}` : '';
    return api.get<QCSummaryResponse>(`/chat/qc/summary/${conversationId}${query}`);
  }

  /** Create an appeal for a FalsePositive verdict */
  async createAppeal(request: CreateAppealRequest): Promise<AppealCreateResponse> {
    return api.post<AppealCreateResponse>('/chat/qc/appeals', request);
  }

  /** List user's appeals */
  async getAppeals(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<AppealListResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<AppealListResponse>(`/chat/qc/appeals${query ? `?${query}` : ''}`);
  }

  /** Dispute a QC verdict */
  async dispute(request: MarkQCWrongRequest): Promise<QCDisputeResponse> {
    return api.post<QCDisputeResponse>('/chat/qc/dispute', request);
  }

  /** Get failed prompt payouts */
  async getFailedPromptPayouts(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<FailedPromptPayoutListResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<FailedPromptPayoutListResponse>(
      `/chat/payments/failed-prompt-payouts${query ? `?${query}` : ''}`
    );
  }
}

export const qcService = new QCService();
