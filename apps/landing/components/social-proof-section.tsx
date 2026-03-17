'use client';

import { useEffect, useRef, useState } from 'react';

const metrics = [
  { display: '47,000+', numericValue: 47000, label: 'Evaluations completed' },
  { display: '2,400+', numericValue: 2400, label: 'Verified experts' },
  { display: '45', numericValue: 45, label: 'Countries represented' },
  { display: '96.8%', numericValue: 96.8, label: 'Accuracy rate' },
];

const domains = ['Medicine', 'Law', 'Engineering', 'Finance', 'Research', 'Computer Science', 'Education', 'Science'];

function AnimatedNumber({ target, suffix, isPercent }: { target: number; suffix: string; isPercent: boolean }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const start = performance.now();

          function animate(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(target * eased);
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  const formatted = isPercent
    ? value.toFixed(1)
    : Math.round(value).toLocaleString();

  return (
    <div ref={ref} style={{
      fontFamily: 'var(--font-display)',
      fontSize: '48px',
      color: 'var(--color-text-primary)',
      lineHeight: 'var(--leading-tight)',
      fontWeight: 400,
      marginBottom: 'var(--space-2)',
    }}>
      {formatted}{suffix}
    </div>
  );
}

export function SocialProofSection() {
  return (
    <section
      aria-labelledby="proof-heading"
      style={{
        width: '100%',
        background: 'var(--color-bg-subtle)',
        borderTop: '1px solid var(--color-border-subtle)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: 'var(--section-y) var(--section-x)',
        }}
      >
        {/* Metrics */}
        <div
          style={{ display: 'grid', gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}
          className="stats-grid"
        >
          {metrics.map((m) => {
            const isPercent = m.display.includes('%');
            const suffix = m.display.replace(/[\d,.]+/, '').replace('%', '');
            return (
              <div key={m.label} style={{ textAlign: 'center' }}>
                <AnimatedNumber
                  target={m.numericValue}
                  suffix={isPercent ? '%' : suffix}
                  isPercent={isPercent}
                />
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {m.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonial */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)', maxWidth: '640px', margin: '0 auto var(--space-12)' }}>
          <blockquote
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'var(--text-xl)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-snug)',
              margin: '0 0 var(--space-4)',
            }}
          >
            &ldquo;The quality of evaluation data from RawEval is a step change from what we were getting. Real experts, real corrections, full audit trail.&rdquo;
          </blockquote>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            Head of ML Infrastructure · Series B AI Company
          </p>
        </div>

        {/* Provider logos */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-text-faint)',
              marginBottom: 'var(--space-5)',
            }}
          >
            Expert domains
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            {domains.map((name) => (
              <span
                key={name}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--color-text-faint)',
                  opacity: 0.5,
                  letterSpacing: 'var(--tracking-wide)',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
