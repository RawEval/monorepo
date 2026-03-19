'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MessageSquare,
  Flag,
  DollarSign,
  Shield,
  CheckCircle2,
  Users,
  Database,
  Sparkles,
} from 'lucide-react';

const stages = [
  {
    id: 'capture',
    phase: 'Capture',
    icon: MessageSquare,
    title: 'User chats with AI',
    description: 'Someone asks a question. The AI responds — but gets something wrong.',
    accent: 'var(--color-text-secondary)',
    visual: 'chat',
  },
  {
    id: 'flag',
    phase: 'Capture',
    icon: Flag,
    title: 'One tap to flag',
    description: 'The user spots the error and flags it. A quick note about what went wrong enters our pipeline.',
    accent: 'var(--color-signal)',
    visual: 'flag',
  },
  {
    id: 'reward',
    phase: 'Capture',
    icon: DollarSign,
    title: 'Flagger earns a reward',
    description: 'Good signal is valuable. The flagger gets paid for catching what AI missed.',
    accent: 'var(--color-success)',
    visual: 'money',
  },
  {
    id: 'sanitize',
    phase: 'Verify',
    icon: Shield,
    title: 'PII stripped & 20+ checks',
    description: 'All personal data is removed. The flagged response goes through extensive quality verification.',
    accent: 'var(--color-info)',
    visual: 'shield',
  },
  {
    id: 'experts',
    phase: 'Verify',
    icon: Users,
    title: 'Domain experts evaluate',
    description: 'We match the task to our highest-rated specialists. 9 reviewers independently reach consensus.',
    accent: 'var(--color-signal)',
    visual: 'experts',
  },
  {
    id: 'payout',
    phase: 'Deliver',
    icon: DollarSign,
    title: 'Expert payout confirmed',
    description: 'Once verified as a true positive, experts receive their payout. Quality is rewarded at every step.',
    accent: 'var(--color-success)',
    visual: 'payout',
  },
  {
    id: 'dataset',
    phase: 'Deliver',
    icon: Database,
    title: 'Training data created',
    description: 'Corrected, verified, provenance-rich data joins the training set — making AI better for everyone.',
    accent: 'var(--color-signal)',
    visual: 'dataset',
  },
];

const phases = ['Capture', 'Verify', 'Deliver'] as const;
const phaseColors: Record<string, string> = {
  'Capture': 'var(--color-signal)',
  'Verify': 'var(--color-info)',
  'Deliver': 'var(--color-success)',
};

export function JourneyAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Observe visibility
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isVisible]);

  // Auto-advance stages
  useEffect(() => {
    if (!isVisible || isPaused) return;

    let current = -1;
    intervalRef.current = setInterval(() => {
      current++;
      if (current >= stages.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      setActiveStage(current);
    }, 1800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVisible, isPaused]);

  const handleStageClick = useCallback((index: number) => {
    setActiveStage(index);
    setIsPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const handleReplay = useCallback(() => {
    setActiveStage(-1);
    setIsPaused(false);
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const currentPhase = activeStage >= 0 ? stages[activeStage]?.phase : null;

  return (
    <section
      ref={containerRef}
      style={{
        width: '100%',
        background: 'var(--color-bg-base)',
        borderTop: '1px solid var(--color-border-subtle)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle background glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '60%',
          background: 'radial-gradient(ellipse, rgba(255, 107, 53, 0.03), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: 'var(--section-y) var(--section-x)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-signal)',
              marginBottom: 'var(--space-4)',
            }}
          >
            The journey of a single flag
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            From wrong answer to better AI
          </h2>
        </div>

        {/* Phase tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-1)',
            marginBottom: 'var(--space-10)',
          }}
        >
          {phases.map((phase) => {
            const isActive = currentPhase === phase;
            const phaseIndex = stages.findIndex((s) => s.phase === phase);
            const isPast = activeStage >= 0 && phaseIndex <= activeStage;

            return (
              <button
                key={phase}
                onClick={() => handleStageClick(stages.findIndex((s) => s.phase === phase))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${isActive ? phaseColors[phase] + '60' : isPast ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
                  background: isActive ? phaseColors[phase] + '12' : 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: 'var(--tracking-wide)',
                  color: isActive ? phaseColors[phase] : isPast ? 'var(--color-text-secondary)' : 'var(--color-text-faint)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                }}
              >
                {isPast && !isActive && <CheckCircle2 size={12} />}
                {phase}
              </button>
            );
          })}
        </div>

        {/* Stage cards — horizontal scrollable on mobile, grid on desktop */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index <= activeStage;
            const isCurrent = index === activeStage;

            return (
              <button
                key={stage.id}
                onClick={() => handleStageClick(index)}
                style={{
                  textAlign: 'left',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                  background: isCurrent ? 'var(--color-bg-elevated)' : isActive ? 'var(--color-bg-surface)' : 'var(--color-bg-surface)',
                  border: `1px solid ${isCurrent ? stage.accent + '50' : isActive ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
                  opacity: isActive ? 1 : activeStage === -1 ? 0.5 : 0.35,
                  transform: isCurrent ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  boxShadow: isCurrent ? `0 4px 20px ${stage.accent}15, 0 0 0 1px ${stage.accent}20` : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Phase label */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                    color: phaseColors[stage.phase],
                    marginBottom: 'var(--space-3)',
                    opacity: 0.8,
                  }}
                >
                  {stage.phase} · {String(index + 1).padStart(2, '0')}
                </div>

                {/* Icon + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-md)',
                      background: isCurrent ? stage.accent : `${stage.accent}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Icon
                      size={15}
                      style={{
                        color: isCurrent ? '#fff' : stage.accent,
                        transition: 'color 0.3s ease',
                      }}
                    />
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      color: isCurrent ? 'var(--color-text-primary)' : isActive ? 'var(--color-text-secondary)' : 'var(--color-text-faint)',
                      fontWeight: 500,
                      margin: 0,
                      transition: 'color 0.3s ease',
                      lineHeight: 'var(--leading-snug)',
                    }}
                  >
                    {stage.title}
                  </h3>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--leading-relaxed)',
                    margin: 0,
                    opacity: isActive ? 1 : 0,
                    maxHeight: isActive ? 80 : 0,
                    transition: 'opacity 0.3s ease, max-height 0.3s ease',
                    overflow: 'hidden',
                  }}
                >
                  {stage.description}
                </p>

                {/* Bottom progress indicator */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: isActive ? stage.accent : 'transparent',
                    opacity: isCurrent ? 1 : 0.4,
                    transition: 'all 0.3s ease',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Bottom row: outcome + replay */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          {/* Outcome badges — appear when all stages complete */}
          {activeStage >= stages.length - 1 && (
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                flexWrap: 'wrap',
                animation: 'fade-up 0.4s ease-out',
              }}
            >
              {[
                { label: 'Flagger paid', icon: DollarSign, color: 'var(--color-success)' },
                { label: 'Experts paid', icon: Users, color: 'var(--color-success)' },
                { label: 'AI improved', icon: Sparkles, color: 'var(--color-signal)' },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.label}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 12px',
                      background: `${item.color}10`,
                      border: `1px solid ${item.color}25`,
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    <ItemIcon size={12} style={{ color: item.color }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: item.color, letterSpacing: 'var(--tracking-wide)' }}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Replay */}
          {activeStage >= stages.length - 1 && (
            <button
              onClick={handleReplay}
              className="btn-ghost"
              style={{ fontSize: 'var(--text-sm)', marginLeft: 'auto' }}
            >
              Replay ↻
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
