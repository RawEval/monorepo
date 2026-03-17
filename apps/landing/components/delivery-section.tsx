const buyers = [
  'Series B–D AI teams building RLHF pipelines',
  'Healthcare / legal / finance AI needing EU compliance',
  'Frontier labs post-Scale AI conflict',
];

const codeSnippet = `{
  "prompt_id": "fail_0x7f3ac9",
  "original_response": "Sydney is the capital...",
  "corrected_response": "Canberra is the capital...",
  "rubric_scores": {
    "accuracy": 9.8,
    "completeness": 9.1
  },
  "annotator_tier": "T1",
  "correction_trail": [...],
  "eu_ai_act_artifact": "audit_847.json",
  "improvement_delta": +8.3
}`;

export function DeliverySection() {
  return (
    <section style={{ width: '100%', background: 'var(--color-bg-inverse)' }}>
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: 'var(--section-y) var(--section-x)',
        }}
      >
        {/* Eyebrow */}
        <div className="eyebrow-inverse"><span className="eyebrow-text">Delivery</span></div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-inverse)',
            fontWeight: 400,
            marginBottom: 'var(--space-4)',
          }}
        >
          We sell the gold. Labs buy better models.
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--color-text-inverse-muted)',
            maxWidth: 'var(--max-prose)',
            marginBottom: 'var(--space-12)',
          }}
        >
          Every verified, annotated, rubric-scored sample ships via REST API as a JSONL
          object with full provenance metadata. Labs get not just the training data — they
          get the audit trail, the correction history, and the improvement delta. Exactly
          what the EU AI Act requires. Exactly what your legal team will stop asking about.
        </p>

        <div style={{ display: 'grid', gap: 'var(--space-8)' }} className="grid-cols-1 lg:grid-cols-2">
          {/* Col 1: Who buys */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--color-text-inverse-muted)', marginBottom: 'var(--space-6)' }}>
              Series B–D AI-native product companies building fine-tuning pipelines.
              Eventually frontier labs — OpenAI, Anthropic, Google DeepMind — once we have
              proven delivery and neutral infrastructure credibility.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {buyers.map((buyer) => (
                <div
                  key={buyer}
                  style={{
                    background: 'rgba(245,242,236,0.04)',
                    border: '1px solid var(--color-border-inverse)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '10px 14px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-inverse-muted)',
                  }}
                >
                  {buyer}
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Code block */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse-muted)', marginBottom: 'var(--space-3)' }}>
              Each 500-prompt batch arrives as a JSONL package with full provenance on every sample.
            </p>
            <div
              style={{
                background: 'rgba(245,242,236,0.04)',
                border: '1px solid rgba(245,242,236,0.08)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4) var(--space-5)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                lineHeight: 'var(--leading-relaxed)',
                color: 'rgba(245,242,236,0.65)',
                overflow: 'auto',
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{codeSnippet}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
