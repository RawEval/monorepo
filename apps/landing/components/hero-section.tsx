import Link from 'next/link';
import { MessageSquare, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

const capabilities = ['Multi-model chat', 'One-click flagging', 'Expert verification', 'Rubric scoring', 'Data delivery', 'Full provenance'];

export function HeroSection() {
  return (
    <section
      style={{
        width: '100%',
        background: 'var(--color-bg-base)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hero gradient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120%',
          height: '80%',
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255, 107, 53, 0.07), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: '96px var(--section-x) var(--section-y)',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        {/* Eyebrow badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-signal)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-signal-border)',
              background: 'var(--color-signal-subtle)',
            }}
          >
            AI Evaluation Infrastructure
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
            fontWeight: 400,
            maxWidth: '800px',
            margin: '0 auto var(--space-6)',
          }}
        >
          Turn AI failures into{' '}
          <span style={{ color: 'var(--color-signal)' }}>training data.</span>
        </h1>

        {/* Subhead */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            lineHeight: 'var(--leading-normal)',
            color: 'var(--color-text-secondary)',
            maxWidth: '560px',
            margin: '0 auto var(--space-10)',
          }}
        >
          Capture failed AI responses. Route to verified domain experts.
          Deliver audit-ready RLHF data.
        </p>

        {/* CTA row */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-12)' }}>
          <a href="https://chat.raweval.com" className="btn-primary" style={{ padding: '14px 32px', fontSize: 'var(--text-sm)' }}>
            Try the Chat <ArrowRight size={14} />
          </a>
          <Link href="/contact" className="btn-secondary" style={{ padding: '14px 28px', fontSize: 'var(--text-sm)' }}>
            Book a Demo
          </Link>
          <a href="https://work.raweval.com" className="btn-ghost" style={{ padding: '14px 20px', fontSize: 'var(--text-sm)' }}>
            Expert Workbench →
          </a>
        </div>

        {/* Trust bar */}
        <div style={{ marginBottom: 'var(--space-16)' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-text-faint)',
              marginBottom: 'var(--space-5)',
            }}
          >
            Works with all top frontier labs
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
            {capabilities.map((name) => (
              <span
                key={name}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-faint)',
                  letterSpacing: 'var(--tracking-wide)',
                  padding: '5px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Product visual — Glassmorphism chat mockup */}
        <div
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            position: 'relative',
          }}
        >
          {/* Glow behind card */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80%',
              background: 'radial-gradient(ellipse, rgba(255, 107, 53, 0.08), transparent 70%)',
              pointerEvents: 'none',
              filter: 'blur(40px)',
            }}
          />

          <div
            className="card-glass"
            style={{
              padding: 'var(--space-6)',
              position: 'relative',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Browser bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', opacity: 0.6 }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EAB308', opacity: 0.6 }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E', opacity: 0.6 }} />
              </div>
              <div
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-faint)',
                  letterSpacing: 'var(--tracking-wide)',
                }}
              >
                chat.raweval.com
              </div>
            </div>

            {/* Chat messages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* User message */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div
                  style={{
                    background: 'var(--color-signal-subtle)',
                    border: '1px solid var(--color-signal-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px 16px',
                    maxWidth: '70%',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-normal)',
                  }}
                >
                  What is the capital of Australia?
                </div>
              </div>

              {/* AI response with flag */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-start', maxWidth: '80%' }}>
                <div
                  style={{
                    background: 'var(--color-bg-muted)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-normal)',
                    position: 'relative',
                  }}
                >
                  <MessageSquare size={12} style={{ display: 'inline', marginRight: '6px', opacity: 0.5 }} />
                  The capital of Australia is Sydney, known for its iconic Opera House...
                </div>

                {/* Flag indicator */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-error-subtle)',
                    border: '1px solid var(--color-error-border)',
                  }}
                >
                  <AlertTriangle size={12} style={{ color: 'var(--color-error)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-error)', letterSpacing: 'var(--tracking-wide)' }}>
                    FLAGGED — Factual error
                  </span>
                </div>
              </div>

              {/* Correction from expert */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-start', maxWidth: '80%' }}>
                <div
                  style={{
                    background: 'var(--color-success-subtle)',
                    border: '1px solid var(--color-success-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-normal)',
                  }}
                >
                  <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '6px', color: 'var(--color-success)' }} />
                  The capital of Australia is <strong>Canberra</strong>, established in 1913...
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-success)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>
                    Expert verified · T2 · Geography
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
