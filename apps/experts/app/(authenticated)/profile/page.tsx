'use client';

import { useQuery } from '@tanstack/react-query';
import { expertsService } from '@/services/experts-service';
import type { ExpertProfile } from '@/features/interview/types';

const tierNames: Record<number, string> = { 1: 'Verified', 2: 'Senior', 3: 'Lead' };

const componentLabels: Record<string, string> = {
  rolling_iaa: 'Inter-Annotator Agreement',
  qc_alignment: 'QC Alignment',
  domain_interview: 'Domain Interview',
  education_experience: 'Education & Experience',
  sla_reliability: 'SLA Reliability',
  fraud_risk_inverse: 'Fraud Risk (Inverse)',
  stability: 'Stability',
};

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => expertsService.getMyProfile(),
  });

  const { data: onboarding, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => expertsService.getOnboardingStatus(),
  });

  // Only fetch score if user is an active expert (non-experts don't have scores)
  const isActiveExpert = onboarding?.active ?? onboarding?.checklist?.active ?? false;

  const { data: score, isLoading: scoreLoading } = useQuery({
    queryKey: ['my-score'],
    queryFn: () => expertsService.getMyScore(),
    enabled: isActiveExpert,
    retry: false,
  });

  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ['my-domains'],
    queryFn: () => expertsService.getMyDomains(),
  });

  const isLoading = profileLoading || onboardingLoading || (isActiveExpert && scoreLoading) || domainsLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ width: 24, height: 24, border: '2px solid var(--color-border)', borderTopColor: 'var(--color-signal)', borderRadius: 'var(--radius-full)', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const completedSteps = onboarding
    ? [onboarding.registered, onboarding.resume_uploaded, onboarding.profile_completed, onboarding.domains_set, onboarding.interview_completed].filter(Boolean).length
    : 0;

  // Unwrap nested profile: API returns { profile: { college, ... } } or flat { college, ... }
  const rawProfile = profile as unknown as { profile?: ExpertProfile } | ExpertProfile | null;
  const profileData: ExpertProfile | null = rawProfile
    ? ('profile' in rawProfile && rawProfile.profile ? rawProfile.profile : rawProfile as ExpertProfile)
    : null;

  // Unwrap nested domains: API returns { domains: [...] } or flat [...]
  const domainsList = domains
    ? (Array.isArray(domains) ? domains : (domains as unknown as { domains?: unknown[] }).domains ?? [])
    : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* Header */}
      <section style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)', paddingBottom: 'var(--space-12)' }}>
        <div style={{ maxWidth: 680 }}>
          <div className="eyebrow"><span className="eyebrow-text">Profile</span></div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-tight)',
            fontWeight: 400,
            margin: '0 0 var(--space-4)',
          }}>
            Expert Profile
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            margin: 0,
          }}>
            Your profile, scores, and domain certifications.
          </p>
        </div>
      </section>

      {/* Two-column grid */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="grid-cols-2-lg" style={{ gap: 'var(--space-8)', alignItems: 'start' }}>

            {/* Left: Profile card */}
            <div style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
            }}>
              {/* Avatar */}
              <div style={{
                width: 64, height: 64, borderRadius: 'var(--radius-full)',
                background: 'var(--color-bg-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-5)',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-muted)' }}>
                  {profile?.college?.charAt(0)?.toUpperCase() || 'E'}
                </span>
              </div>

              {/* Tier + Score */}
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                {score && (
                  <>
                    <span className="mono-label" style={{
                      color: 'var(--color-signal)',
                      background: 'var(--color-signal-subtle)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '10px',
                    }}>
                      {tierNames[score.derived_tier] ?? 'Unknown'} &middot; Tier {score.derived_tier}
                    </span>
                    <div style={{ marginTop: 'var(--space-4)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>
                        {score.expert_score.toFixed(1)}
                      </span>
                      <p className="mono-label" style={{ color: 'var(--color-text-faint)', marginTop: 'var(--space-1)', fontSize: '10px' }}>
                        Overall Score
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Details */}
              {profileData && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <div className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '10px', marginBottom: '2px' }}>Education</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{profileData.highest_education}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{profileData.college}</div>
                  </div>
                  <div>
                    <div className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '10px', marginBottom: '2px' }}>Degree</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{profileData.bachelors_degree}</div>
                    {profileData.masters_degree && (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{profileData.masters_degree}</div>
                    )}
                  </div>
                  <div>
                    <div className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '10px', marginBottom: '2px' }}>Experience</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{profileData.years_of_experience} years</div>
                  </div>
                  {profileData.subjects_of_expertise?.length > 0 && (
                    <div>
                      <div className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '10px', marginBottom: 'var(--space-2)' }}>Expertise</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {(profileData?.subjects_of_expertise ?? []).map((subject: string) => (
                          <span
                            key={subject}
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '11px',
                              color: 'var(--color-text-secondary)',
                              background: 'var(--color-bg-base)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-full)',
                              padding: '2px 10px',
                            }}
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Score metadata */}
              {score && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {[
                      { label: 'Annotations', value: String(score.total_completed_annotations) },
                      { label: 'Score version', value: `v${score.score_version}` },
                      { label: 'Last computed', value: new Date(score.last_computed_at).toLocaleDateString() },
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)' }}>{item.label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Score breakdown + Domains */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

              {/* Score breakdown */}
              {score && (
                <div style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                }}>
                  <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-6)' }}>Score breakdown</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    {Object.entries(score.components).map(([key, comp]) => (
                      <div key={key}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                            {componentLabels[key] ?? key}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)' }}>
                            {(comp.value * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div style={{ height: 4, width: '100%', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-muted)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            borderRadius: 'var(--radius-full)',
                            background: comp.value >= 0.7
                              ? 'var(--color-success)'
                              : comp.value >= 0.4
                                ? 'var(--color-warning)'
                                : 'var(--color-error)',
                            width: `${Math.min(comp.value * 100, 100)}%`,
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)' }}>
                            Weight: {(comp.weight * 100).toFixed(0)}%
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)' }}>
                            Contribution: {comp.contribution.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Domains */}
              {domainsList.length > 0 && (
                <div style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                }}>
                  <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-6)' }}>Domain certifications</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(domainsList as any[]).map((domain: any) => (
                      <div key={`${domain.domain_id}-${domain.domain}`}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                            {domain.domain}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-signal)' }}>
                            {domain.proficiency_score}%
                          </span>
                        </div>
                        <div style={{ height: 4, width: '100%', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-muted)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            borderRadius: 'var(--radius-full)',
                            background: (domain.proficiency_score ?? 0) >= 70
                              ? 'var(--color-success)'
                              : (domain.proficiency_score ?? 0) >= 40
                                ? 'var(--color-warning)'
                                : 'var(--color-error)',
                            width: `${Math.min(domain.proficiency_score ?? 0, 100)}%`,
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                        {domain.subdomain && (
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', marginTop: '2px' }}>
                            {domain.parent_domain} / {domain.subdomain}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Onboarding progress */}
              {onboarding && (
                <div style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                }}>
                  <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-5)' }}>Onboarding progress</div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      {completedSteps === 5 ? 'All steps completed' : `${completedSteps} of 5 steps completed`}
                    </span>
                    <span className="mono-label" style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '10px',
                      color: onboarding.active ? 'var(--color-success)' : 'var(--color-warning)',
                      background: onboarding.active ? 'var(--color-success-subtle)' : 'var(--color-warning-subtle)',
                    }}>
                      {onboarding.active ? 'Active' : 'Pending'}
                    </span>
                  </div>

                  <div style={{ height: 6, width: '100%', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-muted)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-signal)',
                      transition: 'width 0.5s ease',
                      width: `${(completedSteps / 5) * 100}%`,
                    }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-1)', marginTop: 'var(--space-3)' }}>
                    {[
                      { label: 'Account', done: onboarding.registered },
                      { label: 'Resume', done: onboarding.resume_uploaded },
                      { label: 'Profile', done: onboarding.profile_completed },
                      { label: 'Domains', done: onboarding.domains_set },
                      { label: 'Interview', done: onboarding.interview_completed },
                    ].map((step) => (
                      <div key={step.label} style={{ textAlign: 'center' }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: 'var(--radius-full)',
                          background: step.done ? 'var(--color-success)' : 'var(--color-border-strong)',
                          margin: '0 auto var(--space-1)',
                        }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
