'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import { formatCurrency } from '@raweval/utils';
import {
  DollarSign,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import { paymentsService } from '@/services/payments-service';
import { queryKeys } from '@/lib/react-query/query-keys';

const PAGE_SIZE = 20;

export default function PaymentsPage() {
  const [page, setPage] = useState(0);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.paymentStats(),
    queryFn: () => paymentsService.getPaymentStatistics(),
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: queryKeys.paymentsList(page * PAGE_SIZE, PAGE_SIZE),
    queryFn: () => paymentsService.getPayments(page * PAGE_SIZE, PAGE_SIZE),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Payment statistics, transactions, and payout tracking
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="metric text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                formatCurrency(stats?.total_paid ?? 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="metric text-2xl font-bold text-yellow-600">
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                formatCurrency(stats?.total_pending ?? 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="metric text-2xl font-bold text-destructive">
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                formatCurrency(stats?.total_failed ?? 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="metric text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                stats?.transactions_count ?? 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : payments && payments.length > 0 ? (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="code-label text-muted-foreground">
                      #{payment.id}
                    </span>
                    <Badge
                      variant={
                        payment.status === 'completed'
                          ? 'default'
                          : payment.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="gap-1 text-xs"
                    >
                      {payment.status === 'completed' && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {payment.status === 'pending' && (
                        <Clock className="h-3 w-3" />
                      )}
                      {payment.status === 'failed' && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {payment.status}
                    </Badge>
                    {payment.description && (
                      <span className="text-sm text-muted-foreground">
                        {payment.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="metric text-sm font-semibold">
                      {formatCurrency(payment.amount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No transactions found
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
            <span className="text-sm text-muted-foreground">
              Page {page + 1}
            </span>
            <Button
              variant="outline"
              size="sm"
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
