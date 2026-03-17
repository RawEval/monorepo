const cards = [
  {
    num: '01',
    title: 'The neutral slot opened overnight',
    body: 'In mid-2025, Scale AI deepened its alignment with a single hyperscaler. Every competing lab now has a primary data vendor that works for their biggest rival. The neutrality slot — infra no single lab controls — opened overnight. It has not been filled.',
    tag: 'Scale AI conflict · 2025',
    tagColor: 'var(--color-signal)',
    tagBg: 'var(--color-signal-subtle)',
  },
  {
    num: '02',
    title: 'Synthetic data is hitting a verified ceiling',
    body: 'Models trained recursively on AI-generated outputs show measurable quality collapse by generation 25 (Nature, 2024). Labs cannot scale on synthetic data alone — they need verified, traceable human signal. The regulatory floor arrived before the infrastructure.',
    tag: 'Nature, 2024 · Gen 25 collapse',
    tagColor: 'var(--color-info)',
    tagBg: 'var(--color-info-subtle)',
  },
  {
    num: '03',
    title: 'The regulatory floor arrived before the infra',
    body: 'EU AI Act mandates auditable provenance for all AI training data — effective 2025. Labs have no infrastructure to produce compliant artifacts. RawEval\'s output is exactly what compliance requires, creating a minimum viable spend floor that grows with enforcement.',
    tag: 'EU AI Act · effective 2025',
    tagColor: 'var(--color-success)',
    tagBg: 'var(--color-success-subtle)',
  },
];

export function WhyNowSection() {
  return (
    <section
      style={{
        width: '100%',
        background: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: 'var(--section-y) var(--section-x)',
        }}
      >
        {/* Eyebrow */}
        <div className="eyebrow"><span className="eyebrow-text">Why Now</span></div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
            fontWeight: 400,
            marginBottom: 'var(--space-12)',
          }}
        >
          Three structural forces. One open window.
        </h2>

        <div style={{ display: 'grid', gap: 'var(--space-6)' }} className="grid-cols-1 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.num}
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                transition: 'border-color 0.15s ease',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '48px',
                  color: 'var(--color-bg-muted)',
                  lineHeight: 1,
                }}
              >
                {card.num}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-md)',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-snug)',
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--leading-relaxed)',
                  color: 'var(--color-text-secondary)',
                  flex: 1,
                }}
              >
                {card.body}
              </p>
              <span
                style={{
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wide)',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: card.tagBg,
                  color: card.tagColor,
                }}
              >
                {card.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
