'use client';

import { useScrollReveal, useStaggerReveal } from '@/lib/use-animation';
import { MessageSquare, Flag, Award, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    label: 'Chat with top AI models',
    body: 'Access all the top AI models from leading frontier labs — all in one place. Switch between models mid-conversation to compare answers.',
    stat: '6+ models',
    statLabel: 'available',
  },
  {
    icon: Flag,
    label: 'Spot something wrong? Flag it.',
    body: 'When an AI gives a bad answer — wrong facts, weird response, or something harmful — just tap the flag button. Tell us what went wrong in a few words.',
    stat: '1 tap',
    statLabel: 'to flag',
  },
  {
    icon: Award,
    label: 'Earn real rewards',
    body: 'Every valid flag earns you a payout. The more helpful your flags are, the more you earn. Top contributors make $50–200+ per hour equivalent.',
    stat: '$50–200+',
    statLabel: '/hr equivalent',
  },
  {
    icon: TrendingUp,
    label: 'Level up your profile',
    body: 'Start as a Contributor and work your way up. Higher levels unlock better payouts, priority access to new models, and exclusive tasks.',
    stat: '3 levels',
    statLabel: 'to unlock',
  },
];

export function AnimatedFeatures() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const revealed = useStaggerReveal(features.length, 200, isVisible);

  return (
    <div ref={ref} className="grid-cols-2-lg" style={{ gap: 'var(--space-6)' }}>
      {features.map((f, i) => {
        const Icon = f.icon;
        const isRevealed = revealed[i];

        return (
          <div
            key={f.label}
            className="hover-lift"
            style={{
              padding: 'var(--space-6)',
              display: 'flex',
              gap: 'var(--space-5)',
              alignItems: 'flex-start',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              opacity: isRevealed ? 1 : 0,
              transform: isRevealed ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
              transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease',
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-signal-subtle)',
              border: '1px solid var(--color-signal-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={20} style={{ color: 'var(--color-signal)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-primary)',
                fontWeight: 500,
                margin: '0 0 var(--space-3)',
              }}>
                {f.label}
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--leading-relaxed)',
                margin: '0 0 var(--space-4)',
              }}>
                {f.body}
              </p>
              {/* Stat badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 4,
                padding: '4px 10px',
                background: 'var(--color-bg-muted)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--color-signal)',
                  fontWeight: 500,
                  letterSpacing: 'var(--tracking-wide)',
                }}>
                  {f.stat}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--color-text-faint)',
                  letterSpacing: 'var(--tracking-wide)',
                }}>
                  {f.statLabel}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
