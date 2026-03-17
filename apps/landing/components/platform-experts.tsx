const steps = [
  {
    num: '01',
    title: 'Domain application',
    body: 'Expert applies specifying their domain — medicine, law, code, science, finance, etc. The system matches them to the queue of failed prompts in their domain.',
    tag: 'Domain-specific routing',
    tagColor: 'var(--color-text-muted)',
    tagBg: 'var(--color-bg-muted)',
  },
  {
    num: '02',
    title: 'Expert Gauntlet — 30-min live interview',
    body: 'Live screen-share interview. Domain knowledge test. Scored on depth, accuracy, and edge-case awareness. Failure at any stage ends the process. No exceptions.',
    tag: 'Biometric verified',
    tagColor: 'var(--color-info)',
    tagBg: 'var(--color-info-subtle)',
  },
  {
    num: '03',
    title: 'Tier assignment — T1, T2, T3',
    body: 'Score determines tier. T1 (PhD-level) sets the gold standard. T2 specialists score against it. T3 generalists provide the final readability and format check.',
    tag: '3-3-3 system',
    tagColor: 'var(--color-signal)',
    tagBg: 'var(--color-signal-subtle)',
  },
  {
    num: '04',
    title: 'Iron Dome — continuous session monitoring',
    body: '60-second heartbeat. Face detection. Anti-AI keystroke analysis. Copy-paste detection. Session locks instantly on any integrity violation. Every fraud signal is recorded as a data object.',
    tag: 'Zero AI contamination',
    tagColor: 'var(--color-error)',
    tagBg: 'var(--color-error-subtle)',
  },
];

export function PlatformExperts() {
  return (
    <section style={{ width: '100%', background: 'var(--color-bg-base)' }}>
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: 'var(--section-y) var(--section-x)',
        }}
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Column */}
          <div>
            {/* Platform Tag */}
            <span
              className="platform-tag"
              style={{
                background: 'var(--color-info-subtle)',
                color: 'var(--color-info)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Platform 02 — Expert Network
            </span>

            <h3
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
              Only real experts. Verified, not assumed.
            </h3>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--leading-relaxed)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Every captured failure gets matched to a domain expert — not a crowdworker
              with a browser tab open to ChatGPT. Our Expert Gauntlet is a 30-minute live
              interview with domain certification. Only vetted specialists enter the
              annotation queue. Iron Dome monitors every session in real time to ensure the
              human in the loop is actually human.
            </p>

            {/* URL Chip */}
            <span className="url-chip">
              work.raweval.com
            </span>
          </div>

          {/* Right Column — Steps */}
          <div>
            {steps.map((step) => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4) 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-faint)',
                    width: '28px',
                    flexShrink: 0,
                    paddingTop: '2px',
                  }}
                >
                  {step.num}
                </span>
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    {step.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--leading-relaxed)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    {step.body}
                  </p>
                  <span
                    className="platform-tag"
                    style={{
                      background: step.tagBg,
                      color: step.tagColor,
                    }}
                  >
                    {step.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
