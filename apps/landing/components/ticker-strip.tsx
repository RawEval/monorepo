'use client';

const tickerItems = [
  { text: 'Every AI failure is a training signal you ', highlight: 'never captured' },
  { text: 'Crowdwork annotators are using ', highlight: 'ChatGPT to annotate' },
  { text: 'EU AI Act mandates full provenance on ', highlight: 'every training input' },
  { text: 'Model collapse measurable at ', highlight: 'generation 25 — Nature 2024' },
  { text: '', highlight: '$1B+/yr', suffix: ' spent on unauditable training data' },
];

export function TickerStrip() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        background: 'var(--color-bg-inverse)',
        overflow: 'hidden',
        padding: '10px 0',
      }}
    >
      <div className="ticker-track" style={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content' }}>
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-text-inverse-faint)',
              padding: '0 40px',
            }}
          >
            {item.text}
            <span style={{ color: 'var(--color-signal-light)', fontWeight: 500 }}>
              {item.highlight}
            </span>
            {item.suffix || ''}
          </span>
        ))}
      </div>
    </div>
  );
}
