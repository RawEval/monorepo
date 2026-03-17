import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works: Chat & Flag | RawEval',
  description: 'Chat with AI models and flag bad responses. See how your feedback turns into training data that makes AI better.',
};

const howItWorksNav = [
  { label: 'Chat & Flag', href: '/how-it-works/capture' },
  { label: 'Expert Review', href: '/how-it-works/vetting' },
  { label: 'Evaluation', href: '/how-it-works/workbench' },
  { label: 'Results', href: '/how-it-works/delivery' },
];

const steps = [
  {
    n: '01',
    label: 'Chat with any AI model',
    body: 'Open the chat and pick a model. Ask it anything — from homework help to medical questions to code review. Use it exactly like you would any other AI assistant.',
  },
  {
    n: '02',
    label: 'Spot something wrong',
    body: 'Maybe the AI made up a fact. Maybe the code has a bug. Maybe the answer is misleading. You know it when you see it — that gut feeling that something\'s off.',
  },
  {
    n: '03',
    label: 'Tap the flag button',
    body: 'One tap to flag the response. Add a quick note about what went wrong — "wrong capital city", "outdated information", "harmful advice". That\'s it. Takes 10 seconds.',
  },
  {
    n: '04',
    label: 'Earn your reward',
    body: 'Your flag goes to a verified expert for review. When they confirm the error, you earn a payout. The more accurate your flags, the higher your level and the more you earn.',
  },
];

const whatYouCanFlag = [
  'Factual errors — wrong dates, names, numbers, or claims',
  'Hallucinations — made-up sources, fake citations, invented facts',
  'Harmful content — dangerous advice, biased responses, inappropriate output',
  'Incomplete answers — missing important context or caveats',
  'Code bugs — logic errors, security issues, deprecated methods',
  'Format issues — answers that don\'t match what was asked for',
];

export default function CapturePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'var(--space-12)' }}>

      {/* Step nav */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', display: 'flex', gap: 'var(--space-1)', overflowX: 'auto' as const }}>
          {howItWorksNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
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
        {/* Hero */}
        <div style={{ maxWidth: 640, marginBottom: 'var(--space-16)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>Step 01 · Chat & Flag</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-6)' }}>
            You already know when AI gets it wrong. Now you can do something about it.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-8)' }}>
            Chat with AI models like you normally would. When something doesn&apos;t look right, flag it with one tap. You earn rewards, and the AI gets better. It&apos;s that simple.
          </p>
          <a href="https://chat.raweval.com" className="btn-primary">
            Try the Chat →
          </a>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginBottom: 'var(--space-12)' }}>
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

        {/* What you can flag */}
        <div style={{ padding: 'var(--space-8)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-12)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-6)', fontSize: '11px' }}>What you can flag</div>
          <div className="grid-cols-2-md" style={{ gap: 'var(--space-4)' }}>
            {whatYouCanFlag.map((item) => (
              <div key={item} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-signal)', fontFamily: 'var(--font-mono)', fontSize: '11px', flexShrink: 0, marginTop: '2px' }}>→</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-normal)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 'var(--space-6)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <a href="https://chat.raweval.com" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', textDecoration: 'none' }}>
            Start chatting now →
          </a>
          <Link href="/how-it-works/vetting" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textDecoration: 'none' }}>
            Next: Expert Review →
          </Link>
        </div>
      </div>

    </div>
  );
}
