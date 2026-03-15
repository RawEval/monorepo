import Link from 'next/link';
import Image from 'next/image';

const footerCols = [
  {
    heading: 'Products',
    links: [
      { label: 'Chat', href: 'https://chat.raweval.com' },
      { label: 'Expert Network', href: 'https://experts.raweval.com' },
      { label: 'Workbench', href: 'https://workbench.raweval.com' },
      { label: 'Enterprise', href: '/organizations' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'For Experts', href: '/experts' },
      { label: 'How It Works', href: '/how-it-works/capture' },
      { label: 'API Docs', href: 'https://docs.raweval.com' },
      { label: 'Status', href: 'https://status.raweval.com' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Security', href: '/security' },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-base)' }}>
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: 'var(--space-16) var(--section-x) var(--space-10)',
        }}
      >
        {/* Top row */}
        <div className="flex flex-col gap-10 md:flex-row md:gap-16">
          {/* Brand */}
          <div style={{ minWidth: 200, maxWidth: 260 }}>
            <Link href="/" style={{ display: 'inline-flex', marginBottom: 'var(--space-4)' }}>
              <Image src="/logo.png" alt="RawEval" width={90} height={26} style={{ objectFit: 'contain' }} />
            </Link>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
              Human-verified AI evaluation infrastructure. The gold standard for model alignment and safety testing.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              <a
                href="https://twitter.com/raweval"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', textDecoration: 'none', letterSpacing: 'var(--tracking-wide)' }}
                className="footer-link"
              >
                X / Twitter
              </a>
              <span style={{ color: 'var(--color-border-strong)' }}>·</span>
              <a
                href="https://linkedin.com/company/raweval"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', textDecoration: 'none', letterSpacing: 'var(--tracking-wide)' }}
                className="footer-link"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid flex-1 grid-cols-2 gap-8 md:grid-cols-4">
            {footerCols.map((col) => (
              <div key={col.heading}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--color-text-faint)',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  {col.heading}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {col.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="footer-link"
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-muted)',
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            marginTop: 'var(--space-12)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>
            © {new Date().getFullYear()} RawEval Inc. · San Francisco, CA
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>
            Built for the post-synthetic era.
          </span>
        </div>
      </div>
    </footer>
  );
}
