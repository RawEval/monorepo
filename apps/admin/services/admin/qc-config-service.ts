/**
 * Admin QC Config Service
 *
 * Manage Quality Control configurations and thresholds.
 */

import { ApiService } from '../api-service';

export interface QcConfig {
  id: number;
  version: string;
  name: string;
  description: string | null;
  is_active: boolean;

  // Thresholds
  sbert_threshold: number;
  cross_encoder_threshold: number;
  nli_threshold: number;
  iaa_threshold: number;
  entropy_threshold: number;

  // Judge Config
  judge_model_count: number;
  judge_majority_threshold: number;

  created_at: string;
}

export interface CreateQcConfigRequest {
  version: string;
  name: string;
  description?: string;

  sbert_threshold?: number;
  cross_encoder_threshold?: number;
  nli_threshold?: number;
  iaa_threshold?: number;
  entropy_threshold?: number;

  judge_model_count?: number;
  judge_majority_threshold?: number;
}

export class AdminQcConfigService extends ApiService {
  /**
   * List all QC configurations
   */
  async listQcConfigs(): Promise<QcConfig[]> {
    const response = await this.client.get<QcConfig[]>('/admin/qc-configs');
    return this.handleResponse(response);
  }

  /**
   * Create a new QC configuration
   */
  async createQcConfig(data: CreateQcConfigRequest): Promise<QcConfig> {
    const response = await this.client.post<QcConfig>(
      '/admin/qc-configs',
      data
    );
    return this.handleResponse(response);
  }

  /**
   * Get a specific QC configuration
   */
  async getQcConfig(id: number): Promise<QcConfig> {
    const response = await this.client.get<QcConfig>(`/admin/qc-configs/${id}`);
    return this.handleResponse(response);
  }

  /**
   * Update a QC configuration
   */
  async updateQcConfig(
    id: number,
    data: Partial<CreateQcConfigRequest>
  ): Promise<QcConfig> {
    const response = await this.client.patch<QcConfig>(
      `/admin/qc-configs/${id}`,
      data
    );
    return this.handleResponse(response);
  }

  /**
   * Activate a specific QC configuration
   */
  async activateQcConfig(id: number): Promise<QcConfig> {
    const response = await this.client.post<QcConfig>(
      `/admin/qc-configs/${id}/activate`
    );
    return this.handleResponse(response);
  }
}

export const adminQcConfigService = new AdminQcConfigService();
