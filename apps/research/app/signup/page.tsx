import Link from 'next/link';
import type { Metadata } from 'next';
import { UserPlus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign Up | RawEval Research',
  description: 'Create a RawEval Research account to access verified AI evaluation datasets and API access.',
};

export default function SignupPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--section-x)' }}>
      <div style={{ width: '100%', maxWidth: 'var(--max-narrow)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--color-signal-subtle)', border: '1px solid var(--color-signal-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-5)' }}>
            <UserPlus size={22} style={{ color: 'var(--color-signal)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-2)' }}>
            Create your account
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            Get started with 100 free prompts. No credit card required.
          </p>
        </div>

        {/* Card */}
        <div className="card-surface" style={{ padding: 'var(--space-8)' }}>
          <form action="#" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>
                Full name
              </label>
              <input
                type="text"
                placeholder="Jane Smith"
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>
                Work email
              </label>
              <input
                type="email"
                placeholder="jane@company.com"
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Organization */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>
                Organization
              </label>
              <input
                type="text"
                placeholder="Acme AI Research"
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="At least 8 characters"
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Terms checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <input
                type="checkbox"
                readOnly
                style={{
                  width: 16,
                  height: 16,
                  marginTop: 2,
                  accentColor: 'var(--color-signal)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-normal)' }}>
                I agree to the{' '}
                <Link href="/signup" style={{ color: 'var(--color-signal)' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/signup" style={{ color: 'var(--color-signal)' }}>Privacy Policy</Link>
              </span>
            </div>

            {/* Submit */}
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', padding: '14px 24px', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}
            >
              Create Account
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-6)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-signal)', fontWeight: 500 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
