import { ApiService, type PaginatedResponse } from '../api-service';

export interface AdminFailedConversation {
  conversation_id: number;
  session_request_id: string;
  user_id: number;
  user_email: string;
  domain: string | null;
  failure_type: string | null;
  failure_probability: number | null;
  qc_status: string | null;
  agreement_level: number | null;
  fleiss_kappa: number | null;
  total_cost: number | null;
  total_tokens: number | null;
  model_used: string | null;
  annotator_count: number | null;
  qc_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationRubric {
  rubric: unknown;
  conversation_id: number;
}

export interface AnnotationProgress {
  conversation_id: number;
  tiers: unknown[];
}

export interface ConversationFull {
  id: number;
  [key: string]: unknown;
}

export interface StatusHistoryEntry {
  status: string;
  changed_at: string;
  changed_by: number | null;
  reason: string | null;
}

export interface ListFailedConversationsParams {
  page?: number;
  page_size?: number;
  status?: string;
  domain?: string;
  date_from?: string;
  date_to?: string;
  user_id?: number;
  org_id?: number;
  model?: string;
  failure_type?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface TransitionStatusRequest {
  new_status_code: string;
  reason: string;
}

export interface RerunQCRequest {
  reason: string;
  config_id?: number;
}

export interface UpdateAnnotationConfigRequest {
  tier_1_expert_count?: number;
  tier_2_expert_count?: number;
  tier_3_expert_count?: number;
  reviewer_pre_annotation_count?: number;
  reviewer_post_annotation_count?: number;
  reason: string;
}

export class AdminConversationsService extends ApiService {
  async listFailedConversations(
    params: ListFailedConversationsParams = {}
  ): Promise<PaginatedResponse<AdminFailedConversation>> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<
      PaginatedResponse<AdminFailedConversation>
    >(`/admin/failed-conversations${query}`);
    return this.handleResponse(response);
  }

  async getFullConversation(
    conversationId: number
  ): Promise<ConversationFull> {
    const response = await this.client.get<ConversationFull>(
      `/admin/failed-conversations/${conversationId}/full`
    );
    return this.handleResponse(response);
  }

  async getRubric(conversationId: number): Promise<ConversationRubric> {
    const response = await this.client.get<ConversationRubric>(
      `/admin/failed-conversations/${conversationId}/rubric`
    );
    return this.handleResponse(response);
  }

  async getAnnotationProgress(
    conversationId: number
  ): Promise<AnnotationProgress> {
    const response = await this.client.get<AnnotationProgress>(
      `/admin/failed-conversations/${conversationId}/annotation-progress`
    );
    return this.handleResponse(response);
  }

  async getStatusHistory(
    conversationId: number
  ): Promise<StatusHistoryEntry[]> {
    const response = await this.client.get<StatusHistoryEntry[]>(
      `/admin/failed-conversations/${conversationId}/status-history`
    );
    return this.handleResponse(response);
  }

  async transitionStatus(
    conversationId: number,
    data: TransitionStatusRequest
  ): Promise<unknown> {
    const response = await this.client.post(
      `/admin/failed-conversations/${conversationId}/transition-status`,
      data
    );
    return this.handleResponse(response);
  }

  async rerunQC(
    conversationId: number,
    data: RerunQCRequest
  ): Promise<unknown> {
    const response = await this.client.post(
      `/admin/failed-conversations/${conversationId}/rerun-qc`,
      data
    );
    return this.handleResponse(response);
  }

  async updateAnnotationConfig(
    conversationId: number,
    data: UpdateAnnotationConfigRequest
  ): Promise<unknown> {
    const response = await this.client.patch(
      `/admin/failed-conversations/${conversationId}/annotation-config`,
      data
    );
    return this.handleResponse(response);
  }
}

export const adminConversationsService = new AdminConversationsService();
