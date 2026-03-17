'use client';

import { useState } from 'react';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils/cn';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { getScoreBand } from '@/features/interview/types';

interface QuestionItem {
  question_id: string;
  score: number;
  skill: string;
  status: string;
  segment_type: string;
}

interface QuestionAnalysisProps {
  questions: QuestionItem[];
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

export function QuestionAnalysis({ questions }: QuestionAnalysisProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {questions.map((q, idx) => {
        const isExpanded = expandedIds.has(q.question_id);
        const isPassed = q.status === 'passed' || q.score >= 50;

        return (
          <div
            key={q.question_id}
            className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
          >
            <button
              onClick={() => toggleExpanded(q.question_id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg-muted)]"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
              )}
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                Q{idx + 1}
              </span>
              <span className="flex-1 truncate text-sm text-[var(--color-text-primary)]">
                {q.question_id}
              </span>
              <div className="flex items-center gap-2">
                {isPassed ? (
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
                ) : (
                  <XCircle className="h-4 w-4 text-[var(--color-error)]" />
                )}
                <span
                  className={cn(
                    'inline-flex items-center rounded px-2 py-0.5 font-[family-name:var(--font-mono)] text-xs',
                    getScoreBandClass(q.score),
                  )}
                >
                  {q.score}
                </span>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-[var(--color-border)] px-4 py-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div>
                    <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                      Skill
                    </span>
                    <p className="mt-0.5 text-sm text-[var(--color-text-primary)]">
                      {q.skill}
                    </p>
                  </div>
                  <div>
                    <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                      Segment
                    </span>
                    <Badge variant="secondary" className="mt-0.5 block w-fit text-xs">
                      {q.segment_type}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                      Status
                    </span>
                    <Badge
                      variant={isPassed ? 'default' : 'destructive'}
                      className="mt-0.5 block w-fit text-xs"
                    >
                      {q.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
