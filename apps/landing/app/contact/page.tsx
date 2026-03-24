import { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact | RawEval',
  description: 'Get in touch with the RawEval team — sales inquiries, expert applications, press, partnerships, or general questions.',
};

const channels = [
  {
    label: 'Sales & Partnerships',
    email: 'contact@raweval.com',
    desc: 'For AI labs and enterprises interested in evaluation data, pilot programs, or enterprise plans.',
    response: 'Response within 24 hours',
  },
  {
    label: 'Expert Applications',
    email: 'contact@raweval.com',
    desc: 'For domain experts interested in joining our network. Or apply directly through our expert portal.',
    response: 'Review within 5 business days',
    link: { label: 'Apply at work.raweval.com', href: 'https://work.raweval.com/apply' },
  },
  {
    label: 'Press & Media',
    email: 'contact@raweval.com',
    desc: 'For journalists, analysts, and media inquiries about AI data quality, training data provenance, or the evaluation market.',
    response: 'Response within 48 hours',
  },
  {
    label: 'Security & Compliance',
    email: 'contact@raweval.com',
    desc: 'For security questionnaires, vulnerability reports, or compliance inquiries.',
    response: 'Response within 24 hours',
    link: { label: 'View security practices', href: '/security' },
  },
  {
    label: 'API & Technical Support',
    email: 'contact@raweval.com',
    desc: 'For API integration questions, technical documentation, or developer support.',
    response: 'Response within 24 hours',
    link: { label: 'View API docs', href: '/developers' },
  },
  {
    label: 'General Inquiries',
    email: 'contact@raweval.com',
    desc: 'For everything else — investor inquiries, general questions, or just saying hi.',
    response: 'Response within 48 hours',
  },
];

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'var(--section-y)' }}>

      {/* Hero */}
      <section style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--section-y)' }}>
        <div className="grid-cols-2-lg" style={{ gap: 'var(--space-12)', alignItems: 'start' }}>
          <div>
            <div className="eyebrow"><span className="eyebrow-text">Contact</span></div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-4xl)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-tight)',
              fontWeight: 400,
              margin: '0 0 var(--space-5)',
            }}>
              Let&apos;s talk.
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-md)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              margin: '0 0 var(--space-8)',
            }}>
              Whether you&apos;re an AI lab looking for evaluation data, an expert who wants to join the network, or an investor interested in the space — we&apos;d like to hear from you.
            </p>

            {/* Team */}
            <div style={{
              padding: 'var(--space-5)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-bg-surface)',
            }}>
              <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-3)', fontSize: '10px' }}>Our Team</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>
                Distributed & Heads-down
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                We&apos;re a small, focused team building the infrastructure the AI industry needs. We move fast, ship constantly, and obsess over data quality. Reach out — we respond to every message.
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Direct channels */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-10)' }}>Direct channels</div>
          <div className="grid-cols-3-md" style={{ gap: 'var(--space-6)' }}>
            {channels.map((ch) => (
              <div key={ch.email} style={{
                padding: 'var(--space-5)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-bg-base)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>
                    {ch.label}
                  </div>
                  <a
                    href={`mailto:${ch.email}`}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-signal)',
                      letterSpacing: 'var(--tracking-wide)',
                      textDecoration: 'none',
                    }}
                  >
                    {ch.email}
                  </a>
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--leading-relaxed)',
                  margin: 0,
                  flex: 1,
                }}>
                  {ch.desc}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>
                    {ch.response}
                  </span>
                  {ch.link && (
                    <Link
                      href={ch.link.href}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--color-signal)',
                        letterSpacing: 'var(--tracking-wide)',
                        textDecoration: 'none',
                      }}
                    >
                      {ch.link.label} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-8)' }}>Not sure where to start?</div>
          <div className="grid-cols-3-md" style={{ gap: 'var(--space-4)' }}>
            <Link href="/research" className="hover-lift" style={{
              display: 'block',
              padding: 'var(--space-5)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              textDecoration: 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>I&apos;m an AI lab</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>View enterprise plans and pricing →</div>
            </Link>
            <Link href="/experts" className="hover-lift" style={{
              display: 'block',
              padding: 'var(--space-5)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              textDecoration: 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>I&apos;m an expert</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Learn about joining the network →</div>
            </Link>
            <Link href="/chat" className="hover-lift" style={{
              display: 'block',
              padding: 'var(--space-5)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              textDecoration: 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>I want to try it</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Chat with models, flag failures →</div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
