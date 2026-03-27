'use client';

import { useQuery } from '@tanstack/react-query';
import { cn } from '@raweval/utils/cn';
import { Loader2, AlertCircle } from 'lucide-react';
import { workbenchService } from '@/services/workbench-service';
import type { StatusTimelineEntry } from '@/features/workbench/types';

interface StatusTimelineProps {
  fpfId: number;
}

const PHASE_COLORS: Record<string, { dot: string; line: string; bg: string; border: string }> = {
  // Initial / pending phases
  pending: { dot: 'var(--color-text-faint)', line: 'var(--color-border)', bg: 'var(--color-bg-muted)', border: 'var(--color-border)' },
  created: { dot: 'var(--color-text-faint)', line: 'var(--color-border)', bg: 'var(--color-bg-muted)', border: 'var(--color-border)' },
  queued: { dot: 'var(--color-text-faint)', line: 'var(--color-border)', bg: 'var(--color-bg-muted)', border: 'var(--color-border)' },
  // Analysis phase
  analysis_pending: { dot: 'var(--color-signal)', line: 'var(--color-signal-border)', bg: 'var(--color-signal-subtle)', border: 'var(--color-signal-border)' },
  analysis_in_progress: { dot: 'var(--color-signal)', line: 'var(--color-signal-border)', bg: 'var(--color-signal-subtle)', border: 'var(--color-signal-border)' },
  analysis_complete: { dot: 'var(--color-signal)', line: 'var(--color-signal-border)', bg: 'var(--color-signal-subtle)', border: 'var(--color-signal-border)' },
  // Review phases
  pre_review: { dot: 'var(--color-warning)', line: 'rgba(138, 106, 0, 0.2)', bg: 'var(--color-warning-subtle)', border: 'rgba(138, 106, 0, 0.2)' },
  pre_review_complete: { dot: 'var(--color-warning)', line: 'rgba(138, 106, 0, 0.2)', bg: 'var(--color-warning-subtle)', border: 'rgba(138, 106, 0, 0.2)' },
  human_review: { dot: 'var(--color-warning)', line: 'rgba(138, 106, 0, 0.2)', bg: 'var(--color-warning-subtle)', border: 'rgba(138, 106, 0, 0.2)' },
  post_review: { dot: 'var(--color-warning)', line: 'rgba(138, 106, 0, 0.2)', bg: 'var(--color-warning-subtle)', border: 'rgba(138, 106, 0, 0.2)' },
  // Annotation phases
  ready_for_annotation: { dot: 'var(--color-success)', line: 'var(--color-success-border)', bg: 'var(--color-success-subtle)', border: 'var(--color-success-border)' },
  annotation_in_progress: { dot: 'var(--color-success)', line: 'var(--color-success-border)', bg: 'var(--color-success-subtle)', border: 'var(--color-success-border)' },
  annotation_complete: { dot: 'var(--color-success)', line: 'var(--color-success-border)', bg: 'var(--color-success-subtle)', border: 'var(--color-success-border)' },
  // QC phases
  qc_pending: { dot: 'var(--color-info)', line: 'var(--color-info-border)', bg: 'var(--color-info-subtle)', border: 'var(--color-info-border)' },
  qc_in_progress: { dot: 'var(--color-info)', line: 'var(--color-info-border)', bg: 'var(--color-info-subtle)', border: 'var(--color-info-border)' },
  qc_complete: { dot: 'var(--color-info)', line: 'var(--color-info-border)', bg: 'var(--color-info-subtle)', border: 'var(--color-info-border)' },
  // Terminal
  completed: { dot: 'var(--color-success)', line: 'var(--color-success-border)', bg: 'var(--color-success-subtle)', border: 'var(--color-success-border)' },
  rejected: { dot: 'var(--color-error)', line: 'rgba(192, 57, 43, 0.2)', bg: 'var(--color-error-subtle)', border: 'rgba(192, 57, 43, 0.2)' },
  failed: { dot: 'var(--color-error)', line: 'rgba(192, 57, 43, 0.2)', bg: 'var(--color-error-subtle)', border: 'rgba(192, 57, 43, 0.2)' },
  skipped: { dot: 'var(--color-text-faint)', line: 'var(--color-border)', bg: 'var(--color-bg-muted)', border: 'var(--color-border)' },
};

