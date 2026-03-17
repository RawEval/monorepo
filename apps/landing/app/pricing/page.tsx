'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    description: 'Try the chat, flag failures, get started',
    cta: { label: 'Start Free →', href: 'https://chat.raweval.com/signup' },
    featured: false,
    features: [
      '100 conversations per month',
      '3 AI models',
      'Basic flag & feedback tools',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 49, annual: 39 },
    description: 'Full platform access for teams',
    cta: { label: 'Start Pro Trial →', href: 'https://chat.raweval.com/signup?plan=pro' },
    featured: true,
    features: [
      'Unlimited conversations',
      'All AI models',
      'Priority expert evaluation queue',
      'API access & webhooks',
      'Team collaboration',
      'Email support',
    ],
  },
  {
    name: 'Enterprise',
    price: { monthly: null, annual: null },
    description: 'Volume pipelines, SLAs, custom expert panels',
    cta: { label: 'Contact Sales →', href: '/contact?type=enterprise' },
    featured: false,
    features: [
      'Custom model deployment',
      'Dedicated expert panels by domain',
      'SOC 2 compliance reports',
      'SLA guarantees (99.9% uptime)',
      'Dedicated account manager',
      'Custom RLHF data formats',
      'Volume discounts',
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'What happens when I exceed the free tier limits?',
    a: 'You\'ll receive a notification when you approach your limit. You can upgrade to Pro at any time to continue using the platform without interruption.',
  },
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. You can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'What AI models are supported?',
    a: 'RawEval supports all major LLM providers including OpenAI, Anthropic, Google, Meta, Groq, DeepSeek, Mistral, and Cohere. New models are added regularly.',
  },
  {
    q: 'How does expert evaluation work?',
    a: 'When you flag an AI response, it\'s routed to our network of 2,400+ verified domain experts. They evaluate the response using structured rubrics and provide corrections with full provenance.',
  },
  {
    q: 'What data formats do you deliver?',
    a: 'We deliver data in RLHF-ready formats including preference pairs, SFT datasets, rubric-scored completions, and raw JSONL. Custom formats are available on Enterprise plans.',
  },
  {
    q: 'Is there a discount for annual billing?',
    a: 'Yes — annual billing saves you 20% compared to monthly billing across all paid plans.',
  },
  {
    q: 'What\'s included in SOC 2 compliance?',
    a: 'Enterprise plans include SOC 2 Type II compliance reports, data processing agreements (DPAs), isolated environments, and enterprise-grade NDA coverage.',
  },
  {
    q: 'Can I get a custom enterprise quote?',
    a: 'Absolutely. Contact our sales team and we\'ll scope a pilot within 48 hours based on your volume, domain, and delivery requirements.',
  },
];

function FAQItem({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--space-5) 0',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          textAlign: 'left',
          gap: 'var(--space-4)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            fontWeight: 500,
          }}
        >
          {item.q}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--color-text-muted)',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>
      {open && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--leading-relaxed)',
            marginTop: 'var(--space-3)',
            paddingRight: 'var(--space-8)',
          }}
        >
          {item.a}
        </p>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'var(--section-y)' }}>
      {/* Header */}
      <section style={{ textAlign: 'center', maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--space-12)' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--color-signal)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Pricing
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
            fontWeight: 400,
            marginBottom: 'var(--space-4)',
          }}
        >
          Simple, transparent pricing
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-8)',
          }}
        >
          Start free. Scale as you grow.
        </p>

        {/* Billing toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', padding: '4px', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setAnnual(false)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wide)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              background: !annual ? 'var(--color-bg-elevated)' : 'transparent',
              color: !annual ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wide)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              background: annual ? 'var(--color-bg-elevated)' : 'transparent',
              color: annual ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            Annual
            <span style={{ color: 'var(--color-success)', marginLeft: '6px', fontSize: '10px' }}>-20%</span>
          </button>
        </div>
      </section>

      {/* Pricing tiers */}
      <section style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--section-y)' }}>
        <div className="grid-cols-3-md" style={{ gap: 'var(--space-6)', alignItems: 'stretch' }}>
          {PRICING_TIERS.map((tier) => {
            const price = annual ? tier.price.annual : tier.price.monthly;
            return (
              <div
                key={tier.name}
                style={{
                  padding: 'var(--space-8)',
                  border: tier.featured ? '2px solid var(--color-signal)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--color-bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-6)',
                  position: 'relative',
                }}
              >
                {tier.featured && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      letterSpacing: 'var(--tracking-wider)',
                      textTransform: 'uppercase',
                      color: '#fff',
                      background: 'var(--color-signal)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="mono-label" style={{ color: tier.featured ? 'var(--color-signal)' : 'var(--color-text-faint)', marginBottom: 'var(--space-3)' }}>
                    {tier.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: 'var(--space-2)' }}>
                    {price !== null ? (
                      <>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                          ${price}
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>/mo</span>
                      </>
                    ) : (
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                        Custom
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                    {tier.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1 }}>
                  {tier.features.map((f) => (
                    <div key={f} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                      <Check size={14} style={{ color: tier.featured ? 'var(--color-signal)' : 'var(--color-text-muted)', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={tier.cta.href}
                  className={tier.featured ? 'btn-primary' : 'btn-secondary'}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  {tier.cta.label}
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
              marginBottom: 'var(--space-10)',
              textAlign: 'center',
            }}
          >
            Frequently asked questions
          </h2>
          <div>
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.q} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-5)' }}>
            Need a custom plan?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: 440, margin: '0 auto var(--space-8)' }}>
            Talk to our team. We&apos;ll scope a pilot within 48 hours.
          </p>
          <Link href="/contact" className="btn-primary">
            Contact Sales →
          </Link>
        </div>
      </section>
    </div>
  );
}
