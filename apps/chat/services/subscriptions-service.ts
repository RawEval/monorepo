/**
 * Subscriptions Service
 *
 * All /api/v1/chat/subscriptions/* endpoints:
 *  - Plans: list all, get by ID
 *  - Subscribe to a plan / cancel
 *  - My subscriptions & usage stats
 *  - Available models (access gating)
 *  - Wallet balance & transaction history
 *  - API key management (CRUD)
 */

import { api } from '@/lib/api';
import type {
  SubscriptionPlan,
  SubscribeRequest,
  SubscribeResponse,
  CancelSubscriptionRequest,
  UserModelSubscription,
  UserUsageStats,
  AvailableModelsResponse,
  WalletBalance,
  Transaction,
  TransactionLedgerEntry,
  ApiKey,
  CreateApiKeyRequest,
} from '@raweval/types';

class SubscriptionsService {
  // ---------------------------------------------------------------------------
  // Plans
  // ---------------------------------------------------------------------------

  /** List all available plans */
  async getPlans(planType?: string): Promise<SubscriptionPlan[]> {
    const params = new URLSearchParams();
    if (planType) params.set('plan_type', planType);
    params.set('active_only', 'true');
    return api.get<SubscriptionPlan[]>(
      `/chat/subscriptions/plans?${params.toString()}`
    );
  }

  /** Get a single plan by ID */
  async getPlan(planId: number): Promise<SubscriptionPlan> {
    return api.get<SubscriptionPlan>(`/chat/subscriptions/plans/${planId}`);
  }

  // ---------------------------------------------------------------------------
  // Subscribe / Cancel
  // ---------------------------------------------------------------------------

  /** Subscribe to a plan after payment */
  async subscribe(data: SubscribeRequest): Promise<SubscribeResponse> {
    return api.post<SubscribeResponse>('/chat/subscriptions/subscribe', data);
  }

  /** Cancel an active subscription */
  async cancel(data: CancelSubscriptionRequest): Promise<{ message: string }> {
    return api.post('/chat/subscriptions/cancel', data);
  }

  // ---------------------------------------------------------------------------
  // My Subscriptions & Usage
  // ---------------------------------------------------------------------------

  /** Get all active subscriptions for the current user */
  async getMySubscriptions(): Promise<UserModelSubscription[]> {
    const rawRes = await api.get<any>('/chat/subscriptions/my-subscriptions');

    // Safety check: if API already returns an array, just return it
    if (Array.isArray(rawRes)) {
      return rawRes as UserModelSubscription[];
    }

    // Otherwise, normalize the new { base_subscription, model_subscriptions } object into an array
    const subs: UserModelSubscription[] = [];

    // Add base subscription if it exists
    if (rawRes?.base_subscription) {
      subs.push({
        id: rawRes.base_subscription.id || 0,
        user_id: rawRes.user_id,
        plan_id: rawRes.base_subscription.plan_id || 0,
        status: rawRes.base_subscription.status || 'active',
        billing_cycle: rawRes.base_subscription.billing_cycle || 'monthly',
        start_date:
          rawRes.base_subscription.start_date || new Date().toISOString(),
        end_date: rawRes.base_subscription.end_date || null,
        auto_renew:
          rawRes.base_subscription.auto_renew !== undefined
            ? rawRes.base_subscription.auto_renew
            : true,
        created_at:
          rawRes.base_subscription.created_at ||
          rawRes.base_subscription.start_date ||
          new Date().toISOString(),
        plan: {
          id: rawRes.base_subscription.plan_id || 0,
          plan_name: rawRes.base_subscription.plan_name || 'Free',
          plan_tier: rawRes.base_subscription.plan_tier || 'free',
          plan_type: rawRes.base_subscription.plan_type || 'free',
          monthly_price: rawRes.base_subscription.monthly_price || 0,
          annual_price: rawRes.base_subscription.monthly_price
            ? rawRes.base_subscription.monthly_price * 12
            : 0,
          max_daily_messages: 0,
          max_monthly_messages: 0,
          api_access: false,
          web_search_enabled: false,
          file_upload_enabled: false,
          priority_support: false,
          currency: 'USD',
          is_active: true,
        },
      });
    }

    // Add any model-specific premium subscriptions
    if (Array.isArray(rawRes?.model_subscriptions)) {
      rawRes.model_subscriptions.forEach((sub: any) => {
        subs.push({
          id: sub.id || 0,
          user_id: rawRes.user_id,
          plan_id: sub.plan_id || 0,
          status: sub.status || 'active',
          billing_cycle: sub.billing_cycle || 'monthly',
          start_date: sub.start_date || new Date().toISOString(),
          end_date: sub.end_date || null,
          auto_renew: sub.auto_renew !== undefined ? sub.auto_renew : true,
          created_at:
            sub.created_at || sub.start_date || new Date().toISOString(),
          plan: {
            id: sub.plan_id || 0,
            plan_name: sub.plan_name,
            plan_tier: sub.plan_tier || 'premium',
            plan_type: sub.plan_type || 'premium_model',
            monthly_price: sub.monthly_price || 0,
            annual_price: sub.monthly_price ? sub.monthly_price * 12 : 0,
            max_daily_messages: 0,
            max_monthly_messages: 0,
            api_access: false,
            web_search_enabled: false,
            file_upload_enabled: false,
            priority_support: false,
            currency: 'USD',
            is_active: true,
          },
        });
      });
    }

    return subs;
  }

