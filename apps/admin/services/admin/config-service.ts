import { ApiService } from '../api-service';

export interface PlatformConfigItem {
  key: string;
  value: unknown;
  raw_value: string;
  type: string;
  description: string | null;
  category: string;
  is_editable: boolean;
  updated_at: string;
}

export interface ConfigListResponse {
  total: number;
  configs: PlatformConfigItem[];
}

export interface UpdateConfigRequest {
  value: unknown;
}

export class AdminConfigService extends ApiService {
  async getPlatformConfig(
    category?: string
  ): Promise<ConfigListResponse> {
    const query = category ? `?category=${category}` : '';
    const response = await this.client.get<ConfigListResponse>(
      `/admin/config${query}`
    );
    return this.handleResponse(response);
  }

  async updateConfig(
    configKey: string,
    data: UpdateConfigRequest
  ): Promise<unknown> {
    const response = await this.client.put(
      `/admin/config/${configKey}`,
      data
    );
    return this.handleResponse(response);
  }

  async seedDefaultConfig(): Promise<unknown> {
    const response = await this.client.post('/admin/seed-config');
    return this.handleResponse(response);
  }

  async seedDefaultPlans(): Promise<unknown> {
    const response = await this.client.post('/admin/seed-plans');
    return this.handleResponse(response);
  }
}

export const adminConfigService = new AdminConfigService();
