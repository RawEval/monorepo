'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  Flag,
  DollarSign,
  Shield,
  CheckCircle2,
  Users,
  Handshake,
  Database,
  Sparkles,
  SmilePlus,
  Frown,
  Meh,
} from 'lucide-react';

const stages = [
  {
    id: 'prompt',
    icon: MessageSquare,
    emoji: null,
    mood: null,
    title: 'A user asks a question',
    description: 'Someone chats with an AI model — asking about medicine, law, code, or any topic that matters.',
    visual: 'chat',
    accent: 'var(--color-text-secondary)',
  },
  {
    id: 'wrong',
    icon: AlertTriangle,
    emoji: Frown,
    mood: 'worried',
    title: 'The AI gets it wrong',
    description: 'A wrong fact. A hallucination. A dangerous suggestion. The user notices something isn\'t right.',
    visual: 'error',
    accent: 'var(--color-error)',
  },
  {
    id: 'flag',
    icon: Flag,
    emoji: Meh,
    mood: 'determined',
    title: 'They flag it',
    description: 'One tap. A quick note about what went wrong. The failed response enters our pipeline.',
    visual: 'flag',
    accent: 'var(--color-signal)',
  },
  {
    id: 'reward',
    icon: DollarSign,
    emoji: SmilePlus,
    mood: 'happy',
    title: 'They earn a reward',
    description: 'The flagger gets paid for catching what AI missed. Good signal is valuable.',
    visual: 'money',
    accent: 'var(--color-success)',
  },
  {
    id: 'pii',
    icon: Shield,
    emoji: null,
    mood: null,
    title: 'PII removed & sanitized',
    description: 'All personal information is stripped. The task is anonymized and made compliance-ready before any human sees it.',
    visual: 'shield',
    accent: 'var(--color-info)',
  },
  {
    id: 'checks',
    icon: CheckCircle2,
    emoji: null,
    mood: null,
    title: '20+ quality checks',
    description: 'Every flagged response goes through extensive verification — true positive or false positive. Nothing slips through.',
    visual: 'checks',
    accent: 'var(--color-signal)',
  },
  {
    id: 'experts',
    icon: Users,
    emoji: null,
    mood: null,
    title: 'Best experts assigned',
    description: 'We match the task to our highest-rated domain experts. Only verified specialists in that exact field.',
    visual: 'experts',
    accent: 'var(--color-signal)',
  },
  {
    id: 'agreement',
    icon: Handshake,
    emoji: null,
    mood: null,
    title: '9 reviewers reach agreement',
    description: 'Multiple experts independently evaluate. Consensus is reached across all reviewers before anything moves forward.',
    visual: 'consensus',
    accent: 'var(--color-success)',
  },
  {
    id: 'payout',
    icon: DollarSign,
    emoji: SmilePlus,
    mood: 'rewarded',
    title: 'Expert payout initiated',
    description: 'Once verified as a true positive, the original flagger receives their full payout. Quality is rewarded.',
    visual: 'payout',
    accent: 'var(--color-success)',
  },
  {
    id: 'dataset',
    icon: Database,
    emoji: null,
    mood: null,
    title: 'Perfect dataset created',
    description: 'The corrected, verified, provenance-rich data joins the training set — making AI better for everyone.',
    visual: 'dataset',
    accent: 'var(--color-signal)',
  },
  {
    id: 'impact',
    icon: Sparkles,
    emoji: null,
    mood: 'celebration',
    title: 'Everyone wins',
    description: 'The user earned money. The experts got paid. The AI got smarter. The world got safer. That\'s the RawEval loop.',
    visual: 'celebration',
    accent: 'var(--color-signal)',
  },
];

