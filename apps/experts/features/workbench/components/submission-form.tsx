'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@raweval/ui/button';

import {
  Sparkles,
  Clock,
  Send,
  AlertTriangle,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import { workbenchService } from '@/services/workbench-service';

// ── Props ──────────────────────────────────────────────────────────────────

interface SubmissionFormProps {
  allocationId: number;
  promptId: number;
  originalResponse: string;
  onSubmitted: () => void;
}

// ── Timer Hook ─────────────────────────────────────────────────────────────

function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatted = `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(
    Math.floor((seconds % 3600) / 60),
  ).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return { seconds, formatted };
}

// ── Confirmation Modal ─────────────────────────────────────────────────────

function ConfirmModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,13,13,0.6)] backdrop-blur-sm">
      <div className="animate-[fade-in-up_0.2s_ease-out_forwards] flex w-full max-w-[400px] flex-col gap-[var(--space-5)] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-base)] p-[var(--space-6)] shadow-[var(--shadow-md)]">
        <div className="flex flex-col gap-[var(--space-2)]">
          <h3 className="font-[family-name:var(--font-display)] text-[length:var(--text-lg)] text-[var(--color-text-primary)]">
            Submit Annotation?
          </h3>
          <p className="text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--color-text-secondary)]">
            This action cannot be undone. Your corrected response, reasoning,
            and confidence score will be submitted for review.
          </p>
        </div>
        <div className="flex justify-end gap-[var(--space-3)]">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            <X size={14} />
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            Confirm Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function SubmissionForm({
  allocationId,
  promptId,
  originalResponse,
  onSubmitted,
}: SubmissionFormProps) {
  const [correctedResponse, setCorrectedResponse] = useState(originalResponse);
  const [reasoning, setReasoning] = useState('');
  const [confidence, setConfidence] = useState(50);
  const [showConfirm, setShowConfirm] = useState(false);

  const timer = useTimer();

  const wordCount = correctedResponse.split(/\s+/).filter(Boolean).length;
  const canSubmit = correctedResponse.trim().length > 0 && reasoning.trim().length > 0;

  // AI Correct mutation
  const correctMutation = useMutation({
    mutationFn: () =>
      workbenchService.correctText({
        text: correctedResponse,
        correction_mode: 'full',
      }),
    onSuccess: (result) => {
      if (result.is_changed) {
        setCorrectedResponse(result.corrected_text);
      }
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: () =>
      workbenchService.submitAnnotation({
        allocation_id: allocationId,
        prompt_id: promptId,
        corrected_response: correctedResponse,
        reasoning,
        correction_confidence: confidence / 100,
        submission_time_seconds: timer.seconds,
      }),
    onSuccess: () => {
      setShowConfirm(false);
      onSubmitted();
    },
  });

  const handleSubmitClick = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const handleConfirm = useCallback(() => {
    submitMutation.mutate();
  }, [submitMutation]);

  // Confidence label
  function confidenceLabel(val: number): string {
    if (val < 20) return 'Very Low';
    if (val < 40) return 'Low';
    if (val < 60) return 'Moderate';
    if (val < 80) return 'High';
    return 'Very High';
  }

  function confidenceColor(val: number): string {
    if (val < 20) return 'var(--color-error)';
    if (val < 40) return 'var(--color-signal)';
    if (val < 60) return 'var(--color-warning)';
    if (val < 80) return 'var(--color-info)';
    return 'var(--color-success)';
  }

  return (
    <>
      <div className="flex flex-col gap-[var(--space-6)]" style={{ animation: 'fade-in-up 0.3s ease-out forwards' }}>
        {/* Timer */}
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-text-muted)]">
            Submission
          </span>
          <div className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] bg-[var(--color-bg-muted)] px-[var(--space-3)] py-[var(--space-1)]">
            <Clock size={12} className="text-[var(--color-text-faint)]" />
            <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] tabular-nums text-[var(--color-text-secondary)]">
              {timer.formatted}
            </span>
          </div>
        </div>

        {/* Part 1: Corrected Response */}
        <div className="flex flex-col gap-[var(--space-2)]">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-text-muted)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-signal)] font-[family-name:var(--font-mono)] text-[10px] text-white">
                1
              </span>
              Corrected Response
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => correctMutation.mutate()}
              disabled={correctMutation.isPending || correctedResponse.trim().length === 0}
              className="gap-1 text-[var(--color-signal)]"
            >
              {correctMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              AI Correct
            </Button>
          </div>
          <textarea
            value={correctedResponse}
            onChange={(e) => setCorrectedResponse(e.target.value)}
            rows={12}
            className="w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] p-[var(--space-4)] text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-signal)] focus:outline-none"
            placeholder="Write the corrected response..."
          />
          <span className="text-right font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
            {wordCount} words
          </span>
        </div>

        {/* Part 2: Reasoning */}
        <div className="flex flex-col gap-[var(--space-2)]">
          <label className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-text-muted)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-signal)] font-[family-name:var(--font-mono)] text-[10px] text-white">
              2
            </span>
            Reasoning
          </label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            rows={5}
            className="w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] p-[var(--space-4)] text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-signal)] focus:outline-none"
            placeholder="Explain what was wrong and why your correction is better..."
          />
        </div>

        {/* Part 3: Confidence Slider */}
        <div className="flex flex-col gap-[var(--space-3)]">
          <label className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-text-muted)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-signal)] font-[family-name:var(--font-mono)] text-[10px] text-white">
              3
            </span>
            Confidence
          </label>
          <div className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-[var(--space-4)]">
            <div className="flex items-center justify-between">
              <span
                className="font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] font-medium"
                style={{ color: confidenceColor(confidence) }}
              >
                {confidence}%
              </span>
              <span
                className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wide)]"
                style={{ color: confidenceColor(confidence) }}
              >
                {confidenceLabel(confidence)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-[var(--color-signal)]"
            />
            <div className="flex justify-between font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)]">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {submitMutation.isError && (
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-error-subtle)] p-[var(--space-3)]">
            <AlertTriangle size={14} className="text-[var(--color-error)]" />
            <span className="text-[length:var(--text-sm)] text-[var(--color-error)]">
              Submission failed. Please try again.
            </span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          size="lg"
          onClick={handleSubmitClick}
          disabled={!canSubmit}
          className="w-full"
        >
          <Send size={16} />
          Submit Annotation
        </Button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmModal
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          isPending={submitMutation.isPending}
        />
      )}
    </>
  );
}
