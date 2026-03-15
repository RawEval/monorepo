'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  AlertCircle,
  RefreshCcw,
  BarChart3,
  Scale,
  Shield,
  Brain,
  Target,
  Activity,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  User,
  Bot,
  Loader2,
} from 'lucide-react';
import {
  adminConversationsService,
  type FailedConversationQcDetailResponse,
  type FailedConversationQcDetailModel,
  type FailedConversationQcDetailShared,
} from '@/services/admin/conversations-service';
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
import { format } from 'date-fns';

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabId =
  | 'overview'
  | 'rubric'
  | 'judges'
  | 'fraud'
  | 'holistic'
  | 'attribution'
  | 'entropy'
  | 'timeline';

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'rubric', label: 'Rubric', icon: Scale },
  { id: 'judges', label: 'Judges', icon: Brain },
  { id: 'fraud', label: 'Fraud', icon: Shield },
  { id: 'holistic', label: 'Holistic', icon: Eye },
  { id: 'attribution', label: 'Attribution', icon: Target },
  { id: 'entropy', label: 'Entropy', icon: Activity },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(
  score: number | null | undefined,
  invert = false
): string {
  if (score == null) return 'text-muted-foreground';
  const s = invert ? 1 - score : score;
  if (s >= 0.7) return 'text-green-600';
  if (s >= 0.4) return 'text-yellow-600';
  return 'text-red-600';
}

function scoreBg(
  score: number | null | undefined,
  invert = false
): string {
  if (score == null) return 'bg-muted';
  const s = invert ? 1 - score : score;
  if (s >= 0.7) return 'bg-green-500';
  if (s >= 0.4) return 'bg-yellow-500';
  return 'bg-red-500';
}

function verdictBadge(verdict: string | null | undefined) {
  if (!verdict) return null;
  const map: Record<string, { variant: 'destructive' | 'secondary' | 'outline' | 'default'; label: string }> = {
    FailedPrompt: { variant: 'destructive', label: 'Failed Prompt' },
    FalsePositive: { variant: 'secondary', label: 'False Positive' },
    NeedsHumanReview: { variant: 'outline', label: 'Needs Human Review' },
    FraudBlock: { variant: 'destructive', label: 'Fraud Detected' },
  };
  const cfg = map[verdict] ?? { variant: 'outline' as const, label: verdict };
  return (
    <Badge variant={cfg.variant} className="text-xs">
      {cfg.label}
    </Badge>
  );
}

