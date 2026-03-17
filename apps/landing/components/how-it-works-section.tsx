import Link from 'next/link';
import { MessageSquareWarning, UserCheck, Zap } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MessageSquareWarning,
    title: 'Capture',
    description: 'Users chat with AI models across providers. When responses fail, they flag them with one click.',
  },
  {
    number: '02',
    icon: UserCheck,
    title: 'Verify',
    description: '2,400+ verified domain experts evaluate failures through structured rubrics and correction workflows.',
  },
  {
    number: '03',
    icon: Zap,
    title: 'Deliver',
    description: 'Clean, provenance-rich RLHF data delivered via API or batch export. Every data point traced to its source.',
  },
];

export function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      style={{
        width: '100%',
        background: 'var(--color-bg-base)',
        borderTop: '1px solid var(--color-border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: 'var(--section-y) var(--section-x)',
        }}
      >
        {/* Section header */}
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
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
            }}
          >
            Three steps to production-grade data
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid-cols-3-md" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="card-surface hover-lift"
                style={{
                  padding: 'var(--space-8)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-5)',
                }}
              >
                {/* Number + Icon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-signal)',
                      letterSpacing: 'var(--tracking-wide)',
                      fontWeight: 500,
                    }}
                  >
                    {step.number}
                  </span>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-signal-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} style={{ color: 'var(--color-signal)' }} />
                  </div>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-text-primary)',
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--leading-relaxed)',
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Secondary CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/how-it-works/capture"
            className="btn-ghost"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            See the full pipeline →
          </Link>
        </div>
      </div>
    </section>
  );
}
