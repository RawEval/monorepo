'use client';

import { cn } from '@raweval/utils';
import { ArrowUp, ArrowDown, AlertTriangle, Star, Lightbulb, Target } from 'lucide-react';
import type { Evaluation, AdaptiveDifficulty } from '@/features/interview/types';
import { getScoreBand } from '@/features/interview/types';

interface EvaluationDisplayProps {
  evaluation: Evaluation;
  adaptiveDifficulty?: AdaptiveDifficulty;
}

const BREAKDOWN_LABELS: Record<string, string> = {
  conceptual_understanding: 'Conceptual Understanding',
  technical_accuracy: 'Technical Accuracy',
  depth: 'Depth of Knowledge',
  clarity: 'Clarity & Communication',
  edge_cases: 'Edge Cases',
  real_world: 'Real-World Application',
};

function ScoreCircle({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const band = getScoreBand(score);

  const strokeColor =
    band === 'excellent' || band === 'good'
      ? 'var(--color-success)'
      : band === 'meets_minimum'
        ? 'var(--color-info)'
        : band === 'below_expectations'
          ? 'var(--color-warning)'
          : 'var(--color-error)';

  return (
    <div className="relative flex items-center justify-center">
      <svg className="progress-ring" width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="6"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="text-xl font-bold"
          style={{ color: strokeColor }}
        >
          {score}
        </span>
        <span className="text-[9px] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-muted)]">
          score
        </span>
      </div>
    </div>
  );
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.min(100, Math.max(0, value));
  const color =
    percentage >= 80
      ? 'var(--color-success)'
      : percentage >= 60
        ? 'var(--color-info)'
        : percentage >= 40
          ? 'var(--color-warning)'
          : 'var(--color-error)';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          {label}
        </span>
        <span
          className="font-[family-name:var(--font-mono)] text-[var(--text-xs)] font-medium"
          style={{ color }}
        >
          {value}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function EvaluationDisplay({ evaluation, adaptiveDifficulty }: EvaluationDisplayProps) {
  return (
    <div className="evaluation-card animate-fade-in-up space-y-4">
      {/* Difficulty change indicator */}
      {adaptiveDifficulty?.change && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wide)]',
            adaptiveDifficulty.change === 'increase'
              ? 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]'
              : 'bg-[var(--color-info-subtle)] text-[var(--color-info)]',
          )}
        >
          {adaptiveDifficulty.change === 'increase' ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )}
          Difficulty {adaptiveDifficulty.change}d to {adaptiveDifficulty.current}
        </div>
      )}

      {/* Score + breakdown row */}
      <div className="flex gap-5">
        <ScoreCircle score={evaluation.score} />
        <div className="flex-1 space-y-2">
          {Object.entries(evaluation.breakdown).map(([key, value]) => (
            <BreakdownBar
              key={key}
              label={BREAKDOWN_LABELS[key] ?? key}
              value={value}
            />
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="space-y-3 border-t border-[var(--color-border)] pt-3">
        {/* Why this score */}
        <div className="flex gap-2">
          <Target className="mt-0.5 size-3.5 shrink-0 text-[var(--color-text-muted)]" />
          <p className="text-[var(--text-sm)] leading-[var(--leading-normal)] text-[var(--color-text-secondary)]">
            {evaluation.why_this_score}
          </p>
        </div>

        {/* Improvement */}
        <div className="flex gap-2">
          <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-[var(--color-signal)]" />
          <p className="text-[var(--text-sm)] leading-[var(--leading-normal)] text-[var(--color-text-secondary)]">
            {evaluation.improvement_plan}
          </p>
        </div>

        {/* Missed must-include points */}
        {evaluation.missed_must_include_points.length > 0 && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-warning-subtle)] p-3">
            <p className="mb-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wide)] text-[var(--color-warning)]">
              Missed Points
            </p>
            <ul className="list-inside list-disc space-y-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              {evaluation.missed_must_include_points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Red flags */}
        {evaluation.detected_red_flags.length > 0 && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-error-subtle)] p-3">
            <p className="mb-1 flex items-center gap-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wide)] text-[var(--color-error)]">
              <AlertTriangle className="size-3" />
              Red Flags
            </p>
            <ul className="list-inside list-disc space-y-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              {evaluation.detected_red_flags.map((flag, i) => (
                <li key={i}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Bonus points */}
        {evaluation.bonus_points_awarded.length > 0 && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-success-subtle)] p-3">
            <p className="mb-1 flex items-center gap-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wide)] text-[var(--color-success)]">
              <Star className="size-3" />
              Bonus Points
            </p>
            <ul className="list-inside list-disc space-y-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              {evaluation.bonus_points_awarded.map((bonus, i) => (
                <li key={i}>{bonus}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
