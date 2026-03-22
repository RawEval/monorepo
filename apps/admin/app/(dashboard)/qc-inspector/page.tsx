'use client';

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Activity,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  Brain,
  Scale,
  FlaskConical,
  Eye,
  Fingerprint,
  GitBranch,
  GitMerge,
  CircleDot,
} from 'lucide-react';
import { adminLLMConfigService } from '@/services/admin/llm-config-service';
import type { PipelineCallsResponse } from '@/services/admin/llm-config-service';
import { Card, CardContent } from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Verdict = 'FailedPrompt' | 'FalsePositive' | 'NeedsHumanReview' | 'FraudBlock';

interface StageData {
  stage: string;
  model: string;
  call_count: number;
  total_cost_usd: number;
  total_tokens: number;
  total_latency_ms: number;
  calls: CallData[];
}

interface CallData {
  id: number;
  model_requested: string;
  model_resolved: string | null;
  provider: string | null;
  input_tokens: number;
  output_tokens: number;
  total_tokens?: number;
  cost_usd: number;
  latency_ms: number;
  status: string;
  error_message: string | null;
  prompt_name: string | null;
  input_text?: string | null;
  output_text?: string | null;
  system_prompt_text?: string | null;
  created_at: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_GROUPS: Record<string, string[]> = {
  pii: ['pii_anonymizer'],
  context: ['context_extractor'],
  parallel_1: ['kle_entropy', 'self_consistency', 'trace_parser_reference', 'trace_parser_structure'],
  rubric: ['rubric_generator', 'semantic_matcher'],
  parallel_2: [
    'judge_process_verifier',
    'judge_tool_strategy',
    'judge_devils_advocate',
    'claim_decomposer',
    'fraud_detector',
  ],
  reconciliation: ['reconciliation'],
  holistic: ['holistic_evaluator', 'holistic_evaluator_revision'],
  verdict: ['verdict_aggregator'],
  correctness: ['correctness_primary', 'correctness_secondary'],
};

const STAGE_LABELS: Record<string, string> = {
  pii_anonymizer: 'PII Anonymization',
  context_extractor: 'Context Extraction',
  kle_entropy: 'KLE Entropy',
  self_consistency: 'Self-Consistency',
  trace_parser_reference: 'Reference Trace',
  trace_parser_structure: 'Structure Trace',
  rubric_generator: 'Rubric Generation',
  semantic_matcher: 'Semantic Matching',
  judge_process_verifier: 'Judge: Process',
  judge_tool_strategy: 'Judge: Tool Strategy',
  judge_devils_advocate: "Judge: Devil's Advocate",
  claim_decomposer: 'Claims Decomposer',
  fraud_detector: 'Fraud Detector',
  reconciliation: 'Judge-Semantic Reconciliation',
  holistic_evaluator: 'Holistic Evaluation',
  holistic_evaluator_revision: 'Holistic Revision',
  verdict_aggregator: 'Verdict Aggregator',
  correctness_primary: 'Correctness (Primary)',
  correctness_secondary: 'Correctness (Secondary)',
};

const STAGE_ICONS: Record<string, React.ReactNode> = {
  pii_anonymizer: <Fingerprint className="h-4 w-4" />,
  context_extractor: <Brain className="h-4 w-4" />,
  kle_entropy: <Activity className="h-4 w-4" />,
  self_consistency: <GitBranch className="h-4 w-4" />,
  trace_parser_reference: <Eye className="h-4 w-4" />,
  trace_parser_structure: <Layers className="h-4 w-4" />,
  rubric_generator: <FlaskConical className="h-4 w-4" />,
  semantic_matcher: <GitMerge className="h-4 w-4" />,
  judge_process_verifier: <Scale className="h-4 w-4" />,
  judge_tool_strategy: <Scale className="h-4 w-4" />,
  judge_devils_advocate: <Scale className="h-4 w-4" />,
  claim_decomposer: <CheckCircle2 className="h-4 w-4" />,
  fraud_detector: <Shield className="h-4 w-4" />,
  reconciliation: <GitMerge className="h-4 w-4" />,
  holistic_evaluator: <Brain className="h-4 w-4" />,
  holistic_evaluator_revision: <Brain className="h-4 w-4" />,
  verdict_aggregator: <CircleDot className="h-4 w-4" />,
  correctness_primary: <CheckCircle2 className="h-4 w-4" />,
  correctness_secondary: <CheckCircle2 className="h-4 w-4" />,
};

const VERDICT_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  FailedPrompt: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    badge: 'bg-blue-600 text-white',
  },
  FalsePositive: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-600 text-white',
  },
  NeedsHumanReview: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-600 text-white',
  },
  FraudBlock: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/30',
    badge: 'bg-red-600 text-white',
  },
};

const FLOW_ORDER = ['pii', 'context', 'parallel_1', 'rubric', 'parallel_2', 'reconciliation', 'holistic', 'verdict'];
const SIMPLE_STAGES = new Set(['context_extractor', 'correctness_primary', 'correctness_secondary', 'kle_entropy', 'fraud_detector']);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtCost(v: number | null | undefined): string {
  if (v == null) return '$0.0000';
  return `$${v.toFixed(4)}`;
}

