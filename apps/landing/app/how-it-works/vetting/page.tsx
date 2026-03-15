import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works: Expert Vetting | RawEval',
  description: 'How RawEval vets, verifies, and tiered expert annotators.',
};

const howItWorksNav = [
  { label: 'Capture', href: '/how-it-works/capture' },
  { label: 'Vetting', href: '/how-it-works/vetting' },
  { label: 'Workbench', href: '/how-it-works/workbench' },
  { label: 'Delivery', href: '/how-it-works/delivery' },
];

const vettingSteps = [
  { n: '01', label: 'Application review', body: 'Candidates submit credentials, domain background, and professional history. Our team reviews every application manually — no automated approvals.' },
  { n: '02', label: 'Identity verification', body: 'Facial scan matched against government ID. Continuous liveness detection during all work sessions to prevent impersonation.' },
  { n: '03', label: 'Domain skills assessment', body: 'A 90-minute blind assessment in the candidate\'s stated field. Scored by existing Lead-tier experts. Pass rate is ~32%.' },
  { n: '04', label: 'Calibration tasks', body: 'Approved experts complete a set of gold-standard tasks with known correct answers. Their scores establish a personal quality baseline.' },
  { n: '05', label: 'Ongoing monitoring', body: 'QA scores, consensus rates, and keystroke dynamics are monitored continuously. Anomalies trigger review. Underperformers are flagged automatically.' },
];

export default function VettingPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'calc(56px + var(--space-12))' }}>

      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', display: 'flex', gap: 'var(--space-1)', overflowX: 'auto' as const }}>
          {howItWorksNav.map((n) => (
            <Link key={n.href} href={n.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: 'var(--tracking-wide)', padding: '12px 16px', textDecoration: 'none', color: n.href === '/how-it-works/vetting' ? 'var(--color-signal)' : 'var(--color-text-muted)', borderBottom: n.href === '/how-it-works/vetting' ? '2px solid var(--color-signal)' : '2px solid transparent', whiteSpace: 'nowrap' as const }}>{n.label}</Link>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
        <div style={{ maxWidth: 640, marginBottom: 'var(--space-16)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>Step 02 · Vetting</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-6)' }}>
            The most rigorous expert network in the industry.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
            Only 32% of applicants pass our vetting process. We verify credentials, test skills, and continuously monitor performance — so you can trust every annotation that comes out of our platform.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {vettingSteps.map((s) => (
            <div key={s.n} style={{ display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) 0', borderTop: '1px solid var(--color-border)', alignItems: 'flex-start' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', flexShrink: 0, paddingTop: '4px', width: 28 }}>{s.n}</div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-2)' }}>{s.label}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'var(--space-12)', display: 'flex', gap: 'var(--space-6)' }}>
          <Link href="/how-it-works/capture" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textDecoration: 'none' }}>← Capture</Link>
          <Link href="/how-it-works/workbench" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', textDecoration: 'none' }}>Next: Workbench →</Link>
        </div>
      </div>

    </main>
  );
}
