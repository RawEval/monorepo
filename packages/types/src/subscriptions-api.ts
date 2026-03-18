/**
 * Subscriptions API Types
 *
 * Types for the /api/v1/subscriptions/* endpoints covering:
 *  - Plans (free, premium_model, ultimate)
 *  - Subscribing & cancelling
 *  - My subscriptions & usage
 *  - Available models (with access gating)
 *  - Wallet balances & transaction history
 *  - API key management
 */

// ---------------------------------------------------------------------------
// Plan Types
// ---------------------------------------------------------------------------

export type PlanType = 'free' | 'premium_model' | 'ultimate';
export type BillingCycle = 'monthly' | 'annual';

export interface SubscriptionPlanPrice {
  monthly: number;
  annual: number;
}

export interface SubscriptionPlan {
  id: number;
  plan_name: string;
  plan_tier: string;
  plan_type: PlanType;
  description?: string | null;
  /** Features listed on the plan card */
  features?: Record<string, any> | string[] | null;
  model_provider?: string | null;
  model_id?: string | null;
  model_display_name?: string | null;
  max_daily_messages: number;
  max_monthly_messages: number;
  api_access: boolean;
  web_search_enabled: boolean;
  file_upload_enabled: boolean;
  priority_support: boolean;
  monthly_price: number;
  annual_price: number;
  currency: string;
  is_active: boolean;
  is_popular?: boolean;
  badge_text?: string | null;
  sort_order?: number;
}

// ---------------------------------------------------------------------------
// Subscribe / Cancel
// ---------------------------------------------------------------------------

export interface SubscribeRequest {
  plan_id: number;
  billing_cycle: BillingCycle;
  /** Payment ID returned from /payments/razorpay/verify */
  payment_id?: string;
  razorpay_subscription_id?: string;
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
  subscription_id?: number;
  plan: SubscriptionPlan;
  billing_cycle: BillingCycle;
  start_date: string;
  end_date?: string;
  amount_charged: number;
  currency: string;
}

export interface CancelSubscriptionRequest {
  subscription_id: number;
  reason?: string;
}

// ---------------------------------------------------------------------------
// User's Active Subscriptions
// ---------------------------------------------------------------------------

export interface UserModelSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  plan: SubscriptionPlan;
  billing_cycle: BillingCycle;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Usage Stats
// ---------------------------------------------------------------------------

export interface ModelUsageInfo {
  provider: string;
  model: string;
  daily_used: number;
  daily_limit: number | null;
  monthly_used: number;
  monthly_limit: number | null;
}

export interface UserUsageStats {
  subscription_tier: string;
  models: ModelUsageInfo[];
  total_requests_today: number;
  total_requests_month: number;
}

// ---------------------------------------------------------------------------
// Available Models (with gating)
// ---------------------------------------------------------------------------

export interface AvailableModel {
  provider: string;
  model: string;
  display_name: string;
  accessible: boolean;
  reason: string;
  /** If not accessible, the plan that would grant access */
  required_plan?: SubscriptionPlan | null;
  tier: 'free' | 'premium' | 'ultimate';
}

export interface AvailableModelsResponse {
  models: AvailableModel[];
  subscription_tier: string;
}

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

export interface WalletBalance {
  user_id: number;
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  total_spent: number;
  total_withdrawn: number;
  total_deposited: number;
  total_fees: number;
  currency: string;
  active_subscriptions: number;
  last_updated: string;
}

// ---------------------------------------------------------------------------
// Transaction History
// ---------------------------------------------------------------------------

export type TransactionType =
  | 'debit'
  | 'credit'
  | 'refund'
  | 'withdrawal'
  | 'deposit';
export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'reversed';

export interface Transaction {
  id: number;
  user_id: number;
  transaction_type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  reference_id?: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionLedgerEntry {
  id: number;
  transaction_id: number;
  entry_type: 'debit' | 'credit';
  amount: number;
  balance_after: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// API Keys
// ---------------------------------------------------------------------------

export interface ApiKey {
  id: number;
  user_id: number;
  key_prefix: string;
  /** Only returned on creation — never returned again */
  full_key?: string;
  name?: string;
  scopes: string[];
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
}

export interface CreateApiKeyRequest {
  name?: string;
  scopes?: string[];
  expires_in_days?: number;
}

// ---------------------------------------------------------------------------
// Wallet Service Types (/chat/wallet/*)
// ---------------------------------------------------------------------------

export interface WalletBalanceResponse {
  wallet_id?: number;
  user_id: number;
  available: number;
  available_balance?: number;
  pending: number;
  pending_balance?: number;
  locked: number;
  locked_balance?: number;
  total_balance?: number;
  currency: string;
  status?: string;
  total_earned?: number;
  total_spent?: number;
  total_withdrawn?: number;
  total_deposited?: number;
  total_fees_paid?: number;
  total_failed_prompt_payouts?: number;
  total_subscription_payments?: number;
  frozen_at?: string | null;
  frozen_until?: string | null;
  freeze_reason?: string | null;
  is_frozen?: boolean;
  last_transaction_at?: string;
  created_at: string;
}

export interface DepositCreate {
  amount: number;
  currency?: string;
  description?: string;
  payment_id?: string;
  metadata?: Record<string, unknown>;
}

export interface WithdrawalCreate {
  amount: number;
  currency?: string;
  description?: string;
  bank_account_id?: number;
  metadata?: Record<string, unknown>;
}

export interface TransferCreate {
  to_user_id: number;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export type WalletTransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer_in'
  | 'transfer_out'
  | 'fee'
  | 'refund'
  | 'payout'
  | 'failed_prompt_payout'
  | 'subscription_purchase';

export type WalletTransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface WalletTransactionResponse {
  id: number;
  transaction_id?: string;
  user_id: number;
  transaction_type: WalletTransactionType;
  direction?: 'inflow' | 'outflow' | 'internal';
  amount: number;
  currency: string;
  net_amount?: number;
  balance_before?: number;
  balance_after?: number;
  status: WalletTransactionStatus;
  reason?: string;
  description?: string;
  reference_id?: string;
  related_failed_prompt_id?: number | null;
  related_conversation_id?: number | null;
  transaction_fee?: number;
  tax_amount?: number;
  initiated_at?: string;
  completed_at?: string | null;
  failed_at?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WalletLedgerEntryResponse {
  id: number;
  wallet_transaction_id: number;
  entry_type: 'debit' | 'credit';
  amount: number;
  balance_field: 'available' | 'pending' | 'locked';
  balance_before: number;
  balance_after: number;
  created_at: string;
}

export interface WalletReconciliationResponse {
  user_id: number;
  computed_available: number;
  computed_pending: number;
  computed_locked: number;
  stored_available: number;
  stored_pending: number;
  stored_locked: number;
  is_consistent: boolean;
  discrepancies: string[];
}
