import { ApiService, type PaginatedResponse } from '../api-service';

export interface PayoutResponse {
  id: number;
  expert_id: number | null;
  user_id: number;
  batch_id: number | null;
  failed_prompt_final_id: number | null;
  amount: number;
  currency: string;
  status: string;
  role: string | null;
  domain: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface PaymentTrackingItem {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  payment_type: string;
  payment_reason: string;
  status: string;
  description: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface PayoutConfigResponse {
  tier_1_rate: number;
  tier_2_rate: number;
  tier_3_rate: number;
  reviewer_pre_rate: number;
  reviewer_post_rate: number;
  description: string | null;
  updated_at: string;
}

export interface UpdatePayoutConfigRequest {
  tier_1_rate?: number;
  tier_2_rate?: number;
  tier_3_rate?: number;
  reviewer_pre_rate?: number;
  reviewer_post_rate?: number;
  description?: string;
}

export interface ListPayoutsParams {
  expert_id?: number;
  user_id?: number;
  batch_id?: number;
  status?: string;
  role?: string;
  domain?: string;
  page?: number;
  page_size?: number;
}

export class AdminPaymentsService extends ApiService {
  async listPayouts(
    params: ListPayoutsParams = {}
  ): Promise<PaginatedResponse<PayoutResponse>> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<PaginatedResponse<PayoutResponse>>(
      `/admin/payouts${query}`
    );
    return this.handleResponse(response);
  }

  async getBatchPayouts(batchId: number): Promise<unknown> {
    const response = await this.client.get(
      `/admin/payouts/batch/${batchId}`
    );
    return this.handleResponse(response);
  }

  async getTaskPayouts(fpfId: number): Promise<unknown> {
    const response = await this.client.get(
      `/admin/payouts/task/${fpfId}`
    );
    return this.handleResponse(response);
  }

  async triggerPayouts(
    failedPromptFinalId: number,
    reason: string
  ): Promise<unknown> {
    const response = await this.client.post('/admin/payouts/trigger', {
      failed_prompt_final_id: failedPromptFinalId,
      reason,
    });
    return this.handleResponse(response);
  }

  async getPaymentsByUser(
    userId: number,
    params: {
      payment_reason?: string;
      skip?: number;
      limit?: number;
    } = {}
  ): Promise<PaymentTrackingItem[]> {
    const query = this.buildQuery({
      user_id: userId,
      ...params,
    } as Record<string, unknown>);
    const response = await this.client.get<PaymentTrackingItem[]>(
      `/admin/payments/tracking/by-user${query}`
    );
    return this.handleResponse(response);
  }

  async getPaymentsByBatch(batchId: number): Promise<PaymentTrackingItem[]> {
    const response = await this.client.get<PaymentTrackingItem[]>(
      `/admin/payments/tracking/by-batch?batch_id=${batchId}`
    );
    return this.handleResponse(response);
  }

  async getPaymentsByConversation(
    conversationId: number
  ): Promise<PaymentTrackingItem[]> {
    const response = await this.client.get<PaymentTrackingItem[]>(
      `/admin/payments/tracking/by-conversation?conversation_id=${conversationId}`
    );
    return this.handleResponse(response);
  }

  async getPayoutConfig(): Promise<PayoutConfigResponse> {
    const response = await this.client.get<PayoutConfigResponse>(
      '/admin/payout-config'
    );
    return this.handleResponse(response);
  }

  async updatePayoutConfig(
    data: UpdatePayoutConfigRequest
  ): Promise<PayoutConfigResponse> {
    const response = await this.client.put<PayoutConfigResponse>(
      '/admin/payout-config',
      data
    );
    return this.handleResponse(response);
  }

  async getPayoutConfigHistory(): Promise<PayoutConfigResponse[]> {
    const response = await this.client.get<PayoutConfigResponse[]>(
      '/admin/payout-config/history'
    );
    return this.handleResponse(response);
  }
}

export const adminPaymentsService = new AdminPaymentsService();
