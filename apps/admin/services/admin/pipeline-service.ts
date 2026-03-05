/**
 * Admin Pipeline Service
 *
 * Monitors health and throughput of the data processing pipeline.
 */

import { ApiService } from '../api-service';

export interface PipelineStatusSummary {
  total_conversations_processed: number;
  analysis_queue_depth: number;
  annotation_queue_depth: number;
  human_review_pending: number;
  average_processing_time_minutes: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  current_throughput_per_hour: number;
  average_duration_seconds: number;
  active_workers: number;
}

export interface PipelineOverview {
  stages: PipelineStage[];
  bottleneck_stage_id?: string;
}

export interface DomainAnalytics {
  domain: string;
  total_processed: number;
  failure_rate: number;
  top_experts: TopExpert[];
}

export interface TopExpert {
  id: number;
  tasks_completed: number;
  accuracy: number;
}

export class AdminPipelineService extends ApiService {
  /**
   * Get high-level summary of the pipeline status
   */
  async getPipelineStatus(): Promise<PipelineStatusSummary> {
    const response = await this.client.get<PipelineStatusSummary>(
      '/admin/pipeline/status'
    );
    return this.handleResponse(response);
  }

  /**
   * Get detailed overview of all pipeline stages
   */
  async getPipelineOverview(): Promise<PipelineOverview> {
    const response = await this.client.get<PipelineOverview>(
      '/admin/pipeline/overview'
    );
    return this.handleResponse(response);
  }

  /**
   * Get analytics for all domains
   */
  async getDomainAnalytics(): Promise<DomainAnalytics[]> {
    const response = await this.client.get<DomainAnalytics[]>(
      '/admin/pipeline/domains'
    );
    return this.handleResponse(response);
  }

  /**
   * Get detailed analytics for a specific domain
   */
  async getDomainDetails(domain: string): Promise<DomainAnalytics> {
    const response = await this.client.get<DomainAnalytics>(
      `/admin/pipeline/domains/${domain}`
    );
    return this.handleResponse(response);
  }
}

export const adminPipelineService = new AdminPipelineService();
