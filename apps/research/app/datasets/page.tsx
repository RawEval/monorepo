import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, BarChart3, FileText, Shield, CheckCircle2, Bell, ArrowRight, Rocket, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Datasets | RawEval Research — Coming Soon',
  description: 'We\'re building the world\'s most trusted marketplace for verified AI evaluation data. Be the first to access gold-standard RLHF data.',
};

const upcomingDatasets = [
  { name: 'RLHF Preference Pairs', count: '12,400+', icon: BarChart3, color: 'var(--color-signal)', description: 'Side-by-side model comparisons scored by domain experts' },
  { name: 'Corrected Completions', count: '18,700+', icon: CheckCircle2, color: 'var(--color-success)', description: 'Wrong AI responses with expert-written corrections' },
  { name: 'Rubric Evaluations', count: '8,200+', icon: FileText, color: 'var(--color-info)', description: 'Structured scoring across factuality, completeness, harmfulness' },
  { name: 'Red Team Samples', count: '4,900+', icon: Shield, color: 'var(--color-error)', description: 'Adversarial prompts with safety classifications' },
];

const milestones = [
  { label: 'Expert pipeline live', done: true },
  { label: '47,000+ prompts verified', done: true },
  { label: 'API infrastructure', done: true },
  { label: 'Marketplace UI', done: false },
  { label: 'Self-serve access', done: false },
  { label: 'Public launch', done: false },
];

export default function DatasetsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Animated glow */}
        <div aria-hidden="true" style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: '140%', height: '90%', background: 'radial-gradient(ellipse 50% 40% at 50% 20%, rgba(255, 107, 53, 0.08), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '100px var(--section-x) var(--space-16)', textAlign: 'center', position: 'relative' }}>

          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase', color: 'var(--color-signal)', padding: '6px 16px',
              borderRadius: 'var(--radius-full)', border: '1px solid var(--color-signal-border)',
              background: 'var(--color-signal-subtle)', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Rocket size={12} />
              Coming Soon
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', fontWeight: 400,
            maxWidth: 720, margin: '0 auto var(--space-6)',
          }}>
            Something{' '}
            <span style={{ color: 'var(--color-signal)', fontStyle: 'italic' }}>extraordinary</span>{' '}
            is brewing.
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-relaxed)',
            color: 'var(--color-text-secondary)', maxWidth: 560, margin: '0 auto var(--space-5)',
          }}>
            We&apos;re building the world&apos;s first marketplace for verified, expert-evaluated AI training data.
            Every prompt audited. Every correction traced. Every evaluator credentialed.
          </p>

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)',
            color: 'var(--color-text-muted)', maxWidth: 480, margin: '0 auto var(--space-10)',
          }}>
            No crowdwork. No synthetic noise. Just gold-standard data from 2,400+ domain experts across 45 countries — the kind of data that actually makes models better.
          </p>

          {/* CTA */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-16)' }}>
            <Link href="/signup" className="btn-primary" style={{ padding: '14px 32px', fontSize: 'var(--text-sm)', gap: 8 }}>
              <Bell size={14} />
              Get Early Access
            </Link>
            <Link href="/api-docs" className="btn-secondary" style={{ padding: '14px 28px', fontSize: 'var(--text-sm)' }}>
              Preview the API
            </Link>
          </div>

          {/* Progress milestones */}
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)', textAlign: 'left' }}>
              Build progress
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {milestones.map((m) => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: m.done ? 'var(--color-success)' : 'var(--color-bg-muted)',
                    border: `1px solid ${m.done ? 'var(--color-success)' : 'var(--color-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {m.done && <CheckCircle2 size={12} style={{ color: '#fff' }} />}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                    color: m.done ? 'var(--color-text-secondary)' : 'var(--color-text-faint)',
                    textDecoration: m.done ? 'none' : 'none',
                  }}>
                    {m.label}
                  </span>
                  {!m.done && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', marginLeft: 'auto' }}>
                      IN PROGRESS
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's coming — dataset previews */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>
            What we&apos;re building
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)',
            fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-4)',
          }}>
            Four categories of verified data
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)',
            margin: '0 0 var(--space-10)', maxWidth: 520, lineHeight: 'var(--leading-relaxed)',
          }}>
            Every dataset is built from real AI failures caught by real users, verified by credentialed domain experts, and delivered with full provenance.
          </p>

          <div className="grid-cols-2-md" style={{ gap: 'var(--space-6)' }}>
            {upcomingDatasets.map((ds) => {
              const Icon = ds.icon;
              return (
                <div key={ds.name} className="card-surface" style={{ padding: 'var(--space-6)', position: 'relative', overflow: 'hidden' }}>
                  {/* Blur overlay */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                        background: `${ds.color}12`, border: `1px solid ${ds.color}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Icon size={20} style={{ color: ds.color }} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>
                          {ds.name}
                        </h3>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: ds.color, letterSpacing: 'var(--tracking-wide)' }}>
                          {ds.count} samples
                        </span>
                      </div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-4)' }}>
                      {ds.description}
                    </p>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                      background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-border)',
                    }}>
                      <Lock size={10} style={{ color: 'var(--color-text-faint)' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>
                        AVAILABLE AT LAUNCH
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why wait section */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <Sparkles size={24} style={{ color: 'var(--color-signal)', marginBottom: 'var(--space-5)', margin: '0 auto var(--space-5)' }} />
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)',
              fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)',
            }}>
              Why we&apos;re taking our time
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)',
              lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-4)',
            }}>
              Most training data marketplaces ship fast and fix quality later. We&apos;re doing it the other way around.
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)',
              lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-4)',
            }}>
              Every prompt in our pipeline goes through 20+ quality checks, is evaluated by credentialed domain experts, and carries a full provenance chain — from the user who flagged the AI failure to the expert who wrote the correction.
            </p>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)',
              fontStyle: 'italic', margin: '0 0 var(--space-8)',
            }}>
              We&apos;d rather launch with data you can trust than data you have to audit.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'center' }}>
              <Link href="/signup" className="btn-primary" style={{ padding: '14px 32px', fontSize: 'var(--text-sm)', gap: 8 }}>
                <Bell size={14} />
                Notify Me at Launch
              </Link>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>
                No spam. Just one email when we go live.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Meanwhile section */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>
            In the meantime
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)',
            fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-10)',
          }}>
            You can start contributing today
          </h2>

          <div className="grid-cols-3-md" style={{ gap: 'var(--space-6)' }}>
            {[
              {
                title: 'Chat with AI',
                description: 'Use top AI models for free. When you spot something wrong, flag it and earn rewards.',
                cta: 'Start Chatting',
                href: 'https://chat.raweval.com',
                accent: 'var(--color-signal)',
              },
              {
                title: 'Become an Expert',
                description: 'Get paid $18–120/hr to evaluate AI responses in your domain. Work from anywhere.',
                cta: 'Apply Now',
                href: 'https://work.raweval.com',
                accent: 'var(--color-info)',
              },
              {
                title: 'Enterprise Access',
                description: 'Need data now? Talk to us about a custom evaluation pipeline for your team.',
                cta: 'Contact Us',
                href: 'https://www.raweval.com/contact',
                accent: 'var(--color-success)',
              },
            ].map((item) => (
              <a key={item.title} href={item.href} className="card-surface hover-lift" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textDecoration: 'none', color: 'inherit' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0, flex: 1 }}>
                  {item.description}
                </p>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: item.accent, letterSpacing: 'var(--tracking-wide)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {item.cta} <ArrowRight size={12} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
