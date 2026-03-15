import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Enterprise | RawEval',
  description: 'AI evaluation infrastructure for teams building frontier models and enterprise AI. Volume pipelines, SLAs, and custom expert panels.',
};

const features = [
  { label: 'Custom expert panels', body: 'We source and vet specialists in your exact domain — medical, legal, code, finance — not generalists.' },
  { label: 'Volume pipelines', body: 'From 100 to 100,000 annotations per week. Built-in throughput guarantees and SLA-backed delivery.' },
  { label: 'Proprietary data handling', body: 'Enterprise-grade NDA coverage, isolated environments, and SOC 2 Type II compliance.' },
  { label: 'RLHF-ready output', body: 'Structured preference pairs, SFT datasets, and rubric-scored completions. Plug directly into your training pipeline.' },
  { label: 'Dedicated QA layer', body: 'A second tier of expert reviewers audits all output before delivery. We reject before you have to.' },
  { label: 'API + webhook delivery', body: "Push annotations directly to your data warehouse. Or pull via our REST API. Your pipeline, your way." },
];

const tiers = [
  {
    name: 'Starter',
    price: '$2,500 / mo',
    desc: 'Best for early-stage teams evaluating a single model or use case.',
    includes: ['Up to 1,000 annotations / mo', 'Standard expert pool', '5-day turnaround SLA', 'CSV / JSON delivery', 'Email support'],
    cta: 'Start free trial',
  },
  {
    name: 'Growth',
    price: '$9,000 / mo',
    desc: 'For teams scaling RLHF or red-teaming across multiple model versions.',
    includes: ['Up to 10,000 annotations / mo', 'Domain-matched experts', '48-hour turnaround SLA', 'API + webhook delivery', 'Dedicated account manager'],
    cta: 'Talk to sales',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'For AI labs and enterprises with high-volume, compliance-critical needs.',
    includes: ['Unlimited volume', 'Bespoke expert panel', 'Custom SLA', 'SOC 2 + data DPA', 'On-site onboarding available'],
    cta: 'Contact us',
  },
];

export default function OrganizationsPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'calc(56px + var(--section-y))' }}>

      {/* Hero */}
      <section style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--section-y)' }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>Enterprise</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-6)' }}>
            Production-grade evaluation data for AI labs and enterprises.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-8)' }}>
            RawEval gives your team a reliable supply of human-verified annotations, preference pairs, and red-team results — so you can train and evaluate without worrying about data quality.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-3)' }}>
            <a href="mailto:sales@raweval.com" style={{ display: 'inline-block', background: 'var(--color-signal)', color: 'var(--color-text-inverse)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>Talk to sales →</a>
            <Link href="#pricing" style={{ display: 'inline-block', background: 'transparent', color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', textDecoration: 'none', border: '1px solid var(--color-border)' }}>See pricing</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-10)' }}>What you get</div>
          <div className="grid-cols-3-md">
            {features.map((f) => (
              <div key={f.label} style={{ paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', marginBottom: 'var(--space-3)', textTransform: 'uppercase' }}>◈</div>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-3)' }}>{f.label}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-10)' }}>Pricing</div>
          <div className="grid-cols-3-md">
            {tiers.map((t) => (
              <div
                key={t.name}
                style={{
                  padding: 'var(--space-8)',
                  border: t.featured ? '2px solid var(--color-signal)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  background: t.featured ? 'var(--color-signal-subtle)' : 'var(--color-bg-surface)',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: 'var(--space-5)',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: t.featured ? 'var(--color-signal)' : 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>{t.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>{t.price}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>{t.desc}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)', flex: 1 }}>
                  {t.includes.map((item) => (
                    <div key={item} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-signal)', fontFamily: 'var(--font-mono)', fontSize: '12px', flexShrink: 0, marginTop: '2px' }}>✓</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{item}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="mailto:sales@raweval.com"
                  style={{ display: 'block', textAlign: 'center' as const, padding: '11px', background: t.featured ? 'var(--color-signal)' : 'transparent', color: t.featured ? 'var(--color-text-inverse)' : 'var(--color-text-primary)', border: t.featured ? 'none' : '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', textDecoration: 'none' }}
                >
                  {t.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--color-bg-inverse)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)', textAlign: 'center' as const }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-inverse)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)' }}>
            Ready to eliminate bad evaluation data?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-inverse-muted)', maxWidth: 440, margin: '0 auto var(--space-8)' }}>
            Talk to our team. We&apos;ll scope a pilot in 48 hours.
          </p>
          <a href="mailto:sales@raweval.com" style={{ display: 'inline-block', background: 'var(--color-signal)', color: 'var(--color-text-inverse)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', padding: '12px 28px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
            Schedule a call →
          </a>
        </div>
      </section>

    </main>
  );
}
