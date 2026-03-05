/**
 * Admin Conversations Service
 *
 * Manage failed conversations and their rubrics via the admin API.
 */

import { ApiService } from '../api-service';

export type AdminConversationStatus =
  | 'failed'
  | 'processing'
  | 'completed'
  | 'ignored';

export interface AtomicClaim {
  id: string;
  claim_text: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  score: number;
  reasoning: string;
}

export interface ConversationRubric {
  id: number;
  conversation_id: string;
  atomic_claims: AtomicClaim[];
  evaluation_criteria: EvaluationCriteria[];
  overall_score: number;
  summary: string;
  created_at: string;
}

export interface AdminFailedConversation {
  id: string;
  status: AdminConversationStatus;
  priority: 'low' | 'medium' | 'high';
  query_text: string;
  failure_probability: number;
  domain?: string;
  created_at: string;
  updated_at: string;
}

export interface ListFailedConversationsParams {
  skip?: number;
  limit?: number;
  status?: AdminConversationStatus;
  domain?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateConversationStatusRequest {
  status: AdminConversationStatus;
  priority?: 'low' | 'medium' | 'high';
}

export class AdminConversationsService extends ApiService {
  /**
   * List failed conversations with filtering and pagination
   */
  async listFailedConversations(
    params: ListFailedConversationsParams = {}
  ): Promise<AdminFailedConversation[]> {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.client.get<AdminFailedConversation[]>(
      `/admin/conversations/failed?${query}`
    );
    return this.handleResponse(response);
  }

  /**
   * Get a single failed conversation by ID
   */
  async getFailedConversation(id: string): Promise<AdminFailedConversation> {
    const response = await this.client.get<AdminFailedConversation>(
      `/admin/conversations/failed/${id}`
    );
    return this.handleResponse(response);
  }

  /**
   * Get the rubric for a conversation
   */
  async getConversationRubric(id: string): Promise<ConversationRubric> {
    const response = await this.client.get<ConversationRubric>(
      `/admin/conversations/failed/${id}/rubric`
    );
    return this.handleResponse(response);
  }

  /**
   * Trigger regeneration of the rubric for a conversation
   */
  async regenerateRubric(id: string): Promise<ConversationRubric> {
    const response = await this.client.post<ConversationRubric>(
      `/admin/conversations/failed/${id}/rubric/regenerate`
    );
    return this.handleResponse(response);
  }

  /**
   * Update the status or priority of a failed conversation
   */
  async updateConversationStatus(
    id: string,
    data: UpdateConversationStatusRequest
  ): Promise<AdminFailedConversation> {
    const response = await this.client.patch<AdminFailedConversation>(
      `/admin/conversations/failed/${id}/status`,
      data
    );
    return this.handleResponse(response);
  }
}

export const adminConversationsService = new AdminConversationsService();
