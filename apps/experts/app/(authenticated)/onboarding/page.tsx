'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { expertsService } from '@/services/experts-service';
import { ResumeUpload } from '@/features/onboarding/components/resume-upload';
import { ProfileForm } from '@/features/onboarding/components/profile-form';
import { DomainSelector } from '@/features/onboarding/components/domain-selector';
import {
  CheckCircle2,
  FileText,
  User,
  Globe,
  Mic,
  ArrowRight,
  Pencil,
  Loader2,
} from 'lucide-react';

type StepKey = 'resume_uploaded' | 'profile_completed' | 'domains_set' | 'interview_completed';

interface StepConfig {
  label: string;
  key: StepKey;
  icon: typeof FileText;
  description: string;
  summary: string;
}

const STEPS: StepConfig[] = [
  {
    label: 'Upload Resume',
    key: 'resume_uploaded',
    icon: FileText,
    description: 'We use your resume to match you with relevant tasks and tailor your interview questions.',
    summary: 'Resume uploaded',
  },
  {
    label: 'Complete Profile',
    key: 'profile_completed',
    icon: User,
    description: 'Fill in your education, experience, and areas of expertise.',
    summary: 'Profile completed',
  },
  {
    label: 'Set Domains',
    key: 'domains_set',
    icon: Globe,
    description: 'Select your areas of expertise and self-assess your proficiency in each.',
    summary: 'Domains configured',
  },
  {
    label: 'Domain Interview',
    key: 'interview_completed',
    icon: Mic,
    description: 'Take an AI-powered interview to verify your domain expertise. Typically 15\u201325 minutes.',
    summary: 'Interview completed',
  },
];

const STEP_KEYS: StepKey[] = STEPS.map((s) => s.key);

function getFirstIncompleteStep(checklist: Record<StepKey, boolean>): number {
  const idx = STEP_KEYS.findIndex((k) => !checklist[k]);
  return idx === -1 ? STEPS.length : idx;
}