function fmtLatency(ms: number | null | undefined): string {
  if (ms == null) return '--';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtNumber(v: number | null | undefined): string {
  if (v == null) return '0';
  return v.toLocaleString();
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return '--';
  const dt = new Date(d);
  return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
}

function scoreColor(score: number | null | undefined): string {
  if (score == null) return 'text-muted-foreground';
  if (score >= 0.7) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 0.3) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBarColor(score: number | null | undefined): string {
  if (score == null) return 'bg-muted';
  if (score >= 0.7) return 'bg-emerald-500';
  if (score >= 0.3) return 'bg-amber-500';
  return 'bg-red-500';
}

function dGlobalColor(d: number | null | undefined): string {
  if (d == null) return 'text-muted-foreground';
  if (d <= 0.3) return 'text-emerald-600 dark:text-emerald-400';
  if (d <= 0.6) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function dGlobalBarColor(d: number | null | undefined): string {
  if (d == null) return 'bg-muted';
  if (d <= 0.3) return 'bg-emerald-500';
  if (d <= 0.6) return 'bg-amber-500';
  return 'bg-red-500';
}

function stageStatusColor(calls: CallData[]): string {
  if (calls.length === 0) return 'border-muted';
  const hasError = calls.some((c) => c.status === 'error');
  const hasTimeout = calls.some((c) => c.status === 'timeout');
  if (hasError) return 'border-red-500/50';
  if (hasTimeout) return 'border-amber-500/50';
  return 'border-emerald-500/50';
}

function stageStatusBadge(calls: CallData[]): React.ReactNode {
  if (calls.length === 0) return <Badge variant="secondary">No Calls</Badge>;
  const hasError = calls.some((c) => c.status === 'error');
  const hasTimeout = calls.some((c) => c.status === 'timeout');
  if (hasError) return <Badge variant="destructive">Error</Badge>;
  if (hasTimeout) return <Badge className="bg-amber-600 text-white">Timeout</Badge>;
  return <Badge className="bg-emerald-600 text-white">Success</Badge>;
}

function safeParseJSON(text: string | null | undefined): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Try to find JSON in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function getStageGroup(stageName: string): string | null {
  for (const [group, stages] of Object.entries(STAGE_GROUPS)) {
    if (stages.includes(stageName)) return group;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Collapsible Section Component
// ─────────────────────────────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-border rounded-md border">
      <button
        type="button"
        className="text-foreground hover:bg-muted/50 flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        {title}
      </button>
      {open && <div className="border-border border-t px-3 py-2">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Code Block Component
// ─────────────────────────────────────────────────────────────────────────────

function CodeBlock({ title, content }: { title: string; content: string | null | undefined }) {
  if (!content) return null;
  return (
    <CollapsibleSection title={title}>
      <pre className="bg-muted text-foreground max-h-64 overflow-y-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">
        {content}
      </pre>
    </CollapsibleSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Detail: Context Extractor
// ─────────────────────────────────────────────────────────────────────────────

function ContextDetail({ calls }: { calls: CallData[] }) {
  const call = calls[0];
  if (!call) return null;
  const parsed = safeParseJSON(call.output_text) as Record<string, unknown> | null;

  return (
    <div className="space-y-3">
      {parsed && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {parsed.task_type ? (
              <Badge variant="outline" className="font-mono">
                task_type: {String(parsed.task_type)}
              </Badge>
            ) : null}
            {parsed.domain ? (
              <Badge variant="outline" className="font-mono">
                domain: {String(parsed.domain)}
              </Badge>
            ) : null}
            {parsed.difficulty_score != null && (
              <Badge variant="outline" className={cn('font-mono', scoreColor(Number(parsed.difficulty_score)))}>
                difficulty: {Number(parsed.difficulty_score).toFixed(2)}
              </Badge>
            )}
            {parsed.ambiguity_score != null && (
              <Badge variant="outline" className={cn('font-mono', scoreColor(1 - Number(parsed.ambiguity_score)))}>
                ambiguity: {Number(parsed.ambiguity_score).toFixed(2)}
              </Badge>
            )}
          </div>
          {Array.isArray(parsed.success_criteria) && parsed.success_criteria.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">Success Criteria</p>
              <ul className="space-y-0.5">
                {(parsed.success_criteria as string[]).map((c, i) => (
                  <li key={i} className="text-foreground flex items-start gap-1.5 text-xs">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(parsed.verifiable_constraints) && parsed.verifiable_constraints.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">Verifiable Constraints</p>
              <ul className="space-y-0.5">
                {(parsed.verifiable_constraints as string[]).map((c, i) => (
                  <li key={i} className="text-foreground flex items-start gap-1.5 text-xs">
                    <CircleDot className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
                    <span>{typeof c === 'string' ? c : JSON.stringify(c)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <BaseCallDetail call={call} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Detail: KLE Entropy
// ─────────────────────────────────────────────────────────────────────────────

function KLEDetail({ calls }: { calls: CallData[] }) {
  const call = calls[0];
  if (!call) return null;
  const parsed = safeParseJSON(call.output_text) as Record<string, unknown> | null;

  const dGlobal = parsed?.d_global != null ? Number(parsed.d_global) : null;

  return (
    <div className="space-y-3">
      {parsed && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase">d_global</p>
              <p className={cn('font-mono text-2xl font-bold', dGlobalColor(dGlobal))}>
                {dGlobal != null ? dGlobal.toFixed(3) : '--'}
              </p>
            </div>
            <div className="flex-1">
              <div className="bg-muted h-5 w-full overflow-hidden rounded-full">
                <div
                  className={cn('h-full rounded-full transition-all', dGlobalBarColor(dGlobal))}
                  style={{ width: `${dGlobal != null ? Math.min(dGlobal * 100, 100) : 0}%` }}
                />
              </div>
              <div className="mt-0.5 flex justify-between text-[10px]">
                <span className="text-emerald-600">0 (consensus)</span>
                <span className="text-amber-600">0.5</span>
                <span className="text-red-600">1 (divergence)</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {parsed.sample_count != null && (
              <Badge variant="outline" className="font-mono">
                samples: {String(parsed.sample_count)}
              </Badge>
            )}
            {Array.isArray(parsed.model_families) && (
              <Badge variant="outline" className="font-mono">
                families: {(parsed.model_families as string[]).join(', ')}
              </Badge>
            )}
          </div>
          {parsed.interpretation ? (
            <p className="text-muted-foreground text-xs italic">{String(parsed.interpretation)}</p>
          ) : null}
        </div>
      )}
      <BaseCallDetail call={call} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Detail: Judge Panel
// ─────────────────────────────────────────────────────────────────────────────

function JudgeDetail({ stages }: { stages: StageData[] }) {
  const judgeOutputs: { stageName: string; call: CallData; parsed: Record<string, unknown> | null }[] = stages.map(
    (s) => ({
      stageName: s.stage,
      call: s.calls[0] ?? ({} as CallData),
      parsed: safeParseJSON(s.calls[0]?.output_text) as Record<string, unknown> | null,
    })
  );

  // Try to extract criteria table
  const allCriteria: Map<
    string,
    {
      type: string;
      weight: number;
      scores: (number | null)[];
      merged: number | null;
      status: string;
    }
  > = new Map();

  judgeOutputs.forEach((jo, judgeIdx) => {
    if (!jo.parsed) return;
    const criteria = (jo.parsed.criteria_results ?? jo.parsed.criteria ?? jo.parsed.rubric_results) as
      | Array<Record<string, unknown>>
      | undefined;
    if (!Array.isArray(criteria)) return;
    criteria.forEach((cr) => {
      const name = String(cr.criterion_name ?? cr.name ?? cr.criterion ?? 'Unknown');
      if (!allCriteria.has(name)) {
        allCriteria.set(name, {
          type: String(cr.criterion_type ?? cr.type ?? '--'),
          weight: Number(cr.weight ?? 0),
          scores: new Array(judgeOutputs.length).fill(null),
          merged: null,
          status: String(cr.status ?? cr.verdict ?? '--'),
        });
      }
      const entry = allCriteria.get(name)!;
      const score = cr.score != null ? Number(cr.score) : null;
      entry.scores[judgeIdx] = score;
      if (cr.merged_score != null) entry.merged = Number(cr.merged_score);
      if (cr.status) entry.status = String(cr.status);
    });
  });

  const criteriaArray = Array.from(allCriteria.entries());

  return (
    <div className="space-y-4">
      {criteriaArray.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-border border-b">
                <th className="text-muted-foreground px-2 py-1.5 text-left font-semibold">Criterion</th>
                <th className="text-muted-foreground px-2 py-1.5 text-left font-semibold">Type</th>
                <th className="text-muted-foreground px-2 py-1.5 text-right font-semibold">Weight</th>
                {judgeOutputs.map((jo, i) => (
                  <th key={i} className="text-muted-foreground px-2 py-1.5 text-right font-semibold">
                    {STAGE_LABELS[jo.stageName] ?? `Judge ${i + 1}`}
                  </th>
                ))}
                <th className="text-muted-foreground px-2 py-1.5 text-right font-semibold">Merged</th>
                <th className="text-muted-foreground px-2 py-1.5 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {criteriaArray.map(([name, cr]) => (
                <tr key={name} className="border-border border-b last:border-0">
                  <td className="text-foreground max-w-[180px] truncate px-2 py-1.5 font-medium">{name}</td>
                  <td className="text-muted-foreground px-2 py-1.5">{cr.type}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{cr.weight.toFixed(1)}</td>
                  {cr.scores.map((s, i) => (
                    <td key={i} className={cn('px-2 py-1.5 text-right font-mono font-bold', scoreColor(s))}>
                      {s != null ? s.toFixed(2) : '--'}
                    </td>
                  ))}
                  <td className={cn('px-2 py-1.5 text-right font-mono font-bold', scoreColor(cr.merged))}>
                    {cr.merged != null ? cr.merged.toFixed(2) : '--'}
                  </td>
                  <td className="px-2 py-1.5">
                    <StatusBadge status={cr.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Per-judge summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {judgeOutputs.map((jo, i) => {
          const processScore = jo.parsed?.process_score != null ? Number(jo.parsed.process_score) : null;
          return (
            <Card key={i} className="border-border">
              <CardContent className="p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-foreground text-xs font-semibold">
                    {STAGE_LABELS[jo.stageName] ?? jo.stageName}
                  </span>
                  {stageStatusBadge(jo.call.id ? [jo.call] : [])}
                </div>
                <div className="text-muted-foreground space-y-0.5 text-xs">
                  <p>
                    Model: <span className="font-mono">{jo.call.model_requested ?? '--'}</span>
                  </p>
                  <p>
                    Role: <span className="font-mono">{String(jo.parsed?.role ?? jo.parsed?.judge_role ?? '--')}</span>
                  </p>
                  {processScore != null && (
                    <p>
                      process_score:{' '}
                      <span className={cn('font-mono font-bold', scoreColor(processScore))}>
                        {processScore.toFixed(3)}
                      </span>
                    </p>
                  )}
                  <p>Latency: {fmtLatency(jo.call.latency_ms)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Raw call details for each judge */}
      {stages.map((s) =>
        s.calls.map((call) => (
          <CollapsibleSection key={call.id} title={`${STAGE_LABELS[s.stage] ?? s.stage} - Call #${call.id}`}>
            <BaseCallDetail call={call} />
          </CollapsibleSection>
        ))
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === 'CORRECT' || s === 'PASS' || s === 'PASSED')
    return <Badge className="bg-emerald-600 text-white text-[10px]">CORRECT</Badge>;
  if (s === 'PARTIAL' || s === 'PARTIALLY_CORRECT')
    return <Badge className="bg-amber-600 text-white text-[10px]">PARTIAL</Badge>;
  if (s === 'INCORRECT' || s === 'FAIL' || s === 'FAILED')
    return <Badge variant="destructive" className="text-[10px]">INCORRECT</Badge>;
  if (s === 'SKIPPED' || s === 'N/A')
    return (
      <Badge variant="secondary" className="text-[10px]">
        SKIPPED
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-[10px]">
      {status}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Detail: Claims Decomposer
// ─────────────────────────────────────────────────────────────────────────────

function ClaimsDetail({ calls }: { calls: CallData[] }) {
  const call = calls[0];
  if (!call) return null;
  const parsed = safeParseJSON(call.output_text) as Record<string, unknown> | null;

  const claimScore = parsed?.claim_score != null ? Number(parsed.claim_score) : null;
  const claims = Array.isArray(parsed?.claims) ? (parsed.claims as Array<Record<string, unknown>>) : [];

  return (
    <div className="space-y-3">
      {claimScore != null && (
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-xs font-semibold uppercase">Claim Score</p>
          <p className={cn('font-mono text-3xl font-bold', scoreColor(claimScore))}>{claimScore.toFixed(2)}</p>
        </div>
      )}
      {claims.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-muted-foreground text-xs font-semibold uppercase">Claims ({claims.length})</p>
          {claims.map((claim, i) => {
            const verified = claim.verified === true || claim.verified === 'true';
            const confidence = claim.confidence != null ? Number(claim.confidence) : null;
            return (
              <div key={i} className="border-border flex items-center gap-2 rounded-md border px-3 py-1.5">
                {verified ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                )}
                <span className="text-foreground min-w-0 flex-1 truncate text-xs">
                  {String(claim.claim ?? claim.text ?? claim.statement ?? `Claim ${i + 1}`)}
                </span>
                {claim.type ? (
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {String(claim.type)}
                  </Badge>
                ) : null}
                {confidence != null && (
                  <div className="flex w-20 shrink-0 items-center gap-1">
                    <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                      <div
                        className={cn('h-full rounded-full', scoreBarColor(confidence))}
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px]">{confidence.toFixed(2)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <BaseCallDetail call={call} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Detail: Fraud Detector
// ─────────────────────────────────────────────────────────────────────────────

function FraudDetail({ calls }: { calls: CallData[] }) {
  const call = calls[0];
  if (!call) return null;
  const parsed = safeParseJSON(call.output_text) as Record<string, unknown> | null;

  const fraudScore = parsed?.fraud_score != null ? Number(parsed.fraud_score) : null;
  const signals = Array.isArray(parsed?.signals)
    ? (parsed.signals as Array<Record<string, unknown>>)
    : Array.isArray(parsed?.activated_signals)
      ? (parsed.activated_signals as Array<Record<string, unknown>>)
      : [];

  return (
    <div className="space-y-3">
      {fraudScore != null && (
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-xs font-semibold uppercase">Fraud Score</p>
          <p className={cn('font-mono text-3xl font-bold', scoreColor(1 - fraudScore))}>{fraudScore.toFixed(3)}</p>
        </div>
      )}
      {signals.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {signals.map((sig, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-xs font-semibold">
                    {String(sig.signal_type ?? sig.type ?? sig.name ?? `Signal ${i + 1}`)}
                  </span>
                  {sig.score != null && (
                    <span className={cn('font-mono text-sm font-bold', scoreColor(1 - Number(sig.score)))}>
                      {Number(sig.score).toFixed(2)}
                    </span>
                  )}
                </div>
                {sig.description ? <p className="text-muted-foreground mt-1 text-xs">{String(sig.description)}</p> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <BaseCallDetail call={call} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Detail: Holistic Evaluation
// ─────────────────────────────────────────────────────────────────────────────

function HolisticDetail({ calls }: { calls: CallData[] }) {
  const call = calls[0];
  if (!call) return null;
  const parsed = safeParseJSON(call.output_text) as Record<string, unknown> | null;

  const holisticScore = parsed?.holistic_score != null ? Number(parsed.holistic_score) : null;
  const completeness = parsed?.completeness != null ? Number(parsed.completeness) : null;
  const accuracy = parsed?.accuracy != null ? Number(parsed.accuracy) : null;
  const usefulness = parsed?.usefulness != null ? Number(parsed.usefulness) : null;
  const mismatch = parsed?.mismatch_detected === true;
  const strengths = Array.isArray(parsed?.key_strengths) ? (parsed.key_strengths as string[]) : [];
  const weaknesses = Array.isArray(parsed?.key_weaknesses) ? (parsed.key_weaknesses as string[]) : [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Holistic', value: holisticScore },
          { label: 'Completeness', value: completeness },
          { label: 'Accuracy', value: accuracy },
          { label: 'Usefulness', value: usefulness },
        ].map((item) => (
          <div key={item.label} className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-muted-foreground text-[10px] font-semibold uppercase">{item.label}</p>
            <p className={cn('font-mono text-2xl font-bold', scoreColor(item.value))}>
              {item.value != null ? item.value.toFixed(2) : '--'}
            </p>
          </div>
        ))}
      </div>

      {mismatch && (
        <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-600">Mismatch Detected</span>
        </div>
      )}

      {strengths.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">Key Strengths</p>
          <ul className="space-y-0.5">
            {strengths.map((s, i) => (
              <li key={i} className="text-foreground flex items-start gap-1.5 text-xs">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                <span>{String(s)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {weaknesses.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">Key Weaknesses</p>
          <ul className="space-y-0.5">
            {weaknesses.map((w, i) => (
              <li key={i} className="text-foreground flex items-start gap-1.5 text-xs">
                <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
                <span>{String(w)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <BaseCallDetail call={call} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Detail: Verdict Aggregator (Score Waterfall)
// ─────────────────────────────────────────────────────────────────────────────

function VerdictDetail({ calls, allStages }: { calls: CallData[]; allStages: StageData[] }) {
  const call = calls[0];
  if (!call) return null;
  const parsed = safeParseJSON(call.output_text) as Record<string, unknown> | null;

  // Extract scores from various stages for the waterfall
  const getStageScore = (stageName: string, field: string): number | null => {
    const stage = allStages.find((s) => s.stage === stageName);
    if (!stage || stage.calls.length === 0) return null;
    const p = safeParseJSON(stage.calls[0]?.output_text) as Record<string, unknown> | null;
    if (!p || p[field] == null) return null;
    return Number(p[field]);
  };

  const waterfallItems: { label: string; value: number | null; invertColor?: boolean }[] = [
    { label: 'process_score', value: parsed?.process_score != null ? Number(parsed.process_score) : getStageScore('judge_process_verifier', 'process_score') },
    { label: 'd_global', value: getStageScore('kle_entropy', 'd_global'), invertColor: true },
    { label: 'fraud_score', value: getStageScore('fraud_detector', 'fraud_score'), invertColor: true },
    { label: 'claim_score', value: getStageScore('claim_decomposer', 'claim_score') },
    { label: 'holistic', value: getStageScore('holistic_evaluator', 'holistic_score') },
    { label: 'self_consist', value: getStageScore('self_consistency', 'consistency_score') ?? getStageScore('self_consistency', 'self_consistency_score') },
  ];

  const fpScore = parsed?.fp_score != null ? Number(parsed.fp_score) : null;
  const verdictText = parsed?.verdict != null ? String(parsed.verdict) : null;
  const verdictColors = verdictText ? VERDICT_COLORS[verdictText] : null;

  return (
    <div className="space-y-4">
      {/* Score waterfall */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-semibold uppercase">Score Waterfall</p>
        <div className="space-y-1.5">
          {waterfallItems.map((item) => {
            const pct = item.value != null ? Math.min(item.value * 100, 100) : 0;
            const colorFn = item.invertColor
              ? (v: number | null | undefined) => {
                  if (v == null) return 'text-muted-foreground';
                  if (v <= 0.3) return 'text-emerald-600 dark:text-emerald-400';
                  if (v <= 0.6) return 'text-amber-600 dark:text-amber-400';
                  return 'text-red-600 dark:text-red-400';
                }
              : scoreColor;
            const barColorFn = item.invertColor
              ? (v: number | null | undefined) => {
                  if (v == null) return 'bg-muted';
                  if (v <= 0.3) return 'bg-emerald-500';
                  if (v <= 0.6) return 'bg-amber-500';
                  return 'bg-red-500';
                }
              : scoreBarColor;
            return (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-muted-foreground w-24 shrink-0 font-mono text-xs">{item.label}:</span>
                <span className={cn('w-10 shrink-0 font-mono text-xs font-bold', colorFn(item.value))}>
                  {item.value != null ? item.value.toFixed(2) : '--'}
                </span>
                <div className="bg-muted h-4 flex-1 overflow-hidden rounded">
                  <div
                    className={cn('h-full rounded transition-all', barColorFn(item.value))}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verdict line */}
      <div
        className={cn(
          'flex items-center justify-between rounded-lg border-2 px-4 py-3',
          verdictColors?.border ?? 'border-border',
          verdictColors?.bg ?? 'bg-muted/50'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm font-semibold">VERDICT:</span>
          {verdictText && verdictColors ? (
            <Badge className={cn('text-sm', verdictColors.badge)}>{verdictText}</Badge>
          ) : (
            <span className="text-foreground font-mono text-sm font-bold">{verdictText ?? '--'}</span>
          )}
        </div>
        {fpScore != null && (
          <div className="text-right">
            <p className="text-muted-foreground text-[10px] font-semibold uppercase">fp_score</p>
            <p className={cn('font-mono text-lg font-bold', scoreColor(fpScore))}>{fpScore.toFixed(3)}</p>
          </div>
        )}
      </div>

      <BaseCallDetail call={call} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Base Call Detail (shared for all stages)
// ─────────────────────────────────────────────────────────────────────────────

function BaseCallDetail({ call }: { call: CallData }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span className="text-muted-foreground">
          Model: <span className="text-foreground font-mono">{call.model_requested}</span>
          {call.model_resolved && call.model_resolved !== call.model_requested && (
            <span className="text-muted-foreground">
              {' '}
              → <span className="font-mono">{call.model_resolved}</span>
            </span>
          )}
        </span>
        <span className="text-muted-foreground">
          Provider: <span className="text-foreground font-mono">{call.provider ?? '--'}</span>
        </span>
        <span className="text-muted-foreground">
          Tokens:{' '}
          <span className="text-foreground font-mono">
            {fmtNumber(call.input_tokens)} in / {fmtNumber(call.output_tokens)} out
          </span>
        </span>
        <span className="text-muted-foreground">
          Cost: <span className="text-foreground font-mono">{fmtCost(call.cost_usd)}</span>
        </span>
        <span className="text-muted-foreground">
          Latency: <span className="text-foreground font-mono">{fmtLatency(call.latency_ms)}</span>
        </span>
        <span className="text-muted-foreground">
          Status:{' '}
          <span
            className={cn(
              'font-mono',
              call.status === 'success'
                ? 'text-emerald-600'
                : call.status === 'error'
                  ? 'text-red-600'
                  : 'text-amber-600'
            )}
          >
            {call.status}
          </span>
        </span>
      </div>
      {call.error_message && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600">
          {call.error_message}
        </div>
      )}
      <CodeBlock title="System Prompt" content={call.system_prompt_text} />
      <CodeBlock title="Input" content={call.input_text} />
      <CodeBlock title="Output" content={call.output_text} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic Stage Detail (for stages without special rendering)
// ─────────────────────────────────────────────────────────────────────────────

function GenericStageDetail({ stage }: { stage: StageData }) {
  return (
    <div className="space-y-3">
      {stage.calls.map((call) => (
        <div key={call.id} className="space-y-2">
          {stage.calls.length > 1 && (
            <p className="text-muted-foreground text-xs font-semibold">Call #{call.id}</p>
          )}
          <BaseCallDetail call={call} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Box Component (for the flow diagram)
// ─────────────────────────────────────────────────────────────────────────────

function StageBox({
  stage,
  expanded,
  onToggle,
  detailContent,
  compact = false,
}: {
  stage: StageData;
  expanded: boolean;
  onToggle: () => void;
  detailContent: React.ReactNode;
  compact?: boolean;
}) {
  const label = STAGE_LABELS[stage.stage] ?? stage.stage;
  const icon = STAGE_ICONS[stage.stage] ?? <Layers className="h-4 w-4" />;

  return (
    <div className="w-full">
      <Card
        className={cn(
          'cursor-pointer border-2 transition-all hover:shadow-md',
          stageStatusColor(stage.calls),
          expanded && 'ring-primary/20 ring-2'
        )}
        onClick={onToggle}
      >
        <CardContent className={cn('p-3', compact && 'p-2')}>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground shrink-0">{icon}</span>
            <span className={cn('text-foreground flex-1 font-semibold', compact ? 'text-xs' : 'text-sm')}>
              {label}
            </span>
            {expanded ? (
              <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
            )}
          </div>
          <div className={cn('mt-1.5 flex flex-wrap gap-x-3 gap-y-1', compact ? 'text-[10px]' : 'text-xs')}>
            {stageStatusBadge(stage.calls)}
            <span className="text-muted-foreground font-mono">{fmtLatency(stage.total_latency_ms)}</span>
            <span className="text-muted-foreground font-mono">{fmtCost(stage.total_cost_usd)}</span>
            {stage.call_count > 1 && (
              <span className="text-muted-foreground font-mono">{stage.call_count} calls</span>
            )}
          </div>
          {!compact && (
            <p className="text-muted-foreground mt-1 font-mono text-[10px]">{stage.model}</p>
          )}
        </CardContent>
      </Card>
      {expanded && (
        <div className="border-border bg-background mt-2 rounded-lg border-2 border-dashed p-4">{detailContent}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Flow Connector Components
// ─────────────────────────────────────────────────────────────────────────────

function VerticalConnector() {
  return (
    <div className="flex justify-center py-1">
      <div className="border-border h-8 border-l-2 border-dashed" />
    </div>
  );
}

function ForkDot() {
  return (
    <div className="flex justify-center py-1">
      <div className="border-border h-3 w-3 rounded-full border-2 bg-primary/20" />
    </div>
  );
}

function ParallelLabel({ text }: { text: string }) {
  return (
    <div className="flex justify-center">
      <Badge variant="outline" className="text-muted-foreground text-[10px]">
        {text}
      </Badge>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline Flow Component
// ─────────────────────────────────────────────────────────────────────────────

function PipelineFlow({ data }: { data: PipelineCallsResponse }) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const stageMap = useMemo(() => {
    const map = new Map<string, StageData>();
    for (const s of data.stages) {
      map.set(s.stage, s);
    }
    return map;
  }, [data.stages]);

  const presentGroups = useMemo(() => {
    const groups: { group: string; stages: StageData[] }[] = [];
    for (const group of FLOW_ORDER) {
      const stageNames = STAGE_GROUPS[group] ?? [];
      const matching = stageNames.map((n) => stageMap.get(n)).filter(Boolean) as StageData[];
      if (matching.length > 0) {
        groups.push({ group, stages: matching });
      }
    }
    // Also check for correctness group
    const correctnessNames = STAGE_GROUPS.correctness ?? [];
    const correctnessStages = correctnessNames.map((n) => stageMap.get(n)).filter(Boolean) as StageData[];
    if (correctnessStages.length > 0) {
      groups.push({ group: 'correctness', stages: correctnessStages });
    }
    // Add any ungrouped stages
    const grouped = new Set(Object.values(STAGE_GROUPS).flat());
    for (const s of data.stages) {
      if (!grouped.has(s.stage)) {
        groups.push({ group: s.stage, stages: [s] });
      }
    }
    return groups;
  }, [data.stages, stageMap]);

  const toggleStage = useCallback(
    (stageName: string) => {
      setExpandedStage((prev) => (prev === stageName ? null : stageName));
    },
    []
  );

  const getDetailContent = useCallback(
    (stage: StageData): React.ReactNode => {
      const group = getStageGroup(stage.stage);
      if (stage.stage === 'context_extractor') return <ContextDetail calls={stage.calls} />;
      if (stage.stage === 'kle_entropy') return <KLEDetail calls={stage.calls} />;
      if (stage.stage === 'claim_decomposer') return <ClaimsDetail calls={stage.calls} />;
      if (stage.stage === 'fraud_detector') return <FraudDetail calls={stage.calls} />;
      if (stage.stage === 'holistic_evaluator' || stage.stage === 'holistic_evaluator_revision')
        return <HolisticDetail calls={stage.calls} />;
      if (stage.stage === 'verdict_aggregator')
        return <VerdictDetail calls={stage.calls} allStages={data.stages} />;
      // Judge stages grouped
      if (group === 'parallel_2' && (stage.stage.startsWith('judge_') || stage.stage === 'judge_process_verifier')) {
        const judgeStages = data.stages.filter(
          (s) =>
            s.stage === 'judge_process_verifier' ||
            s.stage === 'judge_tool_strategy' ||
            s.stage === 'judge_devils_advocate'
        );
        if (judgeStages.length > 0) return <JudgeDetail stages={judgeStages} />;
      }
      return <GenericStageDetail stage={stage} />;
    },
    [data.stages]
  );

  const renderParallelGroup = (stages: StageData[]) => {
    if (stages.length === 1) {
      const s = stages[0]!;
      return (
        <div className="mx-auto max-w-2xl">
          <StageBox
            stage={s}
            expanded={expandedStage === s.stage}
            onToggle={() => toggleStage(s.stage)}
            detailContent={getDetailContent(s)}
          />
        </div>
      );
    }

    const cols = stages.length <= 2 ? 'grid-cols-2' : stages.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4';

    return (
      <div>
        <ForkDot />
        <ParallelLabel text={`PARALLEL (${stages.length} stages)`} />
        {/* Horizontal line across top */}
        <div className="mx-auto mt-1 mb-1 flex items-center justify-center px-4">
          <div className="border-border h-0 flex-1 border-t-2 border-dashed" />
        </div>
        <div className={cn('grid gap-3', cols)}>
          {stages.map((s) => (
            <StageBox
              key={s.stage}
              stage={s}
              expanded={expandedStage === s.stage}
              onToggle={() => toggleStage(s.stage)}
              detailContent={getDetailContent(s)}
              compact={stages.length > 2}
            />
          ))}
        </div>
        {/* Horizontal line across bottom */}
        <div className="mx-auto mt-1 mb-1 flex items-center justify-center px-4">
          <div className="border-border h-0 flex-1 border-t-2 border-dashed" />
        </div>
        <ForkDot />
      </div>
    );
  };

  return (
    <div className="space-y-0">
      {presentGroups.map((pg, idx) => {
        const isParallel =
          pg.group === 'parallel_1' || pg.group === 'parallel_2' || (pg.group === 'correctness' && pg.stages.length > 1);

        return (
          <React.Fragment key={pg.group}>
            {idx > 0 && <VerticalConnector />}
            {isParallel ? (
              renderParallelGroup(pg.stages)
            ) : pg.stages.length === 1 ? (
              <div className="mx-auto max-w-2xl">
                <StageBox
                  stage={pg.stages[0]!}
                  expanded={expandedStage === pg.stages[0]!.stage}
                  onToggle={() => toggleStage(pg.stages[0]!.stage)}
                  detailContent={getDetailContent(pg.stages[0]!)}
                />
              </div>
            ) : (
              // Multiple stages in a sequential group (e.g., rubric + semantic_matcher)
              <div className="mx-auto max-w-2xl space-y-0">
                {pg.stages.map((s, sIdx) => (
                  <React.Fragment key={s.stage}>
                    {sIdx > 0 && (
                      <div className="flex justify-center py-0.5">
                        <div className="border-border h-4 border-l-2 border-dotted" />
                      </div>
                    )}
                    <StageBox
                      stage={s}
                      expanded={expandedStage === s.stage}
                      onToggle={() => toggleStage(s.stage)}
                      detailContent={getDetailContent(s)}
                    />
                  </React.Fragment>
                ))}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple Factual Path Component
// ─────────────────────────────────────────────────────────────────────────────

function SimpleFactualPath({ data }: { data: PipelineCallsResponse }) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const stageMap = useMemo(() => {
    const map = new Map<string, StageData>();
    for (const s of data.stages) {
      map.set(s.stage, s);
    }
    return map;
  }, [data.stages]);

  const contextStage = stageMap.get('context_extractor');
  const correctnessStages = [stageMap.get('correctness_primary'), stageMap.get('correctness_secondary')].filter(
    Boolean
  ) as StageData[];
  const kleStage = stageMap.get('kle_entropy');
  const fraudStage = stageMap.get('fraud_detector');

  const orderedStages: StageData[] = [contextStage, ...correctnessStages, kleStage, fraudStage].filter(
    Boolean
  ) as StageData[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Badge className="bg-blue-600 text-white">Simple Factual Fast-Path</Badge>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="bg-muted rounded-lg px-3 py-1.5 text-center text-xs font-semibold">Context</div>
        <div className="border-border w-8 border-t-2 border-dashed" />
        <div className="bg-muted rounded-lg px-3 py-1.5 text-center text-xs font-semibold">
          Correctness Check ({correctnessStages.length} model{correctnessStages.length !== 1 ? 's' : ''})
        </div>
        <div className="border-border w-8 border-t-2 border-dashed" />
        <div className="bg-muted rounded-lg px-3 py-1.5 text-center text-xs font-semibold">Verdict</div>
      </div>
      <div className="space-y-0">
        {orderedStages.map((stage, idx) => (
          <React.Fragment key={stage.stage}>
            {idx > 0 && <VerticalConnector />}
            <div className="mx-auto max-w-2xl">
              <StageBox
                stage={stage}
                expanded={expandedStage === stage.stage}
                onToggle={() => setExpandedStage((prev) => (prev === stage.stage ? null : stage.stage))}
                detailContent={
                  stage.stage === 'context_extractor' ? (
                    <ContextDetail calls={stage.calls} />
                  ) : stage.stage === 'kle_entropy' ? (
                    <KLEDetail calls={stage.calls} />
                  ) : stage.stage === 'fraud_detector' ? (
                    <FraudDetail calls={stage.calls} />
                  ) : (
                    <GenericStageDetail stage={stage} />
                  )
                }
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Verdict Banner Component
// ─────────────────────────────────────────────────────────────────────────────

function VerdictBanner({ data }: { data: PipelineCallsResponse }) {
  const qc = data.qc_case;
  if (!qc) return null;

  const verdict = qc.verdict as Verdict | null;
  const colors = verdict ? VERDICT_COLORS[verdict] : null;

  const langfuseUrl = qc.langfuse_trace_id
    ? `https://cloud.langfuse.com/trace/${qc.langfuse_trace_id}`
    : null;

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-5',
        colors?.bg ?? 'bg-muted/50',
        colors?.border ?? 'border-border'
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: Verdict + QC info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {verdict && colors ? (
              <Badge className={cn('px-4 py-1.5 text-lg font-bold', colors.badge)}>{verdict}</Badge>
            ) : (
              <Badge variant="secondary" className="px-4 py-1.5 text-lg font-bold">
                No Verdict
              </Badge>
            )}
            <span className="text-muted-foreground text-sm">QC Case #{qc.id}</span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
            {qc.domain && (
              <span className="text-muted-foreground">
                Domain: <span className="text-foreground font-semibold">{qc.domain}</span>
              </span>
            )}
            {qc.process_score != null && (
              <span className="text-muted-foreground">
                Process:{' '}
                <span className={cn('font-mono font-bold', scoreColor(qc.process_score))}>
                  {qc.process_score.toFixed(3)}
                </span>
              </span>
            )}
            {qc.fraud_score != null && (
              <span className="text-muted-foreground">
                Fraud:{' '}
                <span className={cn('font-mono font-bold', scoreColor(1 - qc.fraud_score))}>
                  {qc.fraud_score.toFixed(3)}
                </span>
              </span>
            )}
            {qc.total_llm_cost_usd != null && (
              <span className="text-muted-foreground">
                Total Cost: <span className="text-foreground font-mono font-bold">{fmtCost(qc.total_llm_cost_usd)}</span>
              </span>
            )}
          </div>
          {qc.created_at && (
            <p className="text-muted-foreground text-xs">Created: {fmtDate(qc.created_at)}</p>
          )}
        </div>

        {/* Right: Summary stats + Langfuse */}
        <div className="flex items-start gap-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-muted-foreground text-[10px] font-semibold uppercase">Calls</p>
              <p className="text-foreground font-mono text-lg font-bold">{fmtNumber(data.summary.total_calls)}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-[10px] font-semibold uppercase">Tokens</p>
              <p className="text-foreground font-mono text-lg font-bold">{fmtNumber(data.summary.total_tokens)}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-[10px] font-semibold uppercase">Latency</p>
              <p className="text-foreground font-mono text-lg font-bold">{fmtLatency(data.summary.total_latency_ms)}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-[10px] font-semibold uppercase">Stages</p>
              <p className="text-foreground font-mono text-lg font-bold">{data.summary.stages_count}</p>
            </div>
          </div>
          {langfuseUrl && (
            <a href={langfuseUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Langfuse
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple Factual Detection
// ─────────────────────────────────────────────────────────────────────────────

function isSimpleFactualPath(stages: StageData[]): boolean {
  const stageNames = new Set(stages.map((s) => s.stage));
  // If it has correctness stages but no judge/rubric stages, it's simple factual
  const hasCorrectness = stageNames.has('correctness_primary') || stageNames.has('correctness_secondary');
  const hasJudge =
    stageNames.has('judge_process_verifier') ||
    stageNames.has('judge_tool_strategy') ||
    stageNames.has('judge_devils_advocate');
  const hasRubric = stageNames.has('rubric_generator');
  if (hasCorrectness && !hasJudge && !hasRubric) return true;
  // Strict check: only these stages
  const simpleOnly = [...stageNames].every((s) => SIMPLE_STAGES.has(s));
  return simpleOnly && hasCorrectness;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function QCInspectorPage() {
  const [pipelineId, setPipelineId] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>('');
  const [searchMode, setSearchMode] = useState<'pipeline' | 'conversation'>('pipeline');
  const [searchId, setSearchId] = useState<number | null>(null);
  const [searchType, setSearchType] = useState<'pipeline' | 'conversation'>('pipeline');

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['qc-inspector', searchType, searchId],
    queryFn: async () => {
      if (searchType === 'pipeline') {
        return adminLLMConfigService.getCallLogsByPipeline(searchId!);
      }
      // For conversation lookup, fetch session call logs and reshape to match pipeline format
      const sessionData = await adminLLMConfigService.getCallLogsBySession(searchId!);
      const logs = (sessionData as any)?.logs || (sessionData as any)?.items || [];
      // Group by stage
      const stageMap: Record<string, any[]> = {};
      for (const log of logs) {
        const stage = log.stage || 'chat';
        if (!stageMap[stage]) stageMap[stage] = [];
        stageMap[stage].push(log);
      }
      return {
        pipeline_id: searchId,
        qc_case: null,
        summary: {
          total_calls: logs.length,
          total_cost_usd: (sessionData as any)?.total_cost_usd || 0,
          total_tokens: (sessionData as any)?.total_tokens || 0,
        },
        stages: Object.entries(stageMap).map(([name, calls]) => ({
          stage: name,
          calls,
          total_calls: calls.length,
          total_cost: calls.reduce((s: number, c: any) => s + (c.cost_usd || 0), 0),
          total_tokens: calls.reduce((s: number, c: any) => s + (c.total_tokens || 0), 0),
        })),
      } as any;
    },
    enabled: searchId != null,
  });

  const handleInspect = () => {
    const raw = searchMode === 'pipeline' ? pipelineId : conversationId;
    const id = parseInt(raw, 10);
    if (!isNaN(id) && id > 0) {
      setSearchId(id);
      setSearchType(searchMode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleInspect();
  };

  const simpleFactual = data ? isSimpleFactualPath(data.stages) : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">QC Pipeline Inspector</h1>
          <p className="text-muted-foreground">
            Inspect QC pipeline runs and conversation LLM calls. Search by QC Case ID or Conversation ID.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {/* Search mode toggle */}
            <div className="flex gap-1 rounded-lg border border-border p-0.5 self-start">
              <button
                onClick={() => setSearchMode('pipeline')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  searchMode === 'pipeline'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                QC Case ID
              </button>
              <button
                onClick={() => setSearchMode('conversation')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  searchMode === 'conversation'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Conversation ID
              </button>
            </div>

            {/* Input field */}
            <div className="flex-1 sm:max-w-xs">
              <label htmlFor="search-id" className="text-foreground mb-1.5 block text-sm font-medium">
                {searchMode === 'pipeline' ? 'QC Case ID (Pipeline ID)' : 'Conversation / Session ID'}
              </label>
              <input
                id="search-id"
                type="number"
                min={1}
                value={searchMode === 'pipeline' ? pipelineId : conversationId}
                onChange={(e) =>
                  searchMode === 'pipeline'
                    ? setPipelineId(e.target.value)
                    : setConversationId(e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder={searchMode === 'pipeline' ? 'Enter QC case ID...' : 'Enter conversation ID...'}
                className={cn(
                  'border-border bg-background text-foreground placeholder:text-muted-foreground',
                  'w-full rounded-md border px-3 py-2 font-mono text-sm',
                  'focus:border-primary focus:ring-primary/20 focus:outline-none focus:ring-2'
                )}
              />
            </div>
            <Button
              onClick={handleInspect}
              disabled={!(searchMode === 'pipeline' ? pipelineId : conversationId) || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Inspect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="text-muted-foreground mb-3 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading pipeline data...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-semibold text-red-600">Failed to load pipeline data</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {error instanceof Error ? error.message : 'An unknown error occurred. Please check the pipeline ID and try again.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Data Display */}
      {data && !isLoading && (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <VerdictBanner data={data} />

          {/* Pipeline Flow */}
          <div>
            <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
              Pipeline Flow
            </h2>
            {simpleFactual ? <SimpleFactualPath data={data} /> : <PipelineFlow data={data} />}
          </div>

          {/* Raw Stages Summary Table */}
          <div>
            <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
              Stages Summary
            </h2>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-border border-b">
                        <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-semibold">Stage</th>
                        <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-semibold">Model</th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-semibold">Calls</th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-semibold">Tokens</th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-semibold">Cost</th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-semibold">Latency</th>
                        <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {data.stages.map((stage: any) => (
                        <tr key={stage.stage} className="border-border border-b last:border-0">
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {STAGE_ICONS[stage.stage] ?? <Layers className="h-3.5 w-3.5" />}
                              </span>
                              <span className="text-foreground font-medium">
                                {STAGE_LABELS[stage.stage] ?? stage.stage}
                              </span>
                            </div>
                          </td>
                          <td className="text-muted-foreground max-w-[200px] truncate px-4 py-2 font-mono text-xs">
                            {stage.model}
                          </td>
                          <td className="text-foreground px-4 py-2 text-right font-mono">{stage.call_count}</td>
                          <td className="text-foreground px-4 py-2 text-right font-mono">
                            {fmtNumber(stage.total_tokens)}
                          </td>
                          <td className="text-foreground px-4 py-2 text-right font-mono">
                            {fmtCost(stage.total_cost_usd)}
                          </td>
                          <td className="text-foreground px-4 py-2 text-right font-mono">
                            {fmtLatency(stage.total_latency_ms)}
                          </td>
                          <td className="px-4 py-2">{stageStatusBadge(stage.calls)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !isLoading && !isError && searchId == null && (
        <div className="flex flex-col items-center justify-center py-20">
          <Activity className="text-muted-foreground/30 mb-4 h-16 w-16" />
          <p className="text-muted-foreground text-sm">Enter a QC Case ID above to inspect a pipeline run.</p>
        </div>
      )}
    </div>
  );
}
