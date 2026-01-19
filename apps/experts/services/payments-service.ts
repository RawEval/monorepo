/**
 * Payments Service
 * 
 * Service for payment-related operations
 */

import { ApiService } from './api-service';

export interface PaymentMethod {
  id: number;
  user_id: number;
  type: 'card' | 'bank_account' | 'paypal' | 'other';
  provider: string;
  last4?: string | null;
  expiry_month?: number | null;
  expiry_year?: number | null;
  is_default: boolean;
  created_at: string;
}

export interface BankAccount {
  id: number;
  user_id: number;
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_type: 'checking' | 'savings';
  is_default: boolean;
  created_at: string;
}

export interface PaymentTransaction {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method_id: number | null;
  bank_account_id: number | null;
  description: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PaymentStatistics {
  total_paid: number;
  total_pending: number;
  total_failed: number;
  currency: string;
  period_start: string;
  period_end: string;
  transactions_count: number;
}

export interface CreatePaymentMethodRequest {
  type: 'card' | 'bank_account' | 'paypal' | 'other';
  provider: string;
  token?: string;
  last4?: string;
  expiry_month?: number;
  expiry_year?: number;
}

export interface CreateBankAccountRequest {
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_type: 'checking' | 'savings';
}

export class PaymentsService extends ApiService {
  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await this.client.get<PaymentMethod[]>(
      '/payments/methods',
    );
    return this.handleResponse(response);
  }

  /**
   * Create payment method
   */
  async createPaymentMethod(
    data: CreatePaymentMethodRequest,
  ): Promise<PaymentMethod> {
    const response = await this.client.post<PaymentMethod>(
      '/payments/methods',
      data,
    );
    return this.handleResponse(response);
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId: number): Promise<void> {
    await this.client.delete(`/payments/methods/${methodId}`);
  }

  /**
   * Get bank accounts
   */
  async getBankAccounts(): Promise<BankAccount[]> {
    const response = await this.client.get<BankAccount[]>(
      '/payments/bank-accounts',
    );
    return this.handleResponse(response);
  }

  /**
   * Create bank account
   */
  async createBankAccount(
    data: CreateBankAccountRequest,
  ): Promise<BankAccount> {
    const response = await this.client.post<BankAccount>(
      '/payments/bank-accounts',
      data,
    );
    return this.handleResponse(response);
  }

  /**
   * Delete bank account
   */
  async deleteBankAccount(accountId: number): Promise<void> {
    await this.client.delete(`/payments/bank-accounts/${accountId}`);
  }

  /**
   * Get payment transactions
   */
  async getPayments(skip = 0, limit = 100): Promise<PaymentTransaction[]> {
    const response = await this.client.get<PaymentTransaction[]>(
      `/payments?skip=${skip}&limit=${limit}`,
    );
    return this.handleResponse(response);
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: number): Promise<PaymentTransaction> {
    const response = await this.client.get<PaymentTransaction>(
      `/payments/${paymentId}`,
    );
    return this.handleResponse(response);
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(
    startDate?: string,
    endDate?: string,
  ): Promise<PaymentStatistics> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await this.client.get<PaymentStatistics>(
      `/payments/statistics/summary${params.toString() ? `?${params.toString()}` : ''}`,
    );
    return this.handleResponse(response);
  }
}

export const paymentsService = new PaymentsService();
