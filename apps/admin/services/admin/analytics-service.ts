import { ApiService } from '../api-service';

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

  async getExpertContributionSummary(
    expertId: number
  ): Promise<unknown> {
    const response = await this.client.get(
      `/admin/author-activity/expert/${expertId}/summary`
    );
    return this.handleResponse(response);
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
