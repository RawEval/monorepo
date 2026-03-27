'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils/cn';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { workbenchService } from '@/services/workbench-service';
import type {
  AnnotationQuestion,
  SubmitResponseRequest,
} from '@/features/workbench/types';

// ── Props ──────────────────────────────────────────────────────────────────

interface QuestionsPanelProps {
  fpfId: number;
  allocationId: number;
  onAllAnswered?: () => void;
}

// ── Rating color map ───────────────────────────────────────────────────────

function ratingColor(value: number, max: number): string {
  const pct = value / max;
  if (pct <= 0.2) return 'var(--color-error)';
  if (pct <= 0.4) return 'var(--color-signal)';
  if (pct <= 0.6) return 'var(--color-warning)';
  if (pct <= 0.8) return 'var(--color-info)';
  return 'var(--color-success)';
}

// ── Individual Question Renderers ──────────────────────────────────────────

function RatingInput({
  question,
  value,
  onChange,
}: {
  question: AnnotationQuestion;
  value: string | undefined;
  onChange: (val: string) => void;
}) {
  const min = question.rating_min ?? 1;
  const max = question.rating_max ?? 5;
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const labels = question.rating_labels ?? {};

  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <div className="flex gap-[var(--space-2)]">
        {options.map((opt) => {
          const selected = value === String(opt);
          const color = ratingColor(opt, max);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(String(opt))}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border-2 font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] font-medium transition-all',
                selected
                  ? 'text-white shadow-[var(--shadow-sm)]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]',
              )}
              style={
                selected
                  ? { borderColor: color, backgroundColor: color }
                  : undefined
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
      {/* Labels row */}
      {Object.keys(labels).length > 0 && (
        <div className="flex justify-between px-1">
          {options.map((opt) => {
            const label = labels[String(opt)];
            return label ? (
              <span
                key={opt}
                className="max-w-[60px] text-center font-[family-name:var(--font-mono)] text-[10px] leading-[var(--leading-snug)] text-[var(--color-text-faint)]"
              >
                {label}
              </span>
            ) : (
              <span key={opt} />
            );
          })}
        </div>
      )}
    </div>
  );
}

function BooleanInput({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex gap-[var(--space-3)]">
      {(['Yes', 'No'] as const).map((opt) => {
        const selected = value === opt;
        const isYes = opt === 'Yes';
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 py-3 font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] font-medium uppercase tracking-[var(--tracking-wide)] transition-all',
              selected
                ? isYes
                  ? 'border-[var(--color-success)] bg-[var(--color-success-subtle)] text-[var(--color-success)]'
                  : 'border-[var(--color-error)] bg-[var(--color-error-subtle)] text-[var(--color-error)]'
                : 'border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function MultipleChoiceInput({
  question,
  value,
  onChange,
}: {
  question: AnnotationQuestion;
  value: string | undefined;
  onChange: (val: string) => void;
}) {
  const options = question.options ?? [];
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-2)] text-left text-[length:var(--text-sm)] transition-all',
              selected
                ? 'border-[var(--color-signal)] bg-[var(--color-signal-subtle)] text-[var(--color-text-primary)]'
                : 'border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]',
            )}
          >
            <span
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                selected
                  ? 'border-[var(--color-signal)]'
                  : 'border-[var(--color-border-strong)]',
              )}
            >
              {selected && (
                <span className="h-2 w-2 rounded-full bg-[var(--color-signal)]" />
              )}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  onCorrect,
  isCorrecting,
}: {
  value: string | undefined;
  onChange: (val: string) => void;
  onCorrect: () => void;
  isCorrecting: boolean;
}) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] p-[var(--space-3)] text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-signal)] focus:outline-none"
        placeholder="Type your response..."
      />
      {value && value.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
            {value.split(/\s+/).filter(Boolean).length} words
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCorrect}
            disabled={isCorrecting}
            className="gap-1 text-[var(--color-signal)]"
          >
            {isCorrecting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            AI Correct
          </Button>
        </div>
      )}
    </div>
  );
}

function NumericInput({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (val: number) => void;
}) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] p-[var(--space-3)] font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-signal)] focus:outline-none"
      placeholder="Enter a number"
    />
  );
}

// ── Question Card ──────────────────────────────────────────────────────────

