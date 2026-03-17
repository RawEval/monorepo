'use client';

import { cn } from '@raweval/utils/cn';
import type { ExpertScore } from '@/features/interview/types';

interface ScoreBreakdownProps {
  score: ExpertScore;
}

const componentLabels: Record<string, string> = {
  rolling_iaa: 'Inter-Annotator Agreement',
  qc_alignment: 'QC Alignment',
  domain_interview: 'Domain Interview',
  education_experience: 'Education & Experience',
  sla_reliability: 'SLA Reliability',
  fraud_risk_inverse: 'Fraud Risk (Inverse)',
  stability: 'Stability',
};

function getBarColor(value: number): string {
  if (value >= 80) return 'bg-[var(--color-success)]';
  if (value >= 60) return 'bg-[var(--color-info)]';
  if (value >= 40) return 'bg-[var(--color-warning)]';
  return 'bg-[var(--color-error)]';
}

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  const components = score.components;

  return (
    <div className="space-y-4">
      <h3 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-muted)]">
        Score Breakdown
      </h3>

      <div className="space-y-3">
        {(Object.keys(components) as Array<keyof typeof components>).map((key) => {
          const component = components[key];
          const label = componentLabels[key] || key;

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                    w:{(component.weight * 100).toFixed(0)}%
                  </span>
                  <span className="font-[family-name:var(--font-mono)] text-sm font-medium text-[var(--color-text-primary)]">
                    {component.value.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    getBarColor(component.value),
                  )}
                  style={{ width: `${Math.min(component.value, 100)}%` }}
                />
              </div>
              <div className="text-right">
                <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)]">
                  contribution: {component.contribution.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
