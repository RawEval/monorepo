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
  PlusCircle,
  X,
} from 'lucide-react';
import {
  adminWalletService,
  type WorkbenchWalletView,
} from '@/services/admin/wallet-service';
import { queryKeys } from '@/lib/react-query/query-keys';

function FreezeModal({
  wallet,
  onClose,
}: {
  wallet: WorkbenchWalletView;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => adminWalletService.freezeWallet(wallet.user_id, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="border-border bg-background w-full max-w-md rounded-xl border p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold">
              {wallet.is_frozen ? 'Unfreeze' : 'Freeze'} Wallet
            </h2>
            <p className="text-muted-foreground text-sm">
              User #{wallet.user_id} · {wallet.user?.email}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Reason *
          </label>
          <input
            className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            placeholder="Reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        {error && <p className="text-destructive mt-2 text-xs">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant={wallet.is_frozen ? 'default' : 'destructive'}
            size="sm"
            disabled={!reason || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {wallet.is_frozen ? 'Unfreeze' : 'Freeze'}
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
  wallet: WorkbenchWalletView;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [direction, setDirection] = useState<'credit' | 'debit'>('credit');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      adminWalletService.adjustBalance({
        user_id: wallet.user_id,
        amount: parseFloat(amount),
        direction,
        reason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
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
            <p className="text-muted-foreground text-sm">
              User #{wallet.user_id} · {wallet.user?.email}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as 'credit' | 'debit')}
              className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">Amount *</label>
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
            <label className="text-muted-foreground mb-1 block text-xs font-medium">Reason *</label>
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
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            disabled={!amount || !reason || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WalletsPage() {
  const [freezeTarget, setFreezeTarget] = useState<WorkbenchWalletView | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<WorkbenchWalletView | null>(null);

  const {
    data: wallets,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.wallets.list,
    queryFn: () => adminWalletService.listWallets(),
  });

  return (
    <div className="space-y-6">
      {freezeTarget && (
        <FreezeModal wallet={freezeTarget} onClose={() => setFreezeTarget(null)} />
      )}
      {adjustTarget && (
        <AdjustModal wallet={adjustTarget} onClose={() => setAdjustTarget(null)} />
      )}

      <div>
        <h1 className="text-foreground text-2xl font-semibold">Wallets</h1>
        <p className="text-muted-foreground text-sm">
          Admin view of all workbench wallets with freeze and balance adjustment controls
        </p>
      </div>

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
                  key={wallet.id}
                  className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">
                        {wallet.user?.full_name || wallet.user?.email || `User #${wallet.user_id}`}
                      </span>
                      <Badge
                        variant={wallet.is_frozen ? 'destructive' : 'secondary'}
                        className="text-xs capitalize"
                      >
                        {wallet.is_frozen ? 'Frozen' : 'Active'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {wallet.currency}
                      </Badge>
                    </div>
                    {wallet.user?.email && (
                      <p className="text-muted-foreground text-xs">
                        {wallet.user.email}
                      </p>
                    )}
                    <div className="text-muted-foreground mt-1 flex flex-wrap gap-3 text-xs">
                      <span className="text-foreground font-semibold">
                        {formatCurrency(wallet.available_balance)} available
                      </span>
                      {wallet.pending_balance > 0 && (
                        <span>{formatCurrency(wallet.pending_balance)} pending</span>
                      )}
                      {wallet.held_balance > 0 && (
                        <span>{formatCurrency(wallet.held_balance)} held</span>
                      )}
                    </div>
                    <div className="text-muted-foreground mt-0.5 flex flex-wrap gap-3 text-xs">
                      <span>Earned: {formatCurrency(wallet.total_earned)}</span>
                      <span>Spent: {formatCurrency(wallet.total_spent)}</span>
                      <span>Withdrawn: {formatCurrency(wallet.total_withdrawn)}</span>
                      <span>{wallet.total_transactions} txns</span>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs text-blue-600 hover:text-blue-600"
                      onClick={() => setFreezeTarget(wallet)}
                    >
                      <Snowflake className="h-3.5 w-3.5" />
                      {wallet.is_frozen ? 'Unfreeze' : 'Freeze'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-12 text-center text-sm">
              No wallets found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
