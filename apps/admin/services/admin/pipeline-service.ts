import { ApiService, type PaginatedResponse } from '../api-service';

export type { PaginatedResponse };

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline Overview (8.1)
// ─────────────────────────────────────────────────────────────────────────────

export interface PipelineStatusItem {
  code: string;
  display_name: string | null;
  count: number;
  is_terminal: boolean;
  color_hex: string | null;
  icon?: string;
}

export interface PipelinePhase {
  phase: string;
  display_name?: string | null;
  statuses: PipelineStatusItem[];
  total_tasks: number;
}

export interface PipelineOverview {
  total_tasks: number;
  tasks_with_rubric: number;
  phases: PipelinePhase[];
  phase_avg_duration_ms: Record<string, number | null>;
  bottleneck_phase: string | null;
  bottleneck_task_count: number;
  terminal_state_counts: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Domain Summary (8.2)
// ─────────────────────────────────────────────────────────────────────────────

export interface DomainAnnotationProgress {
  tier_1: { needed: number; completed: number };
  tier_2: { needed: number; completed: number };
  tier_3: { needed: number; completed: number };
}

export interface DomainSummaryItem {
  domain_id: number;
  domain_name: string;
  display_name: string;
  total_tasks: number;
  tasks_with_rubric: number;
  status_distribution: Record<string, number>;
  annotation_progress: DomainAnnotationProgress;
  /** Legacy flat fields that may still be returned by some API versions */
  domain?: string;
  completed?: number;
  in_progress?: number;
  pending?: number;
  [key: string]: unknown;
}

export interface DomainSummaryResponse {
  domains: DomainSummaryItem[];
  grand_total_tasks: number;
  grand_total_with_rubric: number;
  tasks_without_domain: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Task Status Definitions (8.3)
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskStatusDefinition {
  id: number;
  code: string;
  display_name: string | null;
  description: string | null;
  phase: string | null;
  sort_order: number | null;
  is_terminal: boolean;
  color_hex: string | null;
}

export interface TaskStatusDefinitionsResponse {
  statuses: TaskStatusDefinition[];
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Task Status Summary (8.4)
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskStatusSummaryAnnotationProgress {
  tier_1: { total_needed: number; total_completed: number };
  tier_2: { total_needed: number; total_completed: number };
  tier_3: { total_needed: number; total_completed: number };
}

export interface TaskStatusSummaryResponse {
  total_tasks: number;
  domain_filter: string | null;
  status_breakdown: Record<string, number>;
  annotation_progress: TaskStatusSummaryAnnotationProgress;
}

/** Legacy shape returned by some API versions — array of per-status counts */
export interface TaskStatusSummaryLegacyItem {
  status_code: string;
  display_name: string | null;
  count: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tasks by Status (8.5)
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskByStatusItem {
  fpf_id: number;
  conversation_session_id: number | null;
  domain: string | null;
  subdomain: string | null;
  priority: string | null;
  status: string | null;
  assigned_batch_id: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TasksByStatusResponse {
  status_code: string;
  status_display_name: string | null;
  status_phase: string | null;
  items: TaskByStatusItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export class AdminPipelineService extends ApiService {
  async getPipelineOverview(): Promise<PipelineOverview> {
    const response = await this.client.get<PipelineOverview>(
      '/admin/pipeline-overview'
    );
    return this.handleResponse(response);
  }

  async getDomainSummary(): Promise<DomainSummaryItem[]> {
    const response = await this.client.get<
      DomainSummaryResponse | DomainSummaryItem[]
    >('/admin/domain-summary');
    const data = this.handleResponse(response);
    // Normalize: API may return { domains: [...] } or plain array
    if (Array.isArray(data)) return data as DomainSummaryItem[];
    return (data as DomainSummaryResponse).domains ?? [];
  }

  async getTaskStatusSummary(
    domain?: string
  ): Promise<TaskStatusSummaryResponse | TaskStatusSummaryLegacyItem[]> {
    const query = domain ? `?domain=${encodeURIComponent(domain)}` : '';
    const response = await this.client.get<
      TaskStatusSummaryResponse | TaskStatusSummaryLegacyItem[]
    >(`/admin/task-status-summary${query}`);
    return this.handleResponse(response);
  }

  async getTaskStatusDefinitions(): Promise<TaskStatusDefinition[]> {
    const response = await this.client.get<
      TaskStatusDefinitionsResponse | TaskStatusDefinition[]
    >('/admin/task-status-definitions');
    const data = this.handleResponse(response);
    if (Array.isArray(data)) return data as TaskStatusDefinition[];
    return (data as TaskStatusDefinitionsResponse).statuses ?? [];
  }

  async getTasksByStatus(
    statusCode: string,
    params: {
      sort_by?: string;
      sort_order?: string;
      page?: number;
      page_size?: number;
    } = {}
  ): Promise<TasksByStatusResponse> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<TasksByStatusResponse>(
      `/admin/tasks-by-status/${statusCode}${query}`
    );
    return this.handleResponse(response);
  }
}

export const adminPipelineService = new AdminPipelineService();
