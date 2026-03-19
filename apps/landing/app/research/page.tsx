import { Metadata } from 'next';
import Link from 'next/link';



export const metadata: Metadata = {
  title: 'Enterprise | RawEval',
  description: 'AI evaluation infrastructure for teams building frontier models and enterprise AI. Custom expert panels, volume pipelines, and compliance-ready delivery.',
};

const features = [
  { label: 'Custom expert panels', body: 'We source and vet specialists in your exact domain — medical, legal, code, finance — not generalists.' },
  { label: 'Volume pipelines', body: 'From 100 to 100,000 evaluations per week. Built-in throughput guarantees and delivery SLAs.' },
  { label: 'Proprietary data handling', body: 'Enterprise-grade NDA coverage, isolated environments, and SOC 2 Type II compliance.' },
  { label: 'Training-ready output', body: 'Structured preference pairs, corrected completions, and rubric-scored evaluations. Plug directly into your training pipeline.' },
  { label: 'Dedicated quality layer', body: 'A second tier of expert reviewers audits all output before delivery. We reject before you have to.' },
  { label: 'Flexible delivery', body: 'Push results directly to your data warehouse via API and webhooks. Or download in bulk. Your pipeline, your way.' },
];

const whyRawEval = [
  { label: 'Real humans, verified', body: 'Every evaluator is credential-verified, skill-assessed, and continuously monitored. No crowdwork, no AI-generated annotations.' },
  { label: 'Full provenance', body: 'Every data point carries a complete audit trail — who evaluated it, their qualifications, quality scores, and behavioral verification status.' },
  { label: 'Neutral infrastructure', body: "We don't build models. We don't compete with you. We're the neutral layer every lab can trust with their most sensitive data." },
  { label: 'Compliance-ready', body: 'Built for EU AI Act, SOC 2, and GDPR. Every evaluation generates the documentation regulators require.' },
];

const howItWorks = [
  { step: '01', title: 'We scope your needs', body: 'Tell us your domain, volume, quality bar, and delivery format. We design a custom evaluation pipeline.' },
  { step: '02', title: 'We match experts', body: 'We assemble a panel of verified domain experts tailored to your specific use case and quality requirements.' },
  { step: '03', title: 'Evaluations run', body: 'Your data flows through our pipeline — expert evaluation, quality checks, and provenance tracking.' },
  { step: '04', title: 'Data delivered', body: 'Clean, structured evaluation data delivered on your schedule via API, webhook, or bulk download.' },
];

export default function ResearchPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'var(--section-y)' }}>

      {/* Hero */}
      <section style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--section-y)' }}>
        <div style={{ maxWidth: 680 }}>
          <div className="mono-label" style={{ color: 'var(--color-signal)', marginBottom: 'var(--space-5)' }}>Enterprise</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-6)' }}>
            Human evaluation data you can actually trust.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-8)' }}>
            RawEval gives your team a reliable supply of verified evaluation data — preference pairs, corrected completions, and rubric-scored evaluations — so you can improve your models without worrying about data quality.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-3)' }}>
            <a href="https://research.raweval.com" className="btn-primary">Browse Datasets &rarr;</a>
            <Link href="/contact" className="btn-secondary">Talk to us</Link>
            <a href="https://chat.raweval.com" className="btn-ghost">Try the chat first</a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>What you get</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-10)' }}>
            Everything you need for production-grade evaluation
          </h2>
          <div className="grid-cols-3-md">
            {features.map((f) => (
              <div key={f.label} style={{ paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', marginBottom: 'var(--space-3)', textTransform: 'uppercase' }}>&#9670;</div>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-3)' }}>{f.label}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why RawEval */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Why RawEval</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-10)' }}>
            Built for teams that take data quality seriously
          </h2>
          <div className="grid-cols-2-lg" style={{ gap: 'var(--space-6)' }}>
            {whyRawEval.map((w) => (
              <div key={w.label} className="card-surface" style={{ padding: 'var(--space-6)' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-3)' }}>{w.label}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works for enterprise */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>How it works</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-10)' }}>
            From first conversation to first delivery in weeks
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {howItWorks.map((s) => (
              <div key={s.step} style={{ display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) 0', borderTop: '1px solid var(--color-border)', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', flexShrink: 0, paddingTop: '4px', width: 28 }}>{s.step}</div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-2)' }}>{s.title}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-24) var(--section-x)', textAlign: 'center' as const }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)' }}>
            Let&apos;s build your evaluation pipeline.
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: 440, margin: '0 auto var(--space-8)', lineHeight: 'var(--leading-relaxed)' }}>
            Tell us about your use case and we&apos;ll scope a custom pilot. Most teams go from first conversation to first data delivery in under 4 weeks.
          </p>
          <Link href="/contact" className="btn-primary" style={{ padding: '14px 36px', fontSize: 'var(--text-sm)' }}>
            Contact us &rarr;
          </Link>
        </div>
      </section>

    </div>
  );
}
