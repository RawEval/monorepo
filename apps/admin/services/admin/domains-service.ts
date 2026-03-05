import { ApiService } from '../api-service';

export interface DomainChild {
  id: number;
  name: string;
  display_name: string;
}

export interface DomainResponse {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  parent_domain_id: number | null;
  parent_domain_name: string | null;
  children: DomainChild[];
  is_active: boolean;
  max_batch_size: number;
  default_min_annotators: number;
  auto_batch_threshold: number;
  default_batch_size: number;
  task_count: number;
  expert_count: number;
  batch_count: number;
  created_at: string;
  updated_at: string;
}

export interface DomainsListResponse {
  domains: DomainResponse[];
  total: number;
}

export interface CreateDomainRequest {
  name: string;
  display_name: string;
  description?: string;
  parent_domain_id?: number;
  max_batch_size?: number;
  default_min_annotators?: number;
  auto_batch_threshold?: number;
  default_batch_size?: number;
}

export interface UpdateDomainRequest {
  display_name?: string;
  description?: string;
  parent_domain_id?: number;
  is_active?: boolean;
  max_batch_size?: number;
  default_min_annotators?: number;
  auto_batch_threshold?: number;
  default_batch_size?: number;
}

export class AdminDomainsService extends ApiService {
  async listDomains(includeInactive = false): Promise<DomainsListResponse> {
    const query = includeInactive ? '?include_inactive=true' : '';
    const response = await this.client.get<DomainsListResponse>(
      `/admin/domains${query}`
    );
    return this.handleResponse(response);
  }

  async createDomain(data: CreateDomainRequest): Promise<DomainResponse> {
    const response = await this.client.post<DomainResponse>(
      '/admin/domains',
      data
    );
    return this.handleResponse(response);
  }

  async updateDomain(
    domainId: number,
    data: UpdateDomainRequest
  ): Promise<DomainResponse> {
    const response = await this.client.put<DomainResponse>(
      `/admin/domains/${domainId}`,
      data
    );
    return this.handleResponse(response);
  }

  async deactivateDomain(domainId: number): Promise<unknown> {
    const response = await this.client.patch(
      `/admin/domains/${domainId}/deactivate`
    );
    return this.handleResponse(response);
  }
}

export const adminDomainsService = new AdminDomainsService();
