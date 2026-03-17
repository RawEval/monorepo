'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  AlertCircle,
  Award,
  Users,
  BarChart3,
} from 'lucide-react';
import { workbenchService } from '@/services/workbench-service';
import type { FinalAnswer } from '@/features/workbench/types';

interface GoldenAnswersProps {
  conversationId: number;
}

function getAgreementStyle(level: string): {
  bg: string;
  text: string;
  border: string;
  barColor: string;
} {
  switch (level.toLowerCase()) {
    case 'excellent':
      return {
        bg: 'rgba(26, 107, 58, 0.08)',
        text: '#1a6b3a',
        border: 'rgba(26, 107, 58, 0.2)',
        barColor: '#1a6b3a',
      };
    case 'good':
      return {
        bg: 'var(--color-success-subtle)',
        text: 'var(--color-success)',
        border: 'var(--color-success-border)',
        barColor: '#2d7a4e',
      };
    case 'acceptable':
    case 'moderate':
      return {
        bg: 'var(--color-warning-subtle)',
        text: 'var(--color-warning)',
        border: 'rgba(138, 106, 0, 0.2)',
        barColor: '#8a6a00',
      };
    case 'poor':
    case 'low':
    default:
      return {
        bg: 'var(--color-error-subtle)',
        text: 'var(--color-error)',
        border: 'rgba(192, 57, 43, 0.2)',
        barColor: '#c0392b',
      };
  }
}

function getQCDecisionBadge(decision: string): { bg: string; text: string; border: string } {
  switch (decision.toLowerCase()) {
    case 'accepted':
    case 'approved':
      return {
        bg: 'var(--color-success-subtle)',
        text: 'var(--color-success)',
        border: 'var(--color-success-border)',
      };
    case 'rejected':
    case 'failed':
      return {
        bg: 'var(--color-error-subtle)',
        text: 'var(--color-error)',
        border: 'rgba(192, 57, 43, 0.2)',
      };
    case 'pending':
    case 'in_progress':
      return {
        bg: 'var(--color-warning-subtle)',
        text: 'var(--color-warning)',
        border: 'rgba(138, 106, 0, 0.2)',
      };
    default:
      return {
        bg: 'var(--color-bg-muted)',
        text: 'var(--color-text-muted)',
        border: 'var(--color-border)',
      };
  }
}

function AnswerCard({ answer }: { answer: FinalAnswer }) {
  const agreementStyle = getAgreementStyle(answer.agreement_level);
  const qcStyle = getQCDecisionBadge(answer.qc_decision);

  const displayAnswer =
    answer.final_answer_text ??
    answer.final_answer_value ??
    (answer.final_answer_numeric !== undefined ? String(answer.final_answer_numeric) : 'N/A');

  // Calculate agreement percentage for bar
  const agreementPct = answer.percentage_agreement ?? (answer.majority_percentage ?? 0);

  return (
    <div
      style={{
        background: 'var(--color-bg-base)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4) var(--space-5)',
        position: 'relative',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: agreementStyle.barColor,
          borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
        }}
      />

      {/* Question */}
      <div
        className="mb-3"
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--leading-normal)',
        }}
      >
        {answer.question_text}
      </div>

      {/* Final answer */}
      <div
        className="mb-4"
        style={{
          padding: 'var(--space-3)',
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--color-text-faint)',
            display: 'block',
            marginBottom: 'var(--space-1)',
          }}
        >
          Final Answer
        </span>
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {displayAnswer}
        </span>
      </div>

      {/* Agreement bar */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Agreement
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-sm)',
              background: agreementStyle.bg,
              color: agreementStyle.text,
              border: `1px solid ${agreementStyle.border}`,
              textTransform: 'capitalize',
            }}
          >
            {answer.agreement_level}
          </span>
        </div>
        <div
          style={{
            height: '6px',
            width: '100%',
            background: 'var(--color-bg-muted)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${agreementPct}%`,
              background: agreementStyle.barColor,
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div
        className="flex flex-wrap items-center gap-4"
        style={{
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
        }}
      >
        {/* Fleiss' Kappa */}
        {answer.fleiss_kappa !== null && (
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            <span>
              Kappa:{' '}
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {answer.fleiss_kappa.toFixed(3)}
              </span>
            </span>
          </div>
        )}

        {/* Annotator count */}
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>
            {answer.annotator_count} annotator{answer.annotator_count !== 1 ? 's' : ''}
          </span>
        </div>

        {/* QC Decision */}
        <span
          style={{
            marginLeft: 'auto',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            background: qcStyle.bg,
            color: qcStyle.text,
            border: `1px solid ${qcStyle.border}`,
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            fontSize: '10px',
          }}
        >
          {answer.qc_decision.replace(/_/g, ' ')}
        </span>
      </div>
    </div>
  );
}

export function GoldenAnswers({ conversationId }: GoldenAnswersProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['final-answers', conversationId],
    queryFn: () => workbenchService.getFinalAnswers(conversationId),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ padding: 'var(--space-8)' }}
      >
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--color-signal)' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="flex items-center gap-2"
        style={{
          padding: 'var(--space-4)',
          background: 'var(--color-error-subtle)',
          border: '1px solid rgba(192, 57, 43, 0.2)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-error)',
        }}
      >
        <AlertCircle className="h-4 w-4 shrink-0" />
        Failed to load final answers
      </div>
    );
  }

  if (data.answers.length === 0) {
    return (
      <div
        className="text-center"
        style={{
          padding: 'var(--space-8)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
        }}
      >
        No finalized answers yet.
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
      }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4" style={{ color: 'var(--color-signal)' }} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            Golden Answers
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)',
          }}
        >
          {data.total_final_answers} answers
        </span>
      </div>

      {/* Summary info */}
      <div
        className="mb-4 flex flex-wrap items-center gap-3"
        style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-info-subtle)',
            color: 'var(--color-info)',
            border: '1px solid var(--color-info-border)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
          }}
        >
          {data.domain}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg-muted)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            textTransform: 'capitalize',
          }}
        >
          {data.task_status.replace(/_/g, ' ')}
        </span>
        {data.contributing_experts.length > 0 && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {data.contributing_experts.length} expert{data.contributing_experts.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Answer cards */}
      <div className="flex flex-col gap-3">
        {data.answers.map((answer) => (
          <AnswerCard key={answer.id} answer={answer} />
        ))}
      </div>
    </div>
  );
}
