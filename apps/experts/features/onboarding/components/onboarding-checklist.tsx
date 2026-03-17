'use client';

import { cn } from '@raweval/utils/cn';
import { Check, UserPlus, FileText, User, Globe, Mic } from 'lucide-react';
import type { OnboardingStatus } from '@/features/interview/types';

interface OnboardingChecklistProps {
  status: OnboardingStatus;
  currentExpandedStep: number | null;
  onStepClick: (step: number) => void;
}

interface StepConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  isComplete: (status: OnboardingStatus) => boolean;
}

const steps: StepConfig[] = [
  {
    title: 'Account Created',
    description: 'Your account has been registered on the platform.',
    icon: <UserPlus className="h-5 w-5" />,
    isComplete: (s) => s.registered,
  },
  {
    title: 'Upload Resume',
    description: 'Upload your resume for automated skill extraction.',
    icon: <FileText className="h-5 w-5" />,
    isComplete: (s) => s.resume_uploaded,
  },
  {
    title: 'Complete Profile',
    description: 'Fill in your education, experience, and expertise details.',
    icon: <User className="h-5 w-5" />,
    isComplete: (s) => s.profile_completed,
  },
  {
    title: 'Set Domain Proficiencies',
    description: 'Select your domains and rate your proficiency in each.',
    icon: <Globe className="h-5 w-5" />,
    isComplete: (s) => s.domains_set,
  },
  {
    title: 'Complete Interview',
    description: 'Take a domain interview to verify your expertise.',
    icon: <Mic className="h-5 w-5" />,
    isComplete: (s) => s.interview_completed,
  },
];

function getStepStatus(
  stepIndex: number,
  status: OnboardingStatus,
): 'completed' | 'current' | 'upcoming' {
  const stepConfig = steps[stepIndex];
  if (!stepConfig) return 'upcoming';
  if (stepConfig.isComplete(status)) return 'completed';

  // Current step is the first incomplete one
  const firstIncompleteIndex = steps.findIndex((s) => !s.isComplete(status));
  if (stepIndex === firstIncompleteIndex) return 'current';

  return 'upcoming';
}

export function OnboardingChecklist({
  status,
  currentExpandedStep,
  onStepClick,
}: OnboardingChecklistProps) {
  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(index, status);
        const isExpanded = currentExpandedStep === index;
        const isClickable = stepStatus === 'current';

        return (
          <button
            key={step.title}
            type="button"
            onClick={() => isClickable && onStepClick(index)}
            disabled={!isClickable}
            className={cn(
              'flex w-full items-start gap-4 rounded-xl p-4 text-left transition-all duration-200',
              stepStatus === 'completed' && 'opacity-70',
              stepStatus === 'current' &&
                'border border-[var(--color-signal-border)] bg-[var(--color-signal-subtle)]',
              stepStatus === 'upcoming' && 'opacity-40',
              isClickable && 'cursor-pointer hover:bg-[var(--color-bg-surface)]',
              !isClickable && 'cursor-default',
            )}
          >
            {/* Step indicator */}
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                stepStatus === 'completed' &&
                  'border-[var(--color-success)] bg-[var(--color-success)] text-white',
                stepStatus === 'current' &&
                  'border-[var(--color-signal)] bg-[var(--color-signal-subtle)] text-[var(--color-signal)]',
                stepStatus === 'upcoming' &&
                  'border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-faint)]',
              )}
            >
              {stepStatus === 'completed' ? (
                <Check className="h-5 w-5" />
              ) : (
                step.icon
              )}
            </div>

            {/* Step content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    'text-sm font-medium',
                    stepStatus === 'completed' &&
                      'text-[var(--color-text-muted)] line-through',
                    stepStatus === 'current' && 'text-[var(--color-text-primary)]',
                    stepStatus === 'upcoming' && 'text-[var(--color-text-muted)]',
                  )}
                >
                  {step.title}
                </h3>
                {stepStatus === 'current' && (
                  <span className="rounded-full bg-[var(--color-signal)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-wide)] text-white">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                {step.description}
              </p>
            </div>

            {/* Expand indicator for current step */}
            {stepStatus === 'current' && (
              <div className="shrink-0 self-center">
                <svg
                  className={cn(
                    'h-4 w-4 text-[var(--color-signal)] transition-transform duration-200',
                    isExpanded && 'rotate-180',
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