export default function OnboardingPage() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => expertsService.getOnboardingStatus(),
  });

  const checklist: Record<StepKey, boolean> | null = status
    ? {
        resume_uploaded: status.checklist?.resume_uploaded ?? status.resume_uploaded ?? false,
        profile_completed: status.checklist?.profile_completed ?? status.profile_completed ?? false,
        domains_set: status.checklist?.domains_set ?? status.domains_set ?? false,
        interview_completed: status.checklist?.interview_completed ?? status.interview_completed ?? false,
      }
    : null;

  const completedCount = checklist ? STEP_KEYS.filter((k) => checklist[k]).length : 0;
  const allComplete = completedCount === STEPS.length;

  // Set activeStep to first incomplete step on initial load
  useEffect(() => {
    if (checklist) {
      setActiveStep(getFirstIncompleteStep(checklist));
    }
    // Only run on initial data load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status !== undefined]);

  const handleStepComplete = useCallback(async () => {
    const result = await refetch();
    const newStatus = result.data;
    if (newStatus) {
      const newChecklist: Record<StepKey, boolean> = {
        resume_uploaded: newStatus.checklist?.resume_uploaded ?? newStatus.resume_uploaded ?? false,
        profile_completed: newStatus.checklist?.profile_completed ?? newStatus.profile_completed ?? false,
        domains_set: newStatus.checklist?.domains_set ?? newStatus.domains_set ?? false,
        interview_completed: newStatus.checklist?.interview_completed ?? newStatus.interview_completed ?? false,
      };
      if (isEditing) {
        setIsEditing(false);
        // Return to the first incomplete step after editing
        setActiveStep(getFirstIncompleteStep(newChecklist));
      } else {
        // Auto-advance to next incomplete step
        setActiveStep(getFirstIncompleteStep(newChecklist));
      }
    }
  }, [refetch, isEditing]);

  const handleEdit = useCallback((stepIndex: number) => {
    setActiveStep(stepIndex);
    setIsEditing(true);
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 'var(--space-3)' }}>
        <Loader2 style={{ width: 20, height: 20, color: 'var(--color-signal)', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Loading onboarding status...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!status || !checklist) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Unable to load onboarding status.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      {/* Header */}
      <section style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)', paddingBottom: 'var(--space-12)' }}>
        <div style={{ maxWidth: 680 }}>
          <div className="eyebrow"><span className="eyebrow-text">Onboarding</span></div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-tight)',
            fontWeight: 400,
            margin: '0 0 var(--space-6)',
          }}>
            Complete your expert profile
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            margin: '0 0 var(--space-8)',
          }}>
            Four steps to start receiving evaluation tasks.
          </p>

          {/* Progress bar */}
          <div style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '10px' }}>Progress</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: allComplete ? 'var(--color-success)' : 'var(--color-signal)',
              }}>
                {completedCount}/{STEPS.length}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              {STEPS.map((_, i) => (
                <div
                  key={STEPS[i]?.key ?? i}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 'var(--radius-full)',
                    background: checklist[STEP_KEYS[i] as StepKey]
                      ? allComplete ? 'var(--color-success)' : 'var(--color-signal)'
                      : 'var(--color-bg-muted)',
                    transition: 'background 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {STEPS.map((step, idx) => {
              const isCompleted = checklist[step.key];
              const isActive = activeStep === idx;
              const isLocked = !isCompleted && idx > 0 && !checklist[STEP_KEYS[idx - 1] as StepKey];
              const StepIcon = step.icon;

              return (
                <div
                  key={step.key}
                  style={{
                    border: isActive
                      ? '1px solid var(--color-signal)'
                      : isCompleted
                        ? '1px solid var(--color-success-border)'
                        : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    background: isActive ? 'var(--color-bg-base)' : 'transparent',
                    opacity: isLocked ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Completed step — collapsed summary row */}
                  {isCompleted && !isActive && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 'var(--space-4) var(--space-5)',
                      gap: 'var(--space-3)',
                    }}>
                      <CheckCircle2 style={{ width: 18, height: 18, color: 'var(--color-success)', flexShrink: 0 }} />
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-primary)',
                        fontWeight: 500,
                        flex: 1,
                      }}>
                        {step.label}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                      }}>
                        {step.summary}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEdit(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-signal)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <Pencil style={{ width: 12, height: 12 }} />
                        Edit
                      </button>
                    </div>
                  )}

                  {/* Locked future step */}
                  {isLocked && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 'var(--space-4) var(--space-5)',
                      gap: 'var(--space-3)',
                    }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <StepIcon style={{ width: 12, height: 12, color: 'var(--color-text-faint)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-faint)',
                          fontWeight: 500,
                        }}>
                          {step.label}
                        </span>
                        <p style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-faint)',
                          margin: 'var(--space-1) 0 0',
                        }}>
                          {step.description}
                        </p>
                      </div>
                      <span className="mono-label" style={{
                        fontSize: '10px',
                        color: 'var(--color-text-faint)',
                        padding: 'var(--space-1) var(--space-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                      }}>
                        Locked
                      </span>
                    </div>
                  )}

                  {/* Active step — full form visible */}
                  {isActive && (
                    <div style={{ padding: 'var(--space-6)' }}>
                      {/* Step header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginBottom: 'var(--space-2)',
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-signal)',
                          background: 'var(--color-signal-subtle)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-signal-border)',
                        }}>
                          Step {idx + 1} of {STEPS.length}
                        </span>
                        {isEditing && (
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-muted)',
                          }}>
                            Editing
                          </span>
                        )}
                      </div>

                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-lg)',
                        color: 'var(--color-text-primary)',
                        fontWeight: 400,
                        margin: '0 0 var(--space-2)',
                      }}>
                        {step.label}
                      </h3>

                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-muted)',
                        lineHeight: 'var(--leading-relaxed)',
                        margin: '0 0 var(--space-6)',
                      }}>
                        {step.description}
                      </p>

                      {/* Step content */}
                      <div style={{
                        padding: 'var(--space-5)',
                        background: 'var(--color-bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                      }}>
                        {idx === 0 && <ResumeUpload onComplete={handleStepComplete} />}
                        {idx === 1 && <ProfileForm onComplete={handleStepComplete} />}
                        {idx === 2 && <DomainSelector onComplete={handleStepComplete} />}
                        {idx === 3 && <InterviewStep status={status} checklist={checklist} onComplete={handleStepComplete} />}
                      </div>
                    </div>
                  )}

                  {/* Not active, not completed, not locked — upcoming but accessible */}
                  {!isActive && !isCompleted && !isLocked && (
                    <button
                      type="button"
                      onClick={() => { setActiveStep(idx); setIsEditing(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 'var(--space-4) var(--space-5)',
                        gap: 'var(--space-3)',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: 'var(--radius-full)',
                        border: '2px solid var(--color-signal)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <StepIcon style={{ width: 12, height: 12, color: 'var(--color-signal)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-primary)',
                          fontWeight: 500,
                        }}>
                          {step.label}
                        </span>
                        <p style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          margin: 'var(--space-1) 0 0',
                        }}>
                          {step.description}
                        </p>
                      </div>
                      <ArrowRight style={{ width: 16, height: 16, color: 'var(--color-signal)', flexShrink: 0 }} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All complete celebration */}
      {allComplete && (
        <section style={{ borderTop: '1px solid var(--color-success-border)' }}>
          <div style={{
            maxWidth: 'var(--max-content)',
            margin: '0 auto',
            padding: 'var(--section-y) var(--section-x)',
            textAlign: 'center',
          }}>
            <CheckCircle2 style={{
              width: 48,
              height: 48,
              color: 'var(--color-success)',
              margin: '0 auto var(--space-4)',
            }} />
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
              margin: '0 0 var(--space-3)',
            }}>
              You are all set
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: 480,
              margin: '0 auto var(--space-6)',
            }}>
              Your profile is complete. Head to the workbench to start evaluating tasks.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/workbench" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                Open Workbench <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/profile" className="btn-secondary">View Profile</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Interview sub-component (step 4)                                  */
