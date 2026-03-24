/**
 * QC Service
 *
 * QC pipeline results via /api/v1/chat/failure/* endpoints.
 * Maps to the real backend API at api.raweval.com.
 */

import { api } from '@/lib/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

class QCService {
  /**
   * List failed conversations for the current user.
   * Uses GET /chat/sessions with failed_only=true.
   */
  async getFailedSessions(params?: {
    page?: number;
    page_size?: number;
  }): Promise<Any> {
    const searchParams = new URLSearchParams();
    searchParams.append('failed_only', 'true');
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
    return api.get(`/chat/sessions?${searchParams.toString()}`);
  }

  /**
   * Get full QC analysis for a conversation.
   * Uses GET /chat/failure/analysis/{conversation_id}
   */
  async getAnalysis(conversationId: number, model?: string): Promise<Any> {
    const query = model ? `?model=${encodeURIComponent(model)}` : '';
    return api.get(`/chat/failure/analysis/${conversationId}${query}`);
  }

  /**
   * Get QC status and history for a conversation.
   * Uses GET /chat/failure/status/{conversation_id}
   */
  async getStatus(conversationId: number, model?: string): Promise<Any> {
    const query = model ? `?model=${encodeURIComponent(model)}` : '';
    return api.get(`/chat/failure/status/${conversationId}${query}`);
  }

  /**
   * Get entropy (Layer 1) details.
   */
  async getEntropy(conversationId: number, model?: string): Promise<Any> {
    const query = model ? `?model=${encodeURIComponent(model)}` : '';
    return api.get(`/chat/failure/analysis/${conversationId}/entropy${query}`);
  }

  /**
   * Get judge evaluations (Layer 2+3).
   */
  async getJudges(conversationId: number, model?: string): Promise<Any> {
    const query = model ? `?model=${encodeURIComponent(model)}` : '';
    return api.get(`/chat/failure/analysis/${conversationId}/judges${query}`);
  }

  /**
   * Get root-cause attribution.
   */
  async getAttribution(conversationId: number, model?: string): Promise<Any> {
    const query = model ? `?model=${encodeURIComponent(model)}` : '';
    return api.get(`/chat/failure/analysis/${conversationId}/attribution${query}`);
  }

  /**
   * Get rubric for a failed conversation.
   */
  async getRubric(conversationId: number, model?: string): Promise<Any> {
    const query = model ? `?model=${encodeURIComponent(model)}` : '';
    return api.get(`/chat/failure/analysis/${conversationId}/rubric${query}`);
  }

  /**
   * File an appeal for a FalsePositive verdict (within 7 days).
   */
  async createAppeal(qcCaseId: number, justification: string): Promise<Any> {
    return api.post('/chat/qc/appeals', { qc_case_id: qcCaseId, justification });
  }

  /**
   * File a dispute when QC is wrong.
   */
  async createDispute(conversationId: number, reason: string): Promise<Any> {
    return api.post('/chat/qc/dispute', { conversation_id: conversationId, reason });
  }
}

export const qcService = new QCService();