function getPhaseColor(status: string) {
  const normalized = status.toLowerCase().replace(/\s+/g, '_');
  return PHASE_COLORS[normalized] ?? PHASE_COLORS['pending']!;
}

function formatDuration(ms: number | null): string {
  if (ms === null || ms === 0) return '';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function TimelineEntry({
  entry,
  isLast,
  isCurrent,
}: {
  entry: StatusTimelineEntry;
  isLast: boolean;
  isCurrent: boolean;
}) {
  const colors = getPhaseColor(entry.status);

  return (
    <div className="relative flex gap-4" style={{ paddingBottom: isLast ? 0 : 'var(--space-5)' }}>
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center" style={{ width: '20px' }}>
        <div
          className={cn('relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full')}
          style={{
            background: colors.bg,
            border: `2px solid ${colors.dot}`,
            boxShadow: isCurrent ? `0 0 0 4px ${colors.bg}` : undefined,
          }}
        >
          {isCurrent && (
            <div
              className="absolute h-2 w-2 rounded-full"
              style={{
                background: colors.dot,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          )}
          {!isCurrent && (
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: colors.dot }}
            />
          )}
        </div>
        {!isLast && (
          <div
            className="w-px flex-1"
            style={{
              background: colors.line,
              minHeight: '20px',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-1" style={{ marginTop: '-2px' }}>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: isCurrent ? colors.dot : 'var(--color-text-primary)',
              fontWeight: isCurrent ? 500 : 400,
            }}
          >
            {entry.status.replace(/_/g, ' ')}
          </span>
          {isCurrent && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                background: colors.bg,
                color: colors.dot,
                border: `1px solid ${colors.border}`,
              }}
            >
              Current
            </span>
          )}
        </div>
        <div
          className="mt-1 flex flex-wrap items-center gap-3"
          style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}
        >
          <span>{formatTimestamp(entry.created_at)}</span>
          {entry.triggered_by && (
            <span style={{ color: 'var(--color-text-muted)' }}>
              by {entry.triggered_by}
            </span>
          )}
          {entry.duration_in_previous_ms !== null && entry.duration_in_previous_ms > 0 && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                background: 'var(--color-bg-muted)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {formatDuration(entry.duration_in_previous_ms)}
            </span>
          )}
        </div>
        {entry.reason && (
          <p
            className="mt-1"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--leading-normal)',
            }}
          >
            {entry.reason}
          </p>
        )}
      </div>
    </div>
  );
}

export function StatusTimeline({ fpfId }: StatusTimelineProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['status-timeline', fpfId],
    queryFn: () => workbenchService.getStatusTimeline(fpfId),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ padding: 'var(--space-4)' }}
      >
        <Loader2
          className="h-4 w-4 animate-spin"
          style={{ color: 'var(--color-signal)' }}
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="flex items-center gap-2"
        style={{
          padding: 'var(--space-3)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-faint)',
        }}
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        Failed to load timeline
      </div>
    );
  }

  // Merge and sort both histories chronologically
  const allEntries = [
    ...data.task_status_history,
    ...data.qc_pipeline_history,
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (allEntries.length === 0) {
    return (
      <div
        className="text-center"
        style={{
          padding: 'var(--space-6)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
        }}
      >
        No timeline entries yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Current status badge */}
      <div
        className="inline-flex items-center gap-2"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          background: getPhaseColor(data.current_status).bg,
          color: getPhaseColor(data.current_status).dot,
          border: `1px solid ${getPhaseColor(data.current_status).border}`,
          letterSpacing: 'var(--tracking-wide)',
          textTransform: 'uppercase',
          width: 'fit-content',
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: getPhaseColor(data.current_status).dot,
            animation: 'pulse 2s ease-in-out infinite',
            display: 'inline-block',
          }}
        />
        {data.current_status.replace(/_/g, ' ')}
      </div>

      {/* Timeline entries */}
      <div>
        {allEntries.map((entry, idx) => (
          <TimelineEntry
            key={entry.id}
            entry={entry}
            isLast={idx === allEntries.length - 1}
            isCurrent={idx === allEntries.length - 1 && entry.status === data.current_status}
          />
        ))}
      </div>
    </div>
  );
}
