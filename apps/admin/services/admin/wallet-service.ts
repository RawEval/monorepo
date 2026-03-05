import { ApiService } from '../api-service';

export interface WorkbenchWalletView {
  id: number;
  user_id: number;
  available_balance: number;
  pending_balance: number;
  held_balance: number;
  currency: string;
  total_earned: number;
  total_spent: number;
  total_withdrawn: number;
  total_deposited: number;
  total_fees_paid: number;
  total_transactions: number;
  total_failed_prompt_payouts: number;
  total_subscription_payments: number;
  last_transaction_at: string | null;
  created_at: string;
  updated_at: string;
  is_frozen?: boolean;
  user?: {
    id: number;
    email: string;
    full_name: string | null;
  };
}

export interface WalletTransactionResponse {
  id: number;
  wallet_transaction_id: string;
  transaction_type: string;
  status: string;
  amount: number;
  currency: string;
  source_wallet_id: number | null;
  destination_wallet_id: number | null;
  reference_id: string | null;
  wallet_transaction_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface AdjustWalletRequest {
  user_id: number;
  amount: number;
  direction: 'credit' | 'debit';
  reason: string;
}

export interface FreezeWalletRequest {
  reason: string;
}

export class AdminWalletService extends ApiService {
  async listWallets(): Promise<WorkbenchWalletView[]> {
    const response = await this.client.get<WorkbenchWalletView[]>(
      '/admin/workbench-wallets'
    );
    return this.handleResponse(response);
  }

  async getUserWallet(userId: number): Promise<WorkbenchWalletView> {
    const response = await this.client.get<WorkbenchWalletView>(
      `/admin/workbench-wallets/${userId}`
    );
    return this.handleResponse(response);
  }

  async getWalletTransactions(
    userId: number,
    params: { page?: number; page_size?: number } = {}
  ): Promise<WalletTransactionResponse[]> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<WalletTransactionResponse[]>(
      `/admin/workbench-wallets/${userId}/transactions${query}`
    );
    return this.handleResponse(response);
  }

  async freezeWallet(
    userId: number,
    data: FreezeWalletRequest
  ): Promise<unknown> {
    const response = await this.client.patch(
      `/admin/workbench-wallets/${userId}/freeze`,
      data
    );
    return this.handleResponse(response);
  }

  async adjustBalance(data: AdjustWalletRequest): Promise<unknown> {
    const response = await this.client.post(
      '/admin/workbench-wallets/adjust',
      data
    );
    return this.handleResponse(response);
  }

  async getUserTransactions(
    userId: number,
    params: { page?: number; page_size?: number } = {}
  ): Promise<WalletTransactionResponse[]> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<WalletTransactionResponse[]>(
      `/admin/transactions/${userId}${query}`
    );
    return this.handleResponse(response);
  }
}

export const adminWalletService = new AdminWalletService();
