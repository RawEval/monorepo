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
  MessageSquare,
} from 'lucide-react';
import { workbenchService } from '@/services/workbench-service';
import type { PreReviewAssignment } from '@/features/workbench/types';

interface PreReviewPanelProps {
  review: PreReviewAssignment;
  onComplete: () => void;
}

export function PreReviewPanel({ review, onComplete }: PreReviewPanelProps) {
  const [reason, setReason] = useState('');
  const [completedDecision, setCompletedDecision] = useState<string | null>(null);

  const startMutation = useMutation({
    mutationFn: () => workbenchService.startPreReview(review.failed_prompt_final_id),
  });

  const completeMutation = useMutation({
    mutationFn: (isGenuine: boolean) =>
      workbenchService.completePreReview(review.failed_prompt_final_id, {
        is_genuine_failure: isGenuine,
        reason: reason.trim() || undefined,
      }),
    onSuccess: (_data, isGenuine) => {
      setCompletedDecision(isGenuine ? 'genuine' : 'not_genuine');
      onComplete();
    },
  });

  async function handleVote(isGenuine: boolean) {
    if (!startMutation.isSuccess && !startMutation.isPending) {
      await startMutation.mutateAsync();
    }
    completeMutation.mutate(isGenuine);
  }

  const isPending = startMutation.isPending || completeMutation.isPending;
  const tally = review.vote_tally;

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
          Review Submitted
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          You voted:{' '}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              color:
                completedDecision === 'genuine'
                  ? 'var(--color-success)'
                  : 'var(--color-error)',
            }}
          >
            {completedDecision === 'genuine' ? 'Genuine Failure' : 'Not a Failure'}
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
          <span className="eyebrow-text">Pre-Annotation Review</span>
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-1)',
          }}
        >
          Is this a genuine failure?
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-normal)' }}>
          Review the conversation and determine whether this represents a genuine model failure worth annotating.
        </p>
      </div>

      {/* Task context */}
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
          }}
        >
          Status: {review.task.task_status}
        </span>
        {review.task.failure_reason && (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-warning-subtle)',
              color: 'var(--color-warning)',
              border: '1px solid rgba(138, 106, 0, 0.2)',
            }}
          >
            {review.task.failure_reason}
          </span>
        )}
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
          <strong style={{ color: 'var(--color-text-primary)' }}>{tally.genuine}</strong>/{tally.total_reviewers} reviewers voted genuine so far
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
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-2)',
          }}
        >
          <MessageSquare className="mr-1 inline h-3 w-3" />
          Reason (optional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Provide context for your decision..."
          disabled={isPending}
          rows={3}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-normal)',
            background: 'var(--color-bg-base)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            resize: 'vertical',
          }}
        />
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
          Genuine Failure
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
          Not a Failure
        </Button>
      </div>
    </div>
  );
}
