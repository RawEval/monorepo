import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Security | RawEval',
  description: 'Enterprise-grade security practices at RawEval — SOC 2 Type II, AES-256 encryption, biometric verification, GDPR compliance, and data isolation architecture.',
};

const practices = [
  {
    category: 'Compliance & Certifications',
    items: [
      {
        label: 'SOC 2 Type II',
        body: 'Pursuing SOC 2 Type II certification with an estimated completion date of Q3 2026. Our controls cover security, availability, processing integrity, confidentiality, and privacy.',
        status: 'In progress',
      },
      {
        label: 'GDPR Compliant',
        body: 'Full GDPR compliance including data subject access requests, right to deletion, data portability, and lawful basis documentation. DPA available on request.',
        status: 'Active',
      },
      {
        label: 'EU AI Act Ready',
        body: 'Our provenance pipeline generates the training data documentation required by Article 10 of the EU AI Act — annotator credentials, behavioral verification, quality assessments, and audit trails.',
        status: 'Active',
      },
    ],
  },
  {
    category: 'Data Protection',
    items: [
      {
        label: 'Encryption at Rest',
        body: 'All data encrypted at rest using AES-256. Database encryption, encrypted backups, and encrypted file storage. Encryption keys managed through AWS KMS with automatic rotation.',
        status: 'Active',
      },
      {
        label: 'Encryption in Transit',
        body: 'TLS 1.3 for all data in transit. HSTS enforced across all domains. Certificate pinning for API endpoints. No unencrypted connections accepted.',
        status: 'Active',
      },
      {
        label: 'Data Isolation',
        body: 'Each customer\'s evaluation data is logically isolated with row-level security. No cross-customer data access is possible. Enterprise customers can opt for dedicated database instances.',
        status: 'Active',
      },
      {
        label: 'Data Retention',
        body: 'Configurable retention policies per customer. Default 12-month retention with automatic purging. Customers can request immediate deletion at any time.',
        status: 'Active',
      },
    ],
  },
  {
    category: 'Access Control & Authentication',
    items: [
      {
        label: 'Role-Based Access Control',
        body: 'Granular RBAC across all platform surfaces. Separate permission models for experts, organizations, and internal staff. Audit logs for all access events.',
        status: 'Active',
      },
      {
        label: 'API Authentication',
        body: 'Bearer token authentication with scoped API keys. Keys can be restricted by endpoint, IP range, and rate limit. Token rotation supported without downtime.',
        status: 'Active',
      },
      {
        label: 'Expert Identity Verification',
        body: 'Multi-factor identity verification for all experts: government ID validation, professional credential verification against primary sources, and facial recognition matching.',
        status: 'Active',
      },
    ],
  },
  {
    category: 'Expert Session Security (Iron Dome)',
    items: [
      {
        label: 'Keystroke Dynamics',
        body: 'Real-time analysis of typing patterns — inter-key intervals, hold times, and rhythm — to build behavioral fingerprints. Detects copy-paste, AI-generated text insertion, and session sharing.',
        status: 'Active',
      },
      {
        label: 'Behavioral Biometrics',
        body: 'Session-level behavioral analysis including mouse movement patterns, tab-switching frequency, response time correlation with task difficulty, and vocabulary consistency.',
        status: 'Active',
      },
      {
        label: 'Camera Monitoring',
        body: 'Optional camera-based session verification for high-security evaluation tasks. Facial presence detection, multi-person detection, and screen-sharing detection.',
        status: 'Active',
      },
      {
        label: 'Content Analysis',
        body: 'Statistical analysis of annotation text for AI-generation signatures — perplexity scoring, vocabulary distribution analysis, and writing style consistency checks.',
        status: 'Active',
      },
    ],
  },
  {
    category: 'Infrastructure',
    items: [
      {
        label: 'Cloud Infrastructure',
        body: 'Hosted on AWS with VPC isolation, private subnets for databases, and WAF protection. Multi-AZ deployment for high availability. 99.9% uptime SLA for enterprise customers.',
        status: 'Active',
      },
      {
        label: 'Vulnerability Management',
        body: 'Automated dependency scanning, container image scanning, and SAST analysis in CI/CD pipeline. Critical vulnerabilities patched within 24 hours.',
        status: 'Active',
      },
      {
        label: 'Incident Response',
        body: 'Documented incident response plan with defined severity levels, escalation procedures, and communication templates. Post-incident reviews for all P1/P2 incidents.',
        status: 'Active',
      },
    ],
  },
];

export default function SecurityPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'var(--section-y)' }}>

      {/* Hero */}
      <section style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--section-y)' }}>
        <div style={{ maxWidth: 680 }}>
          <div className="eyebrow"><span className="eyebrow-text">Security</span></div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-tight)',
            fontWeight: 400,
            margin: '0 0 var(--space-6)',
          }}>
            Enterprise-grade security for the most sensitive AI training data.
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            margin: '0 0 var(--space-8)',
          }}>
            AI labs trust us with data that defines their competitive advantage. That trust requires security practices that go beyond checkboxes — from data isolation to behavioral biometrics to EU AI Act compliance.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <a href="mailto:security@raweval.com" className="btn-primary">
              Request security questionnaire
            </a>
            <a href="mailto:security@raweval.com?subject=Vulnerability Report" className="btn-secondary">
              Report a vulnerability
            </a>
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-8) var(--section-x)' }}>
          <div style={{ display: 'grid', gap: 'var(--space-6)' }} className="stats-grid">
            {[
              { value: 'AES-256', label: 'Encryption at rest' },
              { value: 'TLS 1.3', label: 'Encryption in transit' },
              { value: '99.9%', label: 'Uptime SLA (enterprise)' },
              { value: '<24h', label: 'Critical patch response' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-1)' }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security practices */}
      {practices.map((section) => (
        <section key={section.category} style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
            <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-8)' }}>{section.category}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {section.items.map((item) => (
                <div key={item.label} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 'var(--space-2)',
                  paddingTop: 'var(--space-5)',
                  borderTop: '1px solid var(--color-border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'space-between' }}>
                    <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>{item.label}</h3>
                    <span className="mono-label" style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: item.status === 'Active' ? 'var(--color-success-subtle)' : 'var(--color-warning-subtle)',
                      color: item.status === 'Active' ? 'var(--color-success)' : 'var(--color-warning)',
                      border: `1px solid ${item.status === 'Active' ? 'var(--color-success-border)' : 'rgba(138,106,0,0.2)'}`,
                      flexShrink: 0,
                    }}>
                      {item.status}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0, maxWidth: 720 }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section style={{ background: 'var(--color-bg-inverse)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-text-inverse)',
            fontWeight: 400,
            lineHeight: 'var(--leading-tight)',
            margin: '0 0 var(--space-5)',
          }}>
            Need more detail?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-inverse-muted)',
            maxWidth: 480,
            margin: '0 auto var(--space-8)',
            lineHeight: 'var(--leading-relaxed)',
          }}>
            We&apos;re happy to walk through our security practices, share our SOC 2 readiness assessment, or complete your security questionnaire.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:security@raweval.com" className="btn-primary">Email security@raweval.com</a>
            <Link href="/legal/privacy" className="btn-outline-inverse">View privacy policy</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
