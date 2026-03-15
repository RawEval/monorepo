import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Careers | RawEval',
  description: 'Join us in building the evaluation layer for the AI industry.',
};

const openRoles = [
  { role: 'Senior Full Stack Engineer', dept: 'Engineering', location: 'San Francisco / Remote', type: 'Full-time' },
  { role: 'ML Research Scientist', dept: 'Research', location: 'San Francisco', type: 'Full-time' },
  { role: 'Product Designer', dept: 'Design', location: 'Remote', type: 'Full-time' },
  { role: 'Enterprise Sales Lead', dept: 'GTM', location: 'New York / Remote', type: 'Full-time' },
  { role: 'Data Quality Lead', dept: 'Operations', location: 'Remote', type: 'Full-time' },
];

const perks = [
  'Competitive salary + equity',
  'Full medical, dental, vision',
  'Flexible remote policy',
  '$2,000 equipment budget',
  'Unlimited PTO',
  'Annual team offsite',
];

export default function CareersPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'calc(56px + var(--section-y))' }}>

      <section style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--section-y)' }}>
        <div style={{ maxWidth: 600 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>Careers</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-6)' }}>
            Help build the evaluation infrastructure for the AI industry.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
            We&apos;re a small team working on a hard problem. If you care about AI quality, data, and building systems that matter — we want to hear from you.
          </p>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-8)' }}>Open positions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--color-border)' }}>
            {openRoles.map((job) => (
              <div key={job.role} style={{ background: 'var(--color-bg-base)', padding: 'var(--space-5)', display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>{job.role}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', display: 'flex', gap: 'var(--space-3)' }}>
                    <span>{job.dept}</span><span>·</span><span>{job.location}</span><span>·</span><span>{job.type}</span>
                  </div>
                </div>
                <a href={`mailto:careers@raweval.com?subject=Application: ${job.role}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', textDecoration: 'none', padding: '7px 14px', border: '1px solid var(--color-signal-border)', borderRadius: 'var(--radius-sm)' }}>Apply →</a>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-8)' }}>
            Don&apos;t see your role? Email <a href="mailto:careers@raweval.com" style={{ color: 'var(--color-signal)', textDecoration: 'none' }}>careers@raweval.com</a>
          </p>
        </div>
      </section>

      <section style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-10)' }}>Compensation &amp; benefits</div>
          <div className="grid-cols-3-md">
            {perks.map((p) => (
              <div key={p} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-signal)', flexShrink: 0, marginTop: '1px' }}>◈</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--color-bg-inverse)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)', textAlign: 'center' as const }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-inverse)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)' }}>
            Join as an Expert instead.
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-inverse-muted)', maxWidth: 440, margin: '0 auto var(--space-8)' }}>
            Annotate prompts on your own schedule. Earn competitive rates. No full-time commitment required.
          </p>
          <Link href="/experts" style={{ display: 'inline-block', background: 'var(--color-signal)', color: 'var(--color-text-inverse)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', padding: '12px 28px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
            Become an Expert →
          </Link>
        </div>
      </section>

    </main>
  );
}
