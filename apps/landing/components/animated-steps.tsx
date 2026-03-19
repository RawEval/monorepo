'use client';

import { useScrollReveal, useSequence } from '@/lib/use-animation';
import { MessageSquare, Eye, UserCheck, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    label: 'You chat normally',
    body: 'Ask anything — homework help, coding questions, research, creative writing. Use AI the way you normally would.',
    accent: 'var(--color-text-secondary)',
  },
  {
    icon: Eye,
    label: 'You spot a mistake',
    body: "The AI says something wrong, incomplete, or unhelpful. You flag it with one tap and add a quick note about what's off.",
    accent: 'var(--color-signal)',
  },
  {
    icon: UserCheck,
    label: 'Experts verify',
    body: 'Domain experts review your flag, confirm the error, and write a better response. You earn a payout when they validate your catch.',
    accent: 'var(--color-info)',
  },
  {
    icon: Sparkles,
    label: 'AI gets better',
    body: "Your flags become training data that frontier labs use to improve their models. You're literally making AI smarter.",
    accent: 'var(--color-success)',
  },
];

export function AnimatedSteps() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const activeStep = useSequence(steps.length, 800, isVisible);

  return (
    <div ref={ref}>
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
                gap: 'var(--space-5)',
                alignItems: 'flex-start',
                padding: 'var(--space-5)',
                borderRadius: 'var(--radius-lg)',
                background: isCurrent ? 'var(--color-bg-surface)' : 'transparent',
                border: `1px solid ${isCurrent ? 'var(--color-border-strong)' : 'transparent'}`,
                opacity: isActive ? 1 : 0.3,
                transform: isActive ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-lg)',
                background: isCurrent ? `${step.accent}15` : 'var(--color-bg-muted)',
                border: `1px solid ${isCurrent ? `${step.accent}40` : 'var(--color-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.4s ease',
                position: 'relative',
              }}>
                <Icon size={18} style={{
                  color: isCurrent ? step.accent : isActive ? 'var(--color-text-muted)' : 'var(--color-text-faint)',
                  transition: 'color 0.3s ease',
                }} />
                {/* Step number */}
                <div style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: isCurrent ? step.accent : 'var(--color-bg-elevated)',
                  border: `1px solid ${isCurrent ? step.accent : 'var(--color-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: isCurrent ? '#fff' : 'var(--color-text-faint)',
                    fontWeight: 500,
                  }}>
                    {i + 1}
                  </span>
                </div>
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
                  margin: 0,
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 0.4s ease 0.1s',
                }}>
                  {step.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connecting line for desktop */}
      <div
        style={{
          display: 'none', // Only show above 1024px via CSS
          marginTop: 'var(--space-6)',
          height: 2,
          background: 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative',
        }}
        className="step-progress-line"
      >
        <div style={{
          height: '100%',
          width: `${Math.max(0, ((activeStep + 1) / steps.length) * 100)}%`,
          background: 'var(--color-signal)',
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: activeStep >= 0 ? '0 0 8px var(--color-signal-glow)' : 'none',
        }} />
      </div>
    </div>
  );
}
