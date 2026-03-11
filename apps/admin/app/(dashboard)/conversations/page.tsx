'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RefreshCcw,
  AlertCircle,
  Clock,
  CheckCircle2,
  MoreVertical,
  Layers,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  adminConversationsService,
  type ListFailedConversationsParams,
  type AdminFailedConversation,
} from '@/services/admin/conversations-service';
import { adminQcConfigService } from '@/services/admin/qc-config-service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@raweval/utils';

const PAGE_SIZE = 20;
const SORT_FIELDS = [
  'created_at',
  'conversation_id',
  'total_cost',
  'updated_at',
  'user_id',
  'fleiss_kappa',
] as const;

export default function ConversationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rerunConvId, setRerunConvId] = useState<number | null>(null);
  const [rerunReason, setRerunReason] = useState('Admin re-run');
  const [rerunJudgeConfigId, setRerunJudgeConfigId] = useState<string>('');

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userId, setUserId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [model, setModel] = useState('');
  const [qcFlagStatus, setQcFlagStatus] = useState('');
  const [failureType, setFailureType] = useState('');
  const [qcVersion, setQcVersion] = useState('');
  const [annotatorTier, setAnnotatorTier] = useState('');
  const [minIaaScore, setMinIaaScore] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const params: ListFailedConversationsParams = {
    page,
    page_size: PAGE_SIZE,
    sort_by: sortBy,
    sort_order: sortOrder,
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
    ...(userId ? { user_id: parseInt(userId, 10) } : {}),
    ...(orgId ? { org_id: parseInt(orgId, 10) } : {}),
    ...(model ? { model } : {}),
    ...(qcFlagStatus ? { qc_flag_status: qcFlagStatus } : {}),
    ...(failureType ? { failure_type: failureType } : {}),
    ...(qcVersion ? { qc_version: parseInt(qcVersion, 10) } : {}),
    ...(annotatorTier
      ? { annotator_tier: parseInt(annotatorTier, 10) as 1 | 2 | 3 }
      : {}),
    ...(minIaaScore ? { min_iaa_score: parseFloat(minIaaScore) } : {}),
    ...(maxCost ? { max_cost: parseFloat(maxCost) } : {}),
    ...(domain ? { domain } : {}),
    ...(status ? { status } : {}),
  };

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: queryKeys.conversations.list(params as Record<string, unknown>),
    queryFn: () => adminConversationsService.listFailedConversations(params),
  });

  const { data: qcConfigList } = useQuery({
    queryKey: queryKeys.qcConfig.list,
    queryFn: () => adminQcConfigService.listQcConfigs(),
    enabled: rerunConvId != null,
  });

  const conversations = conversationsData?.items ?? [];
  const totalPages = conversationsData?.total_pages ?? 1;

  const transitionMutation = useMutation({
    mutationFn: ({
      id,
      newStatus,
      reason,
    }: {
      id: number;
      newStatus: string;
      reason: string;
    }) =>
      adminConversationsService.transitionStatus(id, {
        new_status_code: newStatus,
        reason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    },
  });

  const rerunQCMutation = useMutation({
    mutationFn: ({
      id,
      reason,
      judgeConfigId,
    }: {
      id: number;
      reason: string;
      judgeConfigId?: number;
    }) =>
      adminConversationsService.rerunQC(id, {
        reason,
        ...(judgeConfigId ? { judge_config_id: judgeConfigId } : {}),
      }),
    onSuccess: () => {
      setRerunConvId(null);
      setRerunReason('Admin re-run');
      setRerunJudgeConfigId('');
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    },
  });

  const handleRerunSubmit = () => {
    if (rerunConvId == null) return;
    rerunQCMutation.mutate({
      id: rerunConvId,
      reason: rerunReason,
      judgeConfigId: rerunJudgeConfigId
        ? parseInt(rerunJudgeConfigId, 10)
        : undefined,
    });
  };

  const getStatusColor = (s: string | null | undefined) => {
    if (!s || typeof s !== 'string')
      return 'bg-muted text-muted-foreground border-border';
    if (s.includes('completed') || s.includes('done'))
      return 'bg-success/10 text-success border-success/20';
    if (s.includes('fail') || s.includes('error'))
      return 'bg-destructive/10 text-destructive border-destructive/20';
    if (s.includes('progress') || s.includes('annot'))
      return 'bg-primary/10 text-primary border-primary/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  const getStatusIcon = (s: string | null | undefined) => {
    if (!s || typeof s !== 'string') return <Clock className="h-3 w-3" />;
    if (s.includes('completed') || s.includes('done'))
      return <CheckCircle2 className="h-3 w-3" />;
    if (s.includes('fail') || s.includes('error'))
      return <AlertCircle className="h-3 w-3" />;
    if (s.includes('progress'))
      return <RefreshCcw className="h-3 w-3 animate-spin" />;
    return <Clock className="h-3 w-3" />;
  };

  const hasActiveFilters =
    dateFrom ||
    dateTo ||
    userId ||
    orgId ||
    model ||
    qcFlagStatus ||
    failureType ||
    qcVersion ||
    annotatorTier ||
    minIaaScore ||
    maxCost ||
    domain ||
    status;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Failed Conversations
          </h1>
          <p className="text-muted-foreground">
            Monitor and triage conversations that failed automated quality
            checks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen((o) => !o)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 rounded-full px-1.5">
                •
              </Badge>
            )}
            {filtersOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="border-input bg-background focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          >
            {SORT_FIELDS.map((f) => (
              <option key={f} value={f}>
                Sort: {f.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as 'asc' | 'desc');
              setPage(1);
            }}
            className="border-input bg-background focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
              })
            }
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {filtersOpen && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Filter failed conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <FilterInput
                label="Date from (ISO)"
                value={dateFrom}
                onChange={setDateFrom}
                placeholder="2026-01-01"
              />
              <FilterInput
                label="Date to (ISO)"
                value={dateTo}
                onChange={setDateTo}
                placeholder="2026-03-01"
              />
              <FilterInput
                label="User ID"
                value={userId}
                onChange={setUserId}
                placeholder="123"
              />
              <FilterInput
                label="Org ID"
                value={orgId}
                onChange={setOrgId}
                placeholder="456"
              />
              <FilterInput
                label="Model"
                value={model}
                onChange={setModel}
                placeholder="gpt-4o"
              />
              <FilterInput
                label="QC flag status"
                value={qcFlagStatus}
                onChange={setQcFlagStatus}
                placeholder="e.g. flagged"
              />
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Failure type
                </label>
                <select
                  value={failureType}
                  onChange={(e) => {
                    setFailureType(e.target.value);
                    setPage(1);
                  }}
                  className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Any</option>
                  <option value="user_marked">User marked</option>
                  <option value="qc_flagged">QC flagged</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <FilterInput
                label="QC version"
                value={qcVersion}
                onChange={setQcVersion}
                placeholder="1.0"
              />
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Annotator tier
                </label>
                <select
                  value={annotatorTier}
                  onChange={(e) => {
                    setAnnotatorTier(e.target.value);
                    setPage(1);
                  }}
                  className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <FilterInput
                label="Min IAA score"
                value={minIaaScore}
                onChange={setMinIaaScore}
                placeholder="0.5"
              />
              <FilterInput
                label="Max cost (USD)"
                value={maxCost}
                onChange={setMaxCost}
                placeholder="1.00"
              />
              <FilterInput
                label="Domain"
                value={domain}
                onChange={setDomain}
                placeholder="interview"
              />
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  <option value="pending_analysis">Pending Analysis</option>
                  <option value="analysis_complete">Analysis Complete</option>
                  <option value="in_annotation">In Annotation</option>
                  <option value="annotation_complete">
                    Annotation Complete
                  </option>
                  <option value="needs_human_review">Needs Human Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="border-border/50 bg-muted/30 border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Results ({conversationsData?.total ?? 0})
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Badge variant="outline" className="bg-background">
                  Filtered
                </Badge>
              )}
              <span className="text-muted-foreground text-xs">
                Sort: {sortBy} {sortOrder}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-border bg-muted/30 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Domain</th>
                  <th className="px-6 py-3">Model</th>
                  <th className="px-6 py-3">Failure Type</th>
                  <th className="px-6 py-3">User / Prob</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="bg-muted h-4 w-full rounded" />
                      </td>
                    </tr>
                  ))
                ) : conversations.length > 0 ? (
                  conversations.map((conv: AdminFailedConversation) => (
                    <tr
                      key={conv.conversation_id}
                      className="group hover:bg-accent/50"
                    >
                      <td className="px-6 py-4">
                        <span className="text-foreground font-mono text-xs font-semibold">
                          #{conv.conversation_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'gap-1 py-0.5 whitespace-nowrap capitalize',
                            getStatusColor(conv.qc_status || conv.status)
                          )}
                        >
                          {getStatusIcon(conv.qc_status || conv.status)}
                          {(conv.qc_status || conv.status || 'pending').replace(
                            /_/g,
                            ' '
                          )}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground text-xs font-medium capitalize">
                          {conv.domain_display_name || conv.domain || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-foreground text-xs leading-none font-bold whitespace-nowrap">
                            {conv.failed_model || conv.model_used || 'N/A'}
                          </span>
                          <span className="text-muted-foreground mt-1 text-[10px] tracking-widest uppercase">
                            {conv.failed_provider || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {conv.failure_type && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'py-0.5 capitalize',
                              conv.failure_type === 'both'
                                ? 'bg-destructive/10 text-destructive border-destructive/20'
                                : 'bg-muted text-muted-foreground border-border'
                            )}
                          >
                            {conv.failure_type}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-muted-foreground line-clamp-1 max-w-xs text-xs">
                          {conv.user_email}
                          {conv.failure_probability != null && (
                            <span className="ml-1">
                              ({(conv.failure_probability * 100).toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-foreground h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/conversations/${conv.conversation_id}?tab=conversation`}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <ExternalLink className="h-4 w-4" /> View Full
                                Detail
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/conversations/${conv.conversation_id}?tab=qc`}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <Layers className="h-4 w-4" /> View QC Detail
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/conversations/${conv.conversation_id}?tab=failure`}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <AlertCircle className="h-4 w-4" /> Failure & QC
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-primary cursor-pointer gap-2"
                              onClick={() =>
                                setRerunConvId(conv.conversation_id)
                              }
                            >
                              <RefreshCcw className="h-4 w-4" /> Re-run QC
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-muted-foreground cursor-pointer gap-2"
                              onClick={() =>
                                transitionMutation.mutate({
                                  id: conv.conversation_id,
                                  newStatus: 'needs_human_review',
                                  reason: 'Admin escalation',
                                })
                              }
                            >
                              <AlertCircle className="h-4 w-4" /> Escalate to
                              Review
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-muted-foreground px-6 py-12 text-center"
                    >
                      No failed conversations found.
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
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={rerunConvId != null}
        onOpenChange={(open) => !open && setRerunConvId(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Re-run QC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-6 py-2">
            <p className="text-muted-foreground text-sm">
              Re-executes the QC pipeline for this conversation. Creates a new
              QC version; old results are never overwritten.
            </p>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Reason
              </label>
              <input
                type="text"
                value={rerunReason}
                onChange={(e) => setRerunReason(e.target.value)}
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Admin re-run"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Judge config (optional)
              </label>
              <select
                value={rerunJudgeConfigId}
                onChange={(e) => setRerunJudgeConfigId(e.target.value)}
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Use active judge config</option>
                {(qcConfigList?.configs ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.version_label}
                    {c.is_active ? ' (active)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRerunConvId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRerunSubmit}
              disabled={rerunQCMutation.isPending || !rerunReason.trim()}
              className="gap-2"
            >
              {rerunQCMutation.isPending ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Re-run QC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-muted-foreground mb-1 block text-xs font-medium">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}
