import { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquare, UserCheck, Zap, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentation | RawEval',
  description: 'Learn how RawEval works — from chatting with AI models and flagging failures, to expert evaluation and data delivery. Guides, API reference, and integration docs.',
};

const gettingStartedSteps = [
  {
    number: '01',
    icon: MessageSquare,
    title: 'Chat with AI models',
    body: 'Open the RawEval Chat and start a conversation with any supported model — GPT-4o, Claude, Gemini, and more. Chat naturally, test edge cases, or explore topics in your domain.',
    link: { label: 'Open Chat →', href: 'https://chat.raweval.com' },
  },
  {
    number: '02',
    icon: UserCheck,
    title: 'Flag what goes wrong',
    body: 'When the AI gives an incorrect, incomplete, or harmful response, click the flag button. Add context about what went wrong — factual error, bias, hallucination, or format issue. Your flag enters the evaluation queue.',
    link: null,
  },
  {
    number: '03',
    icon: Zap,
    title: 'Experts verify & correct',
    body: 'Domain-verified experts review flagged interactions using structured rubrics. They score the response, write a corrected version, and tag the failure type. All with full provenance metadata.',
    link: { label: 'Learn about experts →', href: '/experts' },
  },
];

const platformGuides = [
  {
    icon: MessageSquare,
    title: 'Chat Platform',
    description: 'Multi-model AI chat with built-in failure flagging. Talk to all top frontier models from one interface.',
    features: ['Switch models mid-conversation', 'One-click failure flagging', 'Earn payouts for valid flags', 'See expert corrections in real-time'],
    link: { label: 'Open Chat', href: 'https://chat.raweval.com' },
  },
  {
    icon: UserCheck,
    title: 'Expert Workbench',
    description: 'Where verified domain experts evaluate flagged AI failures. Structured rubrics, correction workflows, and quality scoring.',
    features: ['Domain-matched task assignments', 'Rubric-based evaluation scoring', 'Correction with full provenance', 'Tiered earning ($18–$120/task)'],
    link: { label: 'Expert Portal', href: 'https://work.raweval.com' },
  },
  {
    icon: Database,
    title: 'Data Delivery',
    description: 'Audit-ready evaluation data delivered to AI labs and enterprises. Every data point carries full provenance — who evaluated it, their credentials, behavioral verification, and quality scores.',
    features: ['RLHF-ready preference pairs', 'SFT-ready corrected completions', 'Rubric scores & improvement deltas', 'EU AI Act compliance artifacts'],
    link: { label: 'Enterprise plans →', href: '/organizations' },
  },
];

const apiEndpoints = [
  { method: 'GET', path: '/v1/batches', desc: 'List all annotation batches for your organization' },
  { method: 'GET', path: '/v1/batches/:id', desc: 'Get batch details with all annotations and metadata' },
  { method: 'POST', path: '/v1/prompts', desc: 'Submit prompts for expert evaluation' },
  { method: 'GET', path: '/v1/prompts/:id', desc: 'Check evaluation status and retrieve results' },
  { method: 'GET', path: '/v1/delivery/:batch_id', desc: 'Download completed batch in JSONL format' },
];

const curlExample = `curl -X GET https://api.raweval.com/v1/delivery/batch_42a \\
  -H "Authorization: Bearer reval_sk_live_..."`;

const responseExample = `{
  "prompt_id": "fail_0x7f3ac9",
  "model": "gpt-4o",
  "domain": "geography",
  "original_response": "Sydney is the capital...",
  "corrected_response": "Canberra is the capital...",
  "rubric_scores": {
    "accuracy": 9.8,
    "completeness": 9.1,
    "format": 9.5
  },
  "annotator_tier": "T2",
  "improvement_delta": 8.3,
  "provenance": {
    "expert_verified": true,
    "behavioral_check": "passed",
    "eu_ai_act_artifact": "audit_847.json"
  }
}`;

const faqItems = [
  {
    q: 'Do I need an API key to use RawEval?',
    a: 'No. You can use the Chat and Expert Workbench without an API key. API access is available on Pro and Enterprise plans for programmatic data delivery.',
  },
  {
    q: 'What AI models are supported?',
    a: 'We support all top frontier AI models and add new ones regularly. You can switch between models within the same conversation to compare responses.',
  },
  {
    q: 'How are experts verified?',
    a: 'Experts go through credential verification, a domain skills assessment with identity verification, and ongoing quality monitoring to ensure every evaluation meets our standards.',
  },
  {
    q: 'What data formats do you deliver?',
    a: 'RLHF preference pairs, SFT-ready corrected completions, rubric-scored evaluations, and raw JSONL with full provenance metadata. Custom formats available on Enterprise plans.',
  },
  {
    q: 'How does the Expert Workbench work?',
    a: 'Experts receive task assignments matched to their domain. They evaluate flagged AI responses using structured rubrics, write corrections, and score responses across multiple dimensions. Everything is tracked with full provenance.',
  },
  {
    q: 'Can I integrate RawEval into my existing pipeline?',
    a: 'Yes. Use our REST API to submit prompts, retrieve evaluations, and download completed batches. Webhooks notify you when batches complete. Enterprise plans include custom integration support.',
  },
];

