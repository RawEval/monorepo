import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'For Experts | RawEval',
  description: "Join RawEval's expert network. Earn by annotating prompts in your domain. Flexible pay per prompt or project-based contracts.",
};

const whyJoin = [
  { label: 'Earn on your own schedule', body: 'Pick up tasks when you want, as many as you want. No minimum hours, no lock-in.' },
  { label: 'Get paid per prompt', body: 'Most experts earn $50–200 per hour equivalent, depending on domain and tier.' },
  { label: 'Work you actually care about', body: "You're evaluating frontier AI systems on exactly the topics you're an expert in." },
  { label: 'Transparent quality scores', body: 'See your QA scores and consensus rate in real time. Rise to higher tiers as you prove performance.' },
];

const tiers = [
  { name: 'Verified', rate: '$18–30 / task', requirements: ['Domain credential verification', 'Skill assessment pass (≥75%)', 'Identity verification'] },
  { name: 'Senior', rate: '$30–60 / task', requirements: ['≥ 500 completed tasks', 'QA score ≥ 90%', 'Consensus rate ≥ 88%'] },
  { name: 'Lead', rate: '$60–120 / task', requirements: ['≥ 2,000 completed tasks', 'QA score ≥ 96%', 'Invited by RawEval team'] },
];

const steps = [
  { step: '01', label: 'Apply', body: 'Submit your credentials and domain expertise. We review within 5 business days.' },
  { step: '02', label: 'Assess', body: 'Complete a 90-minute domain skills assessment. Facial verification and ID required.' },
  { step: '03', label: 'Onboard', body: 'Take our calibration tasks to get acquainted with rubrics and quality standards.' },
  { step: '04', label: 'Earn', body: 'Tasks appear in your queue. Accept what you want, earn on your schedule.' },
];

export default function ExpertsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* Hero */}
      <section style={{ background: 'var(--color-bg-base)', paddingTop: 'var(--section-y)', paddingBottom: 'var(--section-y)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)' }}>
          <div style={{ maxWidth: 680 }}>
            <div className="mono-label" style={{ color: 'var(--color-signal)', marginBottom: 'var(--space-5)' }}>Expert Network</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-6)' }}>
              Your expertise has a market. We built the marketplace.
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-8)' }}>
              RawEval connects AI labs with verified domain experts. If you have deep knowledge in medicine, law, code, finance, or any specialized field — you can earn by evaluating AI models in your area.
            </p>
            <Link
              href="https://work.raweval.com/apply"
              className="btn-primary"
            >
              Apply to join →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-10)' }}>Why join</div>
          <div className="grid-cols-2-lg">
            {whyJoin.map((w) => (
              <div key={w.label} style={{ paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-3)' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>{w.label}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-10)' }}>How it works</div>
          <div className="grid-cols-2-lg">
            {steps.map((s) => (
              <div key={s.step} style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', flexShrink: 0, paddingTop: '3px', width: 24 }}>{s.step}</div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-2)' }}>{s.label}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier System */}
      <section style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-10)' }}>Tier system</div>
          <div className="grid-cols-3-md">
            {tiers.map((t) => (
              <div key={t.name} style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-surface)' }}>
                <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>{t.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: 'var(--color-signal)', marginBottom: 'var(--space-5)' }}>{t.rate}</div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' }}>
                  {t.requirements.map((r) => (
                    <div key={r} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', flexShrink: 0, marginTop: '2px' }}>✓</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--color-signal)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)', textAlign: 'center' as const }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: '#fff', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)' }}>
            Join 2,400 verified experts earning on their schedule.
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'rgba(255, 255, 255, 0.7)', maxWidth: 440, margin: '0 auto var(--space-8)' }}>
            Applications reviewed within 5 business days. Domain skills assessment included.
          </p>
          <Link href="https://work.raweval.com/apply" style={{ display: 'inline-block', background: '#fff', color: 'var(--color-signal)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', padding: '12px 28px', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
            Apply now →
          </Link>
        </div>
      </section>

    </div>
  );
}
