import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, Key, Database, Code, Bell, Package, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentation | RawEval Research',
  description: 'Get started with RawEval Research. Guides, API reference, and SDK documentation for verified AI evaluation data.',
};

const sections = [
  { icon: BookOpen, title: 'Getting Started', description: 'Set up your account, generate an API key, and make your first request in under 5 minutes.', href: '/docs', tag: 'START HERE' },
  { icon: Key, title: 'Authentication', description: 'Learn about API key management, scopes, rotation, and security best practices.', href: '/api-docs', tag: null },
  { icon: Database, title: 'Datasets', description: 'Browse available datasets, understand schemas, and learn about quality scoring methodology.', href: '/datasets', tag: null },
  { icon: Code, title: 'API Reference', description: 'Complete endpoint documentation with request/response examples and error codes.', href: '/api-docs', tag: null },
  { icon: Bell, title: 'Webhooks', description: 'Configure real-time notifications for dataset updates, new samples, and quality changes.', href: '/api-docs', tag: null },
  { icon: Package, title: 'SDKs', description: 'Official Python and Node.js client libraries with typed interfaces and async support.', href: '/api-docs', tag: 'COMING SOON' },
];

const quickStartCode = `# 1. Install the Python SDK
pip install raweval

# 2. Set your API key
export RAWEVAL_API_KEY="re_live_..."

# 3. Fetch your first dataset
import raweval

client = raweval.Client()
datasets = client.datasets.list(domain="medicine")

for ds in datasets.data:
    print(f"{ds.name} — {ds.sample_count} samples")

# 4. Access individual prompts
prompts = client.prompts.list(
    dataset_id=datasets.data[0].id,
    limit=10
)

for p in prompts.data:
    print(p.content[:100])
    print(f"  Quality: {p.quality_score}%")
    print()`;

export default function DocsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '120%', height: '80%', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255, 107, 53, 0.06), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '80px var(--section-x) var(--space-12)', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-signal)', padding: '6px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-signal-border)', background: 'var(--color-signal-subtle)' }}>
              Documentation
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', fontWeight: 400, maxWidth: 700, margin: '0 auto var(--space-6)' }}>
            Build with <span style={{ color: 'var(--color-signal)' }}>RawEval</span>
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-normal)', color: 'var(--color-text-secondary)', maxWidth: 520, margin: '0 auto var(--space-8)' }}>
            Everything you need to integrate verified AI evaluation data into your pipeline.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/api-docs" className="btn-primary" style={{ padding: '14px 32px', fontSize: 'var(--text-sm)' }}>
              API Reference <ArrowRight size={14} />
            </Link>
            <Link href="/signup" className="btn-secondary" style={{ padding: '14px 28px', fontSize: 'var(--text-sm)' }}>
              Get API Key
            </Link>
          </div>
        </div>
      </section>

      {/* Quick start */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Quick start</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-6)' }}>
            Up and running in 5 minutes
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-6)', maxWidth: 'var(--max-prose)' }}>
            Install the SDK, authenticate with your API key, and start querying datasets. Here is a complete example.
          </p>

          <pre style={{
            background: '#0D0D0E',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            overflowX: 'auto',
            margin: 0,
          }}>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{quickStartCode}</code>
          </pre>
        </div>
      </section>

      {/* Documentation sections */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Browse docs</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-8)' }}>
            Documentation sections
          </h2>

          <div className="grid-cols-3-md" style={{ gap: 'var(--space-6)' }}>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.title} href={section.href} className="card-surface hover-lift" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-signal-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} style={{ color: 'var(--color-signal)' }} />
                    </div>
                    {section.tag && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wider)', padding: '3px 8px', border: '1px solid var(--color-signal-border)', borderRadius: 'var(--radius-full)', background: 'var(--color-signal-subtle)' }}>
                        {section.tag}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>{section.title}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{section.description}</p>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
                    Read more <ArrowRight size={12} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'linear-gradient(180deg, var(--color-bg-base), #080808)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-24) var(--section-x)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)' }}>
            Need help getting started?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: 440, margin: '0 auto var(--space-8)' }}>
            Join our developer community or reach out to our support team.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-primary" style={{ padding: '14px 36px', fontSize: 'var(--text-sm)' }}>
              Create Account <ArrowRight size={14} />
            </Link>
            <Link href="/api-docs" className="btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
              Full API reference →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
