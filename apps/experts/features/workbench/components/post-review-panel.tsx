'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@raweval/ui/button';
import { cn } from '@raweval/utils/cn';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  BarChart3,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { workbenchService } from '@/services/workbench-service';
import type { PostReviewAssignment } from '@/features/workbench/types';

interface PostReviewPanelProps {
  review: PostReviewAssignment;
  onComplete: () => void;
}

export function PostReviewPanel({ review, onComplete }: PostReviewPanelProps) {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);
  const [completedDecision, setCompletedDecision] = useState<string | null>(null);

  const startMutation = useMutation({
    mutationFn: () => workbenchService.startPostReview(review.failed_prompt_final_id),
  });

  const completeMutation = useMutation({
    mutationFn: (approved: boolean) =>
      workbenchService.completePostReview(review.failed_prompt_final_id, {
        approved,
        reason: reason.trim() || undefined,
      }),
    onSuccess: (_data, approved) => {
      setCompletedDecision(approved ? 'approved' : 'rejected');
      onComplete();
    },
  });

  async function handleVote(approved: boolean) {
    // Mandatory reason when rejecting
    if (!approved && !reason.trim()) {
      setReasonError(true);
      return;
    }
    setReasonError(false);

    if (!startMutation.isSuccess && !startMutation.isPending) {
      await startMutation.mutateAsync();
    }
    completeMutation.mutate(approved);
  }

  const isPending = startMutation.isPending || completeMutation.isPending;
  const tally = review.vote_tally;
  const qc = review.qc_outcome_snapshot;

  // Success state
  if (completedDecision) {
    return (
      <div
        className="animate-fade-in-up flex flex-col items-center gap-4 text-center"
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
        }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: 'var(--color-success-subtle)',
            border: '1px solid var(--color-success-border)',
          }}
        >
          <CheckCircle2 className="h-7 w-7" style={{ color: 'var(--color-success)' }} />
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-primary)',
          }}
        >
          Post-Review Submitted
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          You voted:{' '}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              color:
                completedDecision === 'approved'
                  ? 'var(--color-success)'
                  : 'var(--color-error)',
            }}
          >
            {completedDecision === 'approved' ? 'Approved' : 'Rejected'}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
      }}
    >
      {/* Header */}
      <div>
        <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
          <span className="eyebrow-text">Post-Annotation Review</span>
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-1)',
          }}
        >
          Review annotation quality
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-normal)' }}>
          Evaluate the QC results and decide whether the annotations should be approved or rejected.
        </p>
      </div>

      {/* QC Outcome Snapshot */}
      {qc && (
        <div
          style={{
            background: 'var(--color-bg-base)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
          }}
        >
          <div
            className="mb-3 flex items-center gap-2"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            QC Outcome
          </div>
          <div className="flex flex-wrap gap-4">
            {/* IAA Score */}
            <div className="flex flex-col gap-1">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                Final IAA
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-md)',
                  fontWeight: 500,
                  color: qc.final_iaa >= 0.6 ? 'var(--color-success)' : qc.final_iaa >= 0.4 ? 'var(--color-warning)' : 'var(--color-error)',
                }}
              >
                {qc.final_iaa.toFixed(3)}
              </span>
            </div>
            {/* Agreement Level */}
            <div className="flex flex-col gap-1">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                Agreement
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: getAgreementColor(qc.agreement_level).bg,
                  color: getAgreementColor(qc.agreement_level).text,
                  border: `1px solid ${getAgreementColor(qc.agreement_level).border}`,
                  textTransform: 'capitalize',
                }}
              >
                {qc.agreement_level}
              </span>
            </div>
            {/* QC Decision */}
            <div className="flex flex-col gap-1">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                Decision
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-bg-muted)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                  textTransform: 'capitalize',
                }}
              >
                {qc.qc_decision}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Task context badges */}
      <div
        className="flex flex-wrap gap-3"
        style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', letterSpacing: 'var(--tracking-wide)' }}
      >
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-info-subtle)',
            color: 'var(--color-info)',
            border: '1px solid var(--color-info-border)',
            textTransform: 'uppercase',
          }}
        >
          {review.task.domain}
        </span>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg-muted)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            textTransform: 'uppercase',
          }}
        >
          {review.source}
        </span>
      </div>

      {/* Vote tally */}
      <div
        className="flex items-center gap-3"
        style={{
          background: 'var(--color-bg-muted)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
        }}
      >
        <Users className="h-4 w-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-success)' }}>{tally.approved}</strong> approved /{' '}
          <strong style={{ color: 'var(--color-error)' }}>{tally.rejected}</strong> rejected of{' '}
          {tally.total_reviewers} reviewers
        </span>
        {tally.pending > 0 && (
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            {tally.pending} PENDING
          </span>
        )}
      </div>

      {/* Reason field */}
      <div>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: reasonError ? 'var(--color-error)' : 'var(--color-text-muted)',
            marginBottom: 'var(--space-2)',
          }}
        >
          <MessageSquare className="mr-1 inline h-3 w-3" />
          Reason {reasonError && '(required when rejecting)'}
        </label>
        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (e.target.value.trim()) setReasonError(false);
          }}
          placeholder="Explain your decision..."
          disabled={isPending}
          rows={3}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-normal)',
            background: 'var(--color-bg-base)',
            border: `1px solid ${reasonError ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            resize: 'vertical',
          }}
        />
        {reasonError && (
          <div
            className="mt-1 flex items-center gap-1"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}
          >
            <AlertTriangle className="h-3 w-3" />
            A reason is required when rejecting annotations.
          </div>
        )}
      </div>

      {/* Error display */}
      {(startMutation.error || completeMutation.error) && (
        <div
          className="flex items-center gap-2"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-error-subtle)',
            border: '1px solid rgba(192, 57, 43, 0.2)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-error)',
          }}
        >
          <XCircle className="h-4 w-4 shrink-0" />
          {(startMutation.error ?? completeMutation.error)?.message ?? 'Something went wrong'}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => handleVote(true)}
          disabled={isPending}
          className={cn('flex-1 gap-2')}
          style={{
            background: 'var(--color-success)',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            padding: '14px 20px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {completeMutation.isPending && completeMutation.variables === true ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Approve
        </Button>
        <Button
          onClick={() => handleVote(false)}
          disabled={isPending}
          className={cn('flex-1 gap-2')}
          style={{
            background: 'var(--color-error)',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            padding: '14px 20px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {completeMutation.isPending && completeMutation.variables === false ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Reject
        </Button>
      </div>
    </div>
  );
}

function getAgreementColor(level: string): { bg: string; text: string; border: string } {
  switch (level.toLowerCase()) {
    case 'excellent':
    case 'good':
      return {
        bg: 'var(--color-success-subtle)',
        text: 'var(--color-success)',
        border: 'var(--color-success-border)',
      };
    case 'acceptable':
    case 'moderate':
      return {
        bg: 'var(--color-warning-subtle)',
        text: 'var(--color-warning)',
        border: 'rgba(138, 106, 0, 0.2)',
      };
    case 'poor':
    case 'low':
    default:
      return {
        bg: 'var(--color-error-subtle)',
        text: 'var(--color-error)',
        border: 'rgba(192, 57, 43, 0.2)',
      };
  }
}
