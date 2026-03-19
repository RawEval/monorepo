'use client';

import { useScrollReveal, useSequence } from '@/lib/use-animation';
import { FileText, UserCheck, Wrench, DollarSign, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    label: 'Apply',
    body: 'Submit your application with your domain expertise, credentials, and experience. Takes about 5 minutes.',
    accent: 'var(--color-text-secondary)',
    detail: 'Verification in 24–48 hours',
  },
  {
    icon: UserCheck,
    label: 'Get verified',
    body: 'Our team reviews your credentials and runs a calibration test. Only qualified experts are accepted — that\'s what makes our data valuable.',
    accent: 'var(--color-info)',
    detail: 'Domain-specific calibration',
  },
  {
    icon: Wrench,
    label: 'Evaluate tasks',
    body: 'Flagged AI responses land in your workbench, matched to your domain. Review the original response, write corrections, and score against rubrics.',
    accent: 'var(--color-signal)',
    detail: 'Avg. 4–8 min per task',
  },
  {
    icon: DollarSign,
    label: 'Get paid',
    body: 'Earn per verified evaluation. Higher accuracy and faster turnaround unlock better rates. Weekly payouts, no minimums.',
    accent: 'var(--color-success)',
    detail: 'Weekly bank transfers',
  },
];

export function WorkHowItWorks() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const activeStep = useSequence(steps.length, 1000, isVisible);

  return (
    <div ref={ref}>
      {/* Progress track */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        marginBottom: 'var(--space-10)',
        maxWidth: 600,
      }}>
        {steps.map((step, i) => {
          const isActive = i <= activeStep;
          const isCurrent = i === activeStep;
          return (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              {/* Node */}
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: isCurrent ? step.accent : isActive ? `${step.accent}20` : 'var(--color-bg-muted)',
                border: `2px solid ${isCurrent ? step.accent : isActive ? `${step.accent}50` : 'var(--color-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                flexShrink: 0,
                boxShadow: isCurrent ? `0 0 16px ${step.accent}30` : 'none',
              }}>
                {isActive && !isCurrent ? (
                  <CheckCircle2 size={14} style={{ color: step.accent }} />
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: isCurrent ? '#fff' : 'var(--color-text-faint)',
                    fontWeight: 500,
                  }}>
                    {i + 1}
                  </span>
                )}
              </div>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1,
                  height: 2,
                  background: 'var(--color-border)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: i < activeStep ? '100%' : '0%',
                    background: steps[i + 1]?.accent ?? 'var(--color-signal)',
                    transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step cards */}
      <div className="grid-cols-2-lg" style={{ gap: 'var(--space-6)' }}>
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i <= activeStep;
          const isCurrent = i === activeStep;

          return (
            <div
              key={step.label}
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                alignItems: 'flex-start',
                padding: 'var(--space-5)',
                borderRadius: 'var(--radius-lg)',
                background: isCurrent ? 'var(--color-bg-elevated)' : 'transparent',
                border: `1px solid ${isCurrent ? 'var(--color-border-strong)' : 'transparent'}`,
                opacity: isActive ? 1 : 0.3,
                transform: isActive ? 'translateY(0)' : 'translateY(8px)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-lg)',
                background: isCurrent ? `${step.accent}15` : 'var(--color-bg-muted)',
                border: `1px solid ${isCurrent ? `${step.accent}30` : 'var(--color-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.3s ease',
              }}>
                <Icon size={18} style={{
                  color: isCurrent ? step.accent : isActive ? 'var(--color-text-muted)' : 'var(--color-text-faint)',
                  transition: 'color 0.3s ease',
                }} />
              </div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: isCurrent ? 'var(--color-text-primary)' : isActive ? 'var(--color-text-secondary)' : 'var(--color-text-faint)',
                  fontWeight: 500,
                  margin: '0 0 var(--space-2)',
                  transition: 'color 0.3s ease',
                }}>
                  {step.label}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--leading-relaxed)',
                  margin: '0 0 var(--space-3)',
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}>
                  {step.body}
                </p>
                {isCurrent && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    background: `${step.accent}10`,
                    border: `1px solid ${step.accent}25`,
                    borderRadius: 'var(--radius-full)',
                    animation: 'fade-up 0.3s ease-out',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: step.accent,
                      letterSpacing: 'var(--tracking-wide)',
                    }}>
                      {step.detail}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
