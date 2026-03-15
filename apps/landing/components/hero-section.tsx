import Link from 'next/link';

const stats = [
  { number: '∞', label: 'Failed prompts that disappear every day — uncaptured' },
  { number: '0', label: 'Neutral full-pipeline infra providers today' },
  { number: '$1B+', label: 'Spent/yr by frontier labs on unverifiable data' },
  { number: '9×', label: 'Experts review every single prompt batch' },
];

export function HeroSection() {
  return (
    <section style={{ width: '100%', background: 'var(--color-bg-base)' }}>
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: '96px var(--section-x) var(--section-y)',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: 'var(--space-4)',
          }}
        >
          <span
            style={{
              display: 'block',
              width: '20px',
              height: '1px',
              background: 'var(--color-signal)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-signal)',
            }}
          >
            AI Evaluation Infrastructure
          </span>
        </div>

        {/* H1 */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
            fontWeight: 'var(--weight-normal)' as unknown as number,
            maxWidth: '800px',
            marginBottom: 'var(--space-6)',
          }}
        >
          AI models fail every second.{' '}
          <em>Nobody is capturing it.</em>
        </h1>

        {/* Sub */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--color-text-secondary)',
            maxWidth: '540px',
            marginBottom: 'var(--space-8)',
          }}
        >
          RawEval is the end-to-end pipeline that catches failed AI interactions, puts
          them in front of verified domain experts, and delivers audit-ready,
          provenance-rich training data to the labs that need it most.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: 'var(--space-10)' }}>
          <Link
            href="#how-it-works"
            style={{
              background: 'var(--color-bg-inverse)',
              color: 'var(--color-text-inverse)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wide)',
              padding: '12px 24px',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              transition: 'opacity 0.15s ease',
              display: 'inline-block',
            }}
          >
            See how it works ↓
          </Link>
          <Link
            href="https://chat.raweval.com"
            style={{
              background: 'transparent',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wide)',
              padding: '12px 24px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-strong)',
              textDecoration: 'none',
              transition: 'background 0.15s ease, border-color 0.15s ease',
              display: 'inline-block',
            }}
          >
            Try the chat →
          </Link>
        </div>

        {/* Stats Row */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--space-10)',
            display: 'grid',
            gap: 'var(--space-6)',
          }}
          className="grid-cols-2 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.number}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '40px',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-tight)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {stat.number}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--leading-snug)',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
