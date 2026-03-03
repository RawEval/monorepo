/**
 * Wallet Service
 *
 * All /api/v1/chat/wallet/* endpoints:
 *  - Balance (available, pending, locked)
 *  - Deposits (create, settle)
 *  - Withdrawals (create, complete, fail)
 *  - Transfers (wallet-to-wallet)
 *  - Transaction history
 *  - Ledger (double-entry bookkeeping)
 *  - Reconciliation
 */

import { api } from '@/lib/api';
import type {
  WalletBalanceResponse,
  DepositCreate,
  WithdrawalCreate,
  TransferCreate,
  WalletTransactionResponse,
  WalletLedgerEntryResponse,
  WalletReconciliationResponse,
} from '@raweval/types';

class WalletService {
  // ---------------------------------------------------------------------------
  // Balance
  // ---------------------------------------------------------------------------

  /** Get wallet balance (available, pending, locked, totals) */
  async getBalance(): Promise<WalletBalanceResponse> {
    return api.get<WalletBalanceResponse>('/chat/wallet/balance');
  }

  // ---------------------------------------------------------------------------
  // Deposits
  // ---------------------------------------------------------------------------

  /** Create a deposit (money starts as pending) */
  async createDeposit(
    data: DepositCreate,
    idempotencyKey?: string
  ): Promise<WalletTransactionResponse> {
    const opts = idempotencyKey
      ? { headers: { 'Idempotency-Key': idempotencyKey } }
      : undefined;
    return api.post<WalletTransactionResponse>(
      '/chat/wallet/deposit',
      data,
      opts
    );
  }

  /** Settle a pending deposit (pending → available) */
  async settleDeposit(
    walletTransactionId: number
  ): Promise<WalletTransactionResponse> {
    return api.post<WalletTransactionResponse>(
      `/chat/wallet/deposit/${walletTransactionId}/settle`
    );
  }

  // ---------------------------------------------------------------------------
  // Withdrawals
  // ---------------------------------------------------------------------------

  /** Create a withdrawal (available → locked) */
  async createWithdrawal(
    data: WithdrawalCreate,
    idempotencyKey?: string
  ): Promise<WalletTransactionResponse> {
    const opts = idempotencyKey
      ? { headers: { 'Idempotency-Key': idempotencyKey } }
      : undefined;
    return api.post<WalletTransactionResponse>(
      '/chat/wallet/withdraw',
      data,
      opts
    );
  }

  /** Complete a withdrawal (deduct locked permanently) */
  async completeWithdrawal(
    walletTransactionId: number
  ): Promise<WalletTransactionResponse> {
    return api.post<WalletTransactionResponse>(
      `/chat/wallet/withdraw/${walletTransactionId}/complete`
    );
  }

  /** Fail a withdrawal (release locked → available) */
  async failWithdrawal(
    walletTransactionId: number,
    reason?: string
  ): Promise<WalletTransactionResponse> {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return api.post<WalletTransactionResponse>(
      `/chat/wallet/withdraw/${walletTransactionId}/fail${query}`
    );
  }

  // ---------------------------------------------------------------------------
  // Transfers
  // ---------------------------------------------------------------------------

  /** Transfer money between wallets (atomic) */
  async createTransfer(
    data: TransferCreate,
    idempotencyKey?: string
  ): Promise<WalletTransactionResponse> {
    const opts = idempotencyKey
      ? { headers: { 'Idempotency-Key': idempotencyKey } }
      : undefined;
    return api.post<WalletTransactionResponse>(
      '/chat/wallet/transfer',
      data,
      opts
    );
  }

  // ---------------------------------------------------------------------------
  // Transaction History
  // ---------------------------------------------------------------------------

  /** Get wallet transaction history */
  async getTransactions(
    limit = 100,
    offset = 0
  ): Promise<WalletTransactionResponse[]> {
    return api.get<WalletTransactionResponse[]>(
      `/chat/wallet/transactions?limit=${limit}&offset=${offset}`
    );
  }

  // ---------------------------------------------------------------------------
  // Ledger
  // ---------------------------------------------------------------------------

  /** Get double-entry ledger history */
  async getLedger(
    limit = 100,
    offset = 0
  ): Promise<WalletLedgerEntryResponse[]> {
    return api.get<WalletLedgerEntryResponse[]>(
      `/chat/wallet/ledger?limit=${limit}&offset=${offset}`
    );
  }

  // ---------------------------------------------------------------------------
  // Reconciliation
  // ---------------------------------------------------------------------------

  /** Reconcile wallet balance from ledger entries */
  async reconcile(): Promise<WalletReconciliationResponse> {
    return api.get<WalletReconciliationResponse>('/chat/wallet/reconcile');
  }
}

export const walletService = new WalletService();
