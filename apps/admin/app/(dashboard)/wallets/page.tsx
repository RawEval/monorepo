'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import { formatCurrency } from '@raweval/utils';
import {
  Wallet,
  Loader2,
  AlertTriangle,
  Snowflake,
  Sun,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  adminWalletService,
  type AdminWalletView,
  type AdminWalletAdjustRequest,
} from '@/services/admin/wallet-service';
import { queryKeys } from '@/lib/react-query/query-keys';

const PAGE_SIZE = 20;

function statusVariant(status: AdminWalletView['status']) {
  switch (status) {
    case 'active':
      return 'secondary' as const;
    case 'frozen':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
}

function FreezeModal({
  wallet,
  action,
  onClose,
}: {
  wallet: AdminWalletView;
  action: 'freeze' | 'unfreeze';
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      action === 'freeze'
        ? adminWalletService.freezeWallet(wallet.user_id, reason)
        : adminWalletService.unfreezeWallet(wallet.user_id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'wallets'] });
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="border-border bg-background w-full max-w-md rounded-xl border p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold capitalize">
              {action} Wallet
            </h2>
            <p className="text-muted-foreground text-sm">{wallet.user_email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Reason *
          </label>
          <input
            className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            placeholder={`Reason for ${action}...`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        {error && <p className="text-destructive mt-2 text-xs">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={action === 'freeze' ? 'destructive' : 'default'}
            size="sm"
            disabled={!reason || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            )}
            {action === 'freeze' ? 'Freeze' : 'Unfreeze'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdjustModal({
  wallet,
  onClose,
}: {
  wallet: AdminWalletView;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [txType, setTxType] =
    useState<AdminWalletAdjustRequest['transaction_type']>('manual_credit');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      adminWalletService.adjustWalletBalance(wallet.user_id, {
        amount: parseFloat(amount),
        reason,
        transaction_type: txType,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'wallets'] });
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="border-border bg-background w-full max-w-md rounded-xl border p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold">Adjust Balance</h2>
            <p className="text-muted-foreground text-sm">{wallet.user_email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Type
            </label>
            <select
              value={txType}
              onChange={(e) =>
                setTxType(
                  e.target.value as AdminWalletAdjustRequest['transaction_type']
                )
              }
              className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="manual_credit">Manual Credit</option>
              <option value="manual_debit">Manual Debit</option>
              <option value="correction">Correction</option>
            </select>
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Reason *
            </label>
            <input
              className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              placeholder="Reason for adjustment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-destructive mt-2 text-xs">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!amount || !reason || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            )}
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WalletsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<
    '' | AdminWalletView['status']
  >('');
  const [freezeTarget, setFreezeTarget] = useState<{
    wallet: AdminWalletView;
    action: 'freeze' | 'unfreeze';
  } | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<AdminWalletView | null>(
    null
  );

  const params = {
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    ...(statusFilter
      ? { status: statusFilter as 'active' | 'frozen' | 'suspended' }
      : {}),
  };

  const {
    data: wallets,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.adminWallets(params),
    queryFn: () => adminWalletService.listWallets(params),
  });

  return (
    <div className="space-y-6">
      {freezeTarget && (
        <FreezeModal
          wallet={freezeTarget.wallet}
          action={freezeTarget.action}
          onClose={() => setFreezeTarget(null)}
        />
      )}
      {adjustTarget && (
        <AdjustModal
          wallet={adjustTarget}
          onClose={() => setAdjustTarget(null)}
        />
      )}

      <div>
        <h1 className="text-foreground text-2xl font-semibold">Wallets</h1>
        <p className="text-muted-foreground text-sm">
          Admin view of all user wallets with freeze and balance adjustment
          controls
        </p>
      </div>

      {/* Filters */}
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(
            e.target.value as '' | 'active' | 'frozen' | 'suspended'
          );
          setPage(0);
        }}
        className="border-input bg-background focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="frozen">Frozen</option>
        <option value="suspended">Suspended</option>
      </select>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4" />
            Wallets {wallets ? `(${wallets.length})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <AlertTriangle className="text-destructive h-8 w-8" />
              <p className="text-sm font-medium">Failed to load wallets</p>
              <p className="text-muted-foreground text-xs">{error.message}</p>
            </div>
          ) : wallets && wallets.length > 0 ? (
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <div
                  key={wallet.wallet_id}
                  className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">
                        {wallet.user_full_name || wallet.user_email}
                      </span>
                      <Badge
                        variant={statusVariant(wallet.status)}
                        className="text-xs capitalize"
                      >
                        {wallet.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {wallet.user_email}
                    </p>
                    <div className="text-muted-foreground mt-1 flex flex-wrap gap-3 text-xs">
                      <span className="text-foreground font-semibold">
                        {formatCurrency(wallet.available_balance)} available
                      </span>
                      {wallet.pending_balance > 0 && (
                        <span>
                          {formatCurrency(wallet.pending_balance)} pending
                        </span>
                      )}
                      {wallet.locked_balance > 0 && (
                        <span>
                          {formatCurrency(wallet.locked_balance)} locked
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground mt-0.5 flex flex-wrap gap-3 text-xs">
                      <span>Earned: {formatCurrency(wallet.total_earned)}</span>
                      <span>Spent: {formatCurrency(wallet.total_spent)}</span>
                      <span>
                        Withdrawn: {formatCurrency(wallet.total_withdrawn)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => setAdjustTarget(wallet)}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Adjust
                    </Button>
                    {wallet.status === 'frozen' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() =>
                          setFreezeTarget({ wallet, action: 'unfreeze' })
                        }
                      >
                        <Sun className="h-3.5 w-3.5" />
                        Unfreeze
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs text-blue-600 hover:text-blue-600"
                        onClick={() =>
                          setFreezeTarget({ wallet, action: 'freeze' })
                        }
                      >
                        <Snowflake className="h-3.5 w-3.5" />
                        Freeze
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-12 text-center text-sm">
              {statusFilter
                ? 'No wallets match your filter'
                : 'No wallets found'}
            </p>
          )}

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-muted-foreground text-sm">
              Page {page + 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!wallets || wallets.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
