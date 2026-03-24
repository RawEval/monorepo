import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const footerCols = [
  {
    heading: 'Product',
    links: [
      { label: 'How It Works', href: '/how-it-works/capture' },
      { label: 'Chat', href: '/chat' },
      { label: 'Expert Network', href: '/experts' },
      { label: 'Enterprise', href: '/research' },
      { label: 'API & Docs', href: '/developers' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Security', href: '/security' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation', href: '/developers' },
      { label: 'Changelog', href: '/blog' },
      { label: 'Open Chat', href: 'https://chat.raweval.com', external: true },
      { label: 'Expert Portal', href: 'https://work.raweval.com', external: true },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-base)',
      }}
    >
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
            <Link href="/" style={{ display: 'inline-flex', marginBottom: 'var(--space-4)' }} aria-label="RawEval home">
              <Image
                src="/logo.png"
                alt="RawEval"
                width={90}
                height={26}
                style={{ objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(55%) sepia(82%) saturate(2200%) hue-rotate(344deg) brightness(105%) contrast(96%)' }}
              />
            </Link>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              AI evaluation infrastructure. Capture failures. Verify with experts. Deliver training data.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              <a
                href="https://twitter.com/raweval"
                className="footer-link"
                aria-label="RawEval on X / Twitter"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-faint)',
                  letterSpacing: 'var(--tracking-wide)',
                }}
              >
                X / Twitter
              </a>
              <span style={{ color: 'var(--color-border-strong)' }} aria-hidden="true">·</span>
              <a
                href="https://linkedin.com/company/raweval"
                className="footer-link"
                aria-label="RawEval on LinkedIn"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-faint)',
                  letterSpacing: 'var(--tracking-wide)',
                }}
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
                  className="mono-label"
                  style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-4)',
                    fontWeight: 500,
                  }}
                >
                  {col.heading}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {col.links.map((link) => {
                    const isExternal = 'external' in link && link.external;
                    if (isExternal) {
                      return (
                        <a
                          key={link.label}
                          href={link.href}
                          className="footer-link"
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {link.label}
                          <ArrowUpRight size={10} style={{ opacity: 0.4 }} />
                        </a>
                      );
                    }
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="footer-link"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
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
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            © {new Date().getFullYear()} RawEval, Inc.
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            Built for the post-synthetic era.
          </span>
        </div>
      </div>
    </footer>
  );
}
