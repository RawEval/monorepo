'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Hash,
  Globe,
  Paperclip,
  Cpu,
  FileText,
  Download,
  Filter,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { adminLLMConfigService } from '@/services/admin/llm-config-service';
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
import type {
  SessionFullTrace,
  LLMCallLog,
  WebSearchRecord,
  FileAttachment,
} from '@/services/admin/llm-config-service';

type TabId = 'trace' | 'web-searches' | 'attachments';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'trace', label: 'Session Trace', icon: <Cpu className="h-4 w-4" /> },
  { id: 'web-searches', label: 'Web Searches', icon: <Globe className="h-4 w-4" /> },
  { id: 'attachments', label: 'File Attachments', icon: <Paperclip className="h-4 w-4" /> },
];

function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
}

function formatCost(cost: number | null | undefined): string {
  if (cost == null) return '$0.00';
  return `$${cost.toFixed(4)}`;
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '...';
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function SessionTracePage() {
  const [activeTab, setActiveTab] = useState<TabId>('trace');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Search className="text-primary h-6 w-6" />
          Session Trace & Data
        </h1>
        <p className="text-muted-foreground mt-1">
          Full trace of sessions, web searches, and file attachments.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-border flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'trace' && <SessionTraceTab />}
      {activeTab === 'web-searches' && <WebSearchesTab />}
      {activeTab === 'attachments' && <AttachmentsTab />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1: Session Trace
// ─────────────────────────────────────────────────────────────────────────────

function SessionTraceTab() {
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);

  const { data: trace, isLoading, isError, error } = useQuery({
    queryKey: ['session-trace', 'full-trace', sessionId],
    queryFn: () => adminLLMConfigService.getSessionFullTrace(sessionId!),
    enabled: sessionId != null,
  });

  const handleLoad = () => {
    const parsed = parseInt(sessionIdInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSessionId(parsed);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 max-w-xs">
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Session ID
              </label>
              <input
                type="number"
                min={1}
                value={sessionIdInput}
                onChange={(e) => setSessionIdInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Enter session ID..."
              />
            </div>
            <Button onClick={handleLoad} disabled={!sessionIdInput.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Load Trace
            </Button>
          </div>
        </CardContent>
      </Card>

      {isError && (
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {(error as Error)?.message || 'Failed to load session trace.'}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      )}

      {trace && <SessionTraceView trace={trace} />}
    </div>
  );
}

function SessionTraceView({ trace }: { trace: SessionFullTrace }) {
  const { session, summary, llm_calls, web_searches, attachments } = trace;
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const toggleEvent = (key: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Build chronological timeline
  type TimelineEvent =
    | { type: 'llm'; data: LLMCallLog; time: string | null }
    | { type: 'search'; data: WebSearchRecord; time: string | null }
    | { type: 'attachment'; data: FileAttachment; time: string | null };

  const events: TimelineEvent[] = [
    ...llm_calls.map((c) => ({ type: 'llm' as const, data: c, time: c.created_at })),
    ...web_searches.map((s) => ({ type: 'search' as const, data: s, time: s.created_at ?? s.search_timestamp })),
    ...attachments.map((a) => ({ type: 'attachment' as const, data: a, time: a.created_at })),
  ].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return new Date(a.time).getTime() - new Date(b.time).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <Card>
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-lg">Session #{session.id}</CardTitle>
          <CardDescription>
            <span className="inline-flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span>User ID: <strong>{session.user_id ?? '-'}</strong></span>
              <span>Title: <strong>{session.title ?? 'Untitled'}</strong></span>
              <span>Model: <strong>{session.model ?? '-'}</strong></span>
              <span>Created: <strong>{formatDate(session.created_at)}</strong></span>
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <SummaryCard icon={<Cpu className="h-4 w-4" />} label="LLM Calls" value={summary.total_llm_calls} />
        <SummaryCard icon={<DollarSign className="h-4 w-4" />} label="Total Cost" value={formatCost(summary.total_cost_usd)} />
        <SummaryCard icon={<Hash className="h-4 w-4" />} label="Total Tokens" value={summary.total_tokens.toLocaleString()} />
        <SummaryCard icon={<Globe className="h-4 w-4" />} label="Web Searches" value={summary.web_searches} />
        <SummaryCard icon={<Paperclip className="h-4 w-4" />} label="Attachments" value={summary.attachments} />
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Timeline</CardTitle>
          <CardDescription>{events.length} events</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {events.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center text-sm">No events found.</div>
          ) : (
            <div className="divide-border divide-y">
              {events.map((event, idx) => {
                const key = `${event.type}-${event.type === 'llm' ? event.data.id : event.type === 'search' ? event.data.id : event.data.id}-${idx}`;
                const isExpanded = expandedEvents.has(key);

                if (event.type === 'llm') {
                  const call = event.data;
                  return (
                    <div key={key} className="px-4 py-3">
                      <button
                        className="flex w-full items-center gap-3 text-left"
                        onClick={() => toggleEvent(key)}
                      >
                        <div className="bg-blue-500/10 text-blue-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          <Cpu className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-foreground text-sm font-medium">LLM Call</span>
                            <Badge variant="outline" className="text-[10px]">
                              {call.model_requested}
                            </Badge>
                            {call.stage && (
                              <Badge variant="secondary" className="text-[10px]">
                                {call.stage}
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 text-xs">
                            <span>{call.total_tokens.toLocaleString()} tokens</span>
                            <span>{formatCost(call.cost_usd)}</span>
                            <span>{call.latency_ms}ms</span>
                            <span>{formatDate(call.created_at)}</span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="text-muted-foreground h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="bg-muted/30 mt-3 space-y-3 rounded-lg p-4 text-xs">
                          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div>
                              <span className="text-muted-foreground block">Input Tokens</span>
                              <span className="text-foreground font-mono">{call.input_tokens.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Output Tokens</span>
                              <span className="text-foreground font-mono">{call.output_tokens.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Provider</span>
                              <span className="text-foreground font-mono">{call.provider ?? '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Status</span>
                              <Badge
                                variant={call.status === 'success' ? 'default' : 'destructive'}
                                className="text-[10px]"
                              >
                                {call.status}
                              </Badge>
                            </div>
                          </div>
                          {call.input_text && (
                            <div>
                              <span className="text-muted-foreground mb-1 block font-medium">Input</span>
                              <pre className="bg-background border-border max-h-48 overflow-auto rounded border p-3 text-xs whitespace-pre-wrap">
                                {call.input_text}
                              </pre>
                            </div>
                          )}
                          {call.output_text && (
                            <div>
                              <span className="text-muted-foreground mb-1 block font-medium">Output</span>
                              <pre className="bg-background border-border max-h-48 overflow-auto rounded border p-3 text-xs whitespace-pre-wrap">
                                {call.output_text}
                              </pre>
                            </div>
                          )}
                          {call.error_message && (
                            <div>
                              <span className="text-destructive mb-1 block font-medium">Error</span>
                              <pre className="bg-destructive/5 border-destructive/20 max-h-32 overflow-auto rounded border p-3 text-xs whitespace-pre-wrap">
                                {call.error_message}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                if (event.type === 'search') {
                  const ws = event.data;
                  return (
                    <div key={key} className="px-4 py-3">
                      <button
                        className="flex w-full items-center gap-3 text-left"
                        onClick={() => toggleEvent(key)}
                      >
                        <div className="bg-green-500/10 text-green-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          <Globe className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-foreground text-sm font-medium">Web Search</span>
                            <Badge
                              variant={ws.status === 'success' ? 'default' : ws.status === 'failed' ? 'destructive' : 'secondary'}
                              className="text-[10px]"
                            >
                              {ws.status}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 text-xs">
                            <span className="truncate max-w-[200px]">{ws.search_query}</span>
                            <span>{ws.results_count} results</span>
                            {ws.latency_ms != null && <span>{ws.latency_ms}ms</span>}
                            <span>{formatDate(ws.created_at)}</span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="text-muted-foreground h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="bg-muted/30 mt-3 space-y-3 rounded-lg p-4 text-xs">
                          <div>
                            <span className="text-muted-foreground block font-medium">Query</span>
                            <span className="text-foreground">{ws.search_query}</span>
                          </div>
                          {ws.search_results && ws.search_results.length > 0 && (
                            <div>
                              <span className="text-muted-foreground mb-2 block font-medium">
                                Search Results ({ws.search_results.length})
                              </span>
                              <div className="space-y-2">
                                {ws.search_results.map((result, ri) => (
                                  <div key={ri} className="bg-background border-border rounded border p-3">
                                    <a
                                      href={result.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary text-xs font-medium hover:underline"
                                    >
                                      {result.title}
                                    </a>
                                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                                      {result.snippet}
                                    </p>
                                    <span className="text-muted-foreground/60 mt-1 block text-[10px] truncate">
                                      {result.url}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                // attachment
                const att = event.data;
                return (
                  <div key={key} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500/10 text-orange-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <Paperclip className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-foreground text-sm font-medium">Attachment</span>
                          <Badge variant="outline" className="text-[10px]">
                            {att.file_type}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 text-xs">
                          <span>{att.filename}</span>
                          <span>{formatBytes(att.file_size_bytes)}</span>
                          <span>{formatDate(att.created_at)}</span>
                        </div>
                      </div>
                      {att.s3_url && (
                        <a
                          href={att.s3_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
            {label}
          </p>
          <p className="text-foreground font-mono text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2: Web Searches
// ─────────────────────────────────────────────────────────────────────────────

function WebSearchesTab() {
  const [page, setPage] = useState(1);
  const [sessionFilter, setSessionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const pageSize = 20;

  const filters = {
    session_id: sessionFilter ? parseInt(sessionFilter, 10) : undefined,
    status: statusFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    include_content: true,
    page,
    page_size: pageSize,
  };

  const { data: listData, isLoading } = useQuery({
    queryKey: ['session-trace', 'web-searches', filters],
    queryFn: () => adminLLMConfigService.listWebSearches(filters),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['session-trace', 'web-search-summary'],
    queryFn: () => adminLLMConfigService.getWebSearchSummary(30),
  });

  const items = listData?.items ?? [];
  const total = listData?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const successRate =
    summaryData && summaryData.total_searches > 0
      ? ((summaryData.success_count / summaryData.total_searches) * 100).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summaryData && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <SummaryCard
            icon={<Globe className="h-4 w-4" />}
            label="Total Searches (30d)"
            value={summaryData.total_searches.toLocaleString()}
          />
          <SummaryCard
            icon={<Hash className="h-4 w-4" />}
            label="Success Rate"
            value={`${successRate}%`}
          />
          <SummaryCard
            icon={<FileText className="h-4 w-4" />}
            label="Avg Results"
            value={summaryData.avg_results_per_search.toFixed(1)}
          />
          <SummaryCard
            icon={<Clock className="h-4 w-4" />}
            label="Avg Latency"
            value={`${Math.round(summaryData.avg_latency_ms)}ms`}
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-xs font-medium">Filters</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="text-muted-foreground mb-1 block text-[10px] font-medium">Session ID</label>
              <input
                type="number"
                value={sessionFilter}
                onChange={(e) => { setSessionFilter(e.target.value); setPage(1); }}
                className="border-input bg-background w-28 rounded-lg border px-3 py-1.5 text-sm"
                placeholder="Any"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-[10px] font-medium">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="border-input bg-background rounded-lg border px-3 py-1.5 text-sm"
              >
                <option value="">All</option>
                <option value="success">Success</option>
                <option value="no_results">No Results</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-[10px] font-medium">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="border-input bg-background rounded-lg border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-[10px] font-medium">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="border-input bg-background rounded-lg border px-3 py-1.5 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center text-sm">No web searches found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border bg-muted/50 border-b text-left">
                    <th className="px-4 py-3 text-xs font-medium">ID</th>
                    <th className="px-4 py-3 text-xs font-medium">Session</th>
                    <th className="px-4 py-3 text-xs font-medium">Search Query</th>
                    <th className="px-4 py-3 text-xs font-medium">Results</th>
                    <th className="px-4 py-3 text-xs font-medium">Status</th>
                    <th className="px-4 py-3 text-xs font-medium">Latency</th>
                    <th className="px-4 py-3 text-xs font-medium">Provider</th>
                    <th className="px-4 py-3 text-xs font-medium">Created</th>
                    <th className="px-4 py-3 text-xs font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {items.map((ws) => (
                    <WebSearchRow
                      key={ws.id}
                      ws={ws}
                      isExpanded={expandedRow === ws.id}
                      onToggle={() => setExpandedRow(expandedRow === ws.id ? null : ws.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-border flex items-center justify-between border-t px-4 py-3">
              <span className="text-muted-foreground text-xs">
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WebSearchRow({
  ws,
  isExpanded,
  onToggle,
}: {
  ws: WebSearchRecord;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3 font-mono text-xs">{ws.id}</td>
        <td className="px-4 py-3 font-mono text-xs">{ws.session_id}</td>
        <td className="px-4 py-3 text-xs max-w-[200px] truncate" title={ws.search_query}>
          {truncate(ws.search_query, 50)}
        </td>
        <td className="px-4 py-3 font-mono text-xs">{ws.results_count}</td>
        <td className="px-4 py-3">
          <Badge
            variant={ws.status === 'success' ? 'default' : ws.status === 'failed' ? 'destructive' : 'secondary'}
            className="text-[10px]"
          >
            {ws.status}
          </Badge>
        </td>
        <td className="px-4 py-3 font-mono text-xs">{ws.latency_ms != null ? `${ws.latency_ms}ms` : '-'}</td>
        <td className="px-4 py-3 text-xs">{ws.search_provider}</td>
        <td className="px-4 py-3 text-xs">{formatDate(ws.created_at)}</td>
        <td className="px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={9} className="bg-muted/20 px-4 py-4">
            <div className="space-y-4 text-xs">
              {ws.original_prompt && (
                <div>
                  <span className="text-muted-foreground mb-1 block font-medium">Original Prompt</span>
                  <pre className="bg-background border-border max-h-32 overflow-auto rounded border p-3 whitespace-pre-wrap">
                    {ws.original_prompt}
                  </pre>
                </div>
              )}
              {ws.enhanced_prompt && (
                <div>
                  <span className="text-muted-foreground mb-1 block font-medium">Enhanced Prompt</span>
                  <pre className="bg-background border-border max-h-32 overflow-auto rounded border p-3 whitespace-pre-wrap">
                    {ws.enhanced_prompt}
                  </pre>
                </div>
              )}
              {ws.search_results && ws.search_results.length > 0 && (
                <div>
                  <span className="text-muted-foreground mb-2 block font-medium">
                    Search Results ({ws.search_results.length})
                  </span>
                  <div className="grid gap-2 md:grid-cols-2">
                    {ws.search_results.map((result, ri) => (
                      <div key={ri} className="bg-background border-border rounded border p-3">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-xs font-medium hover:underline inline-flex items-center gap-1"
                        >
                          {result.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <p className="text-muted-foreground mt-1 text-[11px]">{result.snippet}</p>
                        <span className="text-muted-foreground/60 mt-1 block text-[10px] truncate">{result.url}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {ws.error_message && (
                <div>
                  <span className="text-destructive mb-1 block font-medium">Error</span>
                  <pre className="bg-destructive/5 border-destructive/20 rounded border p-3 text-xs whitespace-pre-wrap">
                    {ws.error_message}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3: File Attachments
// ─────────────────────────────────────────────────────────────────────────────

function AttachmentsTab() {
  const [page, setPage] = useState(1);
  const [sessionFilter, setSessionFilter] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const pageSize = 20;

  const filters = {
    session_id: sessionFilter ? parseInt(sessionFilter, 10) : undefined,
    file_type: fileTypeFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page,
    page_size: pageSize,
  };

  const { data: listData, isLoading } = useQuery({
    queryKey: ['session-trace', 'attachments', filters],
    queryFn: () => adminLLMConfigService.listAttachments(filters),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['session-trace', 'attachment-summary'],
    queryFn: () => adminLLMConfigService.getAttachmentSummary(30),
  });

  const items = listData?.items ?? [];
  const total = listData?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summaryData && (
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            <SummaryCard
              icon={<Paperclip className="h-4 w-4" />}
              label="Total Files (30d)"
              value={summaryData.total_files.toLocaleString()}
            />
            <SummaryCard
              icon={<Hash className="h-4 w-4" />}
              label="Total Size"
              value={`${summaryData.total_size_mb.toFixed(2)} MB`}
            />
            <SummaryCard
              icon={<FileText className="h-4 w-4" />}
              label="File Types"
              value={summaryData.by_file_type.length}
            />
          </div>
          {summaryData.by_file_type.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <span className="text-muted-foreground mb-2 block text-xs font-medium">By File Type (30d)</span>
                <div className="flex flex-wrap gap-2">
                  {summaryData.by_file_type.map((ft) => (
                    <Badge key={ft.file_type} variant="outline" className="gap-1.5 text-xs">
                      {ft.file_type}
                      <span className="text-muted-foreground font-mono">{ft.count}</span>
                      <span className="text-muted-foreground/60">({formatBytes(ft.total_bytes)})</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-xs font-medium">Filters</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="text-muted-foreground mb-1 block text-[10px] font-medium">Session ID</label>
              <input
                type="number"
                value={sessionFilter}
                onChange={(e) => { setSessionFilter(e.target.value); setPage(1); }}
                className="border-input bg-background w-28 rounded-lg border px-3 py-1.5 text-sm"
                placeholder="Any"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-[10px] font-medium">File Type</label>
              <select
                value={fileTypeFilter}
                onChange={(e) => { setFileTypeFilter(e.target.value); setPage(1); }}
                className="border-input bg-background rounded-lg border px-3 py-1.5 text-sm"
              >
                <option value="">All</option>
                <option value="image">Image</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="text">Text</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-[10px] font-medium">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="border-input bg-background rounded-lg border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-[10px] font-medium">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="border-input bg-background rounded-lg border px-3 py-1.5 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center text-sm">No attachments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border bg-muted/50 border-b text-left">
                    <th className="px-4 py-3 text-xs font-medium">ID</th>
                    <th className="px-4 py-3 text-xs font-medium">Session</th>
                    <th className="px-4 py-3 text-xs font-medium">Filename</th>
                    <th className="px-4 py-3 text-xs font-medium">Type</th>
                    <th className="px-4 py-3 text-xs font-medium">Content Type</th>
                    <th className="px-4 py-3 text-xs font-medium">Size</th>
                    <th className="px-4 py-3 text-xs font-medium">Created</th>
                    <th className="px-4 py-3 text-xs font-medium">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {items.map((att) => (
                    <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{att.id}</td>
                      <td className="px-4 py-3 font-mono text-xs">{att.session_id}</td>
                      <td className="px-4 py-3 text-xs max-w-[200px] truncate" title={att.filename}>
                        {att.filename}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px]">
                          {att.file_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{att.content_type ?? '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{formatBytes(att.file_size_bytes)}</td>
                      <td className="px-4 py-3 text-xs">{formatDate(att.created_at)}</td>
                      <td className="px-4 py-3">
                        {att.s3_url ? (
                          <a
                            href={att.s3_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-border flex items-center justify-between border-t px-4 py-3">
              <span className="text-muted-foreground text-xs">
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
