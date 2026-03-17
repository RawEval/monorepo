'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils/cn';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertOctagon,
  MinusCircle,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Target,
  BookOpen,
  FileWarning,
} from 'lucide-react';
import { workbenchService } from '@/services/workbench-service';
import type { ClaimVerdict, ErrorSeverity, RubricClaim } from '@/features/workbench/types';

// ── Props ──────────────────────────────────────────────────────────────────

interface RubricPanelProps {
  conversationId: number;
}

// ── Verdict / Severity Maps ────────────────────────────────────────────────

const VERDICT_CONFIG: Record<
  ClaimVerdict,
  { color: string; bg: string; border: string; icon: React.ElementType; label: string }
> = {
  SUPPORTED: {
    color: 'var(--color-success)',
    bg: 'var(--color-success-subtle)',
    border: 'var(--color-success-border)',
    icon: CheckCircle2,
    label: 'Supported',
  },
  CONTRADICTED: {
    color: 'var(--color-error)',
    bg: 'var(--color-error-subtle)',
    border: 'rgba(192, 57, 43, 0.2)',
    icon: XCircle,
    label: 'Contradicted',
  },
  MISSING: {
    color: 'var(--color-warning)',
    bg: 'var(--color-warning-subtle)',
    border: 'rgba(138, 106, 0, 0.2)',
    icon: HelpCircle,
    label: 'Missing',
  },
  MISLEADING: {
    color: 'var(--color-signal)',
    bg: 'var(--color-signal-subtle)',
    border: 'var(--color-signal-border)',
    icon: AlertOctagon,
    label: 'Misleading',
  },
  INSUFFICIENT: {
    color: 'var(--color-text-muted)',
    bg: 'var(--color-bg-muted)',
    border: 'var(--color-border)',
    icon: MinusCircle,
    label: 'Insufficient',
  },
};

const SEVERITY_CONFIG: Record<ErrorSeverity, { color: string; bg: string; label: string }> = {
  critical: { color: 'var(--color-error)', bg: 'var(--color-error-subtle)', label: 'Critical' },
  major: { color: 'var(--color-signal)', bg: 'var(--color-signal-subtle)', label: 'Major' },
  minor: { color: 'var(--color-warning)', bg: 'var(--color-warning-subtle)', label: 'Minor' },
  negligible: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-muted)', label: 'Negligible' },
};

// ── Claim Card ─────────────────────────────────────────────────────────────

