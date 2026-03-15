const features = [
  {
    title: 'Rubric-based scoring',
    body: 'Each prompt is scored on factual accuracy, completeness, tone, and structure. T1 experts define the rubric. T2 and T3 score against it. IAA (Inter-Annotator Agreement) engine ensures statistical consensus before a sample is marked complete.',
  },
  {
    title: 'Correction + dispute trail',
    body: 'Every edit is tracked. Every disagreement between tiers is flagged and arbitrated. The full correction trail ships with the final data — labs see exactly how a sample evolved from failure to gold.',
  },
  {
    title: 'Measurable model improvement',
    body: 'We track accuracy before and after annotation. Labs receive not just corrected data — they receive the improvement delta, proving the data made the model better.',
  },
];

const rubricRows = [
  { label: 'Factual accuracy', score: 1.5, pct: 15 },
  { label: 'Completeness', score: 6.0, pct: 60 },
  { label: 'Confidence calibration', score: 2.0, pct: 20 },
  { label: 'Format & clarity', score: 7.5, pct: 75 },
];

function getBarColor(pct: number) {
  if (pct < 40) return 'var(--color-error)';
  if (pct < 70) return 'var(--color-warning)';
  return 'var(--color-success)';
}

export function PlatformWorkbench() {
  return (
    <section style={{ width: '100%', background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: 'var(--section-y) var(--section-x)',
        }}
      >
        {/* Platform Tag */}
        <span
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-success-subtle)',
            color: 'var(--color-success)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Platform 03 — Workbench
        </span>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
            fontWeight: 'var(--weight-normal)' as unknown as number,
            marginBottom: 'var(--space-4)',
          }}
        >
          Experts fix the failures. We measure the delta.
        </h3>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--color-text-secondary)',
            maxWidth: 'var(--max-prose)',
            marginBottom: 'var(--space-4)',
          }}
        >
          The Workbench is where the real work happens. Nine experts — 3 tiers — review every
          failed prompt batch. They don&apos;t just flag errors; they build rubrics, write
          corrections, and score every dimension of quality. The output isn&apos;t an annotation.
          It&apos;s a measurable improvement with a full audit trail attached.
        </p>

        <span
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: 'var(--tracking-wide)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-bg-muted)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-8)',
          }}
        >
          workbench.raweval.com
        </span>

        {/* Feature List */}
        <div
          style={{ display: 'grid', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
              }}
            >
              <h4 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-medium)' as unknown as number, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                {f.title}
              </h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', color: 'var(--color-text-secondary)' }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>

        {/* Mockup Frame */}
        <div
          style={{
            background: 'var(--color-bg-base)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Browser Bar */}
          <div style={{ background: 'var(--color-bg-muted)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: '#e74c3c' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: '#f39c12' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: '#27ae60' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', marginLeft: 'var(--space-2)' }}>
              workbench.raweval.com — Expert #T1-047 · Geography Domain
            </span>
          </div>

          <div style={{ padding: 'var(--space-5)' }}>
            {/* Failed Prompt Panel */}
            <div
              style={{
                borderLeft: '3px solid var(--color-signal)',
                paddingLeft: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-signal)', display: 'block', marginBottom: 'var(--space-2)' }}>
                Failed prompt · Flagged by user
              </span>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                Model said: &ldquo;The capital of Australia is Sydney...&rdquo; <span style={{ color: 'var(--color-error)' }}>| Error: Capital is Canberra (ACT).</span>
              </p>
            </div>

            {/* Rubric Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {rubricRows.map((row) => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', width: '180px', flexShrink: 0 }}>
                    {row.label}
                  </span>
                  <div style={{ flex: 2, height: '4px', background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${row.pct}%`, background: getBarColor(row.pct), borderRadius: 'var(--radius-full)', transition: 'width 0.3s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-muted)', width: '50px', textAlign: 'right' }}>
                    {row.score} / 10
                  </span>
                </div>
              ))}
            </div>

            {/* Improvement Delta */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: '10px 14px',
                background: 'var(--color-success-subtle)',
                border: '1px solid var(--color-success-border)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ color: 'var(--color-error)' }}>Before: 1.5/10</span>
              <span style={{ color: 'var(--color-text-faint)' }}>→</span>
              <span style={{ fontWeight: 'var(--weight-medium)' as unknown as number, color: 'var(--color-success)' }}>After correction → 9.8/10</span>
              <span style={{ color: 'var(--color-text-faint)' }}>·</span>
              <span style={{ color: 'var(--color-success)' }}>+8.3 point improvement · sample approved for delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
