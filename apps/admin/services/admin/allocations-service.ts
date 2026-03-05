import { ApiService } from '../api-service';

export interface AllocationResponse {
  id: number;
  batch_id: number;
  expert_id: number;
  failed_prompt_final_id: number;
  tier_of_expert: number;
  submission_status: string;
  assigned_at: string;
  completed_at: string | null;
  expert?: {
    id: number;
    user_id: number;
    expert_tier: number;
  };
}

export interface ListAllocationsParams {
  batch_id?: number;
  expert_id?: number;
  submission_status?: string;
  tier?: number;
  page?: number;
  page_size?: number;
}

export interface AssignExpertRequest {
  batch_id: number;
  expert_id: number;
  failed_prompt_final_ids: number[];
  tier_of_expert: number;
  reason: string;
}

export interface ReassignExpertRequest {
  allocation_id: number;
  new_expert_id: number;
  reason: string;
}

export class AdminAllocationsService extends ApiService {
  async listAllocations(
    params: ListAllocationsParams = {}
  ): Promise<AllocationResponse[]> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<AllocationResponse[]>(
      `/admin/allocations${query}`
    );
    return this.handleResponse(response);
  }

  async assignExpert(data: AssignExpertRequest): Promise<unknown> {
    const response = await this.client.post(
      '/admin/allocations/assign-expert',
      data
    );
    return this.handleResponse(response);
  }

  async reassignExpert(data: ReassignExpertRequest): Promise<unknown> {
    const response = await this.client.post(
      '/admin/allocations/reassign-expert',
      data
    );
    return this.handleResponse(response);
  }

  async removeAllocation(allocationId: number): Promise<unknown> {
    const response = await this.client.delete(
      `/admin/allocations/${allocationId}`
    );
    return this.handleResponse(response);
  }
}

export const adminAllocationsService = new AdminAllocationsService();
