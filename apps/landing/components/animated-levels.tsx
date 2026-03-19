'use client';

import { useState, useEffect } from 'react';
import { Star, Zap, Crown, Shield } from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '@/lib/use-animation';

const levels = [
  {
    name: 'Contributor',
    description: 'Just getting started',
    perks: ['Free access to all models', 'Earn per valid flag', 'Community leaderboard'],
    color: 'var(--color-text-muted)',
    icon: Star,
    flagCount: 0,
    earningRange: '$5–25',
  },
  {
    name: 'Reviewer',
    description: '50+ valid flags',
    perks: ['Higher payouts per flag', 'Early access to new models', 'Priority support'],
    color: 'var(--color-info)',
    icon: Shield,
    flagCount: 50,
    earningRange: '$25–80',
  },
  {
    name: 'Expert',
    description: '200+ valid flags + quality score 90%+',
    perks: ['Top-tier payouts', 'Invite to Expert Workbench', 'Direct evaluation tasks', 'Exclusive beta features'],
    color: 'var(--color-signal)',
    icon: Crown,
    flagCount: 200,
    earningRange: '$80–200+',
  },
];

export function AnimatedLevels() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const revealed = useStaggerReveal(levels.length, 300, isVisible);
  const [activeLevel, setActiveLevel] = useState(0);


  // Auto-cycle through levels
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveLevel((prev) => (prev + 1) % levels.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div ref={ref}>
      {/* Level progression bar */}
      <div style={{
        marginBottom: 'var(--space-10)',
        maxWidth: 600,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-3)',
        }}>
          {levels.map((level, i) => {
            const Icon = level.icon;
            return (
              <button
                key={level.name}
                onClick={() => setActiveLevel(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.3s ease',
                  opacity: i === activeLevel ? 1 : 0.5,
                  transform: i === activeLevel ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <Icon size={14} style={{ color: level.color, transition: 'color 0.3s ease' }} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: i === activeLevel ? 'var(--color-text-primary)' : 'var(--color-text-faint)',
                  letterSpacing: 'var(--tracking-wide)',
                  transition: 'color 0.3s ease',
                }}>
                  {level.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress track */}
        <div style={{
          height: 3,
          background: 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            height: '100%',
            width: `${((activeLevel + 1) / levels.length) * 100}%`,
            background: levels[activeLevel]!.color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease',
            boxShadow: `0 0 12px ${levels[activeLevel]!.color}40`,
          }} />
        </div>
      </div>

      {/* Level cards */}
      <div className="grid-cols-3-md" style={{ gap: 'var(--space-6)' }}>
        {levels.map((level, i) => {
          const Icon = level.icon;
          const isRevealed = revealed[i];
          const isActive = i === activeLevel;

          return (
            <div
              key={level.name}
              onClick={() => setActiveLevel(i)}
              style={{
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                background: isActive ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
                border: `1px solid ${isActive ? level.color + '60' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                opacity: isRevealed ? 1 : 0,
                transform: isRevealed
                  ? isActive ? 'translateY(-4px)' : 'translateY(0)'
                  : 'translateY(24px)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? `0 8px 24px ${level.color}15, 0 0 0 1px ${level.color}30` : 'var(--shadow-card)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-md)',
                    background: `${level.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}>
                    <Icon size={16} style={{ color: level.color }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                    {level.name}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-faint)',
                  letterSpacing: 'var(--tracking-wide)',
                  margin: 0,
                }}>
                  {level.description}
                </p>
              </div>

              {/* Earning badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                background: `${level.color}10`,
                border: `1px solid ${level.color}30`,
                borderRadius: 'var(--radius-full)',
                alignSelf: 'flex-start',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: level.color, letterSpacing: 'var(--tracking-wide)', fontWeight: 500 }}>
                  {level.earningRange}/week
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {level.perks.map((perk) => (
                  <div key={perk} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                    <Zap size={12} style={{ color: level.color, flexShrink: 0, marginTop: '3px' }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
