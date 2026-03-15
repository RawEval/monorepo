export function WhoWeServeSection() {
  return (
    <section style={{ width: '100%', background: 'var(--color-bg-base)', borderTop: '1px solid var(--color-border)' }}>
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: 'var(--section-y) var(--section-x)',
        }}
      >
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-4)' }}>
          <span style={{ display: 'block', width: '20px', height: '1px', background: 'var(--color-signal)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-signal)' }}>
            Who We Serve
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
            fontWeight: 'var(--weight-normal)' as unknown as number,
            marginBottom: 'var(--space-12)',
          }}
        >
          The buyers who need this most urgently
        </h2>

        <div style={{ display: 'grid', gap: 'var(--space-6)' }} className="grid-cols-1 md:grid-cols-2">
          {/* Card 1 — Featured */}
          <div
            style={{
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-signal-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                alignSelf: 'flex-start',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-signal-subtle)',
                color: 'var(--color-signal)',
              }}
            >
              Entry wedge · Now
            </span>

            <div>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)' as unknown as number, color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
                Head of Data / ML Infra
              </h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Series B–D AI-native product companies
              </span>
            </div>

            <blockquote
              style={{
                borderLeft: '3px solid var(--color-signal)',
                paddingLeft: 'var(--space-4)',
                margin: 0,
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--leading-relaxed)',
                color: 'var(--color-text-secondary)',
                fontStyle: 'italic',
              }}
            >
              Building fine-tuning and RLHF pipelines with no data infrastructure. Stitching
              together Surge, contractors, and spreadsheets. Gets blamed personally when model
              quality regresses after a training run.
            </blockquote>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                alignSelf: 'flex-start',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-info-subtle)',
                color: 'var(--color-info)',
              }}
            >
              Scale · Month 18+
            </span>

            <div>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)' as unknown as number, color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
                Enterprise AI / LLM Platform Lead
              </h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Financial services, healthcare, legal AI teams
              </span>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--leading-relaxed)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Deploying LLMs on regulated, sensitive domains. Regulators require full auditable
              provenance for every training input. Existing vendors cannot produce EU AI
              Act-compliant artifacts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
