'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  BarChart3,
  GitCompare,
  Table2,
  RefreshCcw,
  Loader2,
} from 'lucide-react';
import {
  adminAnalyticsService,
  type ModelFailureSummaryParams,
  type ModelFailureTrendParams,
  type ModelQcBreakdownParams,
} from '@/services/admin/analytics-service';
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
import { cn } from '@raweval/utils';

type TabId = 'summary' | 'trend' | 'qc' | 'comparison';

const TABS = [
  { id: 'summary' as TabId, label: 'Failure Summary', icon: BarChart3 },
  { id: 'trend' as TabId, label: 'Failure Trend', icon: TrendingUp },
  { id: 'qc' as TabId, label: 'QC Breakdown', icon: Table2 },
  { id: 'comparison' as TabId, label: 'Model Comparison', icon: GitCompare },
] as const;

export default function ModelAnalyticsPage() {
  const [tab, setTab] = useState<TabId>('summary');
  const [summaryParams, setSummaryParams] = useState<ModelFailureSummaryParams>(
    {}
  );
  const [trendParams, setTrendParams] = useState<ModelFailureTrendParams>({
    granularity: 'day',
  });
  const [qcParams, setQcParams] = useState<ModelQcBreakdownParams>({});
  const [compPage, setCompPage] = useState(1);

  const summaryParamsKey = summaryParams as Record<string, unknown>;
  const trendParamsKey = trendParams as Record<string, unknown>;
  const qcParamsKey = qcParams as Record<string, unknown>;
  const compParamsKey = { page: compPage, page_size: 20 } as Record<
    string,
    unknown
  >;

  const {
    data: summaryData,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: queryKeys.modelAnalytics.failureSummary(summaryParamsKey),
    queryFn: () => adminAnalyticsService.getModelFailureSummary(summaryParams),
    enabled: tab === 'summary',
  });

  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: queryKeys.modelAnalytics.failureTrend(trendParamsKey),
    queryFn: () => adminAnalyticsService.getModelFailureTrend(trendParams),
    enabled: tab === 'trend',
  });

  const { data: qcData, isLoading: qcLoading } = useQuery({
    queryKey: queryKeys.modelAnalytics.qcBreakdown(qcParamsKey),
    queryFn: () => adminAnalyticsService.getModelQcBreakdown(qcParams),
    enabled: tab === 'qc',
  });

  const { data: compData, isLoading: compLoading } = useQuery({
    queryKey: queryKeys.modelAnalytics.comparison(compParamsKey),
    queryFn: () =>
      adminAnalyticsService.getModelComparison({
        page: compPage,
        page_size: 20,
      }),
    enabled: tab === 'comparison',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Model Analytics
          </h1>
          <p className="text-muted-foreground">
            Per-model failure rates, QC outcomes, and side-by-side comparison.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => refetchSummary()}
        >
          <RefreshCcw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-border flex gap-1 border-b">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === id
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Failure Summary */}
      {tab === 'summary' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              type="date"
              placeholder="From"
              onChange={(e) =>
                setSummaryParams((p) => ({
                  ...p,
                  date_from: e.target.value || undefined,
                }))
              }
              className="border-input bg-background rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="date"
              placeholder="To"
              onChange={(e) =>
                setSummaryParams((p) => ({
                  ...p,
                  date_to: e.target.value || undefined,
                }))
              }
              className="border-input bg-background rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Provider filter"
              onChange={(e) =>
                setSummaryParams((p) => ({
                  ...p,
                  provider: e.target.value || undefined,
                }))
              }
              className="border-input bg-background w-40 rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          {summaryLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !summaryData?.models.length ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center text-sm">
                No data for the selected filters.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-muted-foreground text-xs">
                      Total Failures
                    </p>
                    <p className="font-mono text-2xl font-bold">
                      {summaryData.total_failures}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-muted-foreground text-xs">Models</p>
                    <p className="font-mono text-2xl font-bold">
                      {summaryData.total_models}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-border bg-muted/30 text-muted-foreground border-b text-left text-xs">
                        <tr>
                          <th className="px-4 py-3">Model</th>
                          <th className="px-4 py-3">Provider</th>
                          <th className="px-4 py-3">Total</th>
                          <th className="px-4 py-3">QC Passed</th>
                          <th className="px-4 py-3">False +</th>
                          <th className="px-4 py-3">Needs Review</th>
                          <th className="px-4 py-3">Fraud</th>
                          <th className="px-4 py-3">Pending</th>
                          <th className="px-4 py-3">Payout ✓</th>
                        </tr>
                      </thead>
                      <tbody className="divide-border divide-y">
                        {summaryData.models.map((m, i) => (
                          <tr key={i} className="hover:bg-accent/30">
                            <td className="px-4 py-3 font-mono text-xs">
                              {m.model ?? '—'}
                            </td>
                            <td className="text-muted-foreground px-4 py-3 text-xs">
                              {m.provider ?? '—'}
                            </td>
                            <td className="px-4 py-3 font-bold">
                              {m.total_marked_failed}
                            </td>
                            <td className="px-4 py-3 text-green-600">
                              {m.qc_passed}
                            </td>
                            <td className="px-4 py-3 text-blue-600">
                              {m.qc_false_positive}
                            </td>
                            <td className="px-4 py-3 text-yellow-600">
                              {m.qc_needs_review}
                            </td>
                            <td className="text-destructive px-4 py-3">
                              {m.qc_fraud_blocked}
                            </td>
                            <td className="text-muted-foreground px-4 py-3">
                              {m.qc_pending}
                            </td>
                            <td className="px-4 py-3 text-green-600">
                              {m.payout_eligible}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Failure Trend */}
      {tab === 'trend' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={trendParams.granularity ?? 'day'}
              onChange={(e) =>
                setTrendParams((p) => ({
                  ...p,
                  granularity: e.target.value as 'day' | 'week' | 'month',
                }))
              }
              className="border-input bg-background rounded-lg border px-3 py-2 text-sm"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
            <input
              type="date"
              onChange={(e) =>
                setTrendParams((p) => ({
                  ...p,
                  date_from: e.target.value || undefined,
                }))
              }
              className="border-input bg-background rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="date"
              onChange={(e) =>
                setTrendParams((p) => ({
                  ...p,
                  date_to: e.target.value || undefined,
                }))
              }
              className="border-input bg-background rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          {trendLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !trendData?.models.length ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center text-sm">
                No trend data.
              </CardContent>
            </Card>
          ) : (
            trendData.models.map((m, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {m.model ?? `Model ${i + 1}`} · {m.provider}
                  </CardTitle>
                  <CardDescription>
                    {m.total} total failures · {trendData.granularity}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {m.data_points.map((d, di) => (
                      <div
                        key={di}
                        className="border-border flex min-w-[48px] flex-col items-center gap-1 rounded border p-2"
                      >
                        <span className="font-mono text-sm font-bold">
                          {d.count}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {d.date.slice(5)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* QC Breakdown */}
      {tab === 'qc' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="date"
              placeholder="From"
              onChange={(e) =>
                setQcParams((p) => ({
                  ...p,
                  date_from: e.target.value || undefined,
                }))
              }
              className="border-input bg-background rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="date"
              placeholder="To"
              onChange={(e) =>
                setQcParams((p) => ({
                  ...p,
                  date_to: e.target.value || undefined,
                }))
              }
              className="border-input bg-background rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          {qcLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !qcData?.models.length ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center text-sm">
                No QC breakdown data.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-border bg-muted/30 text-muted-foreground border-b text-left text-xs">
                      <tr>
                        <th className="px-4 py-3">Model</th>
                        <th className="px-4 py-3">Cases</th>
                        <th className="px-4 py-3">Avg FP Score</th>
                        <th className="px-4 py-3">Avg Process Score</th>
                        <th className="px-4 py-3">Avg D-Global</th>
                        <th className="px-4 py-3">Fraud Flagged</th>
                        <th className="px-4 py-3">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {qcData.models.map((m, i) => (
                        <tr key={i} className="hover:bg-accent/30">
                          <td className="px-4 py-3 font-mono text-xs">
                            {m.model ?? '—'}{' '}
                            <span className="text-muted-foreground">
                              {m.provider}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold">
                            {m.total_qc_cases}
                          </td>
                          <td className="px-4 py-3 font-mono">
                            {m.avg_fp_score?.toFixed(3) ?? '—'}
                          </td>
                          <td className="px-4 py-3 font-mono">
                            {m.avg_process_score?.toFixed(3) ?? '—'}
                          </td>
                          <td className="px-4 py-3 font-mono">
                            {m.avg_d_global?.toFixed(3) ?? '—'}
                          </td>
                          <td className="text-destructive px-4 py-3">
                            {m.fraud_flagged}
                          </td>
                          <td className="text-muted-foreground px-4 py-3">
                            {m.avg_pipeline_latency_ms != null
                              ? `${(m.avg_pipeline_latency_ms / 1000).toFixed(1)}s`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Model Comparison */}
      {tab === 'comparison' && (
        <div className="space-y-4">
          {compLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !(compData?.comparisons ?? compData?.items ?? []).length ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center text-sm">
                No multi-model conversations found.
              </CardContent>
            </Card>
          ) : (
            <>
              {(compData?.comparisons ?? compData?.items ?? []).map((conv) => (
                <Card key={conv.conversation_id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Conversation #{conv.conversation_id}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="border-border text-muted-foreground border-b text-left">
                          <tr>
                            <th className="pr-3 pb-2">Model</th>
                            <th className="pr-3 pb-2">Status</th>
                            <th className="pr-3 pb-2">Verdict</th>
                            <th className="pr-3 pb-2">FP</th>
                            <th className="pr-3 pb-2">Process</th>
                            <th className="pr-3 pb-2">D-Global</th>
                            <th className="pb-2">Payout</th>
                          </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                          {conv.models.map((m, mi) => (
                            <tr key={mi}>
                              <td className="py-2 pr-3 font-mono font-medium">
                                {m.model}
                              </td>
                              <td className="py-2 pr-3">
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {m.fpf_status}
                                </Badge>
                              </td>
                              <td className="py-2 pr-3">
                                <Badge
                                  variant={
                                    m.verdict === 'FailedPrompt'
                                      ? 'destructive'
                                      : 'outline'
                                  }
                                  className="text-[10px]"
                                >
                                  {m.verdict ?? '—'}
                                </Badge>
                              </td>
                              <td className="py-2 pr-3 font-mono">
                                {m.fp_score?.toFixed(3) ?? '—'}
                              </td>
                              <td className="py-2 pr-3 font-mono">
                                {m.process_score?.toFixed(3) ?? '—'}
                              </td>
                              <td className="py-2 pr-3 font-mono">
                                {m.d_global?.toFixed(3) ?? '—'}
                              </td>
                              <td className="py-2">
                                {m.payout_eligible ? '✓' : '✗'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  Page {compPage} of {compData?.total_pages ?? 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={compPage === 1}
                    onClick={() => setCompPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={compPage >= (compData?.total_pages ?? 1)}
                    onClick={() => setCompPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
