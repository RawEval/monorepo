'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ScrollText,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  ExternalLink,
  Activity,
  DollarSign,
  Zap,
  AlertTriangle,
  Server,
  Cpu,
  Settings2,
} from 'lucide-react';
import { adminLLMConfigService } from '@/services/admin/llm-config-service';
import type { LLMCallLog, CallLogFilters } from '@/services/admin/llm-config-service';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'logs', label: 'Call Logs' },
  { key: 'pipeline', label: 'Pipeline Trace' },
  { key: 'stages', label: 'Stages Summary' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtCost(v: number | null | undefined): string {
  if (v == null) return '$0.00';
  return `$${v.toFixed(4)}`;
}

function fmtLatency(ms: number | null | undefined): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtNumber(v: number | null | undefined): string {
  if (v == null) return '0';
  return v.toLocaleString();
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—';
  const dt = new Date(d);
  return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
}

function statusVariant(status: string): 'default' | 'destructive' | 'outline' | 'secondary' {
  if (status === 'success') return 'default';
  if (status === 'error') return 'destructive';
  return 'secondary';
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function LLMLogsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold tracking-tight">
          <ScrollText className="text-primary h-6 w-6" />
          LLM Observability
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor LLM call logs, costs, latencies, and pipeline traces.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="bg-muted flex w-fit rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'logs' && <CallLogsTab />}
      {activeTab === 'pipeline' && <PipelineTraceTab />}
      {activeTab === 'stages' && <StagesSummaryTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 1: Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

function DashboardTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['llm-dashboard'],
    queryFn: () => adminLLMConfigService.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-muted/30 border-border h-32 animate-pulse rounded-xl border"
          />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const periods = [
    { label: 'Last 24 Hours', stats: data.last_24h },
    { label: 'Last 7 Days', stats: data.last_7d },
    { label: 'Last 30 Days', stats: data.last_30d },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Config Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
              <Server className="h-4 w-4" /> Active Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-3xl font-black">
              {data.config.active_providers}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
              <Cpu className="h-4 w-4" /> Registered Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-3xl font-black">
              {data.config.registered_models}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
              <Settings2 className="h-4 w-4" /> QC Stage Configs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-3xl font-black">
              {data.config.qc_stage_configs}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {periods.map((p) => (
          <Card key={p.label} className="shadow-sm">
            <CardHeader className="bg-muted/30 border-border border-b py-3">
              <CardTitle className="text-sm font-bold">{p.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Activity className="h-3.5 w-3.5" /> Calls
                </span>
                <span className="font-mono text-sm font-bold">{fmtNumber(p.stats.calls)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Zap className="h-3.5 w-3.5" /> Tokens
                </span>
                <span className="font-mono text-sm font-bold">{fmtNumber(p.stats.tokens)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <DollarSign className="h-3.5 w-3.5" /> Cost
                </span>
                <span className="font-mono text-sm font-bold">{fmtCost(p.stats.cost_usd)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Activity className="h-3.5 w-3.5" /> Avg Latency
                </span>
                <span className="font-mono text-sm font-bold">{fmtLatency(p.stats.avg_latency_ms)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5" /> Errors
                </span>
                <span className={cn('font-mono text-sm font-bold', p.stats.errors > 0 && 'text-destructive')}>
                  {fmtNumber(p.stats.errors)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Models */}
      {data.top_models_30d && data.top_models_30d.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30 border-border border-b">
            <CardTitle className="text-base font-bold">Top Models (30 days)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-border bg-muted/10 border-b">
                <tr>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Model
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Calls
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {data.top_models_30d.map((m, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="text-foreground px-4 py-3 font-mono text-xs font-bold">
                      {m.model}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {fmtNumber(m.calls)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {fmtCost(m.cost_usd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 2: Call Logs
// ═══════════════════════════════════════════════════════════════════════════════

function CallLogsTab() {
  const [page, setPage] = useState(1);
  const [model, setModel] = useState('');
  const [provider, setProvider] = useState('');
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [includeContent, setIncludeContent] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filters: CallLogFilters = {
    page,
    page_size: PAGE_SIZE,
    ...(model ? { model } : {}),
    ...(provider ? { provider } : {}),
    ...(stage ? { stage } : {}),
    ...(status ? { status } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
    ...(includeContent ? { include_content: true } : {}),
  };

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['llm-call-logs', filters],
    queryFn: () => adminLLMConfigService.listCallLogs(filters),
  });

  const logs = logsData?.items ?? [];
  const totalPages = logsData ? Math.ceil(logsData.total / PAGE_SIZE) : 1;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => { setModel(e.target.value); setPage(1); }}
              placeholder="e.g. gpt-4o"
              className="border-input bg-background h-8 w-40 rounded-md border px-3 text-xs focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => { setProvider(e.target.value); setPage(1); }}
              className="border-input bg-background h-8 rounded-md border px-3 text-xs focus:outline-none"
            >
              <option value="">All</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="deepseek">DeepSeek</option>
              <option value="openrouter">OpenRouter</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Stage
            </label>
            <select
              value={stage}
              onChange={(e) => { setStage(e.target.value); setPage(1); }}
              className="border-input bg-background h-8 rounded-md border px-3 text-xs focus:outline-none"
            >
              <option value="">All</option>
              <option value="process_scoring">Process Scoring</option>
              <option value="fraud_detection">Fraud Detection</option>
              <option value="domain_classification">Domain Classification</option>
              <option value="verdict">Verdict</option>
              <option value="summary">Summary</option>
              <option value="judge">Judge</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="border-input bg-background h-8 rounded-md border px-3 text-xs focus:outline-none"
            >
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="border-input bg-background h-8 rounded-md border px-3 text-xs focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="border-input bg-background h-8 rounded-md border px-3 text-xs focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 self-end pb-1 text-xs">
            <input
              type="checkbox"
              checked={includeContent}
              onChange={(e) => setIncludeContent(e.target.checked)}
              className="accent-primary h-3.5 w-3.5 rounded"
            />
            <span className="text-muted-foreground">Include content</span>
          </label>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-border bg-muted/30 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase">
                <tr>
                  <th className="w-8 px-4 py-3" />
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3 text-right">Tokens</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Latency</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={10} className="px-4 py-4">
                        <div className="bg-muted h-4 w-full rounded" />
                      </td>
                    </tr>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr
                        className={cn(
                          'group cursor-pointer transition-colors',
                          expandedId === log.id
                            ? 'bg-accent/30'
                            : 'hover:bg-accent/50'
                        )}
                        onClick={() =>
                          setExpandedId(expandedId === log.id ? null : log.id)
                        }
                      >
                        <td className="px-4 py-3">
                          {expandedId === log.id ? (
                            <ChevronUp className="text-muted-foreground h-4 w-4" />
                          ) : (
                            <ChevronDown className="text-muted-foreground h-4 w-4" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{log.id}</td>
                        <td className="px-4 py-3">
                          <span className="text-foreground max-w-[180px] truncate font-mono text-xs font-bold" title={log.model_requested}>
                            {log.model_requested}
                          </span>
                        </td>
                        <td className="text-muted-foreground px-4 py-3 text-xs">
                          {log.provider ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          {log.stage ? (
                            <Badge variant="outline" className="bg-background font-mono text-[10px] uppercase">
                              {log.stage}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {fmtNumber(log.total_tokens)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {fmtCost(log.cost_usd)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {fmtLatency(log.latency_ms)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(log.status)} className="text-[10px] uppercase">
                            {log.status}
                          </Badge>
                        </td>
                        <td className="text-muted-foreground px-4 py-3 text-xs">
                          {fmtDate(log.created_at)}
                        </td>
                      </tr>
                      {expandedId === log.id && (
                        <tr className="bg-muted/30">
                          <td colSpan={10} className="px-6 py-4">
                            <CallLogDetail logId={log.id} pipelineId={log.pipeline_id} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-muted-foreground px-6 py-12 text-center">
                      No call logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-border flex items-center justify-between border-t px-6 py-4">
            <span className="text-muted-foreground text-xs">
              Page {page} of {totalPages} ({fmtNumber(logsData?.total ?? 0)} total)
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

// ── Call Log Detail (expanded row) ───────────────────────────────────────────

function CallLogDetail({ logId, pipelineId }: { logId: number; pipelineId: number | null }) {
  const { data: detail, isLoading } = useQuery({
    queryKey: ['llm-call-log-detail', logId],
    queryFn: () => adminLLMConfigService.getCallLogDetail(logId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        <span className="text-muted-foreground text-xs">Loading detail...</span>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs">
        {detail.model_resolved && detail.model_resolved !== detail.model_requested && (
          <span className="text-muted-foreground">
            Resolved: <span className="text-foreground font-mono font-bold">{detail.model_resolved}</span>
          </span>
        )}
        {detail.prompt_name && (
          <span className="text-muted-foreground">
            Prompt: <span className="text-foreground font-mono">{detail.prompt_name}</span>
          </span>
        )}
        {pipelineId && (
          <span className="text-muted-foreground">
            Pipeline:{' '}
            <span className="text-primary cursor-pointer font-mono font-bold hover:underline">
              #{pipelineId}
            </span>
          </span>
        )}
        {detail.error_message && (
          <span className="text-destructive text-xs">
            Error: {detail.error_message}
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <h5 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
            System Prompt
          </h5>
          <pre className="border-border bg-card text-foreground max-h-60 min-h-[60px] overflow-auto rounded-lg border p-3 font-mono text-[10px] leading-relaxed shadow-inner">
            {detail.system_prompt_text || 'N/A'}
          </pre>
        </div>
        <div className="space-y-1">
          <h5 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
            Input
          </h5>
          <pre className="border-border bg-card text-foreground max-h-60 min-h-[60px] overflow-auto rounded-lg border p-3 font-mono text-[10px] leading-relaxed shadow-inner">
            {detail.input_text || 'N/A'}
          </pre>
        </div>
        <div className="space-y-1">
          <h5 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
            Output
          </h5>
          <pre className="border-border bg-card text-foreground max-h-60 min-h-[60px] overflow-auto rounded-lg border p-3 font-mono text-[10px] leading-relaxed shadow-inner">
            {detail.output_text || 'N/A'}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 3: Pipeline Trace
// ═══════════════════════════════════════════════════════════════════════════════

function PipelineTraceTab() {
  const [pipelineId, setPipelineId] = useState('');
  const [loadId, setLoadId] = useState<number | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  const { data, isLoading, isError } = useQuery({
    queryKey: ['llm-pipeline-trace', loadId],
    queryFn: () => adminLLMConfigService.getCallLogsByPipeline(loadId!),
    enabled: loadId !== null,
  });

  function handleLoad() {
    const id = parseInt(pipelineId, 10);
    if (!isNaN(id) && id > 0) {
      setLoadId(id);
      setExpandedStages(new Set());
    }
  }

  function toggleStage(stage: string) {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage);
      else next.add(stage);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <Card className="shadow-sm">
        <CardContent className="flex items-end gap-3 p-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Pipeline ID
            </label>
            <input
              type="number"
              value={pipelineId}
              onChange={(e) => setPipelineId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
              placeholder="e.g. 12345"
              className="border-input bg-background h-8 w-48 rounded-md border px-3 text-xs font-mono focus:outline-none"
            />
          </div>
          <Button size="sm" onClick={handleLoad} disabled={!pipelineId} className="gap-1">
            <Search className="h-3.5 w-3.5" /> Load
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center gap-2 py-8">
          <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          <span className="text-muted-foreground text-sm">Loading pipeline trace...</span>
        </div>
      )}

      {isError && (
        <Card className="border-destructive/30 shadow-sm">
          <CardContent className="py-6 text-center">
            <p className="text-destructive text-sm">Failed to load pipeline trace. Check the pipeline ID.</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-4">
          {/* QC Case Summary */}
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 border-border border-b py-3">
              <CardTitle className="text-sm font-bold">
                Pipeline #{data.pipeline_id} &mdash; QC Case Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-6 text-xs">
                <div>
                  <span className="text-muted-foreground">Total Calls:</span>{' '}
                  <span className="text-foreground font-mono font-bold">{data.summary.total_calls}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Cost:</span>{' '}
                  <span className="text-foreground font-mono font-bold">{fmtCost(data.summary.total_cost_usd)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Tokens:</span>{' '}
                  <span className="text-foreground font-mono font-bold">{fmtNumber(data.summary.total_tokens)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Latency:</span>{' '}
                  <span className="text-foreground font-mono font-bold">{fmtLatency(data.summary.total_latency_ms)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Stages:</span>{' '}
                  <span className="text-foreground font-mono font-bold">{data.summary.stages_count}</span>
                </div>
              </div>

              {data.qc_case && (
                <div className="border-border mt-4 flex flex-wrap items-center gap-4 border-t pt-4 text-xs">
                  {data.qc_case.verdict && (
                    <Badge variant="outline" className="bg-background font-mono text-[10px] uppercase">
                      {data.qc_case.verdict}
                    </Badge>
                  )}
                  {data.qc_case.domain && (
                    <span className="text-muted-foreground">
                      Domain: <span className="text-foreground font-mono">{data.qc_case.domain}</span>
                    </span>
                  )}
                  {data.qc_case.process_score != null && (
                    <span className="text-muted-foreground">
                      Process: <span className="text-foreground font-mono font-bold">{data.qc_case.process_score.toFixed(2)}</span>
                    </span>
                  )}
                  {data.qc_case.fraud_score != null && (
                    <span className="text-muted-foreground">
                      Fraud: <span className="text-foreground font-mono font-bold">{data.qc_case.fraud_score.toFixed(2)}</span>
                    </span>
                  )}
                  {data.qc_case.langfuse_trace_id && (
                    <a
                      href={`https://cloud.langfuse.com/trace/${data.qc_case.langfuse_trace_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs font-mono"
                    >
                      View in Langfuse <ExternalLink className="ml-1 inline h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stages */}
          {data.stages.map((stg) => (
            <Card key={stg.stage} className="shadow-sm">
              <CardHeader
                className={cn(
                  'border-border cursor-pointer border-b py-3 transition-colors hover:bg-muted/20',
                  expandedStages.has(stg.stage) && 'bg-muted/30'
                )}
                onClick={() => toggleStage(stg.stage)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedStages.has(stg.stage) ? (
                      <ChevronUp className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    )}
                    <CardTitle className="text-sm font-bold">
                      <Badge variant="outline" className="bg-background mr-2 font-mono text-[10px] uppercase">
                        {stg.stage}
                      </Badge>
                      <span className="text-muted-foreground font-normal">{stg.model}</span>
                    </CardTitle>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-4 text-xs">
                    <span>{stg.call_count} calls</span>
                    <span>{fmtCost(stg.total_cost_usd)}</span>
                    <span>{fmtLatency(stg.total_latency_ms)}</span>
                  </div>
                </div>
              </CardHeader>
              {expandedStages.has(stg.stage) && (
                <CardContent className="space-y-4 p-4">
                  {stg.calls.map((call) => (
                    <div key={call.id} className="border-border space-y-2 rounded-lg border p-3">
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-mono font-bold">#{call.id}</span>
                        <Badge variant={statusVariant(call.status)} className="text-[10px] uppercase">
                          {call.status}
                        </Badge>
                        <span className="text-muted-foreground">{fmtNumber(call.total_tokens)} tokens</span>
                        <span className="text-muted-foreground">{fmtCost(call.cost_usd)}</span>
                        <span className="text-muted-foreground">{fmtLatency(call.latency_ms)}</span>
                        <span className="text-muted-foreground">{fmtDate(call.created_at)}</span>
                      </div>
                      {call.input_text && (
                        <div className="space-y-1">
                          <h6 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">Input</h6>
                          <pre className="border-border bg-card text-foreground max-h-40 overflow-auto rounded-lg border p-3 font-mono text-[10px] leading-relaxed shadow-inner">
                            {call.input_text}
                          </pre>
                        </div>
                      )}
                      {call.output_text && (
                        <div className="space-y-1">
                          <h6 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">Output</h6>
                          <pre className="border-border bg-card text-foreground max-h-40 overflow-auto rounded-lg border p-3 font-mono text-[10px] leading-relaxed shadow-inner">
                            {call.output_text}
                          </pre>
                        </div>
                      )}
                      {call.error_message && (
                        <p className="text-destructive text-xs">Error: {call.error_message}</p>
                      )}
                    </div>
                  ))}
                  {stg.calls.length === 0 && (
                    <p className="text-muted-foreground py-4 text-center text-xs">No individual calls recorded for this stage.</p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {!data && !isLoading && !isError && (
        <div className="text-muted-foreground py-12 text-center text-sm">
          Enter a pipeline ID and click Load to view the trace.
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 4: Stages Summary
// ═══════════════════════════════════════════════════════════════════════════════

function StagesSummaryTab() {
  const [days, setDays] = useState(7);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['llm-stages-summary', days],
    queryFn: () => adminLLMConfigService.getStagesSummary(days),
  });

  const stages = data?.stages ?? [];

  return (
    <div className="space-y-4">
      {/* Days Selector */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Aggregated stage-level summary of LLM usage.
        </p>
        <div className="bg-muted flex w-fit rounded-lg p-1">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                days === d
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-border bg-muted/30 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase">
                <tr>
                  <th className="w-8 px-4 py-3" />
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Configured Model</th>
                  <th className="px-4 py-3 text-right">Total Calls</th>
                  <th className="px-4 py-3 text-right">Total Cost</th>
                  <th className="px-4 py-3 text-right">Total Errors</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="bg-muted h-4 w-full rounded" />
                      </td>
                    </tr>
                  ))
                ) : stages.length > 0 ? (
                  stages.map((stg) => (
                    <React.Fragment key={stg.stage}>
                      <tr
                        className={cn(
                          'group cursor-pointer transition-colors',
                          expandedStage === stg.stage
                            ? 'bg-accent/30'
                            : 'hover:bg-accent/50'
                        )}
                        onClick={() =>
                          setExpandedStage(expandedStage === stg.stage ? null : stg.stage)
                        }
                      >
                        <td className="px-4 py-3">
                          {expandedStage === stg.stage ? (
                            <ChevronUp className="text-muted-foreground h-4 w-4" />
                          ) : (
                            <ChevronDown className="text-muted-foreground h-4 w-4" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-background font-mono text-[10px] uppercase">
                            {stg.stage}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {stg.configured_model ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-bold">
                          {fmtNumber(stg.total_calls)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-bold">
                          {fmtCost(stg.total_cost_usd)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          <span className={cn(stg.total_errors > 0 && 'text-destructive font-bold')}>
                            {fmtNumber(stg.total_errors)}
                          </span>
                        </td>
                      </tr>
                      {expandedStage === stg.stage && (
                        <tr className="bg-muted/30">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="space-y-2">
                              <h5 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                                Models Used
                              </h5>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead className="border-border border-b">
                                    <tr>
                                      <th className="text-muted-foreground px-3 py-2 text-left text-[10px] font-semibold tracking-wider uppercase">
                                        Model
                                      </th>
                                      <th className="text-muted-foreground px-3 py-2 text-right text-[10px] font-semibold tracking-wider uppercase">
                                        Calls
                                      </th>
                                      <th className="text-muted-foreground px-3 py-2 text-right text-[10px] font-semibold tracking-wider uppercase">
                                        Avg Cost
                                      </th>
                                      <th className="text-muted-foreground px-3 py-2 text-right text-[10px] font-semibold tracking-wider uppercase">
                                        Avg Latency
                                      </th>
                                      <th className="text-muted-foreground px-3 py-2 text-right text-[10px] font-semibold tracking-wider uppercase">
                                        Errors
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-border divide-y">
                                    {stg.models_used.map((m, i) => (
                                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                                        <td className="text-foreground px-3 py-2 font-mono font-bold">
                                          {m.model}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">
                                          {fmtNumber(m.call_count)}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">
                                          {fmtCost(m.avg_cost_usd)}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">
                                          {fmtLatency(m.avg_latency_ms)}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">
                                          <span className={cn(m.error_count > 0 && 'text-destructive font-bold')}>
                                            {fmtNumber(m.error_count)}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                    {stg.models_used.length === 0 && (
                                      <tr>
                                        <td colSpan={5} className="text-muted-foreground py-4 text-center">
                                          No model data.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground px-6 py-12 text-center">
                      No stage summary data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
