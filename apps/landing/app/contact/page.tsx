import { Metadata } from 'next';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact | RawEval',
  description: 'Get in touch with the RawEval team for enterprise sales, expert applications, press, or general inquiries.',
};

const channels = [
  { label: 'Enterprise sales', desc: 'Pricing & integration questions', email: 'sales@raweval.com' },
  { label: 'Expert network', desc: 'Joining as an annotator or evaluator', email: 'experts@raweval.com' },
  { label: 'Press & media', desc: 'Coverage, interviews, partnerships', email: 'press@raweval.com' },
  { label: 'General', desc: 'Everything else', email: 'hello@raweval.com' },
];

export default function ContactPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'calc(56px + var(--section-y))' }}>
      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--section-y)' }}>

        <div style={{ marginBottom: 'var(--space-16)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>Contact</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-5)' }}>
            Get in touch.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-muted)', maxWidth: 480, margin: 0 }}>
            Choose the right channel below or send us a direct message.
          </p>
        </div>

        <div className="grid-cols-2-lg">

          {/* Channels */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>Direct channels</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {channels.map((c) => (
                <a
                  key={c.email}
                  href={`mailto:${c.email}`}
                  style={{ display: 'block', padding: 'var(--space-5)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', textDecoration: 'none', background: 'var(--color-bg-surface)' }}
                >
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>{c.label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>{c.desc}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)' }}>{c.email}</div>
                </a>
              ))}
            </div>
            <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-5)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-surface)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>Office</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                548 Market St<br />San Francisco, CA 94104
              </div>
            </div>
          </div>

          {/* Form */}
          <ContactForm />

        </div>

      </div>
    </main>
  );
}
