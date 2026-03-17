'use client';

import { useState } from 'react';

const inputStyle: React.CSSProperties = {
  background: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-base)',
  padding: '12px 16px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const inquiryTypes = [
  { value: 'sales', label: 'Sales — I want evaluation data for my team' },
  { value: 'expert', label: 'Expert — I want to join the network' },
  { value: 'investor', label: 'Investor — I\'m interested in the company' },
  { value: 'partnership', label: 'Partnership — I want to integrate or collaborate' },
  { value: 'press', label: 'Press — Media inquiry' },
  { value: 'other', label: 'Other' },
];

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: '',
    company: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{
        padding: 'var(--space-10)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-surface)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-success-subtle)',
          border: '1px solid var(--color-success-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6 10l3 3 5-6" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-md)',
          color: 'var(--color-text-primary)',
          fontWeight: 500,
          marginBottom: 'var(--space-2)',
        }}>
          Message sent
        </div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--leading-relaxed)',
          margin: 0,
        }}>
          We&apos;ll get back to you within 24–48 hours depending on inquiry type. Check your email for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: 'var(--space-8)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-base)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '10px', marginBottom: 'var(--space-1)' }}>
        Send us a message
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <input
          type="text"
          placeholder="Your name"
          required
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          style={inputStyle}
        />
      </div>

      <input
        type="text"
        placeholder="Company / organization (optional)"
        value={formData.company}
        onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
        style={inputStyle}
      />

      <select
        required
        value={formData.inquiryType}
        onChange={(e) => setFormData((prev) => ({ ...prev, inquiryType: e.target.value }))}
        style={{
          ...inputStyle,
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%236b6b6b' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          paddingRight: '36px',
          color: formData.inquiryType ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
        }}
      >
        <option value="" disabled>What is this about?</option>
        {inquiryTypes.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <textarea
        placeholder="Your message"
        required
        rows={4}
        value={formData.message}
        onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
        style={{
          ...inputStyle,
          resize: 'vertical',
          minHeight: '100px',
          fontFamily: 'var(--font-body)',
        }}
      />

      <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
        Send message →
      </button>
    </form>
  );
}
