import Link from 'next/link';
import Image from 'next/image';

const footerCols = [
  {
    heading: 'Expert Portal',
    links: [
      { label: 'Dashboard', href: '/' },
      { label: 'Interview', href: '/interview/setup' },
      { label: 'History', href: '/history' },
      { label: 'Profile', href: '/profile' },
    ],
  },
  {
    heading: 'RawEval',
    links: [
      { label: 'Main Site', href: 'https://raweval.com', external: true },
      { label: 'Chat App', href: 'https://chat.raweval.com', external: true },
      { label: 'About', href: 'https://raweval.com/about', external: true },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: 'https://raweval.com/legal/privacy', external: true },
      { label: 'Terms of Service', href: 'https://raweval.com/legal/terms', external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-base)' }}>
      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-16) var(--section-x) var(--space-10)' }}>
        <div className="flex flex-col gap-10 md:flex-row md:gap-16">
          <div style={{ minWidth: 200, maxWidth: 260 }}>
            <Link href="https://raweval.com" style={{ display: 'inline-flex', marginBottom: 'var(--space-4)' }}>
              <Image src="/logo.png" alt="RawEval" width={90} height={26} style={{ objectFit: 'contain' }} />
            </Link>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
              Expert portal for AI evaluation infrastructure. Review and verify AI responses in your domain of expertise.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 md:grid-cols-3">
            {footerCols.map((col) => (
              <div key={col.heading}>
                <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>{col.heading}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {col.links.map((link) => {
                    const isExternal = 'external' in link && link.external;
                    if (isExternal) {
                      return (
                        <a key={link.label} href={link.href} className="footer-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {link.label}
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.4 }}><path d="M3 1h6v6M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                        </a>
                      );
                    }
                    return <Link key={link.label} href={link.href} className="footer-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{link.label}</Link>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>&copy; {new Date().getFullYear()} RawEval Inc.</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>Expert Workbench v1.0</span>
        </div>
      </div>
    </footer>
  );
}