/* ------------------------------------------------------------------ */

interface InterviewStepProps {
  status: {
    can_start_interview?: boolean;
    interview?: {
      session_id: number | null;
      status: string | null;
      score: number | null;
    } | null;
  };
  checklist: Record<string, boolean>;
  onComplete: () => void;
}

function InterviewStep({ status, checklist }: InterviewStepProps) {
  const interview = status.interview;
  const isInProgress = interview?.status === 'in_progress' && interview.session_id != null;
  const isCompleted = interview?.status === 'completed';

  if (isCompleted && interview?.score != null) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          margin: '0 0 var(--space-4)',
        }}>
          Interview completed. Score:{' '}
          <strong style={{ color: interview.score >= 65 ? 'var(--color-success)' : 'var(--color-error)' }}>
            {interview.score}
          </strong>
          /100
        </p>
        {interview.session_id && (
          <Link href={`/results/${interview.session_id}`} className="btn-secondary">
            View Results
          </Link>
        )}
      </div>
    );
  }

  if (isInProgress && interview?.session_id) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          margin: '0 0 var(--space-4)',
        }}>
          You have an interview in progress.
        </p>
        <Link href={`/interview/${interview.session_id}`} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          Continue Interview <ArrowRight style={{ width: 16, height: 16 }} />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
        lineHeight: 'var(--leading-relaxed)',
        margin: '0 0 var(--space-6)',
      }}>
        Take an AI-powered interview to verify your domain expertise. Your resume will be
        auto-loaded. This typically takes 15&ndash;25 minutes.
      </p>

      {/* Allow interview if API says can_start OR if all prerequisite steps are done */}
      {(status.can_start_interview || (checklist.resume_uploaded && checklist.profile_completed && checklist.domains_set)) ? (
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/interview/setup" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            Start Interview <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <Link href="/jobs" className="btn-secondary">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div>
          <span className="btn-primary" style={{ opacity: 0.5, pointerEvents: 'none' }}>
            Start Interview
          </span>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)',
            marginTop: 'var(--space-3)',
          }}>
            Complete all previous steps to unlock.
          </p>
        </div>
      )}
    </div>
  );
}
