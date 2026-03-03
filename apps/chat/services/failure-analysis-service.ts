/**
 * Failure Analysis Service
 *
 * Handles the "mark conversation as failed" flow via:
 *  POST /api/v1/chat/failure/mark-failed
 *
 * When a user marks an AI response as wrong, this service submits the
 * conversation ID to the backend, which triggers:
 *  1. Sets user_marked_failed=true on the LLMCallSession
 *  2. Creates/updates FailedPromptFinal with annotation config
 *  3. Triggers 3-layer background analysis
 *  4. Generates a structured rubric (FActScore-style)
 *
 * After QC passes, the wallet system credits the user.
 */

import { api } from '@/lib/api';
import type { MarkFailedRequest, MarkFailedResponse } from '@raweval/types';

class FailureAnalysisService {
  /**
   * Mark a conversation as failed and configure the annotation pipeline.
   *
   * @param data.conversation_id - The LLMCallSession integer ID (backendSessionId)
   * @param data.domain_id - Optional domain FK
   * @param data.tier1_count / tier2_count / tier3_count - Annotator counts (default 3 each)
   */
  async markConversationFailed(
    data: MarkFailedRequest
  ): Promise<MarkFailedResponse> {
    return api.post<MarkFailedResponse>('/chat/failure/mark-failed', data);
  }

  /**
   * Trigger full 3-layer analysis for a conversation.
   * Layer 0: Behavioral signals, Layer 1: Semantic entropy, Layer 2+3: LLM judges
   */
  async analyzeConversation(
    conversationId: number
  ): Promise<Record<string, unknown>> {
    return api.post<Record<string, unknown>>(
      `/chat/failure/analyze/${conversationId}`
    );
  }

  /**
   * Trigger full 3-layer analysis for all failed conversations.
   */
  async analyzeAll(): Promise<Record<string, unknown>> {
    return api.post<Record<string, unknown>>('/chat/failure/analyze-all');
  }

  /**
   * Get full analysis results for a conversation.
   * Returns from FailedPrompt, FalsePositive, or NeedsHumanReview.
   */
  async getAnalysisResults(
    conversationId: number
  ): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(
      `/chat/failure/analysis/${conversationId}`
    );
  }

  /** Get semantic entropy details (Layer 1) */
  async getEntropyDetails(
    conversationId: number
  ): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(
      `/chat/failure/analysis/${conversationId}/entropy`
    );
  }

  /** Get judge evaluation details (Layer 2+3) */
  async getJudgeDetails(
    conversationId: number
  ): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(
      `/chat/failure/analysis/${conversationId}/judges`
    );
  }

  /**
   * Get root-cause attribution details (post-failure analysis).
   * Shows why the model failed and payout eligibility.
   */
  async getAttributionDetails(
    conversationId: number
  ): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(
      `/chat/failure/analysis/${conversationId}/attribution`
    );
  }

  /**
   * List conversations that need human review (judges disagreed).
   */
  async listHumanReview(
    status = 'pending',
    limit = 50
  ): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(
      `/chat/failure/human-review?status=${status}&limit=${limit}`
    );
  }

  /**
   * Submit a human verdict for a conversation flagged for manual review.
   */
  async resolveHumanReview(
    conversationId: number,
    data: { verdict: 'FAIL' | 'PASS'; reason?: string }
  ): Promise<Record<string, unknown>> {
    return api.post<Record<string, unknown>>(
      `/chat/failure/human-review/${conversationId}/resolve`,
      data
    );
  }
}

export const failureAnalysisService = new FailureAnalysisService();
