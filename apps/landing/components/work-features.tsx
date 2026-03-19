'use client';

import { useScrollReveal, useStaggerReveal } from '@/lib/use-animation';
import { Shield, Brain, Clock, DollarSign, Target, Zap } from 'lucide-react';

const features = [
  {
    icon: Brain,
    label: 'Domain-matched tasks',
    body: 'Only receive tasks in your verified areas of expertise. Medicine experts evaluate medical responses. Lawyers evaluate legal advice.',
    accent: 'var(--color-info)',
  },
  {
    icon: Shield,
    label: 'Iron Dome anti-cheat',
    body: 'Our quality system runs 20+ checks on every evaluation. High-quality work is rewarded. Low-effort work is caught automatically.',
    accent: 'var(--color-signal)',
  },
  {
    icon: Clock,
    label: 'Flexible schedule',
    body: 'Work when you want, from anywhere. Tasks are available 24/7. Most take 4–8 minutes to complete.',
    accent: 'var(--color-text-secondary)',
  },
  {
    icon: DollarSign,
    label: 'Transparent payouts',
    body: 'See exactly what each task pays before you start. Weekly payouts via bank transfer. No hidden fees or minimum thresholds.',
    accent: 'var(--color-success)',
  },
  {
    icon: Target,
    label: 'Structured rubrics',
    body: 'Every task comes with a clear rubric — factual accuracy, completeness, harmfulness, relevance. No guesswork about what\'s expected.',
    accent: 'var(--color-warning)',
  },
  {
    icon: Zap,
    label: 'Career progression',
    body: 'Start as Verified, advance to Senior, and reach Lead. Higher tiers unlock better rates, complex tasks, and mentoring opportunities.',
    accent: 'var(--color-signal)',
  },
];

export function WorkFeatures() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const revealed = useStaggerReveal(features.length, 150, isVisible);

  return (
    <div ref={ref} className="grid-cols-3-md" style={{ gap: 'var(--space-6)' }}>
      {features.map((f, i) => {
        const Icon = f.icon;
        const isRevealed = revealed[i];

        return (
          <div
            key={f.label}
            className="hover-lift"
            style={{
              padding: 'var(--space-6)',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              opacity: isRevealed ? 1 : 0,
              transform: isRevealed ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease',
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: `${f.accent}15`,
              border: `1px solid ${f.accent}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-4)',
            }}>
              <Icon size={18} style={{ color: f.accent }} />
            </div>
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
              margin: 0,
            }}>
              {f.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}
