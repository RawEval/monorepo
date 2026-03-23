/**
 * Subscriptions Service — plans, subscriptions, wallet, API keys
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
  // Plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    return api.get<SubscriptionPlan[]>('/chat/subscriptions/plans');
  }

  async getPlan(planId: number): Promise<SubscriptionPlan> {
    return api.get<SubscriptionPlan>(`/chat/subscriptions/plans/${planId}`);
  }

  // Subscribe / Cancel
  async subscribe(data: SubscribeRequest): Promise<SubscribeResponse> {
    return api.post<SubscribeResponse>('/chat/subscriptions/subscribe', data);
  }

  async cancel(data: CancelSubscriptionRequest): Promise<{ message: string }> {
    return api.post<{ message: string }>('/chat/subscriptions/cancel', data);
  }

  // My Subscriptions
  async getMySubscriptions(): Promise<UserModelSubscription[]> {
    const raw = await api.get<unknown>('/chat/subscriptions/my-subscriptions');
    // Normalize: API may return array or { base_subscription, model_subscriptions }
    if (Array.isArray(raw)) return raw as UserModelSubscription[];
    const obj = raw as {
      base_subscription?: UserModelSubscription | null;
      model_subscriptions?: UserModelSubscription[];
    };
    const result: UserModelSubscription[] = [];
    if (obj.base_subscription) result.push(obj.base_subscription);
    if (obj.model_subscriptions) result.push(...obj.model_subscriptions);
    return result;
  }

  async getMyUsage(): Promise<UserUsageStats> {
    return api.get<UserUsageStats>('/chat/subscriptions/my-usage');
  }

  // Models
  async getAvailableModels(): Promise<AvailableModelsResponse> {
    return api.get<AvailableModelsResponse>('/chat/subscriptions/available-models');
  }

  // Wallet (via subscriptions namespace)
  async getWallet(): Promise<WalletBalance> {
    return api.get<WalletBalance>('/chat/subscriptions/wallet');
  }

  async getTransactions(limit = 50, offset = 0): Promise<Transaction[]> {
    return api.get<Transaction[]>(`/chat/subscriptions/wallet/transactions?limit=${limit}&offset=${offset}`);
  }

  async getTransaction(id: number): Promise<Transaction> {
    return api.get<Transaction>(`/chat/subscriptions/wallet/transactions/${id}`);
  }

  async getTransactionLedger(id: number): Promise<TransactionLedgerEntry[]> {
    return api.get<TransactionLedgerEntry[]>(`/chat/subscriptions/wallet/transactions/${id}/ledger`);
  }

  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    return api.get<ApiKey[]>('/chat/subscriptions/api-keys');
  }

  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKey & { full_key: string }> {
    return api.post<ApiKey & { full_key: string }>('/chat/subscriptions/api-keys', data);
  }

  async deleteApiKey(id: number): Promise<void> {
    return api.delete<void>(`/chat/subscriptions/api-keys/${id}`);
  }
}

export const subscriptionsService = new SubscriptionsService();
