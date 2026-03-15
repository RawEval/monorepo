'use client';

import { useState } from 'react';

export function CTASection() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="get-access" style={{ width: '100%', background: 'var(--color-signal)' }}>
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: 'var(--section-y) var(--section-x)',
          display: 'grid',
          gap: 'var(--space-12)',
          alignItems: 'start',
        }}
        className="grid-cols-1 lg:grid-cols-2"
      >
        {/* Left */}
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-text-inverse)',
              fontWeight: 'var(--weight-normal)' as unknown as number,
              marginBottom: 'var(--space-4)',
            }}
          >
            The pipe is built. First deliveries are loading.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-inverse-muted)',
            }}
          >
            Three infra layers live. Payment rails wired. Expert vetting pipeline running.
            The first 500-sample batch ships within 30 days of your LOI.
          </p>
        </div>

        {/* Right — Form */}
        <div>
          {submitted ? (
            <div
              style={{
                background: 'rgba(245,242,236,0.15)',
                border: '1px solid rgba(245,242,236,0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-8)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse)', letterSpacing: 'var(--tracking-wide)' }}>
                Request received →
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse-muted)', marginTop: 'var(--space-2)' }}>
                We&apos;ll be in touch within 48 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { key: 'name', placeholder: 'Your name', type: 'text' },
                { key: 'email', placeholder: 'Work email', type: 'email' },
                { key: 'company', placeholder: 'Company / team', type: 'text' },
              ].map((field) => (
                <input
                  key={field.key}
                  type={field.type}
                  placeholder={field.placeholder}
                  required
                  value={formData[field.key as keyof typeof formData]}
                  onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  style={{
                    background: 'rgba(245,242,236,0.15)',
                    border: '1px solid rgba(245,242,236,0.25)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-inverse)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-base)',
                    padding: '12px 16px',
                    width: '100%',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              ))}
              <button
                type="submit"
                style={{
                  background: 'transparent',
                  color: 'var(--color-text-inverse)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wide)',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(245,242,236,0.4)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  marginTop: 'var(--space-1)',
                }}
              >
                Request early access →
              </button>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'rgba(245,242,236,0.4)',
                  marginTop: 'var(--space-1)',
                }}
              >
                Pre-seed · $800K round · raweval.com · sales@raweval.com
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
