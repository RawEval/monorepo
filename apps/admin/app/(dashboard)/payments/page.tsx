'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Coins,
  ArrowDownLeft,
  TrendingUp,
  CreditCard,
  Filter,
  Download,
} from 'lucide-react';
import {
  adminPaymentsService,
  type ListAdminPaymentsParams,
} from '@/services/admin';
import { queryKeys } from '@/lib/react-query/query-keys';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { cn, formatCurrency } from '@raweval/utils';

export default function PaymentsPage() {
  const [params, _setParams] = useState<ListAdminPaymentsParams>({
    skip: 0,
    limit: 15,
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: queryKeys.paymentsList(params),
    queryFn: () => adminPaymentsService.listPayments(params),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.paymentStats(params.start_date, params.end_date),
    queryFn: () =>
      adminPaymentsService.getPaymentStatistics(
        params.start_date,
        params.end_date
      ),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Payments & Revenue
          </h1>
          <p className="text-muted-foreground">
            Monitor platform-wide financial transactions, revenue distribution,
            and payout status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinanceCard
          title="Total Volume"
          value={formatCurrency(stats?.total_volume || 0)}
          icon={Coins}
          isLoading={statsLoading}
        />
        <FinanceCard
          title="Subscriptions"
          value={formatCurrency(stats?.subscriptions_revenue || 0)}
          icon={CreditCard}
          isLoading={statsLoading}
          subValue="+12% from last month"
        />
        <FinanceCard
          title="Expert Payouts"
          value={formatCurrency(stats?.expert_payouts || 0)}
          icon={ArrowDownLeft}
          isLoading={statsLoading}
          negative
        />
        <FinanceCard
          title="Failed Payouts"
          value={stats?.total_failed.toString() || '0'}
          icon={AlertCircle}
          isLoading={statsLoading}
          negative={stats?.total_failed !== 0}
        />
      </div>

      <Card>
        <CardHeader className="border-border/50 bg-muted/20 flex flex-row items-center justify-between border-b py-4">
          <div className="space-y-0.5">
            <CardTitle className="text-base">Transaction History</CardTitle>
            <CardDescription>
              A complete log of all financial activities across the platform.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-border bg-muted/30 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase">
                <tr>
                  <th className="px-6 py-3">Transaction ID</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="bg-muted h-4 w-full rounded" />
                        </td>
                      </tr>
                    ))
                  : transactions?.map((tx) => (
                      <tr
                        key={tx.id}
                        className="group hover:bg-accent/50 transition-colors"
                      >
                        <td className="text-foreground px-6 py-4 font-mono text-xs font-medium">
                          #{tx.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-foreground line-clamp-1 max-w-[150px] font-medium">
                              {tx.user_email}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              Reference: {tx.reference_id?.substring(0, 10)}...
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="bg-background text-[10px] uppercase"
                          >
                            {tx.transaction_type || 'General'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'font-bold',
                              tx.amount > 0 ? 'text-success' : 'text-foreground'
                            )}
                          >
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              'gap-1 py-0.5',
                              tx.status === 'completed'
                                ? 'bg-success/10 text-success border-success/20'
                                : tx.status === 'pending'
                                  ? 'bg-warning/10 text-warning border-warning/20'
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                            )}
                          >
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="text-muted-foreground px-6 py-4 text-xs">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinanceCard({
  title,
  value,
  icon: Icon,
  isLoading,
  negative,
  subValue,
}: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <div
            className={cn(
              'rounded-md p-1.5',
              negative
                ? 'bg-destructive/10 text-destructive'
                : 'bg-success/10 text-success'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <div className="bg-muted h-8 w-32 animate-pulse rounded" />
          ) : (
            <h3 className="text-foreground text-2xl font-bold tracking-tight">
              {value}
            </h3>
          )}
          {subValue && (
            <p className="text-muted-foreground mt-1 text-xs font-medium">
              {subValue}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-alert-circle"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
