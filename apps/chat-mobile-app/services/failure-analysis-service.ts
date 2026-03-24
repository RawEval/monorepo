/**
 * Failure Analysis Service — mark failed, analyze, human review
 */
import { api } from '@/lib/api';
import type { MarkFailedRequest, MarkFailedResponse } from '@raweval/types';

interface AnalysisResult {
  conversation_id: number;
  status: string;
  layers: unknown[];
  verdict?: string;
  payout_eligible?: boolean;
}

interface HumanReviewItem {
  conversation_id: number;
  status: string;
  created_at: string;
}

interface ResolveReviewData {
  verdict: 'FAIL' | 'PASS';
  reason?: string;
}

class FailureAnalysisService {
  async markConversationFailed(data: MarkFailedRequest): Promise<MarkFailedResponse> {
    return api.post<MarkFailedResponse>('/chat/failure/mark-failed', data);
  }

  async analyzeConversation(conversationId: number): Promise<AnalysisResult> {
    return api.post<AnalysisResult>(`/chat/failure/analyze/${conversationId}`);
  }

  async analyzeAll(): Promise<{ triggered: number }> {
    return api.post<{ triggered: number }>('/chat/failure/analyze-all');
  }

  async getAnalysisResults(conversationId: number): Promise<AnalysisResult> {
    return api.get<AnalysisResult>(`/chat/failure/analysis/${conversationId}`);
  }

  async getEntropyDetails(conversationId: number): Promise<unknown> {
    return api.get<unknown>(`/chat/failure/entropy/${conversationId}`);
  }

  async getJudgeDetails(conversationId: number): Promise<unknown> {
    return api.get<unknown>(`/chat/failure/judges/${conversationId}`);
  }

  async getAttributionDetails(conversationId: number): Promise<unknown> {
    return api.get<unknown>(`/chat/failure/attribution/${conversationId}`);
  }

  async listHumanReview(
    status?: string,
    limit = 50
  ): Promise<HumanReviewItem[]> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('limit', String(limit));
    return api.get<HumanReviewItem[]>(`/chat/failure/human-review?${params}`);
  }

  async resolveHumanReview(
    conversationId: number,
    data: ResolveReviewData
  ): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/chat/failure/human-review/${conversationId}/resolve`, data);
  }
}

export const failureAnalysisService = new FailureAnalysisService();
