/**
 * Payments Service
 *
 * Covers all /api/v1/chat/payments/* endpoints:
 *  - Payment methods (CRUD)
 *  - Bank accounts (CRUD)
 *  - Payments / Invoices (list, get, create, update)
 *  - Razorpay order creation & signature verification
 *  - Usage & statistics summaries
 *  - User earnings (wallet payout stats)
 */

import { api } from '@/lib/api';
import type {
  PaymentMethodResponse,
  PaymentMethodCreate,
  BankAccountCreate,
  BankAccountUpdate,
  BankAccountResponse,
  PaymentCreate,
  PaymentUpdate,
  PaymentResponse,
  InvoiceResponse,
  RazorpayOrderCreate,
  RazorpayOrderResponse,
  RazorpayVerifyRequest,
  UserEarnings,
} from '@raweval/types';

class PaymentsService {
  // ---------------------------------------------------------------------------
  // Payment Methods
  // ---------------------------------------------------------------------------

  /** Get all payment methods for the current user */
  async getPaymentMethods(): Promise<PaymentMethodResponse[]> {
    return api.get<PaymentMethodResponse[]>('/chat/payments/methods');
  }

  /** Get a specific payment method by ID */
  async getPaymentMethod(methodId: number): Promise<PaymentMethodResponse> {
    return api.get<PaymentMethodResponse>(`/chat/payments/methods/${methodId}`);
  }

  /** Create a new payment method (razorpay | wise | bank_transfer) */
  async createPaymentMethod(
    data: PaymentMethodCreate
  ): Promise<PaymentMethodResponse> {
    return api.post<PaymentMethodResponse>('/chat/payments/methods', data);
  }

  /** Update a payment method — primarily used to set as default */
  async updatePaymentMethod(
    methodId: number,
    isDefault?: boolean
  ): Promise<PaymentMethodResponse> {
    const query = isDefault !== undefined ? `?is_default=${isDefault}` : '';
    return api.patch<PaymentMethodResponse>(
      `/chat/payments/methods/${methodId}${query}`,
      {}
    );
  }

  /** Delete (deactivate) a payment method */
  async deletePaymentMethod(methodId: number): Promise<void> {
    return api.delete(`/chat/payments/methods/${methodId}`);
  }

  // ---------------------------------------------------------------------------
  // Bank Accounts
  // ---------------------------------------------------------------------------

  /** Get all bank accounts, optionally filtered by type */
  async getBankAccounts(
    accountType?: 'indian_bank' | 'foreign_bank' | string
  ): Promise<BankAccountResponse[]> {
    const query = accountType ? `?account_type=${accountType}` : '';
    return api.get<BankAccountResponse[]>(
      `/chat/payments/bank-accounts${query}`
    );
  }

  /** Get a specific bank account by ID */
  async getBankAccount(accountId: number): Promise<BankAccountResponse> {
    return api.get<BankAccountResponse>(
      `/chat/payments/bank-accounts/${accountId}`
    );
  }

  /** Create a new bank account */
  async createBankAccount(
    data: BankAccountCreate
  ): Promise<BankAccountResponse> {
    return api.post<BankAccountResponse>('/chat/payments/bank-accounts', data);
  }

  /** Update bank account details */
  async updateBankAccount(
    accountId: number,
    data: BankAccountUpdate
  ): Promise<BankAccountResponse> {
    return api.patch<BankAccountResponse>(
      `/chat/payments/bank-accounts/${accountId}`,
      data
    );
  }

  /** Delete (deactivate) a bank account */
  async deleteBankAccount(accountId: number): Promise<void> {
    return api.delete(`/chat/payments/bank-accounts/${accountId}`);
  }

  // ---------------------------------------------------------------------------
  // Payments / Invoices
  // ---------------------------------------------------------------------------

  /** Create a new payment */
  async createPayment(data: PaymentCreate): Promise<PaymentResponse> {
    return api.post<PaymentResponse>('/chat/payments', data);
  }

  /** Get payments with optional filtering */
  async getPayments(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    payment_type?: string;
    currency?: string;
  }): Promise<PaymentResponse[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<PaymentResponse[]>(
      `/chat/payments${query ? `?${query}` : ''}`
    );
  }

  /** Get a specific payment by its string ID */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    return api.get<PaymentResponse>(`/chat/payments/${paymentId}`);
  }

  /** Update a payment's status or provider details */
  async updatePayment(
    paymentId: string,
    data: PaymentUpdate
  ): Promise<PaymentResponse> {
    return api.patch<PaymentResponse>(`/chat/payments/${paymentId}`, data);
  }

  /** Get invoices (alias for payments, paginated) */
  async getInvoices(skip = 0, limit = 100): Promise<InvoiceResponse[]> {
    return api.get<InvoiceResponse[]>(
      `/chat/payments/invoices?skip=${skip}&limit=${limit}`
    );
  }

  // ---------------------------------------------------------------------------
  // Razorpay
  // ---------------------------------------------------------------------------

  /**
   * Create a Razorpay order.
   * Returns order ID and amount which are passed to the Razorpay checkout modal.
   */
  async createRazorpayOrder(
    data: RazorpayOrderCreate
  ): Promise<RazorpayOrderResponse> {
    return api.post<RazorpayOrderResponse>(
      '/chat/payments/razorpay/create-order',
      data
    );
  }

  /**
   * Verify a completed Razorpay payment.
   * Must be called after the Razorpay checkout modal callback with the signature.
   */
  async verifyRazorpayPayment(
    data: RazorpayVerifyRequest
  ): Promise<PaymentResponse> {
    return api.post<PaymentResponse>('/chat/payments/razorpay/verify', data);
  }

  // ---------------------------------------------------------------------------
  // Payment Tracking
  // ---------------------------------------------------------------------------

  /**
   * Get tracked payments for a user, optionally filtered by reason.
   * payment_reason values: 'failed_prompt' | 'workbench' | etc.
   */
  async getPaymentsByUser(params?: {
    user_id?: number;
    payment_reason?: string;
    skip?: number;
    limit?: number;
  }): Promise<Record<string, unknown>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<Record<string, unknown>>(
      `/chat/payments/tracking/by-user${query ? `?${query}` : ''}`
    );
  }

  /** Get payments related to a specific prompt */
  async getPaymentsByPrompt(
    promptId: number
  ): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(
      `/chat/payments/tracking/by-prompt?prompt_id=${promptId}`
    );
  }

  /** Get payments related to a specific conversation */
  async getPaymentsByConversation(
    conversationId: number
  ): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(
      `/chat/payments/tracking/by-conversation?conversation_id=${conversationId}`
    );
  }

  // ---------------------------------------------------------------------------
  // Statistics & Earnings
  // ---------------------------------------------------------------------------

  /** Get usage statistics for the current user */
  async getUsageStatistics(): Promise<Record<string, unknown>> {
    return api.get('/chat/payments/usage-statistics');
  }

  /** Get payment statistics summary, optionally filtered by currency */
  async getPaymentStatistics(
    currency?: string
  ): Promise<Record<string, unknown>> {
    const query = currency ? `?currency=${currency}` : '';
    return api.get(`/chat/payments/statistics/summary${query}`);
  }

  /**
   * Get user earnings stats for the Payouts page header cards.
   * Returns: total_earned, pending_earnings, pending_qa_count, total_responses
   */
  async getUserEarnings(): Promise<UserEarnings> {
    return api.get<UserEarnings>('/users/me/earnings');
  }
}

export const paymentsService = new PaymentsService();
