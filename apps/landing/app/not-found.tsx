import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: 480,
        padding: '0 var(--section-x)',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(80px, 15vw, 160px)',
          color: 'var(--color-border)',
          lineHeight: 1,
          marginBottom: 'var(--space-4)',
        }}>
          404
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          color: 'var(--color-text-primary)',
          fontWeight: 400,
          margin: '0 0 var(--space-3)',
        }}>
          This page doesn&apos;t exist.
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--leading-relaxed)',
          margin: '0 0 var(--space-8)',
        }}>
          The page you&apos;re looking for may have moved or doesn&apos;t exist. Try one of these instead:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
          {[
            { label: 'Homepage', href: '/', desc: 'See what RawEval does' },
            { label: 'Enterprise', href: '/research', desc: 'Evaluation data for AI labs' },
            { label: 'Expert Network', href: '/experts', desc: 'Join and start earning' },
            { label: 'Blog', href: '/blog', desc: 'Research and market analysis' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
              }}
            >
              <div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {link.label}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                  {link.desc}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-signal)' }}>→</span>
            </Link>
          ))}
        </div>
        <Link
          href="/"
          className="btn-secondary"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
