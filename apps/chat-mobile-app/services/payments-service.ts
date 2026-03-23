/**
 * Payments Service — payment methods, bank accounts, Razorpay, earnings
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
  PaymentStatistics,
  RazorpayOrderCreate,
  RazorpayOrderResponse,
  RazorpayVerifyRequest,
  UserEarnings,
  PaymentTrackingResponse,
} from '@raweval/types';

class PaymentsService {
  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethodResponse[]> {
    return api.get<PaymentMethodResponse[]>('/chat/payments/payment-methods');
  }

  async getPaymentMethod(id: number): Promise<PaymentMethodResponse> {
    return api.get<PaymentMethodResponse>(`/chat/payments/payment-methods/${id}`);
  }

  async createPaymentMethod(data: PaymentMethodCreate): Promise<PaymentMethodResponse> {
    return api.post<PaymentMethodResponse>('/chat/payments/payment-methods', data);
  }

  async deletePaymentMethod(id: number): Promise<void> {
    return api.delete<void>(`/chat/payments/payment-methods/${id}`);
  }

  // Bank Accounts
  async getBankAccounts(): Promise<BankAccountResponse[]> {
    return api.get<BankAccountResponse[]>('/chat/payments/bank-accounts');
  }

  async getBankAccount(id: number): Promise<BankAccountResponse> {
    return api.get<BankAccountResponse>(`/chat/payments/bank-accounts/${id}`);
  }

  async createBankAccount(data: BankAccountCreate): Promise<BankAccountResponse> {
    return api.post<BankAccountResponse>('/chat/payments/bank-accounts', data);
  }

  async updateBankAccount(id: number, data: BankAccountUpdate): Promise<BankAccountResponse> {
    return api.put<BankAccountResponse>(`/chat/payments/bank-accounts/${id}`, data);
  }

  async deleteBankAccount(id: number): Promise<void> {
    return api.delete<void>(`/chat/payments/bank-accounts/${id}`);
  }

  // Payments
  async createPayment(data: PaymentCreate): Promise<PaymentResponse> {
    return api.post<PaymentResponse>('/chat/payments', data);
  }

  async getPayments(): Promise<PaymentResponse[]> {
    return api.get<PaymentResponse[]>('/chat/payments');
  }

  async getPayment(id: number): Promise<PaymentResponse> {
    return api.get<PaymentResponse>(`/chat/payments/${id}`);
  }

  async updatePayment(id: number, data: PaymentUpdate): Promise<PaymentResponse> {
    return api.patch<PaymentResponse>(`/chat/payments/${id}`, data);
  }

  async getInvoices(): Promise<InvoiceResponse[]> {
    return api.get<InvoiceResponse[]>('/chat/payments/invoices');
  }

  // Razorpay
  async createRazorpayOrder(data: RazorpayOrderCreate): Promise<RazorpayOrderResponse> {
    return api.post<RazorpayOrderResponse>('/chat/payments/razorpay/create-order', data);
  }

  async verifyRazorpayPayment(data: RazorpayVerifyRequest): Promise<{ verified: boolean }> {
    return api.post<{ verified: boolean }>('/chat/payments/razorpay/verify', data);
  }

  // Tracking
  async getPaymentsByUser(userId: number): Promise<PaymentTrackingResponse[]> {
    return api.get<PaymentTrackingResponse[]>(`/chat/payments/tracking/user/${userId}`);
  }

  async getPaymentsByPrompt(promptId: number): Promise<PaymentTrackingResponse[]> {
    return api.get<PaymentTrackingResponse[]>(`/chat/payments/tracking/prompt/${promptId}`);
  }

  async getPaymentsByConversation(conversationId: number): Promise<PaymentTrackingResponse[]> {
    return api.get<PaymentTrackingResponse[]>(`/chat/payments/tracking/conversation/${conversationId}`);
  }

  // Statistics
  async getUsageStatistics(): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>('/chat/payments/statistics/usage');
  }

  async getPaymentStatistics(): Promise<PaymentStatistics> {
    return api.get<PaymentStatistics>('/chat/payments/statistics');
  }

  async getUserEarnings(): Promise<UserEarnings> {
    return api.get<UserEarnings>('/users/me/earnings');
  }
}

export const paymentsService = new PaymentsService();
