import Link from 'next/link';
import Image from 'next/image';

export default function ExpertsPortalEntry() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-inverse)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--section-x)' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <Image src="/logo.png" alt="RawEval" width={120} height={35} style={{ objectFit: 'contain', margin: '0 auto', filter: 'brightness(0) saturate(100%) invert(55%) sepia(82%) saturate(2200%) hue-rotate(344deg) brightness(105%) contrast(96%)' }} />
        </div>
        <div className="mono-label" style={{ color: 'var(--color-signal-light)', marginBottom: 'var(--space-5)' }}>Expert Portal</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-inverse)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-5)' }}>
          Your expertise, evaluated and rewarded.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-inverse-muted)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-10)' }}>
          Sign in to access your workbench, start interviews, and manage your expert profile.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'center' }}>
          <Link href="/login" className="btn-primary" style={{ width: '100%', maxWidth: 280, justifyContent: 'center' }}>
            Sign in &rarr;
          </Link>
          <a href="https://raweval.com/experts" className="btn-outline-inverse" style={{ width: '100%', maxWidth: 280, justifyContent: 'center' }}>
            Learn more about joining
          </a>
        </div>
        <div style={{ marginTop: 'var(--space-12)', display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-inverse-faint)', letterSpacing: 'var(--tracking-wide)' }}>&copy; {new Date().getFullYear()} RawEval Inc.</span>
        </div>
      </div>
    </div>
  );
}
