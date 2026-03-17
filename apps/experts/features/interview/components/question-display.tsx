'use client';

import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils';
import type { InterviewQuestion } from '@/features/interview/types';

interface QuestionDisplayProps {
  question: InterviewQuestion;
  questionNumber: number;
}

function segmentLabel(segmentType: string): string {
  return segmentType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function difficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success-border)]';
    case 'medium':
      return 'bg-[var(--color-info-subtle)] text-[var(--color-info)] border-[var(--color-info-border)]';
    case 'hard':
      return 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[rgba(138,106,0,0.2)]';
    case 'expert':
      return 'bg-[var(--color-error-subtle)] text-[var(--color-error)] border-[rgba(192,57,43,0.2)]';
    default:
      return 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]';
  }
}

export function QuestionDisplay({ question, questionNumber }: QuestionDisplayProps) {
  return (
    <div className="question-card animate-fade-in-up">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-muted)]"
        >
          Q{questionNumber}
        </span>
        <Badge
          variant="outline"
          className={cn(
            'rounded-[var(--radius-sm)] text-[10px] font-medium uppercase tracking-[var(--tracking-wide)]',
            'bg-[var(--color-signal-subtle)] text-[var(--color-signal)] border-[var(--color-signal-border)]',
          )}
        >
          {segmentLabel(question.segment_type)}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            'rounded-[var(--radius-sm)] text-[10px] font-medium uppercase tracking-[var(--tracking-wide)]',
            difficultyColor(question.difficulty),
          )}
        >
          {question.difficulty}
        </Badge>
        {question.is_multipart && (
          <Badge
            variant="secondary"
            className="rounded-[var(--radius-sm)] text-[10px] font-medium uppercase tracking-[var(--tracking-wide)]"
          >
            Multi-part
          </Badge>
        )}
      </div>
      <p className="text-[var(--text-base)] leading-[var(--leading-normal)] text-[var(--color-text-primary)]">
        {question.question_text}
      </p>
    </div>
  );
}
