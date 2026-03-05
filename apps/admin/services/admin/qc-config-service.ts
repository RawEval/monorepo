import { ApiService } from '../api-service';

export interface QcConfig {
  id: number;
  version_label: string;
  description: string | null;
  is_active: boolean;
  min_cohen_kappa: number;
  min_fleiss_kappa: number;
  min_krippendorff: number;
  min_percentage_agreement: number;
  consistency_threshold: number;
  threshold_excellent: number;
  threshold_good: number;
  threshold_acceptable: number;
  threshold_poor: number;
  weighting_strategy: string | null;
  tier_weights: Record<string, number> | null;
  flag_logic: string | null;
  auto_flag_enabled: boolean;
  entropy_low_threshold: number;
  expected_annotator_count: number;
  default_models: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface QcConfigCreateRequest {
  version_label: string;
  description?: string;
  min_cohen_kappa?: number;
  min_fleiss_kappa?: number;
  min_krippendorff?: number;
  min_percentage_agreement?: number;
  consistency_threshold?: number;
  threshold_excellent?: number;
  threshold_good?: number;
  threshold_acceptable?: number;
  threshold_poor?: number;
  weighting_strategy?: string;
  tier_weights?: Record<string, number>;
  flag_logic?: string;
  auto_flag_enabled?: boolean;
  entropy_low_threshold?: number;
  expected_annotator_count?: number;
  default_models?: string[];
  is_active?: boolean;
}

export type QcConfigUpdateRequest = Partial<QcConfigCreateRequest>;

export class AdminQcConfigService extends ApiService {
  async listQcConfigs(): Promise<QcConfig[]> {
    const response = await this.client.get<QcConfig[]>('/admin/qc-config');
    return this.handleResponse(response);
  }

  async getActiveQcConfig(): Promise<QcConfig> {
    const response = await this.client.get<QcConfig>(
      '/admin/qc-config/active'
    );
    return this.handleResponse(response);
  }

  async createQcConfig(data: QcConfigCreateRequest): Promise<QcConfig> {
    const response = await this.client.post<QcConfig>(
      '/admin/qc-config',
      data
    );
    return this.handleResponse(response);
  }

  async updateQcConfig(
    configId: number,
    data: QcConfigUpdateRequest
  ): Promise<QcConfig> {
    const response = await this.client.put<QcConfig>(
      `/admin/qc-config/${configId}`,
      data
    );
    return this.handleResponse(response);
  }
}

export const adminQcConfigService = new AdminQcConfigService();
