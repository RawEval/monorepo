/**
 * Wallet Service — balance, deposits, withdrawals, transfers, ledger
 */
import { api } from '@/lib/api';
import type {
  WalletBalanceResponse,
  WalletTransactionResponse,
  WalletLedgerEntryResponse,
  WalletReconciliationResponse,
  DepositCreate,
  WithdrawalCreate,
  TransferCreate,
} from '@raweval/types';

class WalletService {
  // Balance
  async getBalance(): Promise<WalletBalanceResponse> {
    return api.get<WalletBalanceResponse>('/chat/wallet/balance');
  }

  // Deposits
  async createDeposit(data: DepositCreate): Promise<WalletTransactionResponse> {
    return api.post<WalletTransactionResponse>('/chat/wallet/deposits', data);
  }

  async settleDeposit(transactionId: number): Promise<WalletTransactionResponse> {
    return api.post<WalletTransactionResponse>(`/chat/wallet/deposits/${transactionId}/settle`);
  }

  // Withdrawals
  async createWithdrawal(data: WithdrawalCreate): Promise<WalletTransactionResponse> {
    return api.post<WalletTransactionResponse>('/chat/wallet/withdrawals', data);
  }

  async completeWithdrawal(transactionId: number): Promise<WalletTransactionResponse> {
    return api.post<WalletTransactionResponse>(`/chat/wallet/withdrawals/${transactionId}/complete`);
  }

  async failWithdrawal(transactionId: number): Promise<WalletTransactionResponse> {
    return api.post<WalletTransactionResponse>(`/chat/wallet/withdrawals/${transactionId}/fail`);
  }

  // Transfers
  async createTransfer(data: TransferCreate): Promise<WalletTransactionResponse> {
    return api.post<WalletTransactionResponse>('/chat/wallet/transfers', data);
  }

  // Transaction History
  async getTransactions(limit = 50, offset = 0): Promise<WalletTransactionResponse[]> {
    return api.get<WalletTransactionResponse[]>(`/chat/wallet/transactions?limit=${limit}&offset=${offset}`);
  }

  // Ledger
  async getLedger(limit = 50, offset = 0): Promise<WalletLedgerEntryResponse[]> {
    return api.get<WalletLedgerEntryResponse[]>(`/chat/wallet/ledger?limit=${limit}&offset=${offset}`);
  }

  // Reconciliation
  async reconcile(): Promise<WalletReconciliationResponse> {
    return api.post<WalletReconciliationResponse>('/chat/wallet/reconcile');
  }

  // Withdraw via Razorpay (per API docs)
  async withdrawRazorpay(amount: number, notes?: string): Promise<{ withdrawal_request_id: number; status: string; amount: number; currency: string; message: string }> {
    return api.post('/chat/wallet/withdraw/razorpay', { amount, notes });
  }
}

export const walletService = new WalletService();
