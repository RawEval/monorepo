import Link from 'next/link';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Datasets', href: '/datasets' },
      { label: 'API', href: '/api-docs' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Documentation', href: '/docs' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Chat', href: 'https://chat.raweval.com' },
      { label: 'Expert Workbench', href: 'https://work.raweval.com' },
      { label: 'Landing', href: 'https://www.raweval.com' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: 'https://www.raweval.com/about' },
      { label: 'Contact', href: 'https://www.raweval.com/contact' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-base)' }}>
      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-16) var(--section-x) var(--space-10)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-10)', marginBottom: 'var(--space-12)' }}>
          {columns.map((col) => (
            <div key={col.title}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {col.links.map((link) => (
                  <Link key={link.label} href={link.href} className="footer-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '2px 0' }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-signal)', fontWeight: 500 }}>RawEval</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>RESEARCH</span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-faint)', margin: 0 }}>
            &copy; {new Date().getFullYear()} RawEval Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
