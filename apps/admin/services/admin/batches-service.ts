import { ApiService, type PaginatedResponse } from '../api-service';

export interface BatchResponse {
  id: number;
  domain: string | null;
  status: string;
  total_tasks: number;
  created_at: string;
  updated_at: string;
  tier_1_count?: number;
  tier_2_count?: number;
  tier_3_count?: number;
  allocated_count?: number;
  completed_count?: number;
}

export interface BatchDetail extends BatchResponse {
  failed_prompt_ids: number[];
  allocations: unknown[];
  quality?: unknown;
}

export interface BatchQuality {
  batch_id: number;
  overall_score: number;
  metrics: Record<string, unknown>;
  computed_at: string;
}

export interface ListBatchesParams {
  page?: number;
  page_size?: number;
  domain?: string;
  status?: string;
  sort_order?: string;
}

export interface AdminCreateBatchRequest {
  domain: string;
  failed_prompt_ids?: number[];
  max_size?: number;
  tier_1_count?: number;
  tier_2_count?: number;
  tier_3_count?: number;
  auto_allocate?: boolean;
  reason?: string;
}

export interface ChangeBatchStatusRequest {
  new_status: string;
  reason: string;
}

export interface ChangeBatchDomainRequest {
  new_domain: string;
  new_subdomain?: string;
  reason: string;
}

export interface AdminAllocateBatchRequest {
  reason: string;
}

export class AdminBatchesService extends ApiService {
  async listBatches(
    params: ListBatchesParams = {}
  ): Promise<PaginatedResponse<BatchResponse>> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<PaginatedResponse<BatchResponse>>(
      `/admin/batches${query}`
    );
    return this.handleResponse(response);
  }

  async getBatch(batchId: number): Promise<BatchDetail> {
    const response = await this.client.get<BatchDetail>(
      `/admin/batches/${batchId}`
    );
    return this.handleResponse(response);
  }

  async createBatch(data: AdminCreateBatchRequest): Promise<BatchResponse> {
    const response = await this.client.post<BatchResponse>(
      '/admin/batches/create',
      data
    );
    return this.handleResponse(response);
  }

  async changeStatus(
    batchId: number,
    data: ChangeBatchStatusRequest
  ): Promise<unknown> {
    const response = await this.client.patch(
      `/admin/batches/${batchId}/status`,
      data
    );
    return this.handleResponse(response);
  }

  async changeDomain(
    batchId: number,
    data: ChangeBatchDomainRequest
  ): Promise<unknown> {
    const response = await this.client.patch(
      `/admin/batches/${batchId}/domain`,
      data
    );
    return this.handleResponse(response);
  }

  async triggerAllocation(
    batchId: number,
    data: AdminAllocateBatchRequest
  ): Promise<unknown> {
    const response = await this.client.post(
      `/admin/batches/${batchId}/allocate`,
      data
    );
    return this.handleResponse(response);
  }

  async getBatchQuality(batchId: number): Promise<BatchQuality> {
    const response = await this.client.get<BatchQuality>(
      `/admin/batches/${batchId}/quality`
    );
    return this.handleResponse(response);
  }

  async triggerQualityCompute(batchId: number): Promise<unknown> {
    const response = await this.client.post(
      `/admin/batches/${batchId}/quality-compute`
    );
    return this.handleResponse(response);
  }

  async getQualityHistory(batchId: number): Promise<BatchQuality[]> {
    const response = await this.client.get<BatchQuality[]>(
      `/admin/batches/${batchId}/quality-history`
    );
    return this.handleResponse(response);
  }
}

export const adminBatchesService = new AdminBatchesService();
