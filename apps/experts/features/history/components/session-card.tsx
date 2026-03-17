'use client';

import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils/cn';
import { Calendar, MessageSquare, Zap, RotateCcw } from 'lucide-react';
import type { SessionListItem } from '@/features/interview/types';
import { getScoreBand } from '@/features/interview/types';

interface SessionCardProps {
  session: SessionListItem;
  onClick?: () => void;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border border-[var(--color-success-border)]';
    case 'in_progress': return 'bg-[var(--color-info-subtle)] text-[var(--color-info)] border border-[var(--color-info-border)]';
    case 'created': return 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border border-[var(--color-border)]';
    case 'cancelled': return 'bg-[var(--color-error-subtle)] text-[var(--color-error)] border border-[rgba(192,57,43,0.2)]';
    default: return 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border border-[var(--color-border)]';
  }
}

function getScoreBandClass(score: number): string {
  const band = getScoreBand(score);
  switch (band) {
    case 'excellent': return 'score-band-excellent';
    case 'good': return 'score-band-good';
    case 'meets_minimum': return 'score-band-meets';
    case 'below_expectations': return 'score-band-below';
    case 'deficient': return 'score-band-deficient';
    default: return '';
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  return (
    <button
      onClick={onClick}
      className="evaluation-card hover-lift block w-full cursor-pointer text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-[family-name:var(--font-display)] text-base text-[var(--color-text-primary)]">
            {session.title || `Session #${session.session_id}`}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider',
                getStatusColor(session.status),
              )}
            >
              {session.status.replace(/_/g, ' ')}
            </Badge>
            {session.is_v2_session && (
              <Badge
                variant="outline"
                className="border-[var(--color-signal-border)] bg-[var(--color-signal-subtle)] font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--color-signal)]"
              >
                V2
              </Badge>
            )}
          </div>
        </div>

        {session.overall_score !== null && (
          <span
            className={cn(
              'inline-flex items-center rounded-lg px-3 py-1.5 font-[family-name:var(--font-mono)] text-lg font-medium',
              getScoreBandClass(session.overall_score),
            )}
          >
            {session.overall_score}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(session.created_at)}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          {session.total_questions} questions
        </span>
        {session.is_v2_session && session.barge_in_count > 0 && (
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" />
            {session.barge_in_count} barge-ins
          </span>
        )}
        {session.is_v2_session && session.repeat_request_count > 0 && (
          <span className="flex items-center gap-1">
            <RotateCcw className="h-3.5 w-3.5" />
            {session.repeat_request_count} repeats
          </span>
        )}
      </div>
    </button>
  );
}