export default function DevelopersPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'var(--section-y)' }}>

      {/* Hero */}
      <section style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--section-y)' }}>
        <div style={{ maxWidth: 680 }}>
          <div className="eyebrow"><span className="eyebrow-text">Documentation</span></div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-6)' }}>
            Everything you need to know about RawEval.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-8)' }}>
            From chatting with AI models and flagging failures, to expert evaluation and data delivery — here&apos;s how the platform works and how to get started.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <a href="https://chat.raweval.com" className="btn-primary">Try the Chat →</a>
            <a href="https://work.raweval.com" className="btn-secondary">Expert Workbench →</a>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Getting started</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-10)' }}>
            How RawEval works — in three steps
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {gettingStartedSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  style={{
                    display: 'flex',
                    gap: 'var(--space-6)',
                    alignItems: 'flex-start',
                    padding: 'var(--space-6)',
                    background: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-signal-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} style={{ color: 'var(--color-signal)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)' }}>{step.number}</span>
                      <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>{step.title}</h3>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
                      {step.body}
                    </p>
                    {step.link && (
                      <a
                        href={step.link.href}
                        style={{
                          display: 'inline-block',
                          marginTop: 'var(--space-3)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-signal)',
                          letterSpacing: 'var(--tracking-wide)',
                        }}
                      >
                        {step.link.label}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Guides */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Platform guides</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-10)' }}>
            Connect with every part of RawEval
          </h2>

          <div className="grid-cols-3-md" style={{ gap: 'var(--space-6)' }}>
            {platformGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <div
                  key={guide.title}
                  className="card-surface"
                  style={{
                    padding: 'var(--space-6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-4)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-signal-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} style={{ color: 'var(--color-signal)' }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>{guide.title}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{guide.description}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
                    {guide.features.map((f) => (
                      <div key={f} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--color-signal)', fontFamily: 'var(--font-mono)', fontSize: '10px', flexShrink: 0, marginTop: '4px' }}>✓</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href={guide.link.href}
                    className="btn-ghost"
                    style={{ alignSelf: 'flex-start', padding: '8px 0', color: 'var(--color-signal)' }}
                  >
                    {guide.link.label}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>API Reference</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-4)' }}>
            Programmatic access to evaluation data
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-4)', maxWidth: 560 }}>
            For teams that want to integrate evaluation data directly into their ML pipeline. All endpoints require a Bearer token — API keys are scoped per organization.
          </p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', background: 'var(--color-bg-muted)', padding: 'var(--space-4) var(--space-5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-10)', display: 'inline-block' }}>
            Authorization: Bearer reval_sk_live_...
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
            {apiEndpoints.map((ep) => (
              <div
                key={ep.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-5)',
                  padding: 'var(--space-5)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-bg-base)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    letterSpacing: 'var(--tracking-wide)',
                    color: ep.method === 'POST' ? 'var(--color-success)' : 'var(--color-info)',
                    background: ep.method === 'POST' ? 'var(--color-success-subtle)' : 'var(--color-info-subtle)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {ep.method}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', flexShrink: 0 }}>{ep.path}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{ep.desc}</span>
              </div>
            ))}
          </div>

          {/* Code Example */}
          <div className="grid-cols-2-lg">
            <div>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-4)' }}>Request</h3>
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                background: 'var(--color-bg-muted)',
                padding: 'var(--space-5)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                overflow: 'auto',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {curlExample}
              </pre>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-4)' }}>Response</h3>
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                background: 'var(--color-bg-muted)',
                padding: 'var(--space-5)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                overflow: 'auto',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {responseExample}
              </pre>
            </div>
          </div>
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
            {faqItems.map((item) => (
              <details
                key={item.q}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  padding: 'var(--space-5) 0',
                }}
              >
                <summary
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-primary)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {item.q}
                  <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)', flexShrink: 0, marginLeft: 'var(--space-4)' }}>+</span>
                </summary>
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
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)' }}>
            Ready to try it?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: 440, margin: '0 auto var(--space-8)' }}>
            Chat with AI models, flag what goes wrong, and help build better AI — or bring evaluation data into your ML pipeline.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://chat.raweval.com" className="btn-primary">Try the Chat →</a>
            <Link href="/organizations" className="btn-secondary">Enterprise plans</Link>
            <Link href="/contact" className="btn-ghost">Contact us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
