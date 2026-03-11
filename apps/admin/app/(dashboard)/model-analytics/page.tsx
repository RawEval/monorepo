'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '@/services/admin/analytics-service';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { cn } from '@raweval/utils';
import {
  BarChart3,
  Activity,
  Fingerprint,
  ActivityIcon,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export default function ModelAnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['model-failure-summary', dateRange],
    queryFn: () =>
      adminAnalyticsService.getModelFailureSummary({
        date_from: getDateFrom(dateRange),
      }),
  });

  const { data: breakdownData, isLoading: breakdownLoading } = useQuery({
    queryKey: ['model-qc-breakdown', dateRange],
    queryFn: () =>
      adminAnalyticsService.getModelQcBreakdown({
        date_from: getDateFrom(dateRange),
      }),
  });

  function getDateFrom(range: string) {
    const d = new Date();
    if (range === '7d') d.setDate(d.getDate() - 7);
    if (range === '30d') d.setDate(d.getDate() - 30);
    if (range === '90d') d.setDate(d.getDate() - 90);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Activity className="text-primary h-6 w-6" />
            Model Performance Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Holistic view of how models are performing against the QC pipeline.
          </p>
        </div>
        <div className="bg-muted flex w-fit rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                dateRange === r
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Last {r.replace('d', ' days')}
            </button>
          ))}
        </div>
      </div>

      {summaryLoading || breakdownLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted/30 border-border h-40 animate-pulse rounded-xl border"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                  Total Failures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-3xl font-black">
                  {summaryData?.total_failures?.toLocaleString() ?? 0}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Across {summaryData?.total_models ?? 0} models tracked in this
                  period
                </p>
              </CardContent>
            </Card>
            <Card className="border-red-500/20 shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wider text-red-600 uppercase">
                  <Fingerprint className="h-4 w-4" /> Fraud Blocked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-3xl font-black text-red-600">
                  {summaryData?.models
                    .reduce((sum, m) => sum + (m.qc_fraud_blocked || 0), 0)
                    .toLocaleString() ?? 0}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Conversations intercepted by Trust & Safety
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20 shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wider text-emerald-600 uppercase">
                  <CheckCircle2 className="h-4 w-4" /> QC Passed (False
                  Positives)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-3xl font-black text-emerald-600">
                  {summaryData?.models
                    .reduce((sum, m) => sum + (m.qc_false_positive || 0), 0)
                    .toLocaleString() ?? 0}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Cleared by automated checks
                </p>
              </CardContent>
            </Card>
            <Card className="border-yellow-500/20 shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wider text-yellow-600 uppercase">
                  <ShieldAlert className="h-4 w-4" /> Pending Human Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-3xl font-black text-yellow-600">
                  {summaryData?.models
                    .reduce((sum, m) => sum + (m.qc_needs_review || 0), 0)
                    .toLocaleString() ?? 0}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Escalated to expert annotation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payout Stats */}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card className="bg-success/5 border-success/20">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-success text-xs font-semibold tracking-wider uppercase">
                    Total Payout Eligible
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black">
                    {summaryData?.models
                      .reduce((sum, m) => sum + (m.payout_eligible || 0), 0)
                      .toLocaleString() ?? 0}
                  </p>
                </div>
                <CheckCircle2 className="text-success/40 h-8 w-8" />
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-destructive text-xs font-semibold tracking-wider uppercase">
                    Total Payout Blocked
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black">
                    {summaryData?.models
                      .reduce((sum, m) => sum + (m.payout_blocked || 0), 0)
                      .toLocaleString() ?? 0}
                  </p>
                </div>
                <ShieldAlert className="text-destructive/40 h-8 w-8" />
              </CardContent>
            </Card>
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader className="bg-muted/30 border-border border-b">
                <div className="flex items-center gap-2">
                  <ActivityIcon className="text-primary h-5 w-5" />
                  <CardTitle className="text-base font-bold">
                    Latency & Quality (Average)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 text-sm">
                <table className="w-full">
                  <thead className="bg-muted/10 border-border border-b">
                    <tr>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                        Model
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                        FP Score
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                        D-Global
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                        Latency (s)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {breakdownData?.models?.map((m, i) => (
                      <tr
                        key={i}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div
                            className="text-foreground max-w-[200px] truncate font-bold"
                            title={m.model || 'Unknown'}
                          >
                            {m.model || 'Unknown'}
                          </div>
                          <div className="text-muted-foreground text-[10px] tracking-widest uppercase">
                            {m.provider || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {m.avg_fp_score?.toFixed(3) ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {m.avg_d_global?.toFixed(3) ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {m.avg_pipeline_latency_ms
                            ? (m.avg_pipeline_latency_ms / 1000).toFixed(1)
                            : '—'}
                        </td>
                      </tr>
                    ))}
                    {(!breakdownData?.models ||
                      breakdownData.models.length === 0) && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-muted-foreground py-6 text-center"
                        >
                          No benchmark data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="bg-muted/30 border-border border-b">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-primary h-5 w-5" />
                  <CardTitle className="text-base font-bold">
                    Failure Distribution
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {summaryData?.models?.map((m, i) => {
                    const total = m.total_marked_failed || 1;
                    const fpPct = ((m.qc_false_positive || 0) / total) * 100;
                    const hrPct = ((m.qc_needs_review || 0) / total) * 100;
                    const fbPct = ((m.qc_fraud_blocked || 0) / total) * 100;

                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-bold">{m.model}</span>
                          <span className="text-muted-foreground font-mono">
                            {m.total_marked_failed.toLocaleString()} total
                          </span>
                        </div>
                        <div className="bg-muted flex h-3 w-full overflow-hidden rounded-full shadow-inner">
                          <div
                            style={{ width: `${fpPct}%` }}
                            className="border-background/20 h-full border-r bg-emerald-500"
                            title={`False Positives: ${fpPct.toFixed(1)}%`}
                          />
                          <div
                            style={{ width: `${hrPct}%` }}
                            className="border-background/20 h-full border-r bg-yellow-500"
                            title={`Human Review: ${hrPct.toFixed(1)}%`}
                          />
                          <div
                            style={{ width: `${fbPct}%` }}
                            className="h-full bg-red-500"
                            title={`Fraud Blocked: ${fbPct.toFixed(1)}%`}
                          />
                        </div>
                        <div className="text-muted-foreground flex justify-between px-1 text-[10px] font-semibold uppercase">
                          <span>Passed</span>
                          <span>Review / Fraud</span>
                        </div>
                      </div>
                    );
                  })}
                  {(!summaryData?.models ||
                    summaryData.models.length === 0) && (
                    <div className="text-muted-foreground py-6 text-center">
                      No volume breakdown available.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
