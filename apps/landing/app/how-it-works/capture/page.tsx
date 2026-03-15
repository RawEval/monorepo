import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works: Capture | RawEval',
  description: 'How RawEval captures and surfaces failed AI interactions for expert evaluation.',
};

const steps = [
  { n: '01', label: 'User sends a prompt', body: 'Your users interact with your AI product normally. RawEval monitors for low-confidence outputs, user corrections, and negative signals.' },
  { n: '02', label: 'Failure is flagged', body: 'Our QC layer automatically detects hallucinations, refusals, off-topic responses, and instruction violations using a lightweight classifier.' },
  { n: '03', label: 'Context is captured', body: 'The full conversation turn — system prompt, user message, assistant response, and metadata — is captured with full context preserved.' },
  { n: '04', label: 'Task is queued', body: 'The flagged interaction is structured into a task and routed to the expert queue, with instructions and rubric attached.' },
];

const howItWorksNav = [
  { label: 'Capture', href: '/how-it-works/capture' },
  { label: 'Vetting', href: '/how-it-works/vetting' },
  { label: 'Workbench', href: '/how-it-works/workbench' },
  { label: 'Delivery', href: '/how-it-works/delivery' },
];

export default function CapturePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'calc(56px + var(--space-12))' }}>

      {/* Step nav */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', display: 'flex', gap: 'var(--space-1)', overflowX: 'auto' as const }}>
          {howItWorksNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: 'var(--tracking-wide)',
                padding: '12px 16px',
                textDecoration: 'none',
                color: n.href === '/how-it-works/capture' ? 'var(--color-signal)' : 'var(--color-text-muted)',
                borderBottom: n.href === '/how-it-works/capture' ? '2px solid var(--color-signal)' : '2px solid transparent',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
        <div style={{ maxWidth: 640, marginBottom: 'var(--space-16)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>Step 01 · Capture</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-6)' }}>
            Every failed prompt is an opportunity for a better model.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
            RawEval starts where your model falls short. Our capture layer integrates with your chat product and automatically surfaces interactions that need expert attention — no manual review required.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {steps.map((s) => (
            <div key={s.n} style={{ display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) 0', borderTop: '1px solid var(--color-border)', alignItems: 'flex-start' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', flexShrink: 0, paddingTop: '4px', width: 28 }}>{s.n}</div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-2)' }}>{s.label}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'var(--space-12)', display: 'flex', gap: 'var(--space-4)' }}>
          <Link href="/how-it-works/vetting" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', textDecoration: 'none' }}>
            Next: Vetting →
          </Link>
        </div>
      </div>

    </main>
  );
}
