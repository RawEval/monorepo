'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/helpers/formatters';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  ArrowLeft,
  Loader2,
  TrendingUp,
  Clock,
  Lock,
  ChevronDown,
  DollarSign,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@raweval/ui/card';
import { useWalletBalance, useWalletTransactions } from './api/get-wallet';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TX_TYPE_LABELS: Record<string, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  transfer_in: 'Transfer In',
  transfer_out: 'Transfer Out',
  fee: 'Fee',
  refund: 'Refund',
  payout: 'Payout',
  failed_prompt_payout: 'Failed Prompt Payout',
  subscription_purchase: 'Subscription',
};

const TX_STATUS_COLORS: Record<string, string> = {
  completed:
    'bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success-border)]',
  pending:
    'bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning-subtle)]',
  failed: 'bg-[var(--color-error-subtle)] text-[var(--color-error)] border-[var(--color-error-subtle)]',
  cancelled:
    'bg-muted text-muted-foreground border-border',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WalletPage() {
  const router = useRouter();

  // We assume user is logged in if they're on this page
  const {
    data: balance,
    isLoading: isBalanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useWalletBalance(1);
  const {
    data: allTransactions,
    isLoading: isTxLoading,
    error: txError,
    refetch: refetchTx,
  } = useWalletTransactions();

  const [showAllTx, setShowAllTx] = useState(false);

  const handleRefresh = useCallback(() => {
    refetchBalance();
    refetchTx();
  }, [refetchBalance, refetchTx]);

  // API may return an array directly or a paginated wrapper { items: [...] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = allTransactions as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transactions: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  const loading = isBalanceLoading || isTxLoading;

  // ---------------------------------------------------------------------------
  // Skeleton
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="bg-background flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading wallet…</p>
        </div>
      </div>
    );
  }

  const displayedTxs = showAllTx ? transactions : transactions.slice(0, 10);
  const hasError = balanceError || txError;

  return (
    <div className="bg-background flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Error banner */}
        {hasError && (
          <div className="mb-4 rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-error-subtle)] p-3">
            <div className="flex items-center gap-2 text-sm text-[var(--color-error)]">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{(balanceError as Error)?.message || (txError as Error)?.message || 'Failed to load wallet data.'}</span>
              <Button variant="ghost" size="sm" onClick={handleRefresh} className="ml-auto gap-1 text-xs">
                <RefreshCw className="h-3 w-3" /> Retry
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 space-y-4 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hover:text-foreground text-muted-foreground w-fit gap-2 pl-0 hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground mb-2 text-2xl font-bold sm:text-3xl">
                Wallet
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Manage your balance, deposits, and withdrawals
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Wallet Freeze Warning */}
        {balance?.is_frozen && (
          <div className="mb-6 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error-subtle)] p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-[var(--color-error)]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--color-error)]">
                  Wallet Frozen
                </p>
                <p className="mt-1 text-xs text-[var(--color-error)]/80">
                  {balance.freeze_reason || 'Your wallet has been temporarily frozen.'}
                </p>
                {balance.frozen_until && (
                  <p className="mt-1.5 text-xs font-medium text-[var(--color-error)]">
                    Unfreezes: {formatDate(balance.frozen_until)}
                  </p>
                )}
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Deposits are still allowed. Withdrawals and transfers are blocked until the freeze expires.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Earned Stats */}
        {(balance?.total_earned != null && balance.total_earned > 0) && (
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Total earned: {formatCurrency(balance.total_earned, balance.currency)}
            </span>
            {balance.total_failed_prompt_payouts != null && (
              <span>{balance.total_failed_prompt_payouts} payout{balance.total_failed_prompt_payouts !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}

        {/* Balance Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-primary/20 from-primary/5 bg-linear-to-br to-transparent">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Available Balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-3xl font-bold">
                {formatCurrency(balance?.available ?? 0, balance?.currency)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-3xl font-bold">
                {formatCurrency(balance?.pending ?? 0, balance?.currency)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Locked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-3xl font-bold">
                {formatCurrency(balance?.locked ?? 0, balance?.currency)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="text-muted-foreground h-5 w-5" />
              <CardTitle>Transaction History</CardTitle>
            </div>
            <CardDescription>
              All deposits, withdrawals, and transfers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="py-12 text-center">
                <DollarSign className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
                <p className="text-foreground mb-1 text-sm font-medium">
                  No transactions yet
                </p>
                <p className="text-muted-foreground mx-auto max-w-xs text-xs">
                  Mark AI responses as &ldquo;Wrong&rdquo; in the chat to earn $1 per confirmed failure. Your payouts will appear here.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2"
                  onClick={() => router.push('/chat')}
                >
                  Go to Chat
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {displayedTxs.map((tx) => {
                  const isCredit = [
                    'deposit',
                    'transfer_in',
                    'refund',
                    'payout',
                    'failed_prompt_payout',
                  ].includes(tx.transaction_type);

                  return (
                    <div
                      key={tx.id}
                      className="border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors sm:p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            isCredit
                              ? 'bg-[var(--color-success-subtle)] text-[var(--color-success)]'
                              : 'bg-[var(--color-error-subtle)] text-[var(--color-error)]'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownToLine className="h-4 w-4" />
                          ) : (
                            <ArrowUpFromLine className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground text-sm font-medium">
                            {TX_TYPE_LABELS[tx.transaction_type] ??
                              tx.transaction_type}
                          </p>
                          <p className="text-muted-foreground max-w-[200px] truncate text-xs sm:max-w-none">
                            {tx.reason || tx.description || formatDate(tx.created_at)}
                            {tx.related_conversation_id && (
                              <button
                                onClick={() => router.push(`/chat/${tx.related_conversation_id}`)}
                                className="text-[var(--color-signal)] hover:underline ml-1"
                              >
                                View chat
                              </button>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${TX_STATUS_COLORS[tx.status] ?? ''}`}
                        >
                          {tx.status}
                        </Badge>
                        <span
                          className={`text-sm font-semibold tabular-nums ${
                            isCredit ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                          }`}
                        >
                          {isCredit ? '+' : '−'}
                          {formatCurrency(tx.amount, tx.currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Load More */}
                {!showAllTx && transactions.length >= 10 && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllTx(true)}
                      className="gap-2"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
