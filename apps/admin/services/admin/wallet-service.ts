/**
 * Admin Wallet Service
 *
 * Manage user wallets, balances, and transaction history.
 */

import { ApiService } from '../api-service';

export interface AdminWalletView {
  wallet_id: string;
  user_id: number;
  user_email: string;
  user_full_name: string | null;
  available_balance: number;
  pending_balance: number;
  locked_balance: number;
  total_earned: number;
  total_spent: number;
  total_withdrawn: number;
  status: 'active' | 'frozen' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface AdminWalletTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: 'credit' | 'debit';
  transaction_type: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string | null;
  reference_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ListAdminWalletsParams {
  skip?: number;
  limit?: number;
  status?: 'active' | 'frozen' | 'suspended';
  search?: string;
}

export interface AdminWalletAdjustRequest {
  amount: number;
  reason: string;
  transaction_type: 'manual_credit' | 'manual_debit' | 'correction';
}

export class AdminWalletService extends ApiService {
  /**
   * List all user wallets with filters and search
   */
  async listWallets(
    params: ListAdminWalletsParams = {}
  ): Promise<AdminWalletView[]> {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.client.get<AdminWalletView[]>(
      `/admin/wallets?${query}`
    );
    return this.handleResponse(response);
  }

  /**
   * Get wallet for a specific user
   */
  async getUserWallet(userId: number): Promise<AdminWalletView> {
    const response = await this.client.get<AdminWalletView>(
      `/admin/wallets/user/${userId}`
    );
    return this.handleResponse(response);
  }

  /**
   * List transactions for a specific wallet
   */
  async getWalletTransactions(
    walletId: string,
    params: { skip?: number; limit?: number } = {}
  ): Promise<AdminWalletTransaction[]> {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.client.get<AdminWalletTransaction[]>(
      `/admin/wallets/${walletId}/transactions?${query}`
    );
    return this.handleResponse(response);
  }

  /**
   * Freeze a user's wallet
   */
  async freezeWallet(userId: number, reason: string): Promise<AdminWalletView> {
    const response = await this.client.post<AdminWalletView>(
      `/admin/wallets/user/${userId}/freeze`,
      { reason }
    );
    return this.handleResponse(response);
  }

  /**
   * Unfreeze a user's wallet
   */
  async unfreezeWallet(
    userId: number,
    reason: string
  ): Promise<AdminWalletView> {
    const response = await this.client.post<AdminWalletView>(
      `/admin/wallets/user/${userId}/unfreeze`,
      { reason }
    );
    return this.handleResponse(response);
  }

  /**
   * Manually adjust a user's wallet balance
   */
  async adjustWalletBalance(
    userId: number,
    data: AdminWalletAdjustRequest
  ): Promise<AdminWalletView> {
    const response = await this.client.post<AdminWalletView>(
      `/admin/wallets/user/${userId}/adjust`,
      data
    );
    return this.handleResponse(response);
  }
}

export const adminWalletService = new AdminWalletService();
