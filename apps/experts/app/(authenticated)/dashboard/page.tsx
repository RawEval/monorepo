'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { expertsService } from '@/services/experts-service';
import { workbenchService } from '@/services/workbench-service';
import { CheckCircle2, Circle, ArrowRight, Briefcase, Award, BarChart3, Clock } from 'lucide-react';

// ── Onboarding step config ──────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  { key: 'registered' as const, label: 'Account created', href: null },
  { key: 'resume_uploaded' as const, label: 'Resume uploaded', href: '/onboarding' },
  { key: 'profile_completed' as const, label: 'Profile completed', href: '/onboarding' },
  { key: 'domains_set' as const, label: 'Domains set', href: '/onboarding' },
  { key: 'interview_completed' as const, label: 'Interview passed', href: '/interview/setup' },
];

// ── Tier display ────────────────────────────────────────────────────────────

function tierLabel(tier: number | undefined): string {
  if (tier === 1) return 'Verified';
  if (tier === 2) return 'Senior';
  if (tier === 3) return 'Lead';
  return '—';
}

function tierColor(tier: number | undefined): string {
  if (tier === 1) return 'var(--color-info)';
  if (tier === 2) return 'var(--color-signal)';
  if (tier === 3) return 'var(--color-success)';
  return 'var(--color-text-faint)';
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: onboarding, isLoading: loadingOnboarding } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => expertsService.getOnboardingStatus(),
  });

  const { data: score } = useQuery({
    queryKey: ['my-score'],
    queryFn: () => expertsService.getMyScore(),
    enabled: !!onboarding?.active,
  });

  const { data: tasks } = useQuery({
    queryKey: ['workbench', 'tasks'],
    queryFn: () => workbenchService.getMyTasks({ page: 1, page_size: 5 }),
    enabled: !!onboarding?.active,
  });

  if (loadingOnboarding) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ width: 24, height: 24, border: '2px solid var(--color-border)', borderTopColor: 'var(--color-signal)', borderRadius: 'var(--radius-full)', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isActive = onboarding?.active ?? onboarding?.checklist?.active ?? false;
  // Handle both flat and nested checklist formats
  const checklist = onboarding?.checklist ?? (onboarding ? {
    registered: onboarding.registered,
    resume_uploaded: onboarding.resume_uploaded,
    profile_completed: onboarding.profile_completed,
    domains_set: onboarding.domains_set,
    interview_completed: onboarding.interview_completed,
    active: onboarding.active,
  } : undefined);
  const completedSteps = checklist
    ? [checklist.registered, checklist.resume_uploaded, checklist.profile_completed, checklist.domains_set, checklist.interview_completed].filter(Boolean).length
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)', paddingBottom: 'var(--space-8)' }}>
        <div className="eyebrow"><span className="eyebrow-text">Dashboard</span></div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--leading-tight)',
          fontWeight: 400,
          margin: '0 0 var(--space-5)',
        }}>
          Welcome back
        </h1>

        {/* Status indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: isActive ? 'var(--color-success)' : 'var(--color-warning)' }} />
            <span className="mono-label" style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>
              {isActive ? 'Active Expert' : `Onboarding ${completedSteps}/5`}
            </span>
          </div>
          {score && (
            <>
              <span style={{ color: 'var(--color-border-strong)', fontSize: '11px' }}>&middot;</span>
              <span className="mono-label" style={{ color: tierColor(score.derived_tier), fontSize: '10px' }}>
                Tier: {tierLabel(score.derived_tier)}
              </span>
              <span style={{ color: 'var(--color-border-strong)', fontSize: '11px' }}>&middot;</span>
              <span className="mono-label" style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>
                Score: {score.expert_score?.toFixed(1) ?? '—'}
              </span>
            </>
          )}
        </div>
      </section>

      {/* ── Stats (active experts only) ── */}
      {isActive && score && (
        <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
          <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-8) var(--section-x)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)' }} className="stats-grid">
              {[
                { icon: Award, value: tierLabel(score.derived_tier), label: 'Expert tier' },
                { icon: BarChart3, value: score.expert_score?.toFixed(1) ?? '—', label: 'Expert score' },
                { icon: Briefcase, value: String(tasks?.total ?? 0), label: 'Pending tasks' },
                { icon: Clock, value: '—', label: 'This month' },
              ].map((stat) => (
                <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-base)', border: '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <stat.icon style={{ width: 16, height: 16, color: 'var(--color-text-muted)' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Onboarding Progress (non-active experts) ── */}
      {!isActive && checklist && (
        <section style={{ borderTop: '1px solid var(--color-border)' }}>
          <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
            <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-8)' }}>
              Complete onboarding to access the workbench
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {ONBOARDING_STEPS.map((step) => {
                const done = checklist[step.key];
                return (
                  <div
                    key={step.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      background: done ? 'var(--color-success-subtle)' : 'var(--color-bg-base)',
                    }}
                  >
                    {done ? (
                      <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--color-success)', flexShrink: 0 }} />
                    ) : (
                      <Circle style={{ width: 16, height: 16, color: 'var(--color-text-faint)', flexShrink: 0 }} />
                    )}
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      color: done ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      flex: 1,
                    }}>
                      {step.label}
                    </span>
                    {!done && step.href && (
                      <Link
                        href={step.href}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          color: 'var(--color-signal)',
                          letterSpacing: 'var(--tracking-wide)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        Start <ArrowRight style={{ width: 10, height: 10 }} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {onboarding?.can_start_interview && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <Link href="/interview/setup" className="btn-primary">
                  Start Domain Interview &rarr;
                </Link>
              </div>
            )}

            {onboarding?.interview?.status === 'in_progress' && onboarding.interview.session_id && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <Link href={`/interview/${onboarding.interview.session_id}`} className="btn-primary">
                  Continue Interview &rarr;
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Quick Actions ── */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-8)' }}>Quick actions</div>
          <div className="grid-cols-3-md">
            {[
              ...(isActive
                ? [{ label: 'Open Workbench', href: '/workbench', desc: 'Annotate tasks and earn', accent: true }]
                : [{ label: 'Continue Onboarding', href: '/onboarding', desc: 'Complete your setup to start', accent: true }]
              ),
              { label: 'Interview History', href: '/history', desc: 'Review past sessions and scores', accent: false },
              { label: 'Your Profile', href: '/profile', desc: 'View scores and certifications', accent: false },
            ].map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="hover-border hover-lift"
                style={{
                  display: 'block',
                  border: card.accent ? '1px solid var(--color-signal-border)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  background: card.accent ? 'var(--color-signal-subtle)' : 'var(--color-bg-surface)',
                  padding: 'var(--space-5)',
                  textDecoration: 'none',
                }}
              >
                <span className="mono-label" style={{ color: card.accent ? 'var(--color-signal)' : 'var(--color-text-faint)', fontSize: '10px' }}>
                  {card.label}
                </span>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 'var(--space-2) 0 0' }}>
                  {card.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pending Tasks (active experts only) ── */}
      {isActive && tasks && tasks.total > 0 && (
        <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
          <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
              <div className="mono-label" style={{ color: 'var(--color-text-faint)' }}>Pending tasks</div>
              <Link
                href="/workbench"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--color-signal)',
                  letterSpacing: 'var(--tracking-wide)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Open Workbench <ArrowRight style={{ width: 10, height: 10 }} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {tasks.items?.slice(0, 5).map((task: { allocation_id: number; prompts?: Array<{ domain?: string; conversation_id?: number; failure_reason?: string | null; my_responses?: number; total_questions?: number }> }) => {
                const prompt = task.prompts?.[0];
                return (
                  <Link
                    key={task.allocation_id}
                    href="/workbench"
                    className="hover-border"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3) var(--space-4)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-base)',
                      textDecoration: 'none',
                      gap: 'var(--space-4)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="mono-label" style={{
                        color: 'var(--color-signal)',
                        background: 'var(--color-signal-subtle)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '9px',
                        marginRight: 'var(--space-2)',
                      }}>
                        {prompt?.domain ?? 'Unknown'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        {prompt?.failure_reason
                          ? (prompt.failure_reason.length > 80 ? prompt.failure_reason.slice(0, 80) + '...' : prompt.failure_reason)
                          : `Conversation #${prompt?.conversation_id ?? '?'}`}
                      </span>
                    </div>
                    <span className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '10px', flexShrink: 0 }}>
                      {prompt?.my_responses ?? 0}/{prompt?.total_questions ?? '?'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
