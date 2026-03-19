import Link from 'next/link';
import { ArrowRight, Database, Shield, FileText, Code, BarChart3, CheckCircle2, Globe, Lock } from 'lucide-react';

const stats = [
  { value: '47,000+', label: 'Verified prompts' },
  { value: '96.8%', label: 'Accuracy rate' },
  { value: '2,400+', label: 'Expert evaluators' },
  { value: '45', label: 'Domains covered' },
];

const categories = [
  { name: 'RLHF Preference Pairs', count: '12,400+', icon: BarChart3, description: 'Side-by-side model comparisons scored by domain experts', color: 'var(--color-signal)' },
  { name: 'Corrected Completions', count: '18,700+', icon: CheckCircle2, description: 'Wrong AI responses with expert-written corrections', color: 'var(--color-success)' },
  { name: 'Rubric Evaluations', count: '8,200+', icon: FileText, description: 'Structured scoring across factuality, harmfulness, completeness', color: 'var(--color-info)' },
  { name: 'Red Team Samples', count: '4,900+', icon: Shield, description: 'Adversarial prompts with safety classifications', color: 'var(--color-error)' },
];

const domains = ['Medicine', 'Law', 'Engineering', 'Finance', 'Computer Science', 'Education', 'Research', 'Science'];

const deliveryMethods = [
  { icon: Code, title: 'REST API', description: 'Real-time access with filtering, pagination, and webhook delivery. Rate-limited plans from 100 to 100K requests/day.', tag: 'MOST POPULAR' },
  { icon: Database, title: 'Batch Export', description: 'Download full datasets in JSONL, Parquet, or CSV. Schedule recurring exports on daily/weekly cadence.', tag: null },
  { icon: Globe, title: 'Custom Pipeline', description: 'Direct integration with your data warehouse. We push to S3, GCS, BigQuery, or Snowflake on your schedule.', tag: 'ENTERPRISE' },
];

export default function ResearchHome() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '120%', height: '80%', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255, 107, 53, 0.06), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '100px var(--section-x) var(--section-y)', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-signal)', padding: '6px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-signal-border)', background: 'var(--color-signal-subtle)' }}>
              AI Evaluation Data Marketplace
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', fontWeight: 400, maxWidth: 800, margin: '0 auto var(--space-6)' }}>
            Production-grade data for{' '}
            <span style={{ color: 'var(--color-signal)' }}>better models.</span>
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-normal)', color: 'var(--color-text-secondary)', maxWidth: 560, margin: '0 auto var(--space-10)' }}>
            Browse and purchase verified AI evaluation data — preference pairs, corrected completions, and rubric-scored evaluations — all created by domain experts.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-12)' }}>
            <Link href="/datasets" className="btn-primary" style={{ padding: '14px 32px', fontSize: 'var(--text-sm)' }}>
              Browse Datasets <ArrowRight size={14} />
            </Link>
            <Link href="/api-docs" className="btn-secondary" style={{ padding: '14px 28px', fontSize: 'var(--text-sm)' }}>
              API Documentation
            </Link>
          </div>

          {/* Stats */}
          <div className="grid-cols-4-md" style={{ maxWidth: 700, margin: '0 auto' }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)' }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)', marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dataset categories */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Available data</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-10)' }}>
            Verified evaluation data, ready to use
          </h2>

          <div className="grid-cols-2-md" style={{ gap: 'var(--space-6)' }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.name} href="/datasets" className="card-surface hover-lift" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: `${cat.color}12`, border: `1px solid ${cat.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} style={{ color: cat.color }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-2)' }}>
                      <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>{cat.name}</h3>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: cat.color, letterSpacing: 'var(--tracking-wide)' }}>{cat.count}</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{cat.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-10) var(--section-x)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 'var(--space-5)' }}>Expert domains</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            {domains.map((name) => (
              <span key={name} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-faint)', opacity: 0.5, letterSpacing: 'var(--tracking-wide)' }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Why RawEval data */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Why our data</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-10)' }}>
            Not crowdwork. Expert-verified.
          </h2>

          <div className="grid-cols-3-md">
            {[
              { icon: Shield, title: 'Full provenance', body: 'Every data point carries a complete audit trail — evaluator credentials, quality scores, behavioral verification, and EU AI Act compliance metadata.' },
              { icon: CheckCircle2, title: '20+ quality checks', body: 'Every evaluation goes through our Iron Dome quality system. True positive verification, inter-annotator agreement, and anti-cheat detection.' },
              { icon: Lock, title: 'Compliance-ready', body: 'SOC 2 Type II, GDPR compliant, EU AI Act provenance. PII stripped and sanitized before any human reviewer sees it.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} style={{ paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
                  <Icon size={18} style={{ color: 'var(--color-signal)', marginBottom: 'var(--space-3)' }} />
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-3)' }}>{item.title}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Delivery methods */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Data access</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-10)' }}>
            Your pipeline, your way
          </h2>

          <div className="grid-cols-3-md">
            {deliveryMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div key={method.title} className="card-surface hover-lift" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-signal-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} style={{ color: 'var(--color-signal)' }} />
                    </div>
                    {method.tag && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wider)', padding: '3px 8px', border: '1px solid var(--color-signal-border)', borderRadius: 'var(--radius-full)', background: 'var(--color-signal-subtle)' }}>
                        {method.tag}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>{method.title}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{method.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'linear-gradient(180deg, var(--color-bg-base), #080808)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-24) var(--section-x)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)' }}>
            Better data. Better models.
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: 440, margin: '0 auto var(--space-8)' }}>
            Start with our API or download a sample dataset. No commitment required.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-primary" style={{ padding: '14px 36px', fontSize: 'var(--text-sm)' }}>
              Get API Access <ArrowRight size={14} />
            </Link>
            <Link href="/pricing" className="btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
              View pricing →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
