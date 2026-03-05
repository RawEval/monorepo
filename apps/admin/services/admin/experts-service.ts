import { ApiService, type PaginatedResponse } from '../api-service';

export interface ExpertResponse {
  expert_id: number;
  user_id: number;
  email: string;
  full_name: string | null;
  expert_tier: number | null;
  expert_status: string;
  interview_completed: boolean;
  interview_score: number | null;
  expert_score: number | null;
  derived_tier: number | null;
  rolling_agreement_score: number | null;
  total_completed_annotations: number;
  is_on_probation: boolean;
  quality_trend: string | null;
  active_allocations: number;
  last_heartbeat: string | null;
}

export interface ScoreHistoryEntry {
  id: number;
  expert_id: number;
  score: number;
  trigger: string;
  created_at: string;
}

export interface ScoreTrajectorySummary {
  expert_id: number;
  current_score: number;
  trend: string;
  entries: ScoreHistoryEntry[];
}

export interface ListExpertsParams {
  page?: number;
  page_size?: number;
  tier?: number;
  domain?: string;
  expert_status?: string;
  min_score?: number;
  max_score?: number;
  on_probation?: boolean;
  sort_by?: string;
  sort_order?: string;
}

export interface UpdateExpertStatusRequest {
  expert_status: string;
  is_on_probation?: boolean;
  probation_reason?: string;
  reason: string;
}

export interface UpdateExpertTierRequest {
  new_tier: number;
  reason: string;
}

export class AdminExpertsService extends ApiService {
  async listExperts(
    params: ListExpertsParams = {}
  ): Promise<PaginatedResponse<ExpertResponse>> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<PaginatedResponse<ExpertResponse>>(
      `/admin/experts${query}`
    );
    return this.handleResponse(response);
  }

  async getExpert(expertId: number): Promise<ExpertResponse> {
    const response = await this.client.get<ExpertResponse>(
      `/admin/experts/${expertId}`
    );
    return this.handleResponse(response);
  }

  async updateExpertStatus(
    expertId: number,
    data: UpdateExpertStatusRequest
  ): Promise<unknown> {
    const response = await this.client.patch(
      `/admin/experts/${expertId}/status`,
      data
    );
    return this.handleResponse(response);
  }

  async overrideExpertTier(
    expertId: number,
    data: UpdateExpertTierRequest
  ): Promise<unknown> {
    const response = await this.client.patch(
      `/admin/experts/${expertId}/tier`,
      data
    );
    return this.handleResponse(response);
  }

  async recomputeScore(
    expertId: number,
    domain?: string
  ): Promise<unknown> {
    const query = domain ? `?domain=${domain}` : '';
    const response = await this.client.post(
      `/admin/experts/${expertId}/recompute-score${query}`
    );
    return this.handleResponse(response);
  }

  async batchRecomputeScores(
    domain?: string,
    expertIds?: number[]
  ): Promise<unknown> {
    const params: Record<string, unknown> = {};
    if (domain) params.domain = domain;
    if (expertIds) params.expert_ids = expertIds.join(',');
    const query = this.buildQuery(params);
    const response = await this.client.post(
      `/admin/experts/batch-recompute-scores${query}`
    );
    return this.handleResponse(response);
  }

  async getScoreHistory(
    expertId: number,
    params: { trigger?: string; limit?: number; offset?: number } = {}
  ): Promise<ScoreHistoryEntry[]> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<ScoreHistoryEntry[]>(
      `/admin/experts/${expertId}/score-history${query}`
    );
    return this.handleResponse(response);
  }

  async getScoreTrajectorySummary(
    expertId: number
  ): Promise<ScoreTrajectorySummary> {
    const response = await this.client.get<ScoreTrajectorySummary>(
      `/admin/experts/${expertId}/score-trajectory-summary`
    );
    return this.handleResponse(response);
  }
}

export const adminExpertsService = new AdminExpertsService();