function QuestionCard({
  question,
  allocationId,
  onAnswered,
}: {
  question: AnnotationQuestion;
  allocationId: number;
  onAnswered: () => void;
}) {
  const [value, setValue] = useState<string | undefined>(undefined);
  const [numericValue, setNumericValue] = useState<number | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [qcToast, setQcToast] = useState(false);

  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: (data: SubmitResponseRequest) =>
      workbenchService.submitResponse(data),
    onSuccess: (result) => {
      setSubmitted(true);
      onAnswered();
      queryClient.invalidateQueries({ queryKey: ['task-questions'] });
      if (result.qc_auto_triggered) {
        setQcToast(true);
        setTimeout(() => setQcToast(false), 4000);
      }
    },
  });

  const correctMutation = useMutation({
    mutationFn: () =>
      workbenchService.correctText({
        text: value ?? '',
        correction_mode: 'clarity',
        context_question: question.question_text,
      }),
    onSuccess: (result) => {
      if (result.is_changed) {
        setValue(result.corrected_text);
      }
    },
  });

  const handleSubmit = useCallback(() => {
    const payload: SubmitResponseRequest = {
      question_id: question.id,
      allocation_id: allocationId,
    };

    switch (question.question_type) {
      case 'rating':
      case 'boolean':
      case 'multiple_choice':
        payload.response_value = value;
        break;
      case 'text':
        payload.response_text = value;
        break;
      case 'numeric':
        payload.response_numeric = numericValue;
        break;
      default:
        payload.response_value = value;
    }

    submitMutation.mutate(payload);
  }, [question, value, numericValue, allocationId, submitMutation]);

  const isAnswered =
    submitted || (question.total_responses > 0 && question.status === 'completed');
  const hasValue =
    question.question_type === 'numeric'
      ? numericValue !== undefined
      : value !== undefined && value !== '';

  return (
    <div
      className={cn(
        'relative flex flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border p-[var(--space-4)]',
        isAnswered
          ? 'border-[var(--color-success-border)] bg-[var(--color-success-subtle)]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-surface)]',
      )}
    >
      {/* Question header */}
      <div className="flex items-start gap-[var(--space-2)]">
        {isAnswered ? (
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0 text-[var(--color-success)]"
          />
        ) : (
          <Circle
            size={16}
            className="mt-0.5 shrink-0 text-[var(--color-text-faint)]"
          />
        )}
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[length:var(--text-sm)] font-medium leading-[var(--leading-snug)] text-[var(--color-text-primary)]">
            {question.question_text}
          </span>
          {question.description && (
            <span className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[var(--color-text-muted)]">
              {question.description}
            </span>
          )}
        </div>
        {question.is_required && (
          <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-signal)]">
            *
          </span>
        )}
      </div>

      {/* Input by type */}
      {!isAnswered && (
        <>
          {question.question_type === 'rating' && (
            <RatingInput
              question={question}
              value={value}
              onChange={setValue}
            />
          )}
          {question.question_type === 'boolean' && (
            <BooleanInput value={value} onChange={setValue} />
          )}
          {question.question_type === 'multiple_choice' && (
            <MultipleChoiceInput
              question={question}
              value={value}
              onChange={setValue}
            />
          )}
          {question.question_type === 'text' && (
            <TextInput
              value={value}
              onChange={setValue}
              onCorrect={() => correctMutation.mutate()}
              isCorrecting={correctMutation.isPending}
            />
          )}
          {question.question_type === 'numeric' && (
            <NumericInput value={numericValue} onChange={setNumericValue} />
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!hasValue || submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                'Save'
              )}
            </Button>
          </div>

          {submitMutation.isError && (
            <div className="flex items-center gap-1 text-[length:var(--text-xs)] text-[var(--color-error)]">
              <AlertTriangle size={12} />
              Failed to save response. Try again.
            </div>
          )}
        </>
      )}

      {/* QC toast */}
      {qcToast && (
        <div className="absolute -top-2 right-4 z-10 animate-[fade-in-up_0.3s_ease-out_forwards] rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-subtle)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-warning)]">
          QC auto-triggered
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function QuestionsPanel({
  fpfId,
  allocationId,
  onAllAnswered,
}: QuestionsPanelProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['task-questions', fpfId],
    queryFn: () => workbenchService.getQuestions(fpfId),
    enabled: fpfId > 0,
  });

  const [answeredCount, setAnsweredCount] = useState(0);

  // Sync answered count from server
  useEffect(() => {
    if (data?.my_progress) {
      setAnsweredCount(data.my_progress.questions_answered);
    }
  }, [data?.my_progress]);

  // Check all answered
  useEffect(() => {
    if (data && answeredCount >= data.total_questions && onAllAnswered) {
      onAllAnswered();
    }
  }, [answeredCount, data, onAllAnswered]);

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
          Failed to load questions.
        </span>
      </div>
    );
  }

  if (!data) return null;

  const { questions, total_questions, my_progress } = data;
  const sorted = [...questions].sort(
    (a, b) => a.question_order - b.question_order,
  );

  return (
    <div className="flex flex-col gap-[var(--space-4)]" style={{ animation: 'fade-in-up 0.3s ease-out forwards' }}>
      {/* Progress header */}
      <div className="flex flex-col gap-[var(--space-2)]">
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-text-muted)]">
            Questions
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-muted)]">
            {answeredCount}/{total_questions}
          </span>
        </div>
        {/* Full-width progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${total_questions > 0 ? (answeredCount / total_questions) * 100 : 0}%`,
              background: answeredCount >= total_questions ? 'var(--color-success)' : 'var(--color-signal)',
            }}
          />
        </div>
      </div>

      {/* Allocation status badge */}
      {my_progress && (
        <Badge
          variant="outline"
          className={cn(
            'w-fit text-[10px]',
            my_progress.is_complete
              ? 'border-[var(--color-success-border)] text-[var(--color-success)]'
              : '',
          )}
        >
          {my_progress.is_complete ? 'Complete' : my_progress.allocation_status}
        </Badge>
      )}

      {/* Question cards */}
      <div className="flex flex-col gap-[var(--space-3)]">
        {sorted.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            allocationId={allocationId}
            onAnswered={() => setAnsweredCount((c) => c + 1)}
          />
        ))}
      </div>
    </div>
  );
}
