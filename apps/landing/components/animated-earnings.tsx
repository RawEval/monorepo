'use client';

import { useScrollReveal, useCountUp, useStaggerReveal, Easing } from '@/lib/use-animation';
import { DollarSign, Users, Clock, Star, BarChart3 } from 'lucide-react';

const stats = [
  { icon: DollarSign, value: 4200, prefix: '$', suffix: '+', label: 'Avg. monthly earnings (top experts)', color: 'var(--color-success)' },
  { icon: Clock, value: 6, prefix: '', suffix: ' min', label: 'Avg. time per task', color: 'var(--color-info)' },
  { icon: BarChart3, value: 96.8, prefix: '', suffix: '%', label: 'Expert verification accuracy', color: 'var(--color-signal)' },
  { icon: Users, value: 2400, prefix: '', suffix: '+', label: 'Verified domain experts', color: 'var(--color-text-secondary)' },
];

const tiers = [
  { name: 'Verified Expert', rate: '$18–30', color: 'var(--color-text-muted)', desc: 'Domain knowledge verified, ready for tasks' },
  { name: 'Senior Expert', rate: '$30–60', color: 'var(--color-info)', desc: 'High accuracy, consistent quality output' },
  { name: 'Lead Expert', rate: '$60–120', color: 'var(--color-signal)', desc: 'Top-tier, complex evaluations, mentoring' },
];

export function AnimatedEarnings() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const revealed = useStaggerReveal(stats.length, 200, isVisible);
  const tierRevealed = useStaggerReveal(tiers.length, 250, isVisible);

  return (
    <div ref={ref}>
      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-12)',
      }}
        className="stats-grid"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isRevealed = revealed[i];

          return (
            <div
              key={stat.label}
              style={{
                padding: 'var(--space-5)',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                opacity: isRevealed ? 1 : 0,
                transform: isRevealed ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: `${stat.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-3)',
              }}>
                <Icon size={16} style={{ color: stat.color }} />
              </div>
              <AnimatedStatValue
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                trigger={isRevealed ?? false}
                isPercent={stat.suffix === '%'}
              />
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                margin: 0,
                lineHeight: 1.3,
              }}>
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tier cards */}
      <div className="grid-cols-3-md" style={{ gap: 'var(--space-6)' }}>
        {tiers.map((tier, i) => {
          const isRevealed = tierRevealed[i];

          return (
            <div
              key={tier.name}
              className="hover-lift"
              style={{
                padding: 'var(--space-6)',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                opacity: isRevealed ? 1 : 0,
                transform: isRevealed ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                background: `${tier.color}15`,
                border: `1px solid ${tier.color}30`,
                borderRadius: 'var(--radius-full)',
                marginBottom: 'var(--space-3)',
              }}>
                <Star size={10} style={{ color: tier.color }} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: tier.color,
                  letterSpacing: 'var(--tracking-wide)',
                }}>
                  {tier.name.toUpperCase()}
                </span>
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                color: 'var(--color-text-primary)',
                fontWeight: 400,
                marginBottom: 'var(--space-2)',
              }}>
                {tier.rate}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>
                  /hr
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--leading-relaxed)',
                margin: 0,
              }}>
                {tier.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnimatedStatValue({
  value,
  prefix,
  suffix,
  trigger,
  isPercent,
}: {
  value: number;
  prefix: string;
  suffix: string;
  trigger: boolean;
  isPercent: boolean;
}) {
  const animatedValue = useCountUp(value, 1500, trigger, Easing.cubicOut);

  const display = isPercent
    ? animatedValue.toFixed(1)
    : Math.round(animatedValue).toLocaleString();

  return (
    <div style={{
      fontFamily: 'var(--font-display)',
      fontSize: '32px',
      color: 'var(--color-text-primary)',
      fontWeight: 400,
      marginBottom: 'var(--space-2)',
      lineHeight: 'var(--leading-tight)',
    }}>
      {prefix}{display}{suffix}
    </div>
  );
}
