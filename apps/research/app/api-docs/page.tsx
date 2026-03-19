import Link from 'next/link';
import type { Metadata } from 'next';
import { Code, Key, Zap, ArrowRight, Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'API Documentation | RawEval Research',
  description: 'Complete API reference for accessing RawEval verified AI evaluation datasets programmatically.',
};

const endpoints = [
  {
    method: 'GET',
    path: '/datasets',
    description: 'List all available datasets with optional filtering by domain, type, and quality score.',
    params: 'domain, type, min_quality, page, limit',
  },
  {
    method: 'GET',
    path: '/datasets/:id',
    description: 'Retrieve detailed metadata for a specific dataset including schema, sample count, and pricing.',
    params: 'id (path)',
  },
  {
    method: 'GET',
    path: '/prompts',
    description: 'List prompts within a dataset. Supports pagination, ordering, and field selection.',
    params: 'dataset_id, page, limit, fields, order_by',
  },
  {
    method: 'POST',
    path: '/prompts/search',
    description: 'Full-text search across prompt content with semantic similarity ranking.',
    params: 'query, dataset_id, threshold, limit',
  },
];

const rateLimits = [
  { tier: 'Starter', limit: '100 req/min', daily: '1,000/day' },
  { tier: 'Pro', limit: '1,000 req/min', daily: '50,000/day' },
  { tier: 'Enterprise', limit: 'Custom', daily: 'Unlimited' },
];

const curlExample = `curl -X GET "https://api.raweval.com/v1/datasets" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

const curlSearchExample = `curl -X POST "https://api.raweval.com/v1/prompts/search" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "clinical diagnosis reasoning",
    "dataset_id": "medeval-rlhf-v2",
    "threshold": 0.85,
    "limit": 20
  }'`;

const pythonExample = `import raweval

client = raweval.Client(api_key="YOUR_API_KEY")

# List datasets
datasets = client.datasets.list(domain="medicine")

# Search prompts
results = client.prompts.search(
    query="clinical diagnosis reasoning",
    dataset_id="medeval-rlhf-v2",
    threshold=0.85,
    limit=20
)

for prompt in results.data:
    print(prompt.id, prompt.content[:80])`;

const webhookExample = `{
  "event": "dataset.updated",
  "dataset_id": "medeval-rlhf-v2",
  "timestamp": "2026-03-19T14:30:00Z",
  "changes": {
    "samples_added": 142,
    "quality_score": 97.4
  }
}`;

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>{label}</div>
      <pre style={{
        background: '#0D0D0E',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        overflowX: 'auto',
        margin: 0,
      }}>
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{code}</code>
      </pre>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '120%', height: '80%', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255, 107, 53, 0.06), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '80px var(--section-x) var(--space-12)', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-signal)', padding: '6px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-signal-border)', background: 'var(--color-signal-subtle)' }}>
              API Reference
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', fontWeight: 400, maxWidth: 700, margin: '0 auto var(--space-6)' }}>
            Programmatic access to <span style={{ color: 'var(--color-signal)' }}>verified data</span>
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-normal)', color: 'var(--color-text-secondary)', maxWidth: 520, margin: '0 auto var(--space-8)' }}>
            RESTful API with filtering, pagination, search, and webhook delivery. Get started in minutes.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-primary" style={{ padding: '14px 32px', fontSize: 'var(--text-sm)' }}>
              Get API Key <ArrowRight size={14} />
            </Link>
            <Link href="/docs" className="btn-secondary" style={{ padding: '14px 28px', fontSize: 'var(--text-sm)' }}>
              Quick Start Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Key size={18} style={{ color: 'var(--color-signal)' }} />
            <div className="mono-label" style={{ color: 'var(--color-text-faint)' }}>Authentication</div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-6)' }}>
            API key authentication
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-6)', maxWidth: 'var(--max-prose)' }}>
            All API requests require a Bearer token in the Authorization header. Generate your API key from the dashboard after signing up. Keys are scoped to your organization and can be rotated at any time.
          </p>
          <CodeBlock label="Example request" code={curlExample} />
        </div>
      </section>

      {/* Endpoints */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Code size={18} style={{ color: 'var(--color-signal)' }} />
            <div className="mono-label" style={{ color: 'var(--color-text-faint)' }}>Endpoints</div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-8)' }}>
            Available endpoints
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {endpoints.map((ep) => (
              <div key={ep.path} className="card-surface" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: 'var(--tracking-wider)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: ep.method === 'POST' ? 'var(--color-info-subtle)' : 'var(--color-success-subtle)',
                    color: ep.method === 'POST' ? 'var(--color-info)' : 'var(--color-success)',
                    border: `1px solid ${ep.method === 'POST' ? 'var(--color-info-border)' : 'var(--color-success-border)'}`,
                  }}>
                    {ep.method}
                  </span>
                  <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>/v1{ep.path}</code>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-2)' }}>{ep.description}</p>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>
                  Params: {ep.params}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code examples */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Code examples</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-8)' }}>
            Get started quickly
          </h2>

          <div className="grid-cols-2-lg">
            <div>
              <CodeBlock label="cURL - Search prompts" code={curlSearchExample} />
            </div>
            <div>
              <CodeBlock label="Python SDK" code={pythonExample} />
            </div>
          </div>
        </div>
      </section>

      {/* Rate limits */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Zap size={18} style={{ color: 'var(--color-signal)' }} />
            <div className="mono-label" style={{ color: 'var(--color-text-faint)' }}>Rate limits</div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-8)' }}>
            Usage limits by plan
          </h2>

          <div className="grid-cols-3-md">
            {rateLimits.map((rl) => (
              <div key={rl.tier} className="card-surface" style={{ padding: 'var(--space-5)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-signal)', marginBottom: 'var(--space-3)' }}>{rl.tier}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', fontWeight: 400, marginBottom: 'var(--space-2)' }}>{rl.limit}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>{rl.daily}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Bell size={18} style={{ color: 'var(--color-signal)' }} />
            <div className="mono-label" style={{ color: 'var(--color-text-faint)' }}>Webhooks</div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-6)' }}>
            Real-time notifications
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-6)', maxWidth: 'var(--max-prose)' }}>
            Configure webhook endpoints to receive real-time notifications when datasets are updated, new samples are added, or quality scores change. All webhook payloads are signed with HMAC-SHA256.
          </p>
          <CodeBlock label="Webhook payload example" code={webhookExample} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'linear-gradient(180deg, var(--color-bg-base), #080808)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-24) var(--section-x)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)' }}>
            Ready to integrate?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: 440, margin: '0 auto var(--space-8)' }}>
            Sign up for free and get your API key in seconds. No credit card required for the starter plan.
          </p>
          <Link href="/signup" className="btn-primary" style={{ padding: '14px 36px', fontSize: 'var(--text-sm)' }}>
            Get API Key <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
