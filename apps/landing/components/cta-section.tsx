import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section
      style={{
        width: '100%',
        background: 'linear-gradient(180deg, var(--color-bg-base), #080808)',
        borderTop: '1px solid var(--color-border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: 'var(--space-24) var(--section-x)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
            fontWeight: 400,
            marginBottom: 'var(--space-8)',
          }}
        >
          Ready to capture what AI gets wrong?
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
          <a
            href="https://chat.raweval.com"
            className="btn-primary"
            style={{ padding: '16px 40px', fontSize: 'var(--text-sm)' }}
          >
            Try the Chat <ArrowRight size={14} />
          </a>
          <a
            href="https://work.raweval.com"
            className="btn-secondary"
            style={{ padding: '16px 32px', fontSize: 'var(--text-sm)' }}
          >
            Expert Workbench →
          </a>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-faint)',
          }}
        >
          Chat with AI models, flag bad responses, and help build better AI.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-6)',
            marginTop: 'var(--space-6)',
          }}
        >
          <Link
            href="/organizations"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wide)',
            }}
            className="footer-link"
          >
            For enterprises
          </Link>
          <span style={{ color: 'var(--color-border)', fontSize: 'var(--text-xs)' }}>·</span>
          <Link
            href="/developers"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wide)',
            }}
            className="footer-link"
          >
            Read the docs
          </Link>
          <span style={{ color: 'var(--color-border)', fontSize: 'var(--text-xs)' }}>·</span>
          <Link
            href="/contact"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wide)',
            }}
            className="footer-link"
          >
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  );
}