function ClaimCard({ claim }: { claim: RubricClaim }) {
  const [expanded, setExpanded] = useState(false);
  const verdict = claim.verdict ? VERDICT_CONFIG[claim.verdict] : null;
  const severity = claim.severity ? SEVERITY_CONFIG[claim.severity] : null;
  const VerdictIcon = verdict?.icon ?? HelpCircle;

  return (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      className={cn(
        'w-full cursor-pointer rounded-[var(--radius-md)] border text-left transition-all',
        'hover:shadow-[var(--shadow-sm)]',
        expanded
          ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-base)]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-surface)]',
      )}
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-[var(--space-3)] p-[var(--space-3)]">
        {verdict && (
          <VerdictIcon
            size={16}
            className="shrink-0"
            style={{ color: verdict.color }}
          />
        )}
        <span
          className={cn(
            'flex-1 text-[length:var(--text-sm)] leading-[var(--leading-snug)]',
            expanded ? '' : 'line-clamp-1',
          )}
        >
          {claim.claim_text}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {severity && (
            <span
              className="rounded-[var(--radius-sm)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wide)]"
              style={{ color: severity.color, background: severity.bg }}
            >
              {severity.label}
            </span>
          )}
          {expanded ? (
            <ChevronDown size={14} className="text-[var(--color-text-muted)]" />
          ) : (
            <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="flex flex-col gap-[var(--space-3)] border-t border-[var(--color-border)] px-[var(--space-3)] pb-[var(--space-3)] pt-[var(--space-3)]">
          {/* Verdict badge */}
          {verdict && (
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wide)]"
                style={{
                  color: verdict.color,
                  background: verdict.bg,
                  border: `1px solid ${verdict.border}`,
                }}
              >
                {verdict.label}
              </span>
              {claim.confidence != null && (
                <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
                  {Math.round(claim.confidence * 100)}% confidence
                </span>
              )}
            </div>
          )}

          {/* Evidence */}
          {claim.evidence_text && (
            <div className="flex flex-col gap-1">
              <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wider)] text-[var(--color-text-faint)]">
                Evidence
              </span>
              <p className="text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--color-text-secondary)]">
                {claim.evidence_text}
              </p>
              {claim.evidence_source && (
                <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
                  Source: {claim.evidence_source}
                </span>
              )}
            </div>
          )}

          {/* Explanation */}
          {claim.explanation && (
            <div className="flex flex-col gap-1">
              <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wider)] text-[var(--color-text-faint)]">
                Explanation
              </span>
              <p className="text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--color-text-secondary)]">
                {claim.explanation}
              </p>
            </div>
          )}

          {/* Source turn */}
          {claim.claim_source_turn != null && (
            <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
              Source turn: {claim.claim_source_turn}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function RubricPanel({ conversationId }: RubricPanelProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['rubric', conversationId],
    queryFn: () => workbenchService.getRubric(conversationId),
    enabled: conversationId > 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-[var(--space-8)]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-signal)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-error-subtle)] p-[var(--space-4)]">
        <AlertTriangle size={16} className="text-[var(--color-error)]" />
        <span className="text-[length:var(--text-sm)] text-[var(--color-error)]">
          Failed to load rubric.
        </span>
      </div>
    );
  }

  if (!data) return null;

  const { rubric, claims } = data;
  const severityCfg = rubric.failure_severity
    ? SEVERITY_CONFIG[rubric.failure_severity]
    : null;

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* ── Failure Summary Card ──────────────────────────────────── */}
      {rubric.overall_failure_summary && (
        <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-[var(--space-4)]">
          <div className="flex items-center gap-[var(--space-2)]">
            <ShieldAlert size={16} className="text-[var(--color-error)]" />
            <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-text-muted)]">
              Failure Summary
            </span>
            {severityCfg && (
              <span
                className="ml-auto rounded-[var(--radius-sm)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wide)]"
                style={{ color: severityCfg.color, background: severityCfg.bg }}
              >
                {severityCfg.label}
              </span>
            )}
            {rubric.failure_confidence != null && (
              <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
                {Math.round(rubric.failure_confidence * 100)}%
              </span>
            )}
          </div>
          <p className="text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--color-text-secondary)]">
            {rubric.overall_failure_summary}
          </p>
          {rubric.failure_categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {rubric.failure_categories.map((cat) => (
                <Badge key={cat} variant="outline" className="text-[10px]">
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          {/* Claim stats */}
          <div className="flex gap-[var(--space-4)] border-t border-[var(--color-border)] pt-[var(--space-3)]">
            <StatChip label="Analyzed" value={rubric.total_claims_analyzed} />
            <StatChip
              label="Supported"
              value={rubric.claims_supported}
              color="var(--color-success)"
            />
            <StatChip
              label="Contradicted"
              value={rubric.claims_contradicted}
              color="var(--color-error)"
            />
            <StatChip
              label="Insufficient"
              value={rubric.claims_insufficient}
              color="var(--color-text-muted)"
            />
          </div>
        </div>
      )}

      {/* ── Claims List ───────────────────────────────────────────── */}
      {claims.length > 0 && (
        <div className="flex flex-col gap-[var(--space-2)]">
          <div className="flex items-center gap-2 px-1">
            <FileWarning size={14} className="text-[var(--color-text-muted)]" />
            <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-text-muted)]">
              Claims ({claims.length})
            </span>
          </div>
          <div className="flex flex-col gap-[var(--space-2)]">
            {[...claims]
              .sort((a, b) => a.order - b.order)
              .map((claim) => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
          </div>
        </div>
      )}

      {/* ── Focus Areas ───────────────────────────────────────────── */}
      {rubric.annotator_focus_areas.length > 0 && (
        <div className="flex flex-col gap-[var(--space-2)]">
          <div className="flex items-center gap-2 px-1">
            <Target size={14} className="text-[var(--color-signal)]" />
            <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-text-muted)]">
              Focus Areas
            </span>
          </div>
          <ul className="flex flex-col gap-[var(--space-1)]">
            {rubric.annotator_focus_areas.map((area, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--color-signal-subtle)] p-[var(--space-2)] text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--color-text-secondary)]"
              >
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-signal)]" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Annotator Instructions ────────────────────────────────── */}
      {rubric.annotator_instructions && (
        <div className="flex flex-col gap-[var(--space-2)]">
          <div className="flex items-center gap-2 px-1">
            <BookOpen size={14} className="text-[var(--color-info)]" />
            <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-text-muted)]">
              Instructions
            </span>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-info-border)] bg-[var(--color-info-subtle)] p-[var(--space-3)]">
            <p className="text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--color-text-secondary)]">
              {rubric.annotator_instructions}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat Chip ──────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] font-medium"
        style={{ color: color ?? 'var(--color-text-primary)' }}
      >
        {value}
      </span>
      <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-faint)]">
        {label}
      </span>
    </div>
  );
}
