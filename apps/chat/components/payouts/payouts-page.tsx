'use client';

import { useState, useMemo } from 'react';
import { formatCurrency, formatDate } from '@/helpers/formatters';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  TrendingUp,
  ArrowLeft,
  Building2,
  Plus,
  Trash2,
  Wallet,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// ScrollArea removed — using native scroll for consistency with wallet/settings pages
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@raweval/utils';
import { paymentsService } from '@/services/payments-service';
import { openRazorpayCheckout } from '@/lib/razorpay';
import type { BankAccountCreate } from '@raweval/types';
import type { FailedConversationItem } from './api/get-payouts';
import { usePayoutsData } from './api/get-payouts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payoutKeys, walletKeys } from '@/lib/react-query/query-keys';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';

const VERDICT_CONFIG: Record<
  string,
  { label: string; icon: typeof Clock; color: string }
> = {
  true_failure: {
    label: 'Confirmed Failure',
    icon: CheckCircle2,
    color: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success-border)]',
  },
  false_positive: {
    label: 'False Positive',
    icon: XCircle,
    color: 'bg-muted text-muted-foreground border-border',
  },
  needs_human_review: {
    label: 'Under Review',
    icon: Clock,
    color: 'bg-primary/10 text-primary border-primary/20',
  },
  analysis_in_progress: {
    label: 'Analyzing...',
    icon: Loader2,
    color: 'bg-primary/10 text-primary border-primary/20',
  },
  analysis_pending: {
    label: 'Queued',
    icon: Clock,
    color: 'bg-muted text-muted-foreground border-border',
  },
  marked_as_failed: {
    label: 'Marked',
    icon: AlertCircle,
    color: 'bg-muted text-muted-foreground border-border',
  },
  completed: {
    label: 'Paid',
    icon: CheckCircle2,
    color: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success-border)]',
  },
  pending: {
    label: 'Pending QA',
    icon: Clock,
    color: 'bg-muted text-muted-foreground border-border',
  },
  failed: {
    label: 'QA Rejected',
    icon: XCircle,
    color: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

const DEFAULT_STATUS_CONFIG = {
  label: 'Processing',
  icon: Clock,
  color: 'bg-muted text-muted-foreground border-border',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor(diff / 60_000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// ---------------------------------------------------------------------------
// Bank Account Dialog
// ---------------------------------------------------------------------------

interface AddBankAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

function AddBankAccountDialog({
  open,
  onClose,
  onAdded,
}: AddBankAccountDialogProps) {
  const [form, setForm] = useState<Partial<BankAccountCreate>>({
    account_type: 'indian_bank',
    currency: 'INR',
    country: 'India',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof BankAccountCreate, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (
      !form.account_holder_name ||
      !form.account_number ||
      !form.bank_name ||
      !form.routing_number
    ) {
      setErr('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      await paymentsService.createBankAccount(form as BankAccountCreate);
      onAdded();
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to add bank account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isIndian = form.account_type === 'indian_bank';

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Account type */}
          <div className="space-y-1.5">
            <Label>Account Type</Label>
            <Select
              value={form.account_type}
              onValueChange={(v: string) => {
                set('account_type', v);
                set('currency', v === 'indian_bank' ? 'INR' : 'USD');
                set('country', v === 'indian_bank' ? 'India' : '');
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indian_bank">Indian Bank (INR)</SelectItem>
                <SelectItem value="foreign_bank">
                  Foreign Bank (USD/EUR/GBP)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account Holder */}
          <div className="space-y-1.5">
            <Label>Account Holder Name</Label>
            <Input
              placeholder="Full name as on bank records"
              value={form.account_holder_name ?? ''}
              onChange={(e) => set('account_holder_name', e.target.value)}
              className="h-9"
            />
          </div>

          {/* Account Number */}
          <div className="space-y-1.5">
            <Label>Account Number</Label>
            <Input
              placeholder={isIndian ? 'e.g. 001234567890' : 'Account number'}
              value={form.account_number ?? ''}
              onChange={(e) => set('account_number', e.target.value)}
              className="h-9"
            />
          </div>

          {/* IFSC / SWIFT */}
          <div className="space-y-1.5">
            <Label>{isIndian ? 'IFSC Code' : 'SWIFT / BIC Code'}</Label>
            <Input
              placeholder={isIndian ? 'e.g. HDFC0001234' : 'e.g. CITIUS33'}
              value={form.routing_number ?? ''}
              onChange={(e) => set('routing_number', e.target.value)}
              className="h-9"
            />
          </div>

          {/* Bank Name */}
          <div className="space-y-1.5">
            <Label>Bank Name</Label>
            <Input
              placeholder="e.g. HDFC Bank"
              value={form.bank_name ?? ''}
              onChange={(e) => set('bank_name', e.target.value)}
              className="h-9"
            />
          </div>

          {/* Currency (auto-set, but editable for foreign) */}
          {!isIndian && (
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select
                value={form.currency}
                onValueChange={(v: string) => set('currency', v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {err && (
            <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-xs">
              {err}
            </p>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Payouts Page
// ---------------------------------------------------------------------------

export function PayoutsPage() {
  const router = useRouter();

  // ---- State ----
  const queryClient = useQueryClient();
  const {
    data,
    isLoading: loading,
    isRefetching: refreshing,
    refetch,
    error: queryError,
  } = usePayoutsData();

  const earnings = data?.earnings || null;
  const payments = data?.payments || [];
  const bankAccounts = data?.bankAccounts || [];

  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<string | null>(null);

  const handleRefresh = () => {
    refetch();
  };

  // ---- Filter ----
  const filteredPayments = useMemo(() => {
    let list = payments as FailedConversationItem[];
    if (statusFilter !== 'all') {
      list = list.filter((p) => {
        const pStatus = p.result_type || p.qc_status || p.status || '';
        return pStatus === statusFilter || p.status === statusFilter;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          String(p.id).includes(q) ||
          (p.result_type || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [payments, statusFilter, searchQuery]);

  // ---- Razorpay Withdrawal ----
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      setWithdrawStatus('Please enter a valid amount.');
      return;
    }
    if (!RAZORPAY_KEY) {
      setWithdrawStatus('Payment gateway not configured. Contact support.');
      return;
    }

    setWithdrawing(true);
    setWithdrawStatus(null);

    try {
      // 1a. Create order on backend intentionally as a pending payment
      const pendingPayment = await paymentsService.createPayment({
        amount: Math.round(amount * 100),
        currency: 'INR',
        payment_type: 'expert_payout',
        description: 'RawEval Wallet Withdrawal',
      });

      // 1b. Create Razorpay order mapping the internal ID
      const order = await paymentsService.createRazorpayOrder({
        payment_id: pendingPayment.payment_id,
        amount: Math.round(amount * 100), // paise
        currency: 'INR',
        notes: 'RawEval Wallet Withdrawal',
      });

      // 2. Open Razorpay checkout modal
      const paymentResult = await openRazorpayCheckout({
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpay_order_id,
        name: 'RawEval',
        description: 'Expert Payout Withdrawal',
        theme: { color: '#6366f1' },
      });

      // 3. Verify signature on backend
      await paymentsService.verifyRazorpayPayment({
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
        payment_id: order.payment_id,
      });

      setWithdrawStatus(
        '✓ Withdrawal successful! Funds will arrive in 1-3 business days.'
      );
      setWithdrawAmount('');
      refetch(); // refresh payout stats
      queryClient.invalidateQueries({ queryKey: walletKeys.all }); // sync wallet balance
    } catch (e: any) {
      const msg: string = e?.message ?? 'Withdrawal failed.';
      if (msg.includes('cancelled')) {
        setWithdrawStatus(null); // user dismissed — no error
      } else {
        setWithdrawStatus(`Error: ${msg}`);
      }
    } finally {
      setWithdrawing(false);
    }
  };

  // ---- Delete bank account ----
  const deleteBankMutation = useMutation({
    mutationFn: (accountId: number) =>
      paymentsService.deleteBankAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (e: any) => {
      setError(e?.message ?? 'Failed to delete bank account.');
    },
  });

  const handleDeleteBankAccount = (accountId: number) => {
    deleteBankMutation.mutate(accountId);
  };

  const setDefaultBankMutation = useMutation({
    mutationFn: (accountId: number) =>
      paymentsService.updateBankAccount(accountId, { is_default: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.all });
    },
    onError: (e: any) => {
      setError(e?.message ?? 'Failed to update bank account.');
    },
  });

  const handleSetDefaultBankAccount = (accountId: number) => {
    setDefaultBankMutation.mutate(accountId);
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const currency = earnings?.currency ?? 'USD';

  // Stat cards derived from API
  const statCards = [
    {
      label: 'Total Earned',
      value: formatCurrency(earnings?.total_earned ?? 0, currency),
      icon: DollarSign,
      iconBg: 'bg-[var(--color-success-subtle)]',
      iconColor: 'text-[var(--color-success)]',
    },
    {
      label: 'Pending Earnings',
      value: formatCurrency(earnings?.pending_earnings ?? 0, currency),
      icon: Clock,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Pending QA',
      value: String(earnings?.pending_qa_count ?? 0),
      icon: AlertCircle,
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
    {
      label: 'Total Responses',
      value: String(earnings?.total_responses ?? 0),
      icon: TrendingUp,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
  ];

  // ---- Loading skeleton ----
  if (loading) {
    return (
      <div className="bg-background flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading payouts…</p>
        </div>
      </div>
    );
  }

  // ---- Main render ----
  return (
    <>
      <AddBankAccountDialog
        open={showAddBank}
        onClose={() => setShowAddBank(false)}
        onAdded={() => {
          queryClient.invalidateQueries({ queryKey: payoutKeys.all });
        }}
      />

      <div className="bg-background flex h-full flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {/* Header — same pattern as Wallet & Settings */}
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
                  Payouts &amp; Earnings
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Track your marked responses and payouts
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw
                  className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')}
                />
                Refresh
              </Button>
            </div>
          </div>

          {/* Error banner — same style as wallet */}
          {(error || queryError) && (
            <div className="border-destructive/20 bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error || queryError?.message || 'Error occurred.'}
            </div>
          )}

          <div className="space-y-6">
            {/* ----------------------------------------------------------------
                Stats Cards
            ---------------------------------------------------------------- */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card
                    key={card.label}
                    className="border-border shadow-subtle card-hover transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-muted-foreground text-xs">
                            {card.label}
                          </p>
                          <p className="text-foreground truncate text-xl font-bold sm:text-2xl">
                            {card.value}
                          </p>
                        </div>
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10',
                            card.iconBg
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4 sm:h-5 sm:w-5',
                              card.iconColor
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* ----------------------------------------------------------------
                Withdrawal Section
            ---------------------------------------------------------------- */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="text-primary h-4 w-4" />
                  Withdraw Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Withdraw your earned balance directly to your bank account or
                  via Razorpay.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative max-w-xs flex-1">
                    <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="Amount in USD"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="h-9 pl-7"
                      min="1"
                      step="1"
                    />
                  </div>
                  <Button
                    onClick={handleWithdraw}
                    disabled={withdrawing || !withdrawAmount}
                    className="shrink-0 gap-2"
                  >
                    {withdrawing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                    {withdrawing ? 'Processing…' : 'Withdraw via Razorpay'}
                  </Button>
                </div>
                {withdrawStatus && (
                  <p
                    className={cn(
                      'rounded-lg px-3 py-2 text-xs font-medium',
                      withdrawStatus.startsWith('✓')
                        ? 'bg-[var(--color-success-subtle)] text-[var(--color-success)]'
                        : 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {withdrawStatus}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* ----------------------------------------------------------------
                Bank Accounts
            ---------------------------------------------------------------- */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="text-primary h-4 w-4" />
                    Bank Accounts
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddBank(true)}
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Account
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bankAccounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Building2 className="text-muted-foreground mb-2 h-6 w-6" />
                    <p className="text-muted-foreground text-sm">
                      No bank accounts added yet
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowAddBank(true)}
                      className="text-primary mt-1 h-auto p-0"
                    >
                      Add your first bank account →
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bankAccounts.map((account) => (
                      <div
                        key={account.id}
                        className={cn(
                          'border-border flex items-center justify-between gap-3 rounded-lg border p-3',
                          account.is_default && 'border-primary/30 bg-primary/5'
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-foreground truncate text-sm font-medium">
                              {account.bank_name}
                            </p>
                            {account.is_default && (
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-xs"
                              >
                                Default
                              </Badge>
                            )}
                            {account.is_verified && (
                              <Badge
                                variant="outline"
                                className="shrink-0 gap-1 border-[var(--color-success-border)] text-xs text-[var(--color-success)]"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {account.account_holder_name} • ••••
                            {account.account_number_last4} •{' '}
                            {account.currency.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {!account.is_default && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                              onClick={() =>
                                handleSetDefaultBankAccount(account.id)
                              }
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-7 w-7"
                            onClick={() => handleDeleteBankAccount(account.id)}
                            aria-label={`Delete ${account.bank_name} account`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ----------------------------------------------------------------
                Payment History
            ---------------------------------------------------------------- */}
            <div className="space-y-3">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                <h2 className="text-foreground text-base font-semibold">
                  Payment History
                </h2>
                <div className="flex flex-1 items-center gap-3">
                  {/* Search */}
                  <div className="relative min-w-0 flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      type="search"
                      placeholder="Search payments…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 pl-9"
                    />
                  </div>

                  {/* Status filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-9 shrink-0 gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {statusFilter === 'all'
                            ? 'All Statuses'
                            : (VERDICT_CONFIG[statusFilter]?.label ??
                              statusFilter)}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                        All Statuses
                      </DropdownMenuItem>
                      {Object.entries(VERDICT_CONFIG).map(
                        ([status, cfg]) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => setStatusFilter(status)}
                          >
                            {cfg.label}
                          </DropdownMenuItem>
                        )
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Payment cards */}
              {filteredPayments.length === 0 ? (
                <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                  <AlertCircle className="text-muted-foreground mb-3 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No payments match your filters'
                      : 'No payments yet'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Mark AI responses as &quot;Wrong&quot; in the chat to start
                    earning
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPayments.map((item: FailedConversationItem) => {
                    const verdictKey = item.result_type || item.qc_status || item.status || '';
                    const statusConf =
                      VERDICT_CONFIG[verdictKey] ?? DEFAULT_STATUS_CONFIG;
                    const StatusIcon = statusConf.icon;

                    return (
                      <Card
                        key={item.id}
                        className="border-border shadow-subtle card-hover cursor-pointer overflow-hidden transition-all hover:shadow-md"
                        onClick={() => router.push(`/chat/${item.id}`)}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                            {/* Left: status + meta */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={cn('gap-1', statusConf.color)}
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  {statusConf.label}
                                </Badge>
                                {item.payout_eligible === true && (
                                  <Badge variant="outline" className="gap-1 bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success-border)]">
                                    <DollarSign className="h-3 w-3" />
                                    $1.00
                                  </Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground text-xs">
                                {item.created_at ? formatTimeAgo(item.created_at) : ''}{item.created_at ? ' • ' : ''}
                                {item.created_at ? formatDate(item.created_at) : ''}
                              </p>
                              <p className="text-foreground text-sm font-medium">
                                {item.title}
                              </p>
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                Conversation #{item.id}
                              </p>
                            </div>

                            {/* Right: view link */}
                            <div className="flex shrink-0 items-center sm:items-start sm:pt-1">
                              <span className="text-primary text-sm font-medium">
                                View →
                              </span>
                            </div>
                          </div>

                          {/* Verdict-specific banners */}
                          {item.result_type === 'true_failure' && (
                            <div className="mt-3 rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-subtle)] px-3 py-2">
                              <p className="text-xs font-medium text-[var(--color-success)]">
                                ✓ Confirmed failure — $1.00 credited to your wallet
                              </p>
                            </div>
                          )}
                          {item.result_type === 'false_positive' && (
                            <div className="border-border bg-muted/30 mt-3 rounded-lg border px-3 py-2">
                              <p className="text-muted-foreground text-xs font-medium">
                                Our analysis found the AI response was correct
                              </p>
                            </div>
                          )}
                          {item.result_type === 'needs_human_review' && (
                            <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                              <p className="text-primary text-xs font-medium">
                                Escalated for human review — verdict pending
                              </p>
                            </div>
                          )}
                          {!item.result_type && item.status !== 'completed' && (
                            <div className="border-border bg-muted/30 mt-3 rounded-lg border px-3 py-2">
                              <p className="text-muted-foreground text-xs font-medium">
                                QC analysis in progress…
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
