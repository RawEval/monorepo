'use client';

import { getScoreBand } from '@/features/interview/types';
import type { SubmitAnswerProgress } from '@/features/interview/types';

interface ProgressTrackerProps {
  progress: SubmitAnswerProgress;
  scores: number[];
  averageScore: number;
  skillScores?: Record<string, number[]>;
}

function scoreColor(score: number): string {
  const band = getScoreBand(score);
  if (band === 'excellent' || band === 'good') return 'var(--color-success)';
  if (band === 'meets_minimum') return 'var(--color-info)';
  if (band === 'below_expectations') return 'var(--color-warning)';
  return 'var(--color-error)';
}

export function ProgressTracker({ progress, scores, averageScore, skillScores }: ProgressTrackerProps) {
  const completionPct =
    progress.total_planned > 0
      ? Math.round((progress.questions_answered / progress.total_planned) * 100)
      : 0;

  return (
    <div className="space-y-5">
      {/* Overall progress */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-[family-name:var(--font-mono)] text-[var(--text-xs)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-muted)]">
            Progress
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[var(--text-sm)] font-medium text-[var(--color-text-primary)]">
            {progress.questions_answered}/{progress.total_planned}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
          <div
            className="h-full rounded-full bg-[var(--color-signal)] transition-all duration-500 ease-out"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="mt-1 text-right font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)]">
          {completionPct}% complete
        </p>
      </div>

      {/* Average score */}
      {scores.length > 0 && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 text-center">
          <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-muted)]">
            Average Score
          </p>
          <p
            className="mt-1 text-3xl font-bold"
            style={{ color: scoreColor(averageScore) }}
          >
            {Math.round(averageScore)}
          </p>
        </div>
      )}

      {/* Score trend */}
      {scores.length > 0 && (
        <div>
          <p className="mb-2 font-[family-name:var(--font-mono)] text-[var(--text-xs)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-muted)]">
            Score Trend
          </p>
          <div className="space-y-1.5">
            {scores.map((score, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 text-right font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)]">
                  Q{i + 1}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, score)}%`,
                      backgroundColor: scoreColor(score),
                    }}
                  />
                </div>
                <span
                  className="w-7 text-right font-[family-name:var(--font-mono)] text-[11px] font-medium"
                  style={{ color: scoreColor(score) }}
                >
                  {score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill scores */}
      {skillScores && Object.keys(skillScores).length > 0 && (
        <div>
          <p className="mb-2 font-[family-name:var(--font-mono)] text-[var(--text-xs)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-muted)]">
            Skill Breakdown
          </p>
          <div className="space-y-2">
            {Object.entries(skillScores).map(([skill, skillValues]) => {
              const avg =
                skillValues.length > 0
                  ? Math.round(skillValues.reduce((a, b) => a + b, 0) / skillValues.length)
                  : 0;
              return (
                <div key={skill} className="flex items-center gap-2">
                  <span className="w-24 truncate text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                    {skill.replace(/_/g, ' ')}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, avg)}%`,
                        backgroundColor: scoreColor(avg),
                      }}
                    />
                  </div>
                  <span
                    className="w-7 text-right font-[family-name:var(--font-mono)] text-[11px] font-medium"
                    style={{ color: scoreColor(avg) }}
                  >
                    {avg}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
