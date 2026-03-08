import { ApiService } from '../api-service';

// ─────────────────────────────────────────────────────────────────────────────
// Model analytics types (section 9)
// ─────────────────────────────────────────────────────────────────────────────

export interface ModelFailureEntry {
  model: string | null;
  provider: string | null;
  total_marked_failed: number;
  qc_passed: number;
  qc_false_positive: number;
  qc_needs_review: number;
  qc_fraud_blocked: number;
  qc_pending: number;
  payout_eligible: number;
  payout_blocked: number;
}

export interface ModelFailureSummaryResponse {
  models: ModelFailureEntry[];
  total_models: number;
  total_failures: number;
  date_range_start: string | null;
  date_range_end: string | null;
}

export interface ModelFailureSummaryParams {
  date_from?: string;
  date_to?: string;
  domain?: string;
  provider?: string;
}

export interface ModelTrendDataPoint {
  date: string;
  count: number;
}

export interface ModelTrendEntry {
  model: string | null;
  provider: string | null;
  data_points: ModelTrendDataPoint[];
  total: number;
}

export interface ModelFailureTrendResponse {
  granularity: string;
  models: ModelTrendEntry[];
  date_range_start: string | null;
  date_range_end: string | null;
}

export interface ModelFailureTrendParams {
  granularity?: 'day' | 'week' | 'month';
  /** Comma-separated model names */
  models?: string;
  date_from?: string;
  date_to?: string;
}

export interface ModelQcBreakdownEntry {
  model: string | null;
  provider: string | null;
  total_qc_cases: number;
  verdict_distribution: Record<string, number>;
  avg_fp_score: number | null;
  avg_process_score: number | null;
  avg_d_global: number | null;
  avg_pipeline_latency_ms: number | null;
  fraud_flagged: number;
}

export interface ModelQcBreakdownResponse {
  models: ModelQcBreakdownEntry[];
  total_models: number;
}

export interface ModelQcBreakdownParams {
  date_from?: string;
  date_to?: string;
  domain?: string;
}

export interface ModelComparisonEntry {
  model: string;
  provider: string;
  fpf_id: number;
  fpf_status: string;
  qc_outcome: string | null;
  verdict: string | null;
  fp_score: number | null;
  process_score: number | null;
  d_global: number | null;
  payout_eligible: boolean | null;
  created_at: string;
}

export interface ModelComparisonConversation {
  conversation_id: number;
  models: ModelComparisonEntry[];
}

export interface ModelComparisonResponse {
  comparisons: ModelComparisonConversation[];
  items: ModelComparisonConversation[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ModelComparisonParams {
  page?: number;
  page_size?: number;
  date_from?: string;
  date_to?: string;
}

export interface LeaderboardEntry {
  expert_id: number;
  score: number;
  tier: number;
  tasks_completed: number;
  [key: string]: unknown;
}

export interface QualityTrend {
  date: string;
  score: number;
  domain: string | null;
  [key: string]: unknown;
}

export interface TierChangeLog {
  expert_id: number;
  old_tier: number;
  new_tier: number;
  reason: string;
  changed_at: string;
  [key: string]: unknown;
}

export interface AuthorActivity {
  expert_id: number;
  [key: string]: unknown;
}

export class AdminAnalyticsService extends ApiService {
  // ── Model Analytics ─────────────────────────────────────────────────────

  /** 9.1 Per-model failure summary with QC outcome breakdown */
  async getModelFailureSummary(
    params: ModelFailureSummaryParams = {}
  ): Promise<ModelFailureSummaryResponse> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<ModelFailureSummaryResponse>(
      `/admin/model-failure-summary${query}`
    );
    return this.handleResponse(response);
  }

  /** 9.2 Per-model failure count trend (day/week/month granularity) */
  async getModelFailureTrend(
    params: ModelFailureTrendParams = {}
  ): Promise<ModelFailureTrendResponse> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<ModelFailureTrendResponse>(
      `/admin/model-failure-trend${query}`
    );
    return this.handleResponse(response);
  }

  /** 9.3 Per-model QC score breakdown (avg fp_score, process_score, d_global) */
  async getModelQcBreakdown(
    params: ModelQcBreakdownParams = {}
  ): Promise<ModelQcBreakdownResponse> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<ModelQcBreakdownResponse>(
      `/admin/model-qc-breakdown${query}`
    );
    return this.handleResponse(response);
  }

  /** 9.4 Multi-model side-by-side comparison (only conversations with >= 2 models) */
  async getModelComparison(
    params: ModelComparisonParams = {}
  ): Promise<ModelComparisonResponse> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<ModelComparisonResponse>(
      `/admin/model-comparison${query}`
    );
    return this.handleResponse(response);
  }

  // ── Expert Analytics ─────────────────────────────────────────────────────
  async getExpertLeaderboard(
    tier?: number,
    limit = 20
  ): Promise<LeaderboardEntry[]> {
    const params: Record<string, unknown> = { limit };
    if (tier !== undefined) params.tier = tier;
    const query = this.buildQuery(params);
    const response = await this.client.get<LeaderboardEntry[]>(
      `/admin/analytics/expert-leaderboard${query}`
    );
    return this.handleResponse(response);
  }

  async getQualityTrends(
    domainName?: string,
    limit = 30
  ): Promise<QualityTrend[]> {
    const params: Record<string, unknown> = { limit };
    if (domainName) params.domain_name = domainName;
    const query = this.buildQuery(params);
    const response = await this.client.get<QualityTrend[]>(
      `/admin/analytics/quality-trends${query}`
    );
    return this.handleResponse(response);
  }

  async getTierChangeLog(limit = 50): Promise<TierChangeLog[]> {
    const response = await this.client.get<TierChangeLog[]>(
      `/admin/analytics/tier-change-log?limit=${limit}`
    );
    return this.handleResponse(response);
  }

  async getBatchAuthorActivity(batchId: number): Promise<AuthorActivity[]> {
    const response = await this.client.get<AuthorActivity[]>(
      `/admin/author-activity/batch/${batchId}`
    );
    return this.handleResponse(response);
  }

  async getTaskAuthorActivity(fpfId: number): Promise<AuthorActivity[]> {
    const response = await this.client.get<AuthorActivity[]>(
      `/admin/author-activity/task/${fpfId}`
    );
    return this.handleResponse(response);
  }

  async getExpertContributionSummary(expertId: number): Promise<unknown> {
    const response = await this.client.get(
      `/admin/author-activity/expert/${expertId}/summary`
    );
    return this.handleResponse(response);
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
