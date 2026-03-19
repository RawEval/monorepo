'use client';

import { useState, useEffect, useRef } from 'react';
import { Flag, Check, DollarSign, Bot, User, Sparkles } from 'lucide-react';
import { useScrollReveal, useTypewriter } from '@/lib/use-animation';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  delay: number;
}

const chatScript: ChatMessage[] = [
  { role: 'user', text: 'What year was penicillin discovered?', delay: 0 },
  { role: 'ai', text: 'Penicillin was discovered in 1945 by Alexander Fleming at St. Mary\'s Hospital in London.', delay: 1200 },
];

const correctedYear = '1928';

type AnimationPhase = 'idle' | 'user-typing' | 'user-sent' | 'ai-typing' | 'ai-sent' | 'flagging' | 'flagged' | 'rewarded';

export function ChatHeroAnimation() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [, setVisibleMessages] = useState<number[]>([]);
  const [, setFlagProgress] = useState(0);
  const [rewardVisible, setRewardVisible] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const timerRefs = useRef<NodeJS.Timeout[]>([]);

  const userMessage = useTypewriter(chatScript[0]!.text, {
    charDelayMs: 35,
    trigger: phase === 'user-typing',
  });

  const aiMessage = useTypewriter(chatScript[1]!.text, {
    charDelayMs: 25,
    trigger: phase === 'ai-typing',
  });

  // Clear timers on unmount
  useEffect(() => {
    return () => timerRefs.current.forEach(clearTimeout);
  }, []);

  // Drive the animation sequence
  useEffect(() => {
    if (!isVisible) return;

    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];

    setPhase('idle');
    setVisibleMessages([]);
    setFlagProgress(0);
    setRewardVisible(false);

    const t = (fn: () => void, ms: number) => {
      const timer = setTimeout(fn, ms);
      timerRefs.current.push(timer);
      return timer;
    };

    t(() => setPhase('user-typing'), 600);
    t(() => {
      setPhase('user-sent');
      setVisibleMessages([0]);
    }, 2400);
    t(() => setPhase('ai-typing'), 3200);
    t(() => {
      setPhase('ai-sent');
      setVisibleMessages([0, 1]);
    }, 6000);
    t(() => setPhase('flagging'), 7500);
    t(() => setFlagProgress(0.3), 7800);
    t(() => setFlagProgress(0.6), 8100);
    t(() => setFlagProgress(1), 8400);
    t(() => setPhase('flagged'), 8800);
    t(() => {
      setPhase('rewarded');
      setRewardVisible(true);
    }, 10200);
  }, [isVisible, replayCount]);

  const showCursor = phase === 'ai-typing' && !aiMessage.isComplete;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', maxWidth: 520 }}>
      {/* Chat window frame */}
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
            chat.raweval.com
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Bot size={12} style={{ color: 'var(--color-signal)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)' }}>
              GPT-4o
            </span>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ padding: '20px 16px', minHeight: 240, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* User message */}
          {(phase !== 'idle') && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              opacity: phase === 'user-typing' ? 0.8 : 1,
              animation: 'fade-up 0.3s ease-out',
            }}>
              <div
                style={{
                  background: 'var(--color-bg-inverse)',
                  color: 'var(--color-text-inverse)',
                  padding: '10px 14px',
                  borderRadius: '16px 16px 4px 16px',
                  maxWidth: '80%',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--leading-relaxed)',
                }}
              >
                {phase === 'user-typing' ? (
                  <>{userMessage.displayText}{userMessage.cursorVisible && <span style={{ color: 'var(--color-text-inverse)', opacity: 0.5 }}>|</span>}</>
                ) : (
                  chatScript[0]!.text
                )}
              </div>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--color-bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                alignSelf: 'flex-end',
              }}>
                <User size={14} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            </div>
          )}

          {/* AI message */}
          {(phase === 'ai-typing' || phase === 'ai-sent' || phase === 'flagging' || phase === 'flagged' || phase === 'rewarded') && (
            <div style={{
              display: 'flex',
              gap: 8,
              animation: 'fade-up 0.3s ease-out',
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--color-signal-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                alignSelf: 'flex-end',
              }}>
                <Sparkles size={14} style={{ color: 'var(--color-signal)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    background: 'var(--color-bg-muted)',
                    color: 'var(--color-text-secondary)',
                    padding: '10px 14px',
                    borderRadius: '16px 16px 16px 4px',
                    maxWidth: '85%',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--leading-relaxed)',
                    borderLeft: phase === 'flagged' || phase === 'rewarded' ? '3px solid var(--color-signal)' : 'none',
                    transition: 'border-left 0.3s ease',
                  }}
                >
                  {phase === 'ai-typing' ? (
                    <>
                      {aiMessage.displayText}
                      {showCursor && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: 2,
                            height: 14,
                            background: 'var(--color-signal)',
                            marginLeft: 2,
                            verticalAlign: 'text-bottom',
                            animation: 'cursor-blink 1s step-end infinite',
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      Penicillin was discovered in{' '}
                      {phase === 'flagged' || phase === 'rewarded' ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: 'var(--color-error)', opacity: 0.7 }}>1945</span>
                          {' '}
                          <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>{correctedYear}</span>
                        </>
                      ) : (
                        <span style={{
                          background: phase === 'flagging' ? 'var(--color-error-subtle)' : 'transparent',
                          color: phase === 'flagging' ? 'var(--color-error)' : 'inherit',
                          padding: phase === 'flagging' ? '1px 4px' : 0,
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                        }}>1945</span>
                      )}
                      {' '}by Alexander Fleming at St. Mary&apos;s Hospital in London.
                    </>
                  )}
                </div>

                {/* Flag button row */}
                {(phase === 'ai-sent' || phase === 'flagging' || phase === 'flagged' || phase === 'rewarded') && (
                  <div style={{
                    display: 'flex',
                    gap: 6,
                    marginTop: 6,
                    animation: 'fade-up 0.2s ease-out',
                  }}>
                    <button
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${phase === 'flagging' || phase === 'flagged' || phase === 'rewarded' ? 'var(--color-signal-border)' : 'var(--color-border)'}`,
                        background: phase === 'flagging' || phase === 'flagged' || phase === 'rewarded' ? 'var(--color-signal-subtle)' : 'transparent',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: phase === 'flagging' || phase === 'flagged' || phase === 'rewarded' ? 'var(--color-signal)' : 'var(--color-text-faint)',
                        letterSpacing: 'var(--tracking-wide)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Flag size={10} />
                      {phase === 'flagged' || phase === 'rewarded' ? 'FLAGGED' : 'FLAG'}
                    </button>
                  </div>
                )}

                {/* Flag detail bar */}
                {(phase === 'flagged' || phase === 'rewarded') && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: '8px 12px',
                      background: 'var(--color-signal-subtle)',
                      border: '1px solid var(--color-signal-border)',
                      borderRadius: 'var(--radius-md)',
                      animation: 'fade-up 0.3s ease-out',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Flag size={10} style={{ color: 'var(--color-signal)' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)' }}>
                        FACTUAL ERROR
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                      Wrong year — penicillin was discovered in 1928, not 1945.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thinking dots when AI is about to respond */}
          {phase === 'user-sent' && (
            <div style={{ display: 'flex', gap: 8, animation: 'fade-up 0.3s ease-out' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--color-signal-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, alignSelf: 'flex-end',
              }}>
                <Sparkles size={14} style={{ color: 'var(--color-signal)' }} />
              </div>
              <div style={{
                background: 'var(--color-bg-muted)',
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                display: 'flex',
                gap: 4,
              }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--color-text-faint)',
                      animation: `thinking-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reward toast */}
        {rewardVisible && (
          <div
            style={{
              margin: '0 16px 16px',
              padding: '10px 14px',
              background: 'var(--color-success-subtle)',
              border: '1px solid var(--color-success-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              animation: 'reward-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <DollarSign size={14} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-success)', letterSpacing: 'var(--tracking-wide)', marginBottom: 2 }}>
                REWARD EARNED
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                +$0.75 for catching a factual error
              </div>
            </div>
            <Check size={16} style={{ color: 'var(--color-success)', marginLeft: 'auto' }} />
          </div>
        )}
      </div>

      {/* Replay button */}
      {phase === 'rewarded' && (
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
