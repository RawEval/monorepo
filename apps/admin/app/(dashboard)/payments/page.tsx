'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { adminPaymentsService, type ListPayoutsParams } from '@/services/admin/payments-service';
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

const PAGE_SIZE = 20;

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const params: ListPayoutsParams = {
    page,
    page_size: PAGE_SIZE,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { data: payoutsData, isLoading } = useQuery({
    queryKey: queryKeys.payments.payouts(params as Record<string, unknown>),
    queryFn: () => adminPaymentsService.listPayouts(params),
  });

  const payouts = payoutsData?.items ?? [];
  const totalPages = payoutsData?.total_pages ?? 1;

  const { data: payoutConfig } = useQuery({
    queryKey: queryKeys.payments.payoutConfig,
    queryFn: () => adminPaymentsService.getPayoutConfig(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Payments & Payouts
          </h1>
          <p className="text-muted-foreground">
            Monitor payouts to experts and reviewers, configure payout rates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Payout Config */}
      {payoutConfig && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-xs font-medium">Tier 1 Rate</p>
              <h3 className="text-foreground mt-1 text-xl font-bold">
                {formatCurrency(payoutConfig.tier_1_rate)}
              </h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-xs font-medium">Tier 2 Rate</p>
              <h3 className="text-foreground mt-1 text-xl font-bold">
                {formatCurrency(payoutConfig.tier_2_rate)}
              </h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-xs font-medium">Tier 3 Rate</p>
              <h3 className="text-foreground mt-1 text-xl font-bold">
                {formatCurrency(payoutConfig.tier_3_rate)}
              </h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-xs font-medium">Pre-Review Rate</p>
              <h3 className="text-foreground mt-1 text-xl font-bold">
                {formatCurrency(payoutConfig.reviewer_pre_rate)}
              </h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-xs font-medium">Post-Review Rate</p>
              <h3 className="text-foreground mt-1 text-xl font-bold">
                {formatCurrency(payoutConfig.reviewer_post_rate)}
              </h3>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border-input bg-background focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader className="border-border/50 bg-muted/20 flex flex-row items-center justify-between border-b py-4">
          <div className="space-y-0.5">
            <CardTitle className="text-base">Payouts</CardTitle>
            <CardDescription>
              All expert and reviewer payouts across the platform.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-border bg-muted/30 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Domain</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="bg-muted h-4 w-full rounded" />
                      </td>
                    </tr>
                  ))
                ) : payouts.length > 0 ? (
                  payouts.map((p) => (
                    <tr
                      key={p.id}
                      className="group transition-colors hover:bg-accent/50"
                    >
                      <td className="text-foreground px-6 py-4 font-mono text-xs font-medium">
                        #{p.id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground text-xs">
                          User #{p.user_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {p.role || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-success font-bold">
                          {formatCurrency(p.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'gap-1 py-0.5',
                            p.status === 'completed'
                              ? 'bg-success/10 text-success border-success/20'
                              : p.status === 'pending'
                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                          )}
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-muted-foreground text-xs capitalize">
                          {p.domain || 'N/A'}
                        </span>
                      </td>
                      <td className="text-muted-foreground px-6 py-4 text-xs">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-muted-foreground px-6 py-12 text-center">
                      No payouts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-border flex items-center justify-between border-t px-6 py-4">
            <span className="text-muted-foreground text-xs">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
