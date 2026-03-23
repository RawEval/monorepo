'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.raweval.com';

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

interface TopicOption {
  value: string;
  label: string;
}

// Hardcoded fallback topics (used if API fetch fails)
const fallbackTopics: TopicOption[] = [
  { value: 'Enterprise', label: 'Enterprise — I want evaluation data for my team' },
  { value: 'Partnership', label: 'Partnership — I want to integrate or collaborate' },
  { value: 'Demo Request', label: 'Demo Request — I want to see RawEval in action' },
  { value: 'Pricing', label: 'Pricing — I want to understand costs' },
  { value: 'Support', label: 'Support — I need help with something' },
  { value: 'Feedback', label: 'Feedback — I have a suggestion' },
  { value: 'Other', label: 'Other' },
];

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    organization: '',
    description: '',
  });
  const [topics, setTopics] = useState<TopicOption[]>(fallbackTopics);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch topics from backend (admin-configurable)
  useEffect(() => {
    fetch(`${API_URL}/api/v1/contact/topics`)
      .then((res) => res.json())
      .then((data) => {
        if (data.topics && Array.isArray(data.topics)) {
          setTopics(
            data.topics.map((t: string) => ({
              value: t,
              label: t,
            }))
          );
        }
      })
      .catch(() => {
        // Keep fallback topics
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/contact/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          organization: formData.organization || null,
          topic: formData.topic,
          description: formData.description,
        }),
      });

      if (res.status === 429) {
        setError('Too many submissions. Please try again in a few minutes.');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.detail?.message || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
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
          We&apos;ll get back to you within 24–48 hours. Check your email for a confirmation.
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
          minLength={2}
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
        value={formData.organization}
        onChange={(e) => setFormData((prev) => ({ ...prev, organization: e.target.value }))}
        style={inputStyle}
      />

      <select
        required
        value={formData.topic}
        onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
        style={{
          ...inputStyle,
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%236b6b6b' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          paddingRight: '36px',
          color: formData.topic ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
        }}
      >
        <option value="" disabled>What is this about?</option>
        {topics.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <textarea
        placeholder="Your message"
        required
        rows={4}
        minLength={10}
        value={formData.description}
        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        style={{
          ...inputStyle,
          resize: 'vertical',
          minHeight: '100px',
          fontFamily: 'var(--font-body)',
        }}
      />

      {error && (
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-error, #ef4444)',
          padding: '8px 12px',
          background: 'var(--color-error-subtle, rgba(239,68,68,0.1))',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-error-border, rgba(239,68,68,0.2))',
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={submitting}
        style={{
          alignSelf: 'flex-start',
          opacity: submitting ? 0.7 : 1,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Sending...' : 'Send message →'}
      </button>
    </form>
  );
}
