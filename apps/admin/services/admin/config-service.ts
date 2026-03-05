/**
 * Admin Config Service
 *
 * Manage platform-wide configuration and subscription plans.
 */

import { ApiService } from '../api-service';

export interface PlatformConfig {
  maintenance_mode: boolean;
  maintenance_message: string | null;
  max_upload_size_mb: number;
  default_session_timeout_minutes: number;
  max_concurrent_models: number;
  enable_web_search: boolean;
  enable_streaming: boolean;
  llm_timeout_seconds: number;
  updated_at: string;
}

export interface UpdatePlatformConfigRequest {
  maintenance_mode?: boolean;
  maintenance_message?: string | null;
  max_upload_size_mb?: number;
  default_session_timeout_minutes?: number;
  max_concurrent_models?: number;
  enable_web_search?: boolean;
  enable_streaming?: boolean;
  llm_timeout_seconds?: number;
}

export interface AdminSubscriptionPlan {
  id: number;
  name: string;
  tier: 'free' | 'pro' | 'pro_max';
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  tier: 'free' | 'pro' | 'pro_max';
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

export class AdminConfigService extends ApiService {
  /**
   * Get current platform configuration
   */
  async getPlatformConfig(): Promise<PlatformConfig> {
    const response = await this.client.get<PlatformConfig>(
      '/admin/config/platform'
    );
    return this.handleResponse(response);
  }

  /**
   * Update platform configuration
   */
  async updatePlatformConfig(
    data: UpdatePlatformConfigRequest
  ): Promise<PlatformConfig> {
    const response = await this.client.patch<PlatformConfig>(
      '/admin/config/platform',
      data
    );
    return this.handleResponse(response);
  }

  /**
   * List all subscription plans
   */
  async listSubscriptionPlans(): Promise<AdminSubscriptionPlan[]> {
    const response = await this.client.get<AdminSubscriptionPlan[]>(
      '/admin/config/plans'
    );
    return this.handleResponse(response);
  }

  /**
   * Create a new subscription plan
   */
  async createSubscriptionPlan(
    data: CreateSubscriptionPlanRequest
  ): Promise<AdminSubscriptionPlan> {
    const response = await this.client.post<AdminSubscriptionPlan>(
      '/admin/config/plans',
      data
    );
    return this.handleResponse(response);
  }

  /**
   * Update a subscription plan
   */
  async updateSubscriptionPlan(
    id: number,
    data: Partial<CreateSubscriptionPlanRequest>
  ): Promise<AdminSubscriptionPlan> {
    const response = await this.client.patch<AdminSubscriptionPlan>(
      `/admin/config/plans/${id}`,
      data
    );
    return this.handleResponse(response);
  }

  /**
   * Delete a subscription plan
   */
  async deleteSubscriptionPlan(id: number): Promise<void> {
    const response = await this.client.delete(`/admin/config/plans/${id}`);
    this.handleResponse(response);
  }
}

export const adminConfigService = new AdminConfigService();
