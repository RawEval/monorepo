export function PipelineHeader() {
  return (
    <section
      id="how-it-works"
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
        <div className="eyebrow"><span className="eyebrow-text">The Full Pipeline</span></div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
            fontWeight: 400,
            marginBottom: 'var(--space-4)',
          }}
        >
          From failed prompt to gold-standard training data
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--color-text-secondary)',
            maxWidth: 'var(--max-prose)',
          }}
        >
          Three platforms. One continuous pipeline. Every step connected — from the moment
          a user flags a bad AI answer to the moment a frontier lab receives a verified,
          provenance-rich training sample.
        </p>
      </div>
    </section>
  );
}
