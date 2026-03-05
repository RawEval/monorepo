/**
 * Admin Payments Service
 *
 * Track platform-wide payments, statistics, and individual transactions.
 */

import { ApiService } from '../api-service';

export interface AdminPaymentTransaction {
  id: number;
  user_email: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_type: string | null;
  description: string | null;
  reference_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentStatistics {
  total_volume: number;
  total_completed: number;
  total_pending: number;
  total_failed: number;
  transactions_count: number;
  subscriptions_revenue: number;
  expert_payouts: number;
  failed_prompt_payouts: number;
}

export interface ListAdminPaymentsParams {
  skip?: number;
  limit?: number;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_type?: string;
  start_date?: string;
  end_date?: string;
}

export class AdminPaymentsService extends ApiService {
  /**
   * List all payment transactions on the platform
   */
  async listPayments(
    params: ListAdminPaymentsParams = {}
  ): Promise<AdminPaymentTransaction[]> {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.client.get<AdminPaymentTransaction[]>(
      `/admin/payments?${query}`
    );
    return this.handleResponse(response);
  }

  /**
   * Get details for a specific payment
   */
  async getPaymentDetails(paymentId: number): Promise<AdminPaymentTransaction> {
    const response = await this.client.get<AdminPaymentTransaction>(
      `/admin/payments/${paymentId}`
    );
    return this.handleResponse(response);
  }

  /**
   * Get platform payment statistics
   */
  async getPaymentStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<PaymentStatistics> {
    const params = {
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
    };
    const query = new URLSearchParams(params as any).toString();
    const response = await this.client.get<PaymentStatistics>(
      `/admin/payments/statistics?${query}`
    );
    return this.handleResponse(response);
  }
}

export const adminPaymentsService = new AdminPaymentsService();
