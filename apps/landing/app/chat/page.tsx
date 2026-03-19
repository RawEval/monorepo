import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ChatHeroAnimation } from '@/components/chat-hero-animation';
import { AnimatedFeatures } from '@/components/animated-features';
import { AnimatedLevels } from '@/components/animated-levels';
import { AnimatedSteps } from '@/components/animated-steps';

export const metadata: Metadata = {
  title: 'RawEval Chat | Talk to AI, Earn by Helping',
  description: 'Chat with top AI models for free. When you spot something wrong, flag it and earn rewards. Level up, unlock perks, and help build better AI.',
};

export default function ChatPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* Hero — split layout with animated chat */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Background glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-20%',
            right: '10%',
            width: '50%',
            height: '80%',
            background: 'radial-gradient(ellipse 70% 60% at 60% 30%, rgba(255, 107, 53, 0.06), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 'var(--max-content)',
            margin: '0 auto',
            padding: '100px var(--section-x) var(--section-y)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-12)',
            alignItems: 'center',
            position: 'relative',
          }}
          className="chat-hero-grid"
        >
          {/* Left — copy */}
          <div>
            <div className="mono-label" style={{ color: 'var(--color-signal)', marginBottom: 'var(--space-5)' }}>
              RawEval Chat
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-4xl)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-tight)',
                fontWeight: 400,
                margin: '0 0 var(--space-6)',
              }}
            >
              Chat with AI.{' '}
              <span style={{ color: 'var(--color-signal)' }}>Spot mistakes.</span>{' '}
              Get paid.
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-md)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                margin: '0 0 var(--space-8)',
                maxWidth: 480,
              }}
            >
              Use the best AI models for free. When you find something wrong, flag it — and earn real rewards for helping make AI better. The more you contribute, the more you earn.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-3)' }}>
              <a href="https://chat.raweval.com" className="btn-primary" style={{ padding: '14px 28px', fontSize: 'var(--text-sm)' }}>
                Start Chatting <ArrowRight size={14} />
              </a>
              <a href="https://chat.raweval.com/signup" className="btn-secondary">
                Create Account
              </a>
            </div>

            {/* Model pills */}
            <div style={{ marginTop: 'var(--space-8)' }}>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                color: 'var(--color-text-faint)',
                marginBottom: 'var(--space-3)',
              }}>
                Models available
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['GPT-4o', 'Claude 3.5', 'DeepSeek', 'Gemini', 'Llama 3', 'Mistral'].map((model) => (
                  <span
                    key={model}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--color-text-faint)',
                      letterSpacing: 'var(--tracking-wide)',
                      padding: '3px 8px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — animated chat */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ChatHeroAnimation />
          </div>
        </div>
      </section>

      {/* Features — animated stagger reveal */}
      <section style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>What you can do</div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
              lineHeight: 'var(--leading-tight)',
              margin: '0 0 var(--space-10)',
            }}
          >
            More than just a chat — it&apos;s a way to earn
          </h2>
          <AnimatedFeatures />
        </div>
      </section>

      {/* Levels — animated progression */}
      <section style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Levels & rewards</div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
              lineHeight: 'var(--leading-tight)',
              margin: '0 0 var(--space-4)',
            }}
          >
            The more you contribute, the more you unlock
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-10)', maxWidth: 560 }}>
            Start chatting and flagging for free. As your quality score improves, you level up and earn higher rewards.
          </p>
          <AnimatedLevels />
        </div>
      </section>

      {/* How it works — animated sequence */}
      <section style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>How it works</div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
              lineHeight: 'var(--leading-tight)',
              margin: '0 0 var(--space-10)',
            }}
          >
            Simple as chatting
          </h2>
          <AnimatedSteps />
        </div>
      </section>

      {/* Social proof strip */}
      <section style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-10) var(--section-x)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-12)',
            flexWrap: 'wrap',
          }}>
            {[
              { value: '47,000+', label: 'Flags processed' },
              { value: '96.8%', label: 'Accuracy rate' },
              { value: '$50–200+', label: '/hr top earners' },
              { value: '6+', label: 'AI models available' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xl)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 400,
                  lineHeight: 'var(--leading-tight)',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--color-text-faint)',
                  letterSpacing: 'var(--tracking-wide)',
                  marginTop: 4,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div
          style={{
            maxWidth: 'var(--max-content)',
            margin: '0 auto',
            padding: 'var(--space-24) var(--section-x)',
            textAlign: 'center' as const,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
              lineHeight: 'var(--leading-tight)',
              margin: '0 0 var(--space-5)',
            }}
          >
            Start chatting, start earning.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)',
              maxWidth: 440,
              margin: '0 auto var(--space-8)',
            }}
          >
            Free to use. Earn rewards from your first valid flag.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <a href="https://chat.raweval.com" className="btn-primary" style={{ padding: '14px 36px', fontSize: 'var(--text-sm)' }}>
              Open Chat <ArrowRight size={14} />
            </a>
            <Link href="/work" className="btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
              Want to earn more? Join as an Expert →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
