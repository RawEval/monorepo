'use client';

import { useCallback, useRef, useState } from 'react';
import { Textarea } from '@raweval/ui/textarea';
import { Button } from '@raweval/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
  disabled: boolean;
}

export function AnswerInput({ onSubmit, isSubmitting, disabled }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = answer.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
    setAnswer('');
  }, [answer, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const isDisabled = disabled || isSubmitting || answer.trim().length === 0;

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-base)] p-[var(--space-4)]">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer here..."
          disabled={disabled || isSubmitting}
          className="min-h-[120px] resize-y pr-4 pb-12 font-[family-name:var(--font-body)] text-[var(--text-base)] leading-[var(--leading-normal)]"
          rows={4}
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-[family-name:var(--font-mono)] text-[var(--text-xs)] text-[var(--color-text-muted)]">
              {answer.length} characters
            </span>
            <span className="text-[var(--text-xs)] text-[var(--color-text-faint)]">
              {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to submit
            </span>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isDisabled}
            size="lg"
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Submit Answer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
