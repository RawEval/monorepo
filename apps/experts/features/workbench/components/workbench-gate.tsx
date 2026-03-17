'use client';

import { useQuery } from '@tanstack/react-query';
import { expertsService } from '@/services/experts-service';
import { workbenchService } from '@/services/workbench-service';
import { Button } from '@raweval/ui/button';
import {
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  UserCheck,
  FileText,
  BookOpen,
  Mic,
} from 'lucide-react';
import { cn } from '@raweval/utils/cn';

interface WorkbenchGateProps {
  children: React.ReactNode;
}

const ONBOARDING_STEPS = [
  { key: 'registered', label: 'Account Created', icon: UserCheck },
  { key: 'resume_uploaded', label: 'Resume Uploaded', icon: FileText },
  { key: 'profile_completed', label: 'Profile Completed', icon: BookOpen },
  { key: 'domains_set', label: 'Domains Selected', icon: BookOpen },
  { key: 'interview_completed', label: 'Interview Passed', icon: Mic },
] as const;

function getGateContent(currentStep: string) {
  switch (currentStep) {
    case 'not_registered':
      return {
        icon: Shield,
        title: 'Complete Registration',
        description:
          'You need to register as an expert before accessing the workbench. Complete your registration to get started.',
        ctaLabel: 'Start Onboarding',
        ctaHref: '/onboarding',
      };
    case 'registered':
    case 'resume_uploaded':
    case 'profile_completed':
      return {
        icon: FileText,
        title: 'Complete Your Profile',
        description:
          'Your profile setup is in progress. Complete all onboarding steps to unlock the annotation workbench.',
        ctaLabel: 'Continue Onboarding',
        ctaHref: '/onboarding',
      };
    case 'ready_for_interview':
      return {
        icon: Mic,
        title: 'Interview Required',
        description:
          'Your profile is complete. Pass the expert interview to gain access to the annotation workbench.',
        ctaLabel: 'Start Interview',
        ctaHref: '/interview/setup',
      };
    case 'interview_completed':
      return {
        icon: Clock,
        title: 'Under Review',
        description:
          'Your interview has been completed and is being reviewed. You will be notified once your expert status is confirmed.',
        ctaLabel: 'View Status',
        ctaHref: '/onboarding',
      };
    default:
      return {
        icon: Shield,
        title: 'Access Pending',
        description:
          'Your account is being processed. Please complete all onboarding steps to access the workbench.',
        ctaLabel: 'Go to Onboarding',
        ctaHref: '/onboarding',
      };
  }
}

function getStepStatus(
  stepKey: string,
  onboardingData: Record<string, boolean | string | unknown>,
): 'completed' | 'current' | 'pending' {
  if (onboardingData[stepKey] === true) return 'completed';

  const stepOrder = [
    'registered',
    'resume_uploaded',
    'profile_completed',
    'domains_set',
    'interview_completed',
  ];
  const currentIdx = stepOrder.findIndex(
    (s) => onboardingData[s] !== true,
  );
  const thisIdx = stepOrder.indexOf(stepKey);

  if (thisIdx === currentIdx) return 'current';
  return 'pending';
}

