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
  flag_logic: Record<string, unknown> | null;
  auto_flag_enabled: boolean;
  entropy_low_threshold: number;
  collusion_min_repeat_batches?: number;
  outlier_disagreement_threshold?: number;
  tier_dominance_divergence_threshold?: number;
  consecutive_low_agreement_probation?: number;
  expected_annotator_count: number;
  default_models: Record<string, string> | null;
  created_at?: string;
  updated_at?: string;
}

/** GET /admin/qc-config response */
export interface QcConfigListResponse {
  configs: QcConfig[];
  total: number;
  active_config_id: number | null;
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
  flag_logic?: Record<string, unknown>;
  auto_flag_enabled?: boolean;
  entropy_low_threshold?: number;
  collusion_min_repeat_batches?: number;
  outlier_disagreement_threshold?: number;
  tier_dominance_divergence_threshold?: number;
  consecutive_low_agreement_probation?: number;
  default_models?: Record<string, string>;
  expected_annotator_count?: number;
  is_active?: boolean;
}

export type QcConfigUpdateRequest = Partial<QcConfigCreateRequest>;

export class AdminQcConfigService extends ApiService {
  /** List all QC configs (historical + active). Response: { configs, total, active_config_id }. */
  async listQcConfigs(): Promise<QcConfigListResponse> {
    const response = await this.client.get<QcConfigListResponse | QcConfig[]>(
      '/admin/qc-config'
    );
    const data = this.handleResponse(response);
    // Backward compat: if API returns array, wrap it
    if (Array.isArray(data)) {
      return {
        configs: data as QcConfig[],
        total: (data as QcConfig[]).length,
        active_config_id: (data as QcConfig[]).find((c) => c.is_active)?.id ?? null,
      };
    }
    return data as QcConfigListResponse;
  }

  /** Get currently active QC configuration */
  async getActiveQcConfig(): Promise<QcConfig> {
    const response = await this.client.get<QcConfig>(
      '/admin/qc-config/active'
    );
    return this.handleResponse(response);
  }

  /** Create new versioned QC config. If is_active=true, all others are deactivated. */
  async createQcConfig(data: QcConfigCreateRequest): Promise<QcConfig> {
    const response = await this.client.post<QcConfig>(
      '/admin/qc-config',
      data
    );
    return this.handleResponse(response);
  }

  /** Update existing QC config. If is_active=true, all others are deactivated. */
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
