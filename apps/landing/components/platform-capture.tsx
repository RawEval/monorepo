const features = [
  {
    title: 'Real-time failure capture',
    body: 'Every interaction is monitored. When a response is wrong, slow, hallucinated, or incomplete — the system captures the full session object with metadata, provider context, and model version.',
  },
  {
    title: 'User bounty system',
    body: 'Users earn payouts for flagging genuinely bad responses. This creates a self-sustaining incentive loop — better flags, more data, higher quality signal for labs.',
  },
  {
    title: 'Multimodal + attachment support',
    body: 'Text, images, documents — any interaction type is captured. Failed multi-step reasoning, image misidentification, document misreading — all become structured training candidates.',
  },
];

const qcRows = [
  { status: 'pass', claim: 'Capital city factual claim — verifiable', result: 'Confirmed error · queued' },
  { status: 'pass', claim: 'Timezone claim — secondary error', result: 'Partially correct · flagged for review' },
  { status: 'filtered', claim: 'Opinion / preference claims', result: 'Not a factual failure · dropped' },
];

export function PlatformCapture() {
  return (
    <section style={{ width: '100%', background: 'var(--color-bg-base)' }}>
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
            background: 'var(--color-signal-subtle)',
            color: 'var(--color-signal)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Platform 01 — Capture
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
          We catch the failures before they disappear
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
          chat.raweval.com is a multimodal AI assistant built to do two things simultaneously:
          give users a genuinely useful AI experience, and capture every moment the model gets
          it wrong. Users flag failed responses, earn payouts for quality flags, and in doing so
          generate the most valuable data source in AI training — real failure cases from real users.
        </p>

        {/* URL Chip */}
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
          chat.raweval.com
        </span>

        {/* Feature List */}
        <div
          style={{
            display: 'grid',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)',
          }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                transition: 'border-color 0.15s ease',
              }}
            >
              <h4
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-medium)' as unknown as number,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {feature.title}
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--leading-relaxed)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {feature.body}
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
          <div
            style={{
              background: 'var(--color-bg-muted)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: '#e74c3c' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: '#f39c12' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: '#27ae60' }} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--color-text-faint)',
                marginLeft: 'var(--space-2)',
              }}
            >
              chat.raweval.com
            </span>
          </div>

          {/* Mockup Body */}
          <div style={{ padding: 'var(--space-5)' }}>
            {/* User Message */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
              <div
                style={{
                  background: 'var(--color-bg-inverse)',
                  color: 'var(--color-text-inverse)',
                  borderRadius: '10px 10px 2px 10px',
                  padding: '10px 14px',
                  fontSize: 'var(--text-sm)',
                  maxWidth: '80%',
                }}
              >
                What is the capital of Australia? And what timezone does it use?
              </div>
            </div>

            {/* AI Response (flagged) */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 'var(--space-3)' }}>
              <div
                style={{
                  background: 'var(--color-bg-surface)',
                  color: 'var(--color-text-secondary)',
                  borderRadius: '10px 10px 10px 2px',
                  padding: '10px 14px',
                  fontSize: 'var(--text-sm)',
                  maxWidth: '80%',
                  border: '1px solid var(--color-signal-border)',
                  borderLeft: '3px solid var(--color-signal)',
                }}
              >
                The capital of Australia is Sydney. It is located in the Eastern timezone (AEST, UTC+10)...
              </div>
            </div>

            {/* Flag Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-4)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-signal-subtle)',
                border: '1px solid var(--color-signal-border)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-6)',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                This response contains a factual error. The capital is Canberra, not Sydney.
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: 'var(--tracking-wide)',
                  padding: '6px 14px',
                  background: 'var(--color-signal)',
                  color: 'var(--color-text-inverse)',
                  borderRadius: 'var(--radius-sm)',
                  whiteSpace: 'nowrap',
                }}
              >
                Flag as incorrect →
              </span>
            </div>

            {/* QC Layer */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                QC Layer — False Positive Screening
              </div>

              {qcRows.map((row) => (
                <div
                  key={row.claim}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-2) 0',
                    borderBottom: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 500,
                      color: row.status === 'pass' ? 'var(--color-success)' : 'var(--color-error)',
                    }}
                  >
                    {row.status === 'pass' ? '✓ PASS' : '✗ FILTERED'}
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)', flex: 1, minWidth: '140px' }}>
                    {row.claim}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)' }}>
                    {row.result}
                  </span>
                </div>
              ))}

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--color-text-faint)',
                  marginTop: 'var(--space-3)',
                }}
              >
                → 2 of 3 claims verified · prompt queued for expert annotation
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
