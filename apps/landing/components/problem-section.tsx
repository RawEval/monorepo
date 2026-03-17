const problems = [
  {
    num: '01',
    label: 'The failure vanishes',
    title: 'Failures are the most valuable signal. Nobody captures them.',
    body: 'Every time a user asks an AI something and gets a wrong, hallucinated, or unhelpful answer — that interaction disappears. No lab receives it. No training signal is created. It happened millions of times today. Those failures are exactly what the next model needs to learn from.',
    tag: 'This is what we fix first',
  },
  {
    num: '02',
    label: 'The humans are fake',
    title: 'Crowdworkers are using the AI to annotate the AI.',
    body: "Labs pay platforms to have humans annotate training data. But those annotators are using ChatGPT to complete the work. There is no keystroke monitoring, no fraud detection, no way to know if the 'human feedback' loop has been quietly replaced by the exact model it's supposed to improve.",
    tag: 'This is what Iron Dome fixes',
  },
  {
    num: '03',
    label: 'The data is unauditable',
    title: 'Regulators are arriving. Labs have no provenance trail.',
    body: 'The EU AI Act mandates full provenance on every training input — effective 2025. Labs currently have no infrastructure to produce a compliant audit artifact. Every sample in their training sets might as well be anonymous.',
    tag: 'This is what our delivery layer fixes',
  },
];

export function ProblemSection() {
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
        <div className="eyebrow-inverse"><span className="eyebrow-text">The Problem</span></div>

        {/* H2 */}
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
          Three things are broken in AI training right now
        </h2>

        {/* Lead */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--color-text-inverse-muted)',
            maxWidth: '520px',
            marginBottom: 'var(--space-12)',
          }}
        >
          AI labs spend hundreds of millions improving their models. But the infrastructure
          beneath the data — how it&apos;s captured, who validates it, and whether it can be
          audited — simply doesn&apos;t exist.
        </p>

        {/* Problem Cards */}
        <div
          style={{
            display: 'grid',
            gap: '1px',
          }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {problems.map((problem) => (
            <div
              key={problem.num}
              style={{
                background: 'rgba(245, 242, 236, 0.04)',
                border: '1px solid var(--color-border-inverse)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                transition: 'border-color 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              {/* Label */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-inverse-faint)',
                }}
              >
                {problem.num} — {problem.label}
              </span>

              {/* Title */}
              <h3
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-md)',
                  fontWeight: 500,
                  lineHeight: 'var(--leading-snug)',
                  color: 'var(--color-text-inverse)',
                }}
              >
                {problem.title}
              </h3>

              {/* Body */}
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--leading-relaxed)',
                  color: 'var(--color-text-inverse-muted)',
                  flex: 1,
                }}
              >
                {problem.body}
              </p>

              {/* Tag */}
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
                  background: 'var(--color-signal-subtle)',
                  color: 'var(--color-signal-light)',
                }}
              >
                {problem.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
