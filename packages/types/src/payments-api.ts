/**
 * Payments API Types
 *
 * Covers: payment methods, bank accounts, payments, Razorpay orders,
 * payment tracking, earnings statistics, and failure-analysis mark-failed.
 */

// ---------------------------------------------------------------------------
// Payment Method
// ---------------------------------------------------------------------------

export interface PaymentMethodResponse {
  id: number;
  user_id: number;
  method_type: string;
  method_name: string;
  is_default: boolean;
  created_at?: string;
}

export interface PaymentMethodCreate {
  method_type: 'razorpay' | 'wise' | 'bank_transfer' | string;
  provider_token?: string;
  is_default?: boolean;
}

// ---------------------------------------------------------------------------
// Bank Account
// ---------------------------------------------------------------------------

export interface BankAccountCreate {
  account_type: 'indian_bank' | 'foreign_bank' | string;
  account_holder_name: string;
  account_number: string;
  /** IFSC for Indian banks, SWIFT/BIC for foreign banks */
  routing_number?: string;
  bank_name: string;
  bank_address?: string;
  country: string;
  currency: string;
  is_default?: boolean;
}

export interface BankAccountUpdate {
  account_holder_name?: string;
  routing_number?: string;
  bank_name?: string;
  bank_address?: string;
  is_default?: boolean;
  is_active?: boolean;
}

export interface BankAccountResponse {
  id: number;
  user_id: number;
  account_type: string;
  account_holder_name: string;
  /** Only last 4 digits returned by API */
  account_number_last4: string;
  routing_number: string;
  bank_name: string;
  country: string;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

export interface PaymentCreate {
  amount: number;
  currency: string;
  payment_type: string;
  payment_method_id?: number;
  description?: string;
  payment_reason?: string;
}

export interface PaymentUpdate {
  status?: string;
  provider_payment_id?: string;
  receipt_url?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
  id: number;
  payment_id: string;
  user_id: number;
  payment_method_id?: number | null;
  amount: number;
  currency: string;
  status: string;
  payment_type?: string | null;
  payment_reason?: string | null;
  description?: string | null;
  created_at: string;
  updated_at?: string | null;
  provider_payment_id?: string | null;
  receipt_url?: string | null;
  metadata?: Record<string, unknown> | null;
}

/** Invoices are an alias for payments */
export type InvoiceResponse = PaymentResponse;

// ---------------------------------------------------------------------------
// Payment Tracking
// ---------------------------------------------------------------------------

/** Response from GET /payments/tracking/by-user */
export interface PaymentTrackingResponse {
  payments: PaymentResponse[];
  total: number;
  skip: number;
  limit: number;
}

// ---------------------------------------------------------------------------
// Payment Statistics
// ---------------------------------------------------------------------------

export interface PaymentStatistics {
  total_paid: number;
  total_pending: number;
  total_failed: number;
  currency: string;
  payment_count: number;
  last_payment_date?: string | null;
}

// ---------------------------------------------------------------------------
// Razorpay
// ---------------------------------------------------------------------------

export interface RazorpayOrderCreate {
  /** Amount in smallest currency unit (e.g. paise for INR) */
  amount: number;
  currency?: string;
  notes?: string;
  payment_method_id?: number;
  payment_id: string;
}

export interface RazorpayOrderResponse {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  payment_id: string;
  key_id?: string;
}

export interface RazorpayVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  payment_id?: string;
}

// ---------------------------------------------------------------------------
// User Earnings (GET /users/me/earnings)
// ---------------------------------------------------------------------------

export interface UserEarnings {
  total_earned: number;
  pending_earnings: number;
  pending_qa_count: number;
  total_responses: number;
  currency?: string;
}

// ---------------------------------------------------------------------------
// Failure Analysis — Mark Failed (POST /failure-analysis/mark-failed)
// ---------------------------------------------------------------------------

export interface MarkFailedRequest {
  /** LLMCallSession ID */
  conversation_id: number;
  domain_id?: number;
  /** Number of Tier-1 annotators (default 3) */
  tier1_count?: number;
  /** Number of Tier-2 annotators (default 3) */
  tier2_count?: number;
  /** Number of Tier-3 annotators (default 3) */
  tier3_count?: number;
  /** Pre-annotation reviewer count (default 0) */
  reviewer_count_pre?: number;
  /** Post-annotation reviewer count (default 0) */
  reviewer_count_post?: number;
  notes?: string;
}

export interface MarkFailedResponse {
  conversation_id: number;
  failed_prompt_final_id?: number | null;
  status: string;
  message: string;
  analysis_triggered: boolean;
}