function ScoreGauge({
  label,
  value,
  invert = false,
  subtitle,
}: {
  label: string;
  value: number | null | undefined;
  invert?: boolean;
  subtitle?: string;
}) {
  const pct = value != null ? Math.round(value * 100) : null;
  return (
    <div className="border-border rounded-lg border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={cn('font-mono text-xl font-bold', scoreColor(value, invert))}>
        {pct != null ? `${pct}%` : 'N/A'}
      </p>
      {value != null && (
        <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={cn('h-full rounded-full transition-all', scoreBg(value, invert))}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {subtitle && (
        <p className="text-muted-foreground mt-1 text-[10px]">{subtitle}</p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  if (value == null || value === '') return null;
  return (
    <div>
      <span className="text-muted-foreground text-xs">{label}</span>
      <p className="text-sm font-medium">{String(value)}</p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ChatAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = typeof params?.id === 'string' ? parseInt(params.id, 10) : NaN;
  const isValid = Number.isInteger(id) && id > 0;

  const tabFromUrl = (searchParams?.get('tab') as TabId) || 'overview';
  const [tab, setTab] = useState<TabId>(tabFromUrl);
  const [selectedModel, setSelectedModel] = useState<string | undefined>();

  useEffect(() => {
    const t = searchParams?.get('tab') as TabId | null;
    if (t) setTab(t);
  }, [searchParams]);

  // Primary data: QC Detail (comprehensive endpoint)
  const {
    data: qcDetail,
    isLoading: qcLoading,
    error: qcError,
    refetch: refetchQc,
  } = useQuery({
    queryKey: queryKeys.conversations.qcDetail(id),
    queryFn: () => adminConversationsService.getQcDetail(id),
    enabled: isValid,
  });

  // Select first model when data loads
  useEffect(() => {
    if (qcDetail?.models?.length && !selectedModel) {
      setSelectedModel(qcDetail.models[0]?.model ?? undefined);
    }
  }, [qcDetail, selectedModel]);

  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <AlertCircle className="text-muted-foreground h-10 w-10" />
        <p className="text-muted-foreground text-sm">Invalid conversation ID.</p>
      </div>
    );
  }

  const currentModel = qcDetail?.models?.find(
    (m) => m.model === selectedModel
  ) ?? qcDetail?.models?.[0];
  const qcCase = currentModel?.qc_case;
  const shared = qcDetail?.shared;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border bg-background/95 sticky top-0 z-10 flex shrink-0 flex-col gap-2 border-b px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link
              href={`/conversations/${id}?tab=qc`}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <span className="text-muted-foreground">|</span>
            <h1 className="text-foreground font-mono text-lg font-bold">
              Chat Analysis #{id}
            </h1>
            {verdictBadge(qcCase?.verdict)}
            {qcCase?.payout_eligible && (
              <Badge className="bg-green-600 text-white text-xs">
                Payout Eligible
              </Badge>
            )}
            {qcCase?.payout_eligible === false && qcCase?.verdict && (
              <Badge variant="outline" className="text-xs">
                No Payout
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Model selector */}
            {qcDetail && qcDetail.models.length > 1 && (
              <select
                value={selectedModel ?? ''}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="border-input bg-background rounded-lg border px-3 py-1.5 text-sm"
              >
                {qcDetail.models.map((m, i) => (
                  <option key={i} value={m.model ?? ''}>
                    {m.model ?? `Model ${i + 1}`} ({m.provider})
                  </option>
                ))}
              </select>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => refetchQc()}
            >
              <RefreshCcw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>

        {/* Subheader info */}
        {shared && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {shared.user_email && <span>{shared.user_email}</span>}
            {shared.user_full_name && <span>{shared.user_full_name}</span>}
            {currentModel?.model && (
              <Badge variant="outline" className="text-[10px]">
                {currentModel.model}
              </Badge>
            )}
            {qcDetail?.session_status && (
              <Badge
                variant={qcDetail.session_status === 'failed' ? 'destructive' : 'outline'}
                className="text-[10px]"
              >
                {qcDetail.session_status}
              </Badge>
            )}
            {qcDetail?.user_marked_failed && (
              <span className="text-destructive font-medium">User marked failed</span>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="border-border -mb-px flex gap-1 overflow-x-auto border-b">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              type="button"
              onClick={() => {
                setTab(tabId);
                router.replace(
                  `/conversations/${id}/analysis?tab=${tabId}`,
                  { scroll: false }
                );
              }}
              className={cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                tab === tabId
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {qcLoading ? (
          <LoadingBlock />
        ) : qcError ? (
          <ErrorState
            message={qcError instanceof Error ? qcError.message : 'Failed to load'}
            onRetry={() => refetchQc()}
          />
        ) : !qcDetail ? (
          <EmptyState />
        ) : (
          <>
            {tab === 'overview' && (
              <OverviewTab
                qcDetail={qcDetail}
                currentModel={currentModel ?? null}
              />
            )}
            {tab === 'rubric' && (
              <RubricTab currentModel={currentModel ?? null} />
            )}
            {tab === 'judges' && (
              <JudgesTab
                currentModel={currentModel ?? null}
                shared={qcDetail.shared}
              />
            )}
            {tab === 'fraud' && (
              <FraudTab currentModel={currentModel ?? null} />
            )}
            {tab === 'holistic' && (
              <HolisticTab currentModel={currentModel ?? null} />
            )}
            {tab === 'attribution' && (
              <AttributionTab
                shared={qcDetail.shared}
              />
            )}
            {tab === 'entropy' && (
              <EntropyTab
                shared={qcDetail.shared}
              />
            )}
            {tab === 'timeline' && (
              <TimelineTab
                currentModel={currentModel ?? null}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
      <AlertCircle className="text-destructive h-12 w-12" />
      <p className="text-muted-foreground max-w-md text-center text-sm">{message}</p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCcw className="h-4 w-4" /> Retry
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-16">
      <p className="text-muted-foreground text-sm">No data available.</p>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({
  qcDetail,
  currentModel,
}: {
  qcDetail: FailedConversationQcDetailResponse;
  currentModel: FailedConversationQcDetailModel | null;
}) {
  const qcCase = currentModel?.qc_case;
  const shared = qcDetail.shared;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      {/* Verdict & Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Verdict</CardTitle>
            {verdictBadge(qcCase?.verdict)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <ScoreGauge
              label="Process Score"
              value={qcCase?.process_score}
              subtitle="Higher = better response"
            />
            <ScoreGauge
              label="FP Score"
              value={qcCase?.fp_score}
              invert
              subtitle="> 0.65 = true failure"
            />
            <ScoreGauge
              label="Holistic Score"
              value={qcCase?.holistic_score}
              subtitle={qcCase?.holistic_override_applied ? 'Override applied' : 'Independent quality check'}
            />
            <ScoreGauge
              label="D-Global (Entropy)"
              value={qcCase?.d_global}
              invert
              subtitle="> 0.7 = high disagreement"
            />
            <ScoreGauge
              label="Fraud Score"
              value={qcCase?.fraud_score}
              invert
              subtitle="> 0.4 = suspicious"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pipeline info */}
      {qcCase && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              <Row label="Pipeline Stage" value={qcCase.pipeline_stage} />
              <Row label="Status" value={qcCase.status} />
              <Row
                label="Latency"
                value={
                  qcCase.pipeline_latency_ms != null
                    ? `${(qcCase.pipeline_latency_ms / 1000).toFixed(1)}s`
                    : null
                }
              />
              <Row label="Root Cause" value={qcCase.root_cause} />
              <Row label="Judge Variance" value={qcCase.judge_variance?.toFixed(4)} />
              <Row label="Fraud Status" value={qcCase.fraud_status} />
              <Row label="Entropy Status" value={qcCase.entropy_status} />
              <Row
                label="Payout"
                value={
                  qcCase.payout_eligible
                    ? 'Eligible'
                    : qcCase.payout_block_reason ?? 'Not eligible'
                }
              />
            </div>
            {qcCase.verdict_reason && (
              <div className="border-border mt-4 border-t pt-3">
                <span className="text-muted-foreground text-xs font-medium">
                  Verdict Reason
                </span>
                <p className="mt-1 text-sm">{qcCase.verdict_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conversation messages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {shared?.user_messages?.map((msg, i) => (
            <div key={i} className="flex gap-3">
              <div className="bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                <User className="text-muted-foreground h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[11px]">
                  User · Turn {msg.turn_number}
                </p>
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {msg.content || '(empty)'}
                </p>
              </div>
            </div>
          ))}
          {currentModel?.assistant_message?.content && (
            <div className="flex gap-3">
              <div className="bg-primary/10 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[11px]">
                  {currentModel.model} · {currentModel.provider}
                </p>
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {currentModel.assistant_message.content}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intent Object */}
      {currentModel?.qc_intent_objects?.[0] && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Intent Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              <Row label="Task Type" value={currentModel.qc_intent_objects[0].task_type} />
              <Row label="Primary Goal" value={currentModel.qc_intent_objects[0].primary_goal} />
              <Row label="Domain" value={currentModel.qc_intent_objects[0].domain} />
              <Row
                label="Ambiguity"
                value={currentModel.qc_intent_objects[0].ambiguity_score?.toFixed(2)}
              />
              <Row
                label="Extraction Confidence"
                value={
                  currentModel.qc_intent_objects[0].extraction_confidence != null
                    ? `${(currentModel.qc_intent_objects[0].extraction_confidence * 100).toFixed(0)}%`
                    : null
                }
              />
            </div>
            {currentModel.qc_intent_objects[0].global_summary && (
              <div className="border-border mt-3 border-t pt-3">
                <span className="text-muted-foreground text-xs font-medium">
                  Summary
                </span>
                <p className="mt-1 text-sm">
                  {currentModel.qc_intent_objects[0].global_summary}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Rubric Tab ────────────────────────────────────────────────────────────────

function RubricTab({
  currentModel,
}: {
  currentModel: FailedConversationQcDetailModel | null;
}) {
  const rubric = currentModel?.qc_rubric;
  const criteria = rubric?.criteria ?? [];

  if (!rubric) return <EmptyState />;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      {/* Rubric Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Process-Trace Rubric ({rubric.criteria_count ?? criteria.length} criteria)
          </CardTitle>
          <CardDescription>
            Process score: {rubric.process_score?.toFixed(3) ?? 'N/A'} · FP
            score: {rubric.fp_score?.toFixed(3) ?? 'N/A'} · D-Global:{' '}
            {rubric.d_global?.toFixed(3) ?? 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <ScoreGauge label="Process Score" value={rubric.process_score} />
            <ScoreGauge label="FP Score" value={rubric.fp_score} invert />
            <div className="border-border rounded-lg border p-3">
              <p className="text-muted-foreground text-xs">Total Weight</p>
              <p className="font-mono text-xl font-bold">
                {rubric.total_weight?.toFixed(2) ?? 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria table */}
      {criteria.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Criteria Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-border border-b text-left">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-medium">Step</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Criterion</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Type</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Weight</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Status</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Score</th>
                    <th className="px-4 py-2.5 text-xs font-medium">D_i</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {criteria.map((c, i) => (
                    <CriterionRow key={i} criterion={c} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CriterionRow({
  criterion: c,
}: {
  criterion: FailedConversationQcDetailModel['qc_rubric'] extends { criteria: (infer T)[] } | null ? T : never;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr
        className="hover:bg-muted/20 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="px-4 py-2.5 font-mono text-xs">{c.step_id}</td>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-2">
            {c.name}
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        </td>
        <td className="text-muted-foreground px-4 py-2.5 text-xs">{c.type}</td>
        <td className="px-4 py-2.5 font-mono text-xs">
          {c.weight?.toFixed(2) ?? '—'}
        </td>
        <td className="px-4 py-2.5">
          <Badge
            variant={
              c.status === 'CORRECT'
                ? 'default'
                : c.status === 'INCORRECT'
                  ? 'destructive'
                  : 'outline'
            }
            className="text-[10px]"
          >
            {c.status ?? 'PENDING'}
          </Badge>
        </td>
        <td className={cn('px-4 py-2.5 font-mono text-xs font-bold', scoreColor(c.step_score))}>
          {c.step_score?.toFixed(2) ?? '—'}
        </td>
        <td className={cn('px-4 py-2.5 font-mono text-xs', scoreColor(c.d_i, true))}>
          {c.d_i?.toFixed(2) ?? '—'}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="bg-muted/10 px-4 py-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {c.evidence_expected && (
                <div>
                  <p className="text-muted-foreground text-xs font-medium">
                    Expected Evidence
                  </p>
                  <p className="border-border bg-background mt-1 rounded border p-2 text-xs">
                    {c.evidence_expected}
                  </p>
                </div>
              )}
              {c.evidence_actual && (
                <div>
                  <p className="text-muted-foreground text-xs font-medium">
                    Actual Evidence
                  </p>
                  <p className="border-border bg-background mt-1 rounded border p-2 text-xs">
                    {c.evidence_actual}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {c.judge_1_score != null && (
                <span>
                  J1: <strong>{c.judge_1_score.toFixed(2)}</strong>
                </span>
              )}
              {c.judge_2_score != null && (
                <span>
                  J2: <strong>{c.judge_2_score.toFixed(2)}</strong>
                </span>
              )}
              {c.judge_3_defensibility != null && (
                <span>
                  J3 (defense): <strong>{c.judge_3_defensibility.toFixed(2)}</strong>
                </span>
              )}
              {c.merged_score != null && (
                <span>
                  Merged: <strong>{c.merged_score.toFixed(2)}</strong>
                </span>
              )}
              {c.calibrated_score != null && (
                <span>
                  Calibrated: <strong>{c.calibrated_score.toFixed(2)}</strong>
                </span>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Judges Tab ────────────────────────────────────────────────────────────────

function JudgesTab({
  currentModel,
  shared,
}: {
  currentModel: FailedConversationQcDetailModel | null;
  shared: FailedConversationQcDetailShared;
}) {
  // Use QC detail judges (per-model) and shared judge evaluations
  const qcJudges = currentModel?.qc_judges ?? [];
  const evaluations = shared.judge_evaluations ?? [];
  const majorityVerdict = shared.judge_majority_verdict;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      {/* Majority Verdict */}
      {majorityVerdict && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Majority Verdict</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div className="border-border rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Verdict</p>
                <p
                  className={cn(
                    'mt-1 text-lg font-bold',
                    majorityVerdict.majority_verdict === 'FAIL'
                      ? 'text-red-600'
                      : 'text-green-600'
                  )}
                >
                  {majorityVerdict.majority_verdict}
                </p>
              </div>
              <div className="border-border rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Individual Verdicts</p>
                <div className="mt-1 flex gap-1.5 font-mono text-sm font-bold">
                  <span className={majorityVerdict.judge_1_verdict === 'FAIL' ? 'text-red-600' : 'text-green-600'}>
                    J1: {majorityVerdict.judge_1_verdict}
                  </span>
                  <span className={majorityVerdict.judge_2_verdict === 'FAIL' ? 'text-red-600' : 'text-green-600'}>
                    J2: {majorityVerdict.judge_2_verdict}
                  </span>
                  <span className={majorityVerdict.judge_3_verdict === 'FAIL' ? 'text-red-600' : 'text-green-600'}>
                    J3: {majorityVerdict.judge_3_verdict}
                  </span>
                </div>
              </div>
              <ScoreGauge
                label="Mean Failure Score"
                value={majorityVerdict.mean_failure_score}
                invert
              />
              <ScoreGauge
                label="Confidence"
                value={majorityVerdict.verdict_confidence}
              />
            </div>
            {majorityVerdict.entropy_boosted && (
              <div className="mt-3">
                <Badge variant="outline" className="text-[10px]">
                  Entropy Boosted
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Individual Judges — from judges endpoint */}
      {evaluations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-foreground text-sm font-semibold">
            Judge Evaluations ({evaluations.length})
          </h3>
          {evaluations.map((judge, i) => (
            <JudgeEvaluationCard key={i} judge={judge} index={i} />
          ))}
        </div>
      )}

      {/* QC Judge Outputs — from qc-detail */}
      {evaluations.length === 0 && qcJudges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-foreground text-sm font-semibold">
            QC Judge Panel ({qcJudges.length})
          </h3>
          {qcJudges.map((j, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {j.judge_role}
                    </Badge>
                    <span className="text-muted-foreground text-xs">{j.model_id}</span>
                  </CardTitle>
                  <span className={cn('font-mono text-lg font-bold', scoreColor(j.process_score))}>
                    {j.process_score?.toFixed(3) ?? 'N/A'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex flex-wrap gap-3 text-xs">
                  {j.latency_ms != null && (
                    <span className="text-muted-foreground">
                      {(j.latency_ms / 1000).toFixed(1)}s
                    </span>
                  )}
                  {j.tokens_used != null && (
                    <span className="text-muted-foreground">
                      {j.tokens_used} tokens
                    </span>
                  )}
                  {j.cost_usd != null && (
                    <span className="text-muted-foreground">
                      ${j.cost_usd.toFixed(4)}
                    </span>
                  )}
                  {j.status && (
                    <Badge variant="outline" className="text-[10px]">
                      {j.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {evaluations.length === 0 && qcJudges.length === 0 && <EmptyState />}
    </div>
  );
}

function JudgeEvaluationCard({
  judge,
  index,
}: {
  judge: FailedConversationQcDetailShared['judge_evaluations'][number];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="text-[10px]">
              Judge {judge.judge_run ?? index + 1}
            </Badge>
            <span className="text-muted-foreground text-xs">{judge.judge_model}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={judge.verdict === 'FAIL' ? 'destructive' : 'default'}
              className="text-xs"
            >
              {judge.verdict}
            </Badge>
            <span className={cn('font-mono font-bold', scoreColor(judge.failure_score, true))}>
              {judge.failure_score?.toFixed(3) ?? 'N/A'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Claim summary */}
        <div className="flex flex-wrap gap-3 text-xs">
          <span>
            Supported:{' '}
            <strong className="text-green-600">{judge.claims_supported ?? 0}</strong>
          </span>
          <span>
            Contradicted:{' '}
            <strong className="text-red-600">{judge.claims_contradicted ?? 0}</strong>
          </span>
          <span>
            Insufficient:{' '}
            <strong className="text-yellow-600">
              {judge.claims_insufficient ?? 0}
            </strong>
          </span>
          {judge.latency_ms != null && (
            <span className="text-muted-foreground">
              {(judge.latency_ms / 1000).toFixed(1)}s
            </span>
          )}
          {judge.tokens_used != null && (
            <span className="text-muted-foreground">
              {judge.tokens_used} tokens
            </span>
          )}
        </div>

        {/* Claim analysis toggle */}
        {judge.claim_analysis && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Hide claim analysis' : 'Show claim analysis'}
            </Button>

            {expanded && (
              <div className="border-border bg-muted/20 rounded border p-3">
                <pre className="text-xs leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(judge.claim_analysis, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Fraud Tab ─────────────────────────────────────────────────────────────────

function FraudTab({
  currentModel,
}: {
  currentModel: FailedConversationQcDetailModel | null;
}) {
  const signals = currentModel?.qc_fraud_signals ?? [];
  const qcCase = currentModel?.qc_case;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      {/* Aggregate fraud score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fraud Detection</CardTitle>
          <CardDescription>
            7-signal fraud analysis across ambiguity, adversarial patterns, and
            marking behavior.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-border rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Aggregate Fraud Score</p>
              <p
                className={cn(
                  'font-mono text-3xl font-bold',
                  (qcCase?.fraud_score ?? 0) > 0.5
                    ? 'text-red-600'
                    : (qcCase?.fraud_score ?? 0) > 0.2
                      ? 'text-yellow-600'
                      : 'text-green-600'
                )}
              >
                {qcCase?.fraud_score?.toFixed(3) ?? 'N/A'}
              </p>
            </div>
            <div className="border-border rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Status</p>
              <p className="mt-1 text-lg font-bold">
                {qcCase?.fraud_status ?? 'N/A'}
              </p>
            </div>
            <div className="border-border rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Signals Detected</p>
              <p className="mt-1 font-mono text-lg font-bold">
                {signals.filter((s) => (s.score ?? 0) > 0.2).length} / {signals.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual signals */}
      {signals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Signal Breakdown ({signals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {signals.map((signal, i) => (
              <FraudSignalBar key={i} signal={signal} />
            ))}
          </CardContent>
        </Card>
      )}

      {signals.length === 0 && <EmptyState />}
    </div>
  );
}

function FraudSignalBar({
  signal,
}: {
  signal: FailedConversationQcDetailModel['qc_fraud_signals'][number];
}) {
  const [expanded, setExpanded] = useState(false);
  const score = signal.score ?? 0;
  const pct = Math.round(score * 100);
  const color =
    score > 0.5
      ? 'bg-red-500 text-red-600'
      : score > 0.2
        ? 'bg-yellow-500 text-yellow-600'
        : 'bg-green-500 text-green-600';

  return (
    <div
      className="border-border cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/20"
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="min-w-[140px] font-mono text-sm font-medium">
            {signal.signal_type}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-muted h-2 w-24 overflow-hidden rounded-full">
            <div
              className={cn('h-full rounded-full', color.split(' ')[0])}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={cn('w-12 text-right font-mono text-sm font-bold', color.split(' ')[1])}>
            {score.toFixed(2)}
          </span>
        </div>
      </div>
      {signal.description && (
        <p className="text-muted-foreground mt-1 text-xs">{signal.description}</p>
      )}
      {expanded && signal.evidence && (
        <div className="border-border bg-muted/10 mt-2 rounded border p-2">
          <pre className="text-[10px] whitespace-pre-wrap">
            {JSON.stringify(signal.evidence, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Holistic Tab ──────────────────────────────────────────────────────────────

function HolisticTab({
  currentModel,
}: {
  currentModel: FailedConversationQcDetailModel | null;
}) {
  const qcCase = currentModel?.qc_case;
  const holistic = currentModel?.qc_holistic_evaluation;
  const semanticMatches = currentModel?.qc_semantic_matches ?? [];
  const verdictFP = currentModel?.verdict_failed_prompt ?? [];
  const verdictFalse = currentModel?.verdict_false_positive ?? [];
  const verdictHR = currentModel?.verdict_needs_human_review ?? [];

  if (!qcCase) return <EmptyState />;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      {/* Holistic Evaluation (Stage 6.5) */}
      {holistic ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Holistic Evaluation (Stage 6.5)</CardTitle>
              {holistic.mismatch_detected && (
                <Badge variant="destructive" className="text-xs">
                  Mismatch Override
                </Badge>
              )}
              {holistic.would_user_be_satisfied != null && (
                <Badge
                  variant={holistic.would_user_be_satisfied ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {holistic.would_user_be_satisfied ? 'User Satisfied' : 'User Unsatisfied'}
                </Badge>
              )}
            </div>
            <CardDescription>
              Independent LLM assessment of overall response quality.
              {holistic.model_used && ` Model: ${holistic.model_used}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <ScoreGauge
                label="Holistic Score"
                value={holistic.holistic_score}
                subtitle="Overall quality"
              />
              <ScoreGauge
                label="Completeness"
                value={holistic.completeness_score}
                subtitle="All parts addressed?"
              />
              <ScoreGauge
                label="Accuracy"
                value={holistic.accuracy_score}
                subtitle="Factually correct?"
              />
              <ScoreGauge
                label="Usefulness"
                value={holistic.usefulness_score}
                subtitle="Helpful to user?"
              />
            </div>

            {holistic.holistic_reasoning && (
              <div className="border-border border-t pt-3">
                <p className="text-muted-foreground text-xs font-medium">Reasoning</p>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                  {holistic.holistic_reasoning}
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {holistic.key_strengths && Array.isArray(holistic.key_strengths) && holistic.key_strengths.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1 text-xs font-medium text-green-600">
                    <CheckCircle2 className="h-3 w-3" /> Key Strengths
                  </p>
                  <ul className="space-y-1">
                    {holistic.key_strengths.map((s, i) => (
                      <li key={i} className="text-xs">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {holistic.key_weaknesses && Array.isArray(holistic.key_weaknesses) && holistic.key_weaknesses.length > 0 && (
                <div>
                  <p className="text-destructive mb-2 flex items-center gap-1 text-xs font-medium">
                    <XCircle className="h-3 w-3" /> Key Weaknesses
                  </p>
                  <ul className="space-y-1">
                    {holistic.key_weaknesses.map((w, i) => (
                      <li key={i} className="text-xs">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
              <Row label="Confidence" value={holistic.confidence_level} />
              <Row label="Process Score at Eval" value={holistic.process_score_at_eval?.toFixed(3)} />
              {holistic.latency_ms != null && (
                <Row label="Latency" value={`${(holistic.latency_ms / 1000).toFixed(1)}s`} />
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Holistic Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              No holistic evaluation data available for this conversation.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Semantic Matches (Stage 4.5) */}
      {semanticMatches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Semantic Evidence Matching ({semanticMatches.length} criteria)
            </CardTitle>
            <CardDescription>
              LLM-based re-matching of rubric criteria against the full response text.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-border border-b text-left">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-medium">Step</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Criterion</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Addressed</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Confidence</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Matched Text</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {semanticMatches.map((sm, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-mono text-xs">
                        {sm.criterion_step_id}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-2.5 text-xs">
                        {sm.criterion_name}
                      </td>
                      <td className="px-4 py-2.5">
                        {sm.addressed != null ? (
                          sm.addressed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td
                        className={cn(
                          'px-4 py-2.5 font-mono text-xs font-bold',
                          scoreColor(sm.match_confidence)
                        )}
                      >
                        {sm.match_confidence != null
                          ? `${Math.round(sm.match_confidence * 100)}%`
                          : '—'}
                      </td>
                      <td className="max-w-[300px] truncate px-4 py-2.5 text-xs">
                        {sm.matched_text || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verdict Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Verdict Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <ScoreGauge label="Process Score" value={qcCase.process_score} />
            <ScoreGauge label="FP Score" value={qcCase.fp_score} invert />
            <ScoreGauge label="D-Global" value={qcCase.d_global} invert />
            <ScoreGauge label="Fraud Score" value={qcCase.fraud_score} invert />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            <Row label="Verdict" value={qcCase.verdict} />
            <Row label="Root Cause" value={qcCase.root_cause} />
            <Row label="Verdict Reason" value={qcCase.verdict_reason} />
            <Row
              label="Payout"
              value={
                qcCase.payout_eligible
                  ? 'Eligible'
                  : qcCase.payout_block_reason ?? 'Not eligible'
              }
            />
            <Row label="Judge Variance" value={qcCase.judge_variance?.toFixed(4)} />
          </div>

          {verdictFP.length > 0 && (
            <div>
              <p className="text-destructive mb-2 flex items-center gap-1 text-xs font-medium">
                <XCircle className="h-3 w-3" /> Failed Prompt Verdicts ({verdictFP.length})
              </p>
              {verdictFP.map((v, i) => (
                <div key={i} className="border-border mb-2 rounded border p-3">
                  <div className="grid gap-2 sm:grid-cols-3 text-xs">
                    <Row label="Failure Probability" value={v.failure_probability?.toFixed(3)} />
                    <Row label="Decision Path" value={v.decision_path} />
                    <Row label="Judge Majority" value={v.judge_majority_verdict} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {verdictFalse.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle2 className="h-3 w-3" /> False Positive Verdicts ({verdictFalse.length})
              </p>
              {verdictFalse.map((v, i) => (
                <div key={i} className="border-border mb-2 rounded border p-3">
                  <div className="grid gap-2 sm:grid-cols-2 text-xs">
                    <Row label="Failure Probability" value={v.failure_probability?.toFixed(3)} />
                    <Row label="Reason" value={v.reason_for_disagreement} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {verdictHR.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-2 flex items-center gap-1 text-xs font-medium">
                <Eye className="h-3 w-3" /> Needs Human Review ({verdictHR.length})
              </p>
              {verdictHR.map((v, i) => (
                <div key={i} className="border-border mb-2 rounded border p-3">
                  <div className="grid gap-2 sm:grid-cols-2 text-xs">
                    <Row label="Failure Probability" value={v.failure_probability?.toFixed(3)} />
                    <Row label="Escalation Reason" value={v.escalation_reason} />
                    <Row label="Human Verdict" value={v.human_verdict} />
                    <Row label="Review Notes" value={v.review_notes} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Attribution Tab ───────────────────────────────────────────────────────────

function AttributionTab({
  shared,
}: {
  shared: FailedConversationQcDetailShared;
}) {
  const data = shared.failure_attribution;
  if (!data) return <EmptyState />;

  const probFields = [
    'ambiguous_prompt',
    'underspecified_input',
    'model_hallucination',
    'model_reasoning_error',
    'missing_external_knowledge',
    'adversarial_prompt',
  ] as const;
  const categories = probFields
    .map((key) => [key, data[key]] as [string, number | null])
    .filter(([, v]) => v != null)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));

  const categoryLabels: Record<string, string> = {
    ambiguous_prompt: 'Ambiguous Prompt',
    underspecified_input: 'Underspecified Input',
    model_hallucination: 'Model Hallucination',
    model_reasoning_error: 'Model Reasoning Error',
    missing_external_knowledge: 'Missing External Knowledge',
    adversarial_prompt: 'Adversarial Prompt',
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Failure Attribution</CardTitle>
          <CardDescription>
            Root cause analysis — what caused the failure and who is responsible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div className="border-border rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Primary Cause</p>
              <p className="mt-1 text-sm font-bold">
                {categoryLabels[data.primary_cause ?? ''] ?? data.primary_cause ?? 'N/A'}
              </p>
            </div>
            {data.adversarial_score != null && (
              <ScoreGauge
                label="Adversarial Score"
                value={data.adversarial_score}
                invert
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attribution breakdown */}
      {categories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Probability Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map(([key, val]) => {
              const pct = Math.round((val ?? 0) * 100);
              const isPrimary = key === data.primary_cause;
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className={cn(isPrimary && 'font-semibold')}>
                      {categoryLabels[key] ?? key}
                      {isPrimary && (
                        <Badge variant="default" className="ml-2 text-[10px]">
                          Primary
                        </Badge>
                      )}
                    </span>
                    <span className="font-mono font-bold">{pct}%</span>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        isPrimary ? 'bg-primary' : 'bg-primary/50'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

    </div>
  );
}

// ─── Entropy Tab ───────────────────────────────────────────────────────────────

function EntropyTab({
  shared,
}: {
  shared: FailedConversationQcDetailShared;
}) {
  const results = shared.semantic_entropy_results ?? [];
  const latest = results[0];
  if (!latest) return <EmptyState />;

  const entropy = latest.normalized_entropy ?? 0;
  const stabilityColor =
    latest.stability_level === 'stable'
      ? 'text-green-600'
      : latest.stability_level === 'moderate'
        ? 'text-yellow-600'
        : 'text-red-600';

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Semantic Entropy</CardTitle>
          <CardDescription>
            Cross-model semantic clustering — measures how much models disagree
            on the answer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {/* Entropy gauge */}
            <div className="border-border rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Normalized Entropy (D_global)</p>
              <p
                className={cn(
                  'font-mono text-3xl font-bold',
                  entropy < 0.3
                    ? 'text-green-600'
                    : entropy < 0.7
                      ? 'text-yellow-600'
                      : 'text-red-600'
                )}
              >
                {entropy.toFixed(3)}
              </p>
              <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
                <div
                  className={cn(
                    'h-full rounded-full',
                    entropy < 0.3
                      ? 'bg-green-500'
                      : entropy < 0.7
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  )}
                  style={{ width: `${Math.round(entropy * 100)}%` }}
                />
              </div>
              <p className="text-muted-foreground mt-1 text-[10px]">
                {entropy < 0.3
                  ? 'Models agree'
                  : entropy < 0.7
                    ? 'Some disagreement'
                    : 'High disagreement'}
              </p>
            </div>

            <div className="border-border rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Stability</p>
              <p className={cn('mt-1 text-lg font-bold capitalize', stabilityColor)}>
                {latest.stability_level ?? 'N/A'}
              </p>
            </div>

            <div className="border-border rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Samples</p>
              <p className="mt-1 font-mono text-lg font-bold">
                {latest.num_samples ?? 0}
              </p>
            </div>

            <div className="border-border rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Raw Entropy</p>
              <p className="mt-1 font-mono text-lg font-bold">
                {latest.raw_entropy?.toFixed(4) ?? 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cluster details */}
      {latest.cluster_sizes && typeof latest.cluster_sizes === 'object' && Object.keys(latest.cluster_sizes).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cluster Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(latest.cluster_sizes as Record<string, number>)
              .sort(([, a], [, b]) => b - a)
              .map(([label, size]) => {
                const total = latest.num_samples ?? 1;
                const pct = Math.round((size / total) * 100);
                return (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-mono text-xs">Cluster {label}</span>
                      <span className="font-mono text-xs font-bold">
                        {size} ({pct}%)
                      </span>
                    </div>
                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Technical details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Technical Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            <Row label="Raw Entropy" value={latest.raw_entropy?.toFixed(4)} />
            <Row
              label="Latency"
              value={
                latest.total_latency_ms != null
                  ? `${(latest.total_latency_ms / 1000).toFixed(1)}s`
                  : null
              }
            />
            <Row label="Samples" value={latest.num_samples} />
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {results.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Entropy History ({results.length} runs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-border border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Entropy</th>
                    <th className="px-3 py-2 text-left">Stability</th>
                    <th className="px-3 py-2 text-left">Samples</th>
                    <th className="px-3 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {results.map((h, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-mono font-bold">
                        {h.normalized_entropy?.toFixed(3)}
                      </td>
                      <td className="px-3 py-2">{h.stability_level}</td>
                      <td className="px-3 py-2 font-mono">{h.num_samples}</td>
                      <td className="px-3 py-2 font-mono">{h.created_at ? format(new Date(h.created_at), 'MMM d, h:mm a') : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Timeline Tab ──────────────────────────────────────────────────────────────

function TimelineTab({
  currentModel,
}: {
  currentModel: FailedConversationQcDetailModel | null;
}) {
  const qcHistory = currentModel?.qc_status_history ?? [];
  const qcCase = currentModel?.qc_case;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      {/* Pipeline current status from QC case */}
      {qcCase && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pipeline Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              <Row label="Status" value={qcCase.status} />
              <Row label="Pipeline Stage" value={qcCase.pipeline_stage} />
              <Row label="Domain" value={qcCase.domain} />
              <Row
                label="Latency"
                value={
                  qcCase.pipeline_latency_ms != null
                    ? `${(qcCase.pipeline_latency_ms / 1000).toFixed(1)}s`
                    : null
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* QC Status History (SCD Type 2) */}
      {qcHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              QC Status History ({qcHistory.length} transitions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {qcHistory.map((entry, i) => (
                <div key={entry.id ?? i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'ring-background mt-3 h-2.5 w-2.5 rounded-full ring-2',
                        entry.is_current ? 'bg-primary' : 'bg-muted-foreground/50'
                      )}
                    />
                    {i < qcHistory.length - 1 && (
                      <div className="bg-border mt-1 w-px flex-1" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{entry.status}</span>
                      {entry.pipeline_stage && (
                        <Badge variant="outline" className="font-mono text-[10px]">
                          Stage {entry.pipeline_stage}
                        </Badge>
                      )}
                      {entry.is_current && (
                        <Badge className="text-[10px]">Current</Badge>
                      )}
                    </div>
                    {entry.reason && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {entry.reason}
                      </p>
                    )}
                    <div className="text-muted-foreground mt-1 flex flex-wrap gap-3 text-[11px]">
                      <span>{entry.triggered_by ?? 'system'}</span>
                      {entry.effective_from && (
                        <span>
                          {format(new Date(entry.effective_from), 'MMM d, h:mm:ss a')}
                        </span>
                      )}
                      {entry.duration_in_previous_ms != null && (
                        <span>
                          Duration: {(entry.duration_in_previous_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {qcHistory.length === 0 && <EmptyState />}
    </div>
  );
}
