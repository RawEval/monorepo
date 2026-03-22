'use client';

import { useEffect, useState } from 'react';
import { cn } from '@raweval/utils';
import type { SubmitAnswerProgress } from '@/features/interview/types';

interface InterviewHeaderProps {
  sessionId: number;
  progress: SubmitAnswerProgress | null;
  phase: string;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function phaseDisplay(phase: string): string {
  return phase
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function InterviewHeader({ sessionId, progress, phase }: InterviewHeaderProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const completionPct =
    progress && progress.total_planned > 0
      ? Math.round((progress.questions_answered / progress.total_planned) * 100)
      : 0;

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-[var(--space-5)] py-[var(--space-3)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-[var(--text-lg)] text-[var(--color-text-primary)]">
            Interview
          </h2>
          <span className="hidden font-[family-name:var(--font-mono)] text-[var(--text-xs)] text-[var(--color-text-muted)] sm:inline">
            #{sessionId}
          </span>
          <div
            className="interview-phase-badge"
            data-phase={phase.toUpperCase()}
          >
            <span
              className={cn(
                'inline-block size-1.5 rounded-full',
                phase === 'complete' ? 'bg-[var(--color-text-muted)]' : 'bg-current animate-pulse',
              )}
            />
            {phaseDisplay(phase)}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {progress && (
            <span className="font-[family-name:var(--font-mono)] text-[var(--text-xs)] sm:text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              {progress.questions_answered}/{progress.total_planned} qs
            </span>
          )}
          <span className="countdown-timer">
            {formatElapsed(elapsed)}
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
        <div
          className="h-full rounded-full bg-[var(--color-signal)] transition-all duration-500 ease-out"
          style={{ width: `${completionPct}%` }}
        />
      </div>
    </div>
  );
}
