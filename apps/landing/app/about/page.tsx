import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | RawEval',
  description: 'We\'re building the evaluation infrastructure layer for AI — capturing model failures, routing them to verified domain experts, and delivering audit-ready training data to frontier labs.',
};

const stats = [
  { value: '2,400+', label: 'Certified domain experts' },
  { value: '96.8%', label: 'Evaluation accuracy rate' },
  { value: '45+', label: 'Countries represented' },
  { value: '47K+', label: 'Evaluations shipped' },
];

const timeline = [
  {
    period: 'Q3 2024',
    title: 'Founded',
    body: 'RawEval started with a question: why does the AI industry spend $2B/year on training data that nobody verifies? We began building the answer.',
  },
  {
    period: 'Q4 2024',
    title: 'First 400 experts verified',
    body: 'Before writing a single line of platform code, we spent four months building the expert network. Cold-emailing physicians, verifying law degrees, running domain assessments.',
  },
  {
    period: 'Q1 2025',
    title: 'Platform launch + first customers',
    body: 'Launched the capture layer, expert workbench, and delivery pipeline. First paying lab customer within 3 weeks of launch.',
  },
  {
    period: 'Q2 2025',
    title: 'Iron Dome deployed',
    body: 'Shipped our anti-cheat system — keystroke dynamics, behavioral biometrics, and content analysis. Detected AI contamination in 29% of annotations on day one.',
  },
  {
    period: 'Q3 2025',
    title: '2,400 experts, 45 countries',
    body: 'Expert network crossed 2,400 verified professionals across medicine, law, engineering, finance, and research. 89% retention rate.',
  },
  {
    period: '2026',
    title: 'Scaling to 10,000 experts',
    body: 'Building the neutral infrastructure standard for AI evaluation. Pursuing SOC 2 certification, EU AI Act compliance, and enterprise lab partnerships.',
  },
];

const principles = [
  {
    number: '01',
    title: 'Truth above all',
    body: 'Data quality isn\'t a feature — it\'s the product. We reject annotations that don\'t meet the bar, even when it slows throughput. Every data point that leaves our pipeline carries proof of its provenance.',
  },
  {
    number: '02',
    title: 'Human-centric AI',
    body: 'AI gets better when verified humans tell it where it\'s wrong. Not crowdworkers clicking buttons — domain experts applying judgment. The human in the loop must be real, qualified, and compensated fairly.',
  },
  {
    number: '03',
    title: 'Neutral infrastructure',
    body: 'We don\'t build models. We don\'t compete with our customers. We\'re the neutral layer that every lab can trust with their most sensitive evaluation data, regardless of who else uses our infrastructure.',
  },
  {
    number: '04',
    title: 'Meritocracy of expertise',
    body: 'Experts are tiered on performance, not credentials alone. A physician who produces consistently excellent evaluations earns more than one who coasts on their degree. Quality is rewarded, speed is not.',
  },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'var(--section-y)' }}>

      {/* Hero */}
      <section style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--section-y)' }}>
        <div style={{ maxWidth: 720 }}>
          <div className="eyebrow"><span className="eyebrow-text">About RawEval</span></div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-tight)',
            fontWeight: 400,
            margin: '0 0 var(--space-6)',
          }}>
            We&apos;re building the evaluation infrastructure layer for AI.
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            margin: '0 0 var(--space-3)',
          }}>
            Every frontier AI lab needs verified human judgment to improve their models. But today, 30–50% of &quot;human&quot; annotations are AI-generated, provenance trails don&apos;t exist, and the dominant infrastructure provider has picked a side.
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            margin: 0,
          }}>
            RawEval is the neutral, end-to-end pipeline that fixes this — capturing AI failures, routing them to verified domain experts, and delivering audit-ready training data with full provenance.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-10) var(--section-x)' }}>
          <div style={{ display: 'grid', gap: 'var(--space-6)' }} className="stats-grid">
            {stats.map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '40px', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-1)' }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The problem we solve */}
      <section>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-10)' }}>Why we exist</div>
          <div className="grid-cols-2-lg" style={{ gap: 'var(--space-12)' }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-3xl)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-tight)',
                fontWeight: 400,
                margin: '0 0 var(--space-5)',
              }}>
                AI models fail millions of times per day. Those failures vanish.
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                margin: '0 0 var(--space-4)',
              }}>
                Every failed AI interaction — a hallucinated medical answer, a buggy code suggestion, a harmful recommendation — is a training signal. But today, those signals disappear. No capture infrastructure exists.
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                margin: 0,
              }}>
                The few labs that do collect human feedback face a worse problem: the humans are fake. Crowdworkers use AI to annotate AI training data, creating a recursive contamination loop that degrades model quality with every generation.
              </p>
            </div>
            <div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                margin: '0 0 var(--space-4)',
              }}>
                We built RawEval to solve all three layers of this problem:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[
                  { step: '01', label: 'Capture', body: 'Our chat interface and API detect when AI models fail, preserving the full context as structured evaluation tasks.' },
                  { step: '02', label: 'Verify', body: 'A network of 2,400+ credentialed experts evaluates each failure. Our Iron Dome anti-cheat system ensures every evaluation is genuinely human.' },
                  { step: '03', label: 'Deliver', body: 'Verified evaluations are packaged with full provenance metadata and delivered in RLHF-ready formats — preference pairs, SFT datasets, rubric scores.' },
                ].map((s) => (
                  <div key={s.step} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', flexShrink: 0, paddingTop: '3px', width: 24 }}>{s.step}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>{s.label}</div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="eyebrow"><span className="eyebrow-text">Principles</span></div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-tight)',
            fontWeight: 400,
            marginBottom: 'var(--space-12)',
          }}>
            What we believe
          </h2>
          <div className="grid-cols-2-lg" style={{ gap: 'var(--space-8)' }}>
            {principles.map((p) => (
              <div key={p.number} style={{
                paddingTop: 'var(--space-5)',
                borderTop: '1px solid var(--color-border)',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)', marginBottom: 'var(--space-3)' }}>{p.number}</div>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-3)' }}>{p.title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-10)' }}>Our journey</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {timeline.map((t, i) => (
              <div
                key={t.period}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  gap: 'var(--space-6)',
                  paddingTop: 'var(--space-6)',
                  paddingBottom: 'var(--space-6)',
                  borderTop: i === 0 ? '2px solid var(--color-signal)' : '1px solid var(--color-border)',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: i === timeline.length - 1 ? 'var(--color-signal)' : 'var(--color-text-faint)',
                  letterSpacing: 'var(--tracking-wide)',
                  paddingTop: '3px',
                }}>
                  {t.period}
                </div>
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-primary)',
                    fontWeight: 500,
                    margin: '0 0 var(--space-2)',
                  }}>
                    {t.title}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--leading-relaxed)',
                    margin: 0,
                    maxWidth: 560,
                  }}>
                    {t.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-text-primary)',
            fontWeight: 400,
            lineHeight: 'var(--leading-tight)',
            margin: '0 0 var(--space-5)',
          }}>
            Want to be part of this?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)',
            maxWidth: 440,
            margin: '0 auto var(--space-8)',
            lineHeight: 'var(--leading-relaxed)',
          }}>
            We&apos;re hiring engineers, operators, and business builders. Or join our expert network and start earning.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/careers" className="btn-dark">View open roles →</Link>
            <Link href="/experts" className="btn-secondary">Join as an expert →</Link>
            <Link href="/contact" className="btn-secondary">Get in touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
