import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'RawEval Chat | AI Evaluation Through Natural Conversation',
  description: 'Test AI models the way real users do. Chat with frontier models, flag bad responses, and turn failures into training data.',
};

const features = [
  { label: 'Talk to frontier models', body: 'Access GPT-4o, Claude 3.5, Gemini 1.5, and other frontier models from a single interface. Switch mid-conversation.' },
  { label: 'Flag failures in real time', body: "When a model gets it wrong, hit flag. Add context. That interaction goes straight into RawEval's expert evaluation queue." },
  { label: 'Earn for every valid flag', body: 'Contributors earn a payout for each flagged interaction that passes expert QC. The better the failure, the higher the payout.' },
  { label: 'See expert corrections', body: "Once an interaction is evaluated, you can see how the expert reframed the prompt and corrected the response. Learn what 'good' looks like." },
];

const useCases = [
  { label: 'Researchers', body: 'Systematically probe model weaknesses. Build reproducible failure datasets.' },
  { label: 'Developers', body: 'Test your product prompts against multiple models. Find edge cases before users do.' },
  { label: 'Domain experts', body: "Evaluate models in your field. Your knowledge turns into high-value training data." },
];

export default function ChatPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* Hero */}
      <section style={{ background: 'var(--color-bg-inverse)', paddingTop: 'calc(56px + var(--section-y))', paddingBottom: 'var(--section-y)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)' }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal-light)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>RawEval Chat</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-inverse)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-6)' }}>
              The chat interface that turns your conversations into training data.
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-inverse-muted)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-8)' }}>
              When a model gets something wrong in our chat UI, you flag it. Our experts evaluate it. The result becomes gold-standard data that goes back into model training. You get paid for the signal.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-3)' }}>
              <Link href="https://chat.raweval.com" style={{ display: 'inline-block', background: 'var(--color-signal)', color: 'var(--color-text-inverse)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>Open Chat →</Link>
              <Link href="/how-it-works/capture" style={{ display: 'inline-block', background: 'transparent', color: 'var(--color-text-inverse-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', textDecoration: 'none', border: '1px solid var(--color-border-inverse)' }}>How it works</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-10)' }}>Features</div>
          <div className="grid-cols-2-lg">
            {features.map((f) => (
              <div key={f.label} style={{ paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-3)' }}>{f.label}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-10)' }}>Who uses it</div>
          <div className="grid-cols-3-md">
            {useCases.map((u) => (
              <div key={u.label} style={{ paddingTop: 'var(--space-5)', borderTop: '2px solid var(--color-border)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', fontWeight: 400, margin: '0 0 var(--space-4)' }}>{u.label}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)', textAlign: 'center' as const }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)' }}>
            Ready to start building better models?
          </h2>
          <Link href="https://chat.raweval.com" style={{ display: 'inline-block', background: 'var(--color-signal)', color: 'var(--color-text-inverse)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', padding: '12px 28px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
            Start chatting →
          </Link>
        </div>
      </section>

    </main>
  );
}