function CheckAnimation({ count, active }: { count: number; active: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', maxWidth: '180px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            background: active ? 'var(--color-success-subtle)' : 'var(--color-bg-muted)',
            border: `1px solid ${active ? 'var(--color-success-border)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: active ? 1 : 0.3,
            transition: `all 0.3s ease ${i * 0.06}s`,
            transform: active ? 'scale(1)' : 'scale(0.8)',
          }}
        >
          <CheckCircle2 size={12} style={{ color: active ? 'var(--color-success)' : 'var(--color-text-faint)' }} />
        </div>
      ))}
    </div>
  );
}

function ExpertAvatars({ active }: { active: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '0', marginLeft: '8px' }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: active
              ? `hsl(${20 + i * 15}, 80%, ${55 + i * 3}%)`
              : 'var(--color-bg-muted)',
            border: '2px solid var(--color-bg-base)',
            marginLeft: i > 0 ? '-8px' : '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: active ? 1 : 0.3,
            transition: `all 0.4s ease ${i * 0.08}s`,
            transform: active ? 'scale(1)' : 'scale(0.7)',
            zIndex: 9 - i,
            position: 'relative',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#fff', fontWeight: 500 }}>
            {active ? `E${i + 1}` : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProgressLine({ progress }: { progress: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '23px',
        top: '0',
        bottom: '0',
        width: '2px',
        background: 'var(--color-border)',
        zIndex: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: `${progress}%`,
          background: 'var(--color-signal)',
          transition: 'height 0.6s ease-out',
          borderRadius: '1px',
          boxShadow: progress > 0 ? '0 0 8px var(--color-signal-glow)' : 'none',
        }}
      />
    </div>
  );
}

export function JourneyAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);

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
      { threshold: 0.15 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let current = -1;
    const interval = setInterval(() => {
      current++;
      if (current >= stages.length) {
        clearInterval(interval);
        return;
      }
      setActiveStage(current);
    }, 1200);

    return () => clearInterval(interval);
  }, [isVisible]);

  const progress = activeStage >= 0
    ? Math.min(((activeStage + 1) / stages.length) * 100, 100)
    : 0;

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
      {/* Background glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '40%',
          background: 'radial-gradient(ellipse, rgba(255, 107, 53, 0.04), transparent 70%)',
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
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
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
              maxWidth: '640px',
              margin: '0 auto',
            }}
          >
            From a wrong answer to a better AI — here&apos;s what happens behind the scenes
          </h2>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            maxWidth: '520px',
            margin: '0 auto var(--space-16)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          Every flag you tap triggers a rigorous pipeline. Here&apos;s how one wrong answer becomes training data that makes AI safer for everyone.
        </p>

        {/* Timeline */}
        <div
          style={{
            position: 'relative',
            maxWidth: '680px',
            margin: '0 auto',
          }}
        >
          <ProgressLine progress={progress} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const MoodIcon = stage.emoji;
              const isActive = index <= activeStage;
              const isCurrent = index === activeStage;

              return (
                <div
                  key={stage.id}
                  style={{
                    display: 'flex',
                    gap: 'var(--space-5)',
                    alignItems: 'flex-start',
                    padding: 'var(--space-5) 0',
                    position: 'relative',
                    zIndex: 1,
                    opacity: isActive ? 1 : 0.25,
                    transform: isActive ? 'translateX(0)' : 'translateX(12px)',
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Node */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      background: isCurrent ? stage.accent : isActive ? 'var(--color-bg-surface)' : 'var(--color-bg-muted)',
                      border: `2px solid ${isCurrent ? stage.accent : isActive ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isCurrent ? `0 0 20px ${stage.accent}33` : 'none',
                    }}
                  >
                    <Icon
                      size={20}
                      style={{
                        color: isCurrent ? '#fff' : isActive ? stage.accent : 'var(--color-text-faint)',
                        transition: 'color 0.3s ease',
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingTop: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-base)',
                          color: isCurrent ? 'var(--color-text-primary)' : isActive ? 'var(--color-text-secondary)' : 'var(--color-text-faint)',
                          fontWeight: 500,
                          margin: 0,
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {stage.title}
                      </h3>
                      {MoodIcon && isActive && (
                        <MoodIcon
                          size={16}
                          style={{
                            color: stage.accent,
                            opacity: isCurrent ? 1 : 0.5,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      )}
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-muted)',
                        lineHeight: 'var(--leading-relaxed)',
                        margin: 0,
                        maxWidth: '480px',
                        opacity: isActive ? 1 : 0,
                        transition: 'opacity 0.4s ease 0.1s',
                      }}
                    >
                      {stage.description}
                    </p>

                    {/* Special visuals for certain stages */}
                    {stage.id === 'checks' && (
                      <div style={{ marginTop: 'var(--space-3)', opacity: isActive ? 1 : 0, transition: 'opacity 0.4s ease 0.2s' }}>
                        <CheckAnimation count={20} active={isActive} />
                      </div>
                    )}

                    {stage.id === 'experts' && (
                      <div style={{ marginTop: 'var(--space-3)', opacity: isActive ? 1 : 0, transition: 'opacity 0.4s ease 0.2s' }}>
                        <ExpertAvatars active={isActive} />
                      </div>
                    )}

                    {stage.id === 'agreement' && isActive && (
                      <div
                        style={{
                          marginTop: 'var(--space-3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          padding: '6px 14px',
                          background: 'var(--color-success-subtle)',
                          border: '1px solid var(--color-success-border)',
                          borderRadius: 'var(--radius-full)',
                          opacity: isCurrent ? 1 : 0.6,
                          transition: 'opacity 0.4s ease',
                        }}
                      >
                        <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-success)', letterSpacing: 'var(--tracking-wide)' }}>
                          9/9 CONSENSUS REACHED
                        </span>
                      </div>
                    )}

                    {stage.id === 'payout' && isActive && (
                      <div
                        style={{
                          marginTop: 'var(--space-3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          padding: '6px 14px',
                          background: 'var(--color-success-subtle)',
                          border: '1px solid var(--color-success-border)',
                          borderRadius: 'var(--radius-full)',
                          opacity: isCurrent ? 1 : 0.6,
                          transition: 'opacity 0.4s ease',
                        }}
                      >
                        <DollarSign size={12} style={{ color: 'var(--color-success)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-success)', letterSpacing: 'var(--tracking-wide)' }}>
                          PAYOUT CONFIRMED — TRUE POSITIVE
                        </span>
                      </div>
                    )}

                    {stage.id === 'dataset' && isActive && (
                      <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: '4px', opacity: isCurrent ? 1 : 0.6, transition: 'opacity 0.4s ease' }}>
                        {['Correction', 'Rubric', 'Provenance', 'Audit'].map((tag, i) => (
                          <span
                            key={tag}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              color: 'var(--color-signal)',
                              letterSpacing: 'var(--tracking-wide)',
                              padding: '3px 8px',
                              border: '1px solid var(--color-signal-border)',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--color-signal-subtle)',
                              opacity: isActive ? 1 : 0,
                              transition: `opacity 0.3s ease ${i * 0.1}s`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {stage.id === 'impact' && isCurrent && (
                      <div
                        style={{
                          marginTop: 'var(--space-4)',
                          padding: 'var(--space-4) var(--space-5)',
                          background: 'var(--color-signal-subtle)',
                          border: '1px solid var(--color-signal-border)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'var(--space-2)',
                        }}
                      >
                        {[
                          { label: 'Flagger', result: 'Earned a payout' },
                          { label: 'Experts', result: 'Got paid for evaluation' },
                          { label: 'AI model', result: 'Got smarter' },
                          { label: 'Next user', result: 'Gets a better answer' },
                        ].map((item) => (
                          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <CheckCircle2 size={12} style={{ color: 'var(--color-signal)', flexShrink: 0 }} />
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                              <strong style={{ color: 'var(--color-text-primary)' }}>{item.label}:</strong> {item.result}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Step number */}
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: isCurrent ? stage.accent : 'var(--color-text-faint)',
                      letterSpacing: 'var(--tracking-wider)',
                      flexShrink: 0,
                      paddingTop: '6px',
                      transition: 'color 0.3s ease',
                      minWidth: '24px',
                      textAlign: 'right',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Replay button */}
        {activeStage >= stages.length - 1 && (
          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <button
              onClick={() => {
                setActiveStage(-1);
                setIsVisible(false);
                setTimeout(() => setIsVisible(true), 100);
              }}
              className="btn-ghost"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Replay the journey ↻
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
