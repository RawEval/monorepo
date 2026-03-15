'use client';

import Link from 'next/link';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
  toc: { id: string; title: string }[];
}

export function LegalLayout({ children, title, lastUpdated, toc }: LegalLayoutProps) {
  return (
    <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'calc(56px + var(--section-y)) var(--section-x) var(--section-y)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }} className="lg-row-layout">
        <style>{`@media (min-width: 1024px) { .lg-row-layout { flex-direction: row !important; } }`}</style>

        {/* Sidebar */}
        <aside style={{ flexShrink: 0, width: 200 }}>
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>Legal</div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginBottom: 'var(--space-8)' }}>
              {[
                { label: 'Terms of Service', href: '/legal/terms' },
                { label: 'Privacy Policy', href: '/legal/privacy' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'block',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    textDecoration: 'none',
                    color: item.label === title ? 'var(--color-signal)' : 'var(--color-text-muted)',
                    background: item.label === title ? 'var(--color-signal-subtle)' : 'transparent',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>On this page</div>
            <nav style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)', textDecoration: 'none', padding: '3px 0' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-signal)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-8)', marginBottom: 'var(--space-10)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-3)' }}>{title}</h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>Last updated: {lastUpdated}</div>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: 680,
            }}
            className="legal-prose"
          >
            <style>{`
              .legal-prose h3 { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-text-primary); font-weight: 400; margin: 2em 0 0.75em; }
              .legal-prose p { margin: 0 0 1em; }
              .legal-prose ul { padding-left: 1.5em; margin: 0 0 1em; }
              .legal-prose li { margin-bottom: 0.4em; }
              .legal-prose a { color: var(--color-signal); }
              .legal-prose strong { color: var(--color-text-primary); font-weight: 500; }
              .legal-prose section { scroll-margin-top: 80px; }
              .legal-prose .lead { font-family: var(--font-body); font-size: var(--text-md); color: var(--color-text-primary); font-weight: 400; }
              .legal-prose blockquote { border-left: 3px solid var(--color-signal); padding-left: var(--space-5); margin: var(--space-6) 0; background: var(--color-signal-subtle); padding: var(--space-5) var(--space-5) var(--space-5) var(--space-6); border-radius: 0 var(--radius-md) var(--radius-md) 0; }
            `}</style>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
