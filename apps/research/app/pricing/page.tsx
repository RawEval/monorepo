import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Check, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing | RawEval Research',
  description: 'Simple, transparent pricing for verified AI evaluation data. Start free, scale as you grow.',
};

const tiers = [
  {
    name: 'Starter',
    price: '$0.05',
    unit: '/prompt',
    volume: '1,000 prompts/month',
    description: 'For researchers and small teams getting started with verified evaluation data.',
    cta: 'Get Started',
    ctaLink: '/signup',
    highlighted: false,
    features: [
      'Up to 1,000 prompts/month',
      'REST API access',
      'JSONL export',
      '100 req/min rate limit',
      '3 datasets included',
      'Community support',
      'Basic quality filters',
    ],
  },
  {
    name: 'Pro',
    price: '$0.03',
    unit: '/prompt',
    volume: '50,000 prompts/month',
    description: 'For teams building production AI systems that need high-volume, high-quality data.',
    cta: 'Start Pro Trial',
    ctaLink: '/signup',
    highlighted: true,
    features: [
      'Up to 50,000 prompts/month',
      'REST API + batch export',
      'JSONL, Parquet, CSV formats',
      '1,000 req/min rate limit',
      'All datasets included',
      'Priority email support',
      'Advanced quality filters',
      'Webhook notifications',
      'Usage analytics dashboard',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    unit: '',
    volume: 'Unlimited prompts',
    description: 'For organizations that need custom pipelines, SLAs, and compliance guarantees.',
    cta: 'Contact Sales',
    ctaLink: '/signup',
    highlighted: false,
    features: [
      'Unlimited prompts',
      'REST API + batch + custom pipeline',
      'All formats + custom schemas',
      'Custom rate limits',
      'All datasets + custom collections',
      'Dedicated account manager',
      'Custom quality thresholds',
      'Webhook + S3/GCS/BigQuery push',
      'SOC 2 compliance report',
      'SLA guarantee (99.9%)',
      'EU AI Act provenance metadata',
    ],
  },
];

const faqs = [
  {
    question: 'What counts as a prompt?',
    answer: 'A prompt is a single data point accessed via the API or included in a batch export. Each prompt includes the input, model outputs, and expert evaluation metadata. Viewing dataset listings or metadata does not count toward your prompt quota.',
  },
  {
    question: 'Can I switch plans at any time?',
    answer: 'Yes. You can upgrade or downgrade your plan at any time from the dashboard. When upgrading, you get immediate access to the higher tier. When downgrading, the change takes effect at the start of your next billing cycle.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'The Starter plan includes 100 free prompts so you can evaluate the data quality before committing. Pro plans come with a 14-day free trial with full access to all features and datasets.',
  },
  {
    question: 'How is data quality guaranteed?',
    answer: 'Every data point passes through our Iron Dome quality system with 20+ automated and human checks. Quality scores are transparently displayed on every dataset. We maintain a 96.8% average accuracy rate across all datasets.',
  },
  {
    question: 'Do you offer academic pricing?',
    answer: 'Yes. We offer discounted pricing for academic institutions and nonprofit research organizations. Contact us at contact@raweval.com with your institutional email for details.',
  },
];

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '120%', height: '80%', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255, 107, 53, 0.06), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '80px var(--section-x) var(--space-12)', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-signal)', padding: '6px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-signal-border)', background: 'var(--color-signal-subtle)' }}>
              Pricing
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', fontWeight: 400, maxWidth: 700, margin: '0 auto var(--space-6)' }}>
            Simple, <span style={{ color: 'var(--color-signal)' }}>transparent</span> pricing
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-normal)', color: 'var(--color-text-secondary)', maxWidth: 520, margin: '0 auto' }}>
            Pay per prompt. No hidden fees. Scale up or down as your needs change.
          </p>
        </div>
      </section>

      {/* Pricing tiers */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="grid-cols-3-md" style={{ gap: 'var(--space-6)', alignItems: 'stretch' }}>
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="card-surface"
                style={{
                  padding: 'var(--space-8)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  ...(tier.highlighted ? {
                    border: '1px solid var(--color-signal-border)',
                    boxShadow: '0 0 24px var(--color-signal-glow)',
                  } : {}),
                }}
              >
                {tier.highlighted && (
                  <span style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                    color: '#FFFFFF',
                    background: 'var(--color-signal)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    Most Popular
                  </span>
                )}

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-signal)', marginBottom: 'var(--space-4)' }}>{tier.name}</div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400 }}>{tier.price}</span>
                  {tier.unit && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{tier.unit}</span>}
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)', marginBottom: 'var(--space-4)' }}>{tier.volume}</div>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-6)' }}>{tier.description}</p>

                <Link
                  href={tier.ctaLink}
                  className={tier.highlighted ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '12px 24px', fontSize: 'var(--text-sm)', textAlign: 'center', marginBottom: 'var(--space-6)' }}
                >
                  {tier.cta} {tier.highlighted && <ArrowRight size={14} />}
                </Link>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1 }}>
                  {tier.features.map((feature) => (
                    <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                      <Check size={14} style={{ color: 'var(--color-signal)', flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-normal)' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <HelpCircle size={18} style={{ color: 'var(--color-signal)' }} />
            <div className="mono-label" style={{ color: 'var(--color-text-faint)' }}>FAQ</div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-8)' }}>
            Common questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 'var(--max-prose)' }}>
            {faqs.map((faq) => (
              <div key={faq.question} style={{ paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-3)' }}>{faq.question}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'linear-gradient(180deg, var(--color-bg-base), #080808)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-24) var(--section-x)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)' }}>
            Start building with better data
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: 440, margin: '0 auto var(--space-8)' }}>
            100 free prompts on the Starter plan. No credit card required.
          </p>
          <Link href="/signup" className="btn-primary" style={{ padding: '14px 36px', fontSize: 'var(--text-sm)' }}>
            Create Free Account <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
