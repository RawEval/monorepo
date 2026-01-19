/**
 * Workbench Service
 * 
 * Service for workbench operations (task allocation, submission, etc.)
 */

import { ApiService } from './api-service';

export interface TaskBatch {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  status: string;
}

export interface CreateTaskBatchRequest {
  name: string;
  description?: string | null;
  prompt_ids: number[];
}

export interface AllocateExpertRequest {
  expert_id: number;
  task_ids: number[];
}

export interface TaskSubmission {
  task_id: number;
  corrected_response: string;
  notes?: string | null;
}

export interface SubmitTaskRequest {
  task_id: number;
  corrected_response: string;
  notes?: string | null;
}

export interface TaskResponse {
  id: number;
  prompt_id: number;
  batch_id: number;
  expert_id: number | null;
  status: string;
  priority: string;
  assigned_at: string | null;
  submitted_at: string | null;
  created_at: string;
}

export class WorkbenchService extends ApiService {
  /**
   * Create a task batch
   */
  async createTaskBatch(
    data: CreateTaskBatchRequest,
  ): Promise<TaskBatch> {
    const response = await this.client.post<TaskBatch>(
      '/workbench/batches',
      data,
    );
    return this.handleResponse(response);
  }

  /**
   * Get all task batches
   */
  async getTaskBatches(skip = 0, limit = 100): Promise<TaskBatch[]> {
    const response = await this.client.get<TaskBatch[]>(
      `/workbench/batches?skip=${skip}&limit=${limit}`,
    );
    return this.handleResponse(response);
  }

  /**
   * Get task batch by ID
   */
  async getTaskBatch(batchId: number): Promise<TaskBatch> {
    const response = await this.client.get<TaskBatch>(
      `/workbench/batches/${batchId}`,
    );
    return this.handleResponse(response);
  }

  /**
   * Allocate experts to tasks
   */
  async allocateExperts(
    batchId: number,
    allocations: AllocateExpertRequest[],
  ): Promise<void> {
    await this.client.post(
      `/workbench/batches/${batchId}/allocate`,
      { allocations },
    );
  }

  /**
   * Reallocate expert to different tasks
   */
  async reallocateExpert(
    batchId: number,
    expertId: number,
    taskIds: number[],
  ): Promise<void> {
    await this.client.post(
      `/workbench/batches/${batchId}/reallocate`,
      {
        expert_id: expertId,
        task_ids: taskIds,
      },
    );
  }

  /**
   * Get available tasks for expert
   */
  async getAvailableTasks(
    expertId?: number,
    skip = 0,
    limit = 100,
  ): Promise<TaskResponse[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (expertId) {
      params.append('expert_id', expertId.toString());
    }

    const response = await this.client.get<TaskResponse[]>(
      `/workbench/tasks?${params.toString()}`,
    );
    return this.handleResponse(response);
  }

  /**
   * Submit a task
   */
  async submitTask(data: SubmitTaskRequest): Promise<TaskResponse> {
    const response = await this.client.post<TaskResponse>(
      '/workbench/tasks/submit',
      data,
    );
    return this.handleResponse(response);
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: number): Promise<TaskResponse> {
    const response = await this.client.get<TaskResponse>(
      `/workbench/tasks/${taskId}`,
    );
    return this.handleResponse(response);
  }
}

export const workbenchService = new WorkbenchService();
