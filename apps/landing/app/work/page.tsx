import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { WorkHeroAnimation } from '@/components/work-hero-animation';
import { AnimatedEarnings } from '@/components/animated-earnings';
import { WorkFeatures } from '@/components/work-features';
import { WorkHowItWorks } from '@/components/work-how-it-works';

export const metadata: Metadata = {
  title: 'RawEval Work | Expert Evaluation Workbench',
  description: 'Get paid to evaluate AI responses. Use your domain expertise to verify AI outputs, write corrections, and help build better models. Top experts earn $60–120/hr.',
};

export default function WorkPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', overflowX: 'hidden' }}>

      {/* Hero — split layout with animated workbench */}
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
            top: '-15%',
            left: '5%',
            width: '60%',
            height: '70%',
            background: 'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(255, 107, 53, 0.05), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 'var(--max-content)',
            margin: '0 auto',
            padding: '100px var(--section-x) var(--section-y)',
            position: 'relative',
          }}
          className="chat-hero-grid"
        >
          {/* Left — copy */}
          <div>
            <div className="mono-label" style={{ color: 'var(--color-signal)', marginBottom: 'var(--space-5)' }}>
              RawEval Work
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
              Your expertise has a{' '}
              <span style={{ color: 'var(--color-signal)' }}>market.</span>
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
              Get paid to evaluate AI responses in your domain. Review flagged outputs, write expert corrections, and help frontier labs train better models. Work from anywhere, on your own schedule.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-3)' }}>
              <a href="https://work.raweval.com" className="btn-primary" style={{ padding: '14px 28px', fontSize: 'var(--text-sm)' }}>
                Apply as Expert <ArrowRight size={14} />
              </a>
              <Link href="/chat" className="btn-secondary">
                Try the Chat First
              </Link>
            </div>

            {/* Domain pills */}
            <div style={{ marginTop: 'var(--space-8)' }}>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                color: 'var(--color-text-faint)',
                marginBottom: 'var(--space-3)',
              }}>
                Domains hiring now
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Medicine', 'Law', 'Engineering', 'Finance', 'Computer Science', 'Research'].map((domain) => (
                  <span
                    key={domain}
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
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — animated workbench */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <WorkHeroAnimation />
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Why experts choose RawEval</div>
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
            Built for serious evaluators
          </h2>
          <WorkFeatures />
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>How it works</div>
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
            From application to payout
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)',
            margin: '0 0 var(--space-10)',
            maxWidth: 520,
          }}>
            Our vetting process ensures only qualified experts evaluate AI outputs. Once verified, tasks flow to you automatically.
          </p>
          <WorkHowItWorks />
        </div>
      </section>

      {/* Earnings */}
      <section style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Earnings & tiers</div>
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
            Real pay for real expertise
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)',
            margin: '0 0 var(--space-10)',
            maxWidth: 520,
          }}>
            Earn based on your tier, accuracy, and task complexity. Top experts earn $4,200+ monthly.
          </p>
          <AnimatedEarnings />
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
            Put your expertise to work.
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
            Join 2,400+ verified experts earning real money by evaluating AI responses.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <a href="https://work.raweval.com" className="btn-primary" style={{ padding: '14px 36px', fontSize: 'var(--text-sm)' }}>
              Apply Now <ArrowRight size={14} />
            </a>
            <Link href="/chat" className="btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
              Or start by chatting — earn as a Contributor →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
