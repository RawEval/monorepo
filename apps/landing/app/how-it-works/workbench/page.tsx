import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works: Workbench | RawEval',
  description: 'The RawEval annotation workbench — rubric-guided evaluation with triple-blind consensus.',
};

const howItWorksNav = [
  { label: 'Capture', href: '/how-it-works/capture' },
  { label: 'Vetting', href: '/how-it-works/vetting' },
  { label: 'Workbench', href: '/how-it-works/workbench' },
  { label: 'Delivery', href: '/how-it-works/delivery' },
];

const features = [
  { label: 'Rubric-guided scoring', body: 'Every task comes with a structured rubric specific to the domain and task type. Experts score on defined axes — accuracy, completeness, safety, helpfulness.' },
  { label: 'Triple-blind consensus', body: 'Three independent experts score each task without seeing each other\'s answers. Final score is computed using a weighted consensus algorithm.' },
  { label: 'Keystroke monitoring', body: 'Continuous keystroke dynamics analysis detects copy-paste, AI-generated text, and idle sessions. Anomalies are flagged for review.' },
  { label: 'Correction + rewrite', body: 'Experts don\'t just score — they correct. Rewritten model outputs become gold-standard training data for your RLHF pipeline.' },
];

export default function WorkbenchPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'var(--space-12)' }}>

      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', display: 'flex', gap: 'var(--space-1)', overflowX: 'auto' as const }}>
          {howItWorksNav.map((n) => (
            <Link key={n.href} href={n.href} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', padding: '12px 16px', textDecoration: 'none', color: n.href === '/how-it-works/workbench' ? 'var(--color-signal)' : 'var(--color-text-muted)', borderBottom: n.href === '/how-it-works/workbench' ? '2px solid var(--color-signal)' : '2px solid transparent', whiteSpace: 'nowrap' as const }}>{n.label}</Link>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
        <div style={{ maxWidth: 640, marginBottom: 'var(--space-16)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>Step 03 · Workbench</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-6)' }}>
            Where experts produce gold-standard annotations.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
            The RawEval Workbench is a purpose-built evaluation environment. Experts don&apos;t work in spreadsheets — they work in a structured, rubric-guided interface designed to maximize signal quality.
          </p>
        </div>

        <div className="grid-cols-2-lg" style={{ marginBottom: 'var(--space-12)' }}>
          {features.map((f) => (
            <div key={f.label} style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-surface)' }}>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-3)' }}>{f.label}</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
          <Link href="/how-it-works/vetting" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textDecoration: 'none' }}>← Vetting</Link>
          <Link href="/how-it-works/delivery" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', textDecoration: 'none' }}>Next: Delivery →</Link>
        </div>
      </div>

    </div>
  );
}
