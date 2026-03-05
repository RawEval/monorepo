import { ApiService } from '../api-service';

export interface PipelineStatusItem {
  code: string;
  display_name: string;
  count: number;
  is_terminal: boolean;
  color_hex: string;
  icon: string;
}

export interface PipelinePhase {
  phase: string;
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

export interface DomainSummary {
  domain: string;
  total_tasks: number;
  completed: number;
  in_progress: number;
  pending: number;
  [key: string]: unknown;
}

export interface TaskStatusSummary {
  status_code: string;
  display_name: string;
  count: number;
}

export interface TaskStatusDefinition {
  status_code: string;
  display_name: string;
  description: string;
  phase: string;
}

export class AdminPipelineService extends ApiService {
  async getPipelineOverview(): Promise<PipelineOverview> {
    const response = await this.client.get<PipelineOverview>(
      '/admin/pipeline-overview'
    );
    return this.handleResponse(response);
  }

  async getDomainSummary(): Promise<DomainSummary[]> {
    const response = await this.client.get<DomainSummary[]>(
      '/admin/domain-summary'
    );
    return this.handleResponse(response);
  }

  async getTaskStatusSummary(): Promise<TaskStatusSummary[]> {
    const response = await this.client.get<TaskStatusSummary[]>(
      '/admin/task-status-summary'
    );
    return this.handleResponse(response);
  }

  async getTaskStatusDefinitions(): Promise<TaskStatusDefinition[]> {
    const response = await this.client.get<TaskStatusDefinition[]>(
      '/admin/task-status-definitions'
    );
    return this.handleResponse(response);
  }

  async getTasksByStatus(
    statusCode: string,
    params: { page?: number; page_size?: number } = {}
  ): Promise<unknown[]> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<unknown[]>(
      `/admin/tasks-by-status/${statusCode}${query}`
    );
    return this.handleResponse(response);
  }
}

export const adminPipelineService = new AdminPipelineService();