  /** Get current user's usage stats and limits */
  async getMyUsage(): Promise<UserUsageStats> {
    return api.get<UserUsageStats>('/chat/subscriptions/my-usage');
  }

  // ---------------------------------------------------------------------------
  // Available Models
  // ---------------------------------------------------------------------------

  /** Get all models with their subscription access status */
  async getAvailableModels(): Promise<AvailableModelsResponse> {
    return api.get<AvailableModelsResponse>(
      '/chat/subscriptions/available-models'
    );
  }

  // ---------------------------------------------------------------------------
  // Wallet (via subscriptions namespace)
  // ---------------------------------------------------------------------------

  /** Get the current user's wallet balances */
  async getWallet(): Promise<WalletBalance> {
    return api.get<WalletBalance>('/chat/subscriptions/wallet');
  }

  /** Get transaction history */
  async getTransactions(params?: {
    limit?: number;
    offset?: number;
    transaction_type?: string;
    direction?: string;
    status?: string;
  }): Promise<Transaction[]> {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set('limit', String(params.limit));
    if (params?.offset !== undefined) qs.set('offset', String(params.offset));
    if (params?.transaction_type)
      qs.set('transaction_type', params.transaction_type);
    if (params?.direction) qs.set('direction', params.direction);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return api.get<Transaction[]>(`/chat/subscriptions/transactions${query}`);
  }

  /** Get a single transaction */
  async getTransaction(transactionId: string): Promise<Transaction> {
    return api.get<Transaction>(
      `/chat/subscriptions/transactions/${transactionId}`
    );
  }

  /** Get the double-entry ledger entries for a transaction */
  async getTransactionLedger(
    transactionId: string
  ): Promise<TransactionLedgerEntry[]> {
    return api.get<TransactionLedgerEntry[]>(
      `/chat/subscriptions/transactions/${transactionId}/ledger`
    );
  }

  // ---------------------------------------------------------------------------
  // API Keys
  // ---------------------------------------------------------------------------

  /** List all API keys for the current user */
  async getApiKeys(): Promise<ApiKey[]> {
    return api.get<ApiKey[]>('/chat/subscriptions/api-keys');
  }

  /** Generate a new API key (full_key only returned on creation) */
  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKey> {
    return api.post<ApiKey>('/chat/subscriptions/api-keys', data);
  }

  /** Revoke (delete) an API key */
  async deleteApiKey(keyId: number): Promise<void> {
    return api.delete(`/chat/subscriptions/api-keys/${keyId}`);
  }
}

export const subscriptionsService = new SubscriptionsService();
