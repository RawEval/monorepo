'use client';

import { useState } from 'react';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
  background: 'var(--color-bg-base)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>Send a message</div>
      {sent ? (
        <div style={{ padding: 'var(--space-8)', background: 'var(--color-success-subtle)', border: '1px solid var(--color-success-border)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-success)', letterSpacing: 'var(--tracking-wide)', marginBottom: 'var(--space-3)' }}>Message sent</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>We&apos;ll get back to you within one business day.</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', marginBottom: 'var(--space-2)' }}>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', marginBottom: 'var(--space-2)' }}>Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', marginBottom: 'var(--space-2)' }}>Subject</label>
            <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', marginBottom: 'var(--space-2)' }}>Message</label>
            <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more..." style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>
          <button
            type="submit"
            style={{ background: 'var(--color-signal)', color: 'var(--color-text-inverse)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', padding: '12px 24px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', alignSelf: 'flex-start' as const, transition: 'background 0.15s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-signal-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-signal)')}
          >
            Send message →
          </button>
        </form>
      )}
    </div>
  );
}
