'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  FileText,
  User,
  Clock,
  DollarSign,
  Brain,
  Shield,
  Star,
} from 'lucide-react';
import { useScrollReveal, useTypewriter } from '@/lib/use-animation';

type Phase = 'idle' | 'loading' | 'task-in' | 'reviewing' | 'rubric' | 'verdict' | 'payout';

const rubricItems = [
  { label: 'Factual accuracy', score: 2, max: 5 },
  { label: 'Completeness', score: 3, max: 5 },
  { label: 'Harmfulness', score: 5, max: 5 },
  { label: 'Relevance', score: 4, max: 5 },
];

export function WorkHeroAnimation() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const [phase, setPhase] = useState<Phase>('idle');
  const [rubricReveal, setRubricReveal] = useState<number[]>([]);
  const [replayCount, setReplayCount] = useState(0);
  const timerRefs = useRef<NodeJS.Timeout[]>([]);

  const correctionText = useTypewriter(
    'Penicillin was discovered in 1928 by Alexander Fleming. The year 1945 refers to when Fleming, Florey, and Chain received the Nobel Prize for its development.',
    { charDelayMs: 20, trigger: phase === 'reviewing' }
  );

  useEffect(() => {
    return () => timerRefs.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];

    setPhase('idle');
    setRubricReveal([]);

    const t = (fn: () => void, ms: number) => {
      const timer = setTimeout(fn, ms);
      timerRefs.current.push(timer);
    };

    t(() => setPhase('loading'), 400);
    t(() => setPhase('task-in'), 1200);
    t(() => setPhase('reviewing'), 2800);
    t(() => setPhase('rubric'), 6500);
    t(() => setRubricReveal([0]), 7000);
    t(() => setRubricReveal([0, 1]), 7400);
    t(() => setRubricReveal([0, 1, 2]), 7800);
    t(() => setRubricReveal([0, 1, 2, 3]), 8200);
    t(() => setPhase('verdict'), 9200);
    t(() => setPhase('payout'), 10800);
  }, [isVisible, replayCount]);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', maxWidth: 560 }}>
      {/* Workbench frame */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px var(--color-border)',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg-muted)',
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>
            work.raweval.com
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-success-subtle)',
              border: '1px solid var(--color-success-border)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-success)', letterSpacing: 'var(--tracking-wide)' }}>
                EXPERT
              </span>
            </div>
          </div>
        </div>

        {/* Workbench content */}
        <div style={{ padding: '20px 16px', minHeight: 320 }}>

          {/* Task loading state */}
          {phase === 'loading' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: 'var(--space-8) 0',
              animation: 'fade-in 0.3s ease-out',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '2px solid var(--color-border)',
                borderTopColor: 'var(--color-signal)',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>
                LOADING TASK...
              </span>
            </div>
          )}

          {/* Task card */}
          {(phase !== 'idle' && phase !== 'loading') && (
            <div style={{ animation: 'fade-up 0.4s ease-out' }}>
              {/* Task header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-4)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={14} style={{ color: 'var(--color-signal)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)' }}>
                    TASK #4,217
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Brain size={12} style={{ color: 'var(--color-info)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-info)', letterSpacing: 'var(--tracking-wide)' }}>
                    MEDICINE
                  </span>
                </div>
              </div>

              {/* Original response */}
              <div style={{
                padding: '12px 14px',
                background: 'var(--color-bg-muted)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-signal)',
                marginBottom: 'var(--space-4)',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)', marginBottom: 6 }}>
                  AI RESPONSE — FLAGGED
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  margin: 0,
                }}>
                  &ldquo;Penicillin was discovered in <span style={{ color: 'var(--color-error)', textDecoration: 'underline', textDecorationStyle: 'wavy' }}>1945</span> by Alexander Fleming...&rdquo;
                </p>
              </div>

              {/* Expert correction */}
              {(phase === 'reviewing' || phase === 'rubric' || phase === 'verdict' || phase === 'payout') && (
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  marginBottom: 'var(--space-4)',
                  animation: 'fade-up 0.3s ease-out',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 8,
                  }}>
                    <User size={12} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)' }}>
                      YOUR CORRECTION
                    </span>
                    {phase !== 'reviewing' && (
                      <CheckCircle2 size={12} style={{ color: 'var(--color-success)', marginLeft: 'auto' }} />
                    )}
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                    margin: 0,
                  }}>
                    {phase === 'reviewing' ? (
                      <>
                        {correctionText.displayText}
                        {correctionText.cursorVisible && !correctionText.isComplete && (
                          <span style={{
                            display: 'inline-block',
                            width: 2,
                            height: 14,
                            background: 'var(--color-signal)',
                            marginLeft: 2,
                            verticalAlign: 'text-bottom',
                            animation: 'cursor-blink 1s step-end infinite',
                          }} />
                        )}
                      </>
                    ) : (
                      'Penicillin was discovered in 1928 by Alexander Fleming. The year 1945 refers to when Fleming, Florey, and Chain received the Nobel Prize for its development.'
                    )}
                  </p>
                </div>
              )}

              {/* Rubric scoring */}
              {(phase === 'rubric' || phase === 'verdict' || phase === 'payout') && (
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-4)',
                  animation: 'fade-up 0.3s ease-out',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)', marginBottom: 10 }}>
                    RUBRIC EVALUATION
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {rubricItems.map((item, i) => {
                      const isRevealed = rubricReveal.includes(i);
                      return (
                        <div
                          key={item.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            opacity: isRevealed ? 1 : 0,
                            transform: isRevealed ? 'translateX(0)' : 'translateX(-8px)',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)', minWidth: 110 }}>
                            {item.label}
                          </span>
                          <div style={{
                            flex: 1,
                            height: 4,
                            background: 'var(--color-border)',
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${(item.score / item.max) * 100}%`,
                              height: '100%',
                              background: item.score >= 4 ? 'var(--color-success)' : item.score >= 3 ? 'var(--color-warning)' : 'var(--color-error)',
                              borderRadius: 2,
                              transition: 'width 0.5s ease',
                            }} />
                          </div>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: item.score >= 4 ? 'var(--color-success)' : item.score >= 3 ? 'var(--color-warning)' : 'var(--color-error)',
                            minWidth: 28,
                            textAlign: 'right',
                          }}>
                            {item.score}/{item.max}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Verdict */}
              {(phase === 'verdict' || phase === 'payout') && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: 'var(--color-signal-subtle)',
                    border: '1px solid var(--color-signal-border)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-3)',
                    animation: 'fade-up 0.3s ease-out',
                  }}
                >
                  <Shield size={14} style={{ color: 'var(--color-signal)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)' }}>
                    TRUE POSITIVE CONFIRMED
                  </span>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-success)', marginLeft: 'auto' }} />
                </div>
              )}
            </div>
          )}

          {/* Payout */}
          {phase === 'payout' && (
            <div
              style={{
                padding: '12px 14px',
                background: 'var(--color-success-subtle)',
                border: '1px solid var(--color-success-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                animation: 'reward-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <DollarSign size={18} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-success)', letterSpacing: 'var(--tracking-wide)' }}>
                  PAYOUT EARNED
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-text-primary)', fontWeight: 400 }}>
                  $4.50
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Star size={10} style={{ color: 'var(--color-warning)', fill: 'var(--color-warning)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-warning)' }}>+15 XP</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={10} style={{ color: 'var(--color-text-faint)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)' }}>4m 22s</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replay */}
      {phase === 'payout' && (
        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <button
            onClick={() => setReplayCount((c) => c + 1)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-faint)',
              letterSpacing: 'var(--tracking-wide)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 12px',
              transition: 'color 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-faint)')}
          >
            Replay ↻
          </button>
        </div>
      )}
    </div>
  );
}
