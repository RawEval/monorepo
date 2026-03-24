import Link from 'next/link';
import type { Metadata } from 'next';
import { LogIn } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Log In | RawEval Research',
  description: 'Log in to your RawEval Research account to access datasets and API keys.',
};

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--section-x)' }}>
      <div style={{ width: '100%', maxWidth: 'var(--max-narrow)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--color-signal-subtle)', border: '1px solid var(--color-signal-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-5)' }}>
            <LogIn size={22} style={{ color: 'var(--color-signal)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-2)' }}>
            Welcome back
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            Log in to access your datasets and API keys
          </p>
        </div>

        {/* Card */}
        <div className="card-surface" style={{ padding: 'var(--space-8)' }}>
          <form action="#" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-faint)' }}>
                  Password
                </label>
                <Link href="/login" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="Enter your password"
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

            {/* Submit */}
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', padding: '14px 24px', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}
            >
              Log in
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-6)' }}>
          {"Don't have an account? "}
          <Link href="/signup" style={{ color: 'var(--color-signal)', fontWeight: 500 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