export function WorkbenchGate({ children }: WorkbenchGateProps) {
  const {
    data: onboarding,
    isLoading: onboardingLoading,
    error: onboardingError,
  } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => expertsService.getOnboardingStatus(),
    staleTime: 60_000,
    retry: 1,
  });

  // Allow access if onboarding call fails but user has a token (admin/moderator case)
  // Admins may not have expert records, so the onboarding endpoint returns 404/403.
  const isLikelyAdmin = !!onboardingError && !onboardingLoading;
  const isActive = onboarding?.active === true || isLikelyAdmin;

  const {
    data: profileCheck,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ['profile-check'],
    queryFn: () => workbenchService.profileCheck(),
    enabled: isActive,
    staleTime: 60_000,
    retry: false,
  });

  // Loading state
  if (onboardingLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: 'var(--color-signal)' }}
          />
          <p
            className="text-sm"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              fontSize: 'var(--text-xs)',
            }}
          >
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  // Admin/moderator bypass: if onboarding failed but user is authenticated, let them through
  if (isLikelyAdmin) {
    return (
      <WorkbenchGateContext.Provider
        value={{
          profileCompleted: true,
          missingFields: [],
          isProfileLoading: false,
        }}
      >
        {children}
      </WorkbenchGateContext.Provider>
    );
  }

  // Error state (only for genuine errors, not admin bypass)
  if (!onboarding) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div
          className="flex max-w-md flex-col items-center gap-6 text-center"
          style={{ padding: 'var(--space-8)' }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              background: 'var(--color-error-subtle)',
              border: '1px solid rgba(192, 57, 43, 0.2)',
            }}
          >
            <XCircle className="h-8 w-8" style={{ color: 'var(--color-error)' }} />
          </div>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Unable to verify access
            </h2>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--leading-normal)',
              }}
            >
              We could not retrieve your onboarding status. Please try again or contact support.
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--color-signal)',
              color: 'var(--color-text-inverse)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Expert is active -- render children with profile check data
  if (onboarding.active) {
    return (
      <WorkbenchGateContext.Provider
        value={{
          profileCompleted: profileCheck?.profile_completed ?? true,
          missingFields: profileCheck?.missing_fields ?? [],
          isProfileLoading: profileLoading,
        }}
      >
        {children}
      </WorkbenchGateContext.Provider>
    );
  }

  // Gate screen -- expert is NOT active
  const gate = getGateContent(onboarding.current_step);
  const GateIcon = gate.icon;

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        background: 'var(--color-bg-base)',
        padding: 'var(--space-6)',
      }}
    >
      <div
        className="w-full animate-fade-in-up"
        style={{ maxWidth: '480px' }}
      >
        {/* Icon area */}
        <div className="mb-8 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: 'var(--color-signal-subtle)',
              border: '1px solid var(--color-signal-border)',
            }}
          >
            <GateIcon
              className="h-10 w-10"
              style={{ color: 'var(--color-signal)' }}
            />
          </div>
        </div>

        {/* Title and description */}
        <div className="mb-8 text-center">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-tight)',
              marginBottom: 'var(--space-3)',
            }}
          >
            {gate.title}
          </h1>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: 'var(--max-prose)',
              margin: '0 auto',
            }}
          >
            {gate.description}
          </p>
        </div>

        {/* Progress stepper */}
        <div
          className="mb-8"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
          }}
        >
          <p
            className="mb-4"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            Onboarding Progress
          </p>
          <div className="flex flex-col gap-3">
            {ONBOARDING_STEPS.map((step) => {
              const status = getStepStatus(
                step.key,
                onboarding as unknown as Record<string, boolean | string | unknown>,
              );
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                    )}
                    style={{
                      background:
                        status === 'completed'
                          ? 'var(--color-success-subtle)'
                          : status === 'current'
                            ? 'var(--color-signal-subtle)'
                            : 'var(--color-bg-muted)',
                      border:
                        status === 'completed'
                          ? '1px solid var(--color-success-border)'
                          : status === 'current'
                            ? '1px solid var(--color-signal-border)'
                            : '1px solid var(--color-border)',
                    }}
                  >
                    {status === 'completed' ? (
                      <CheckCircle2
                        className="h-4 w-4"
                        style={{ color: 'var(--color-success)' }}
                      />
                    ) : (
                      <StepIcon
                        className="h-3.5 w-3.5"
                        style={{
                          color:
                            status === 'current'
                              ? 'var(--color-signal)'
                              : 'var(--color-text-faint)',
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      color:
                        status === 'completed'
                          ? 'var(--color-text-secondary)'
                          : status === 'current'
                            ? 'var(--color-text-primary)'
                            : 'var(--color-text-faint)',
                      fontWeight: status === 'current' ? 500 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <a href={gate.ctaHref} className="no-underline">
            <Button
              className="gap-2"
              style={{
                background: 'var(--color-signal)',
                color: 'var(--color-text-inverse)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                padding: '12px 28px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {gate.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

// Context for passing profile check data to children
import { createContext, useContext } from 'react';

interface WorkbenchGateContextValue {
  profileCompleted: boolean;
  missingFields: string[];
  isProfileLoading: boolean;
}

const WorkbenchGateContext = createContext<WorkbenchGateContextValue>({
  profileCompleted: true,
  missingFields: [],
  isProfileLoading: false,
});

export function useWorkbenchGate() {
  return useContext(WorkbenchGateContext);
}
