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
};

const TX_STATUS_COLORS: Record<string, string> = {
  completed:
    'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  pending:
    'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  failed: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  cancelled:
    'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
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
    refetch: refetchBalance,
  } = useWalletBalance(1); // passing a dummy or real userId if available
  const {
    data: allTransactions,
    isLoading: isTxLoading,
    refetch: refetchTx,
  } = useWalletTransactions();

  const [showAllTx, setShowAllTx] = useState(false);

  const handleRefresh = useCallback(() => {
    refetchBalance();
    refetchTx();
  }, [refetchBalance, refetchTx]);

  const transactions = allTransactions || [];
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

  return (
    <div className="bg-background flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
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
                <p className="text-muted-foreground text-sm">
                  No transactions yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayedTxs.map((tx) => {
                  const isCredit = [
                    'deposit',
                    'transfer_in',
                    'refund',
                    'payout',
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
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-red-500/10 text-red-600'
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
                            {tx.description || formatDate(tx.created_at)}
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
                            isCredit ? 'text-green-600' : 'text-red-600'
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
