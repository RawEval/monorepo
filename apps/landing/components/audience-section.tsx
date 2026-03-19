import Link from 'next/link';
import { Check } from 'lucide-react';

const audiences = [
  {
    title: 'For AI Labs & Enterprises',
    subtitle: 'Buy evaluation data',
    features: [
      'Buy verified evaluation data at scale',
      'Custom expert panels matched to your domain',
      'API-first delivery, RLHF-ready formats',
      'SOC 2 compliant, full data provenance',
    ],
    cta: { label: 'View Enterprise Plans →', href: '/research' },
    accent: 'var(--color-success)',
  },
  {
    title: 'For Domain Experts',
    subtitle: 'Evaluate AI, earn money',
    features: [
      'Earn $18–120 per evaluation task',
      'Work on your schedule, from anywhere',
      'AI-powered vetting ensures quality matches',
      'Transparent scoring and tier advancement',
    ],
    cta: { label: 'Join the Expert Network →', href: '/work' },
    accent: 'var(--color-signal)',
  },
];

export function AudienceSection() {
  return (
    <section
      aria-labelledby="audience-heading"
      style={{
        width: '100%',
        background: 'var(--color-bg-base)',
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
          <h2
            id="audience-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
            }}
          >
            Built for both sides of AI evaluation
          </h2>
        </div>

        {/* Cards */}
        <div className="grid-cols-2-md" style={{ gap: 'var(--space-6)' }}>
          {audiences.map((a) => (
            <div
              key={a.title}
              className="card-surface hover-glow"
              style={{
                padding: 'var(--space-10)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-6)',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                    color: a.accent,
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  {a.subtitle}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-text-primary)',
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {a.title}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', flex: 1 }}>
                {a.features.map((f) => (
                  <div key={f} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <Check
                      size={16}
                      style={{
                        color: a.accent,
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 'var(--leading-normal)',
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href={a.cta.href}
                className="btn-ghost"
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 0',
                  color: a.accent,
                }}
              >
                {a.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
