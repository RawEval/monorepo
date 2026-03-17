import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Careers | RawEval',
  description: 'Join the team building the evaluation infrastructure layer for AI. We\'re hiring engineers, operators, and researchers who believe verified human judgment is the bottleneck to better AI.',
};

const values = [
  {
    label: 'Ship infrastructure, not features',
    body: 'We build systems that labs depend on for production training runs. Reliability, correctness, and auditability matter more than speed-to-market.',
  },
  {
    label: 'Earn trust through transparency',
    body: 'Our customers trust us with their most sensitive training data. That trust is earned through radical transparency in how we handle data, verify experts, and report quality.',
  },
  {
    label: 'Small team, outsized scope',
    body: 'We\'re a pre-seed team tackling a problem that affects every frontier AI lab. Everyone here has end-to-end ownership of critical systems.',
  },
  {
    label: 'Verified over vibes',
    body: 'We measure everything — expert quality, data provenance, pipeline throughput. Opinions are welcome; data decides.',
  },
];

interface Role {
  title: string;
  type: string;
  location: string;
  team: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  compensation: string;
}

const openRoles: Role[] = [
  {
    title: 'Founding Engineer — Full Stack',
    type: 'Full-time',
    location: 'San Francisco (hybrid) or Remote (US)',
    team: 'Engineering',
    description: 'You\'ll own major surfaces across the platform — from the expert workbench to the org-facing dashboard to the evaluation pipeline. This is a generalist role where you\'ll build product, write infrastructure, and make architectural decisions that shape the system for years.',
    responsibilities: [
      'Design and build core platform features across Next.js apps (chat, expert workbench, admin)',
      'Own the evaluation pipeline from capture to delivery — API routes, queue systems, data transforms',
      'Build the org-facing dashboard for batch management, data delivery, and billing',
      'Work directly with AI lab customers to scope integrations and API requirements',
      'Make technology and architecture decisions as an early engineering hire',
    ],
    requirements: [
      '3+ years building production web applications (React/Next.js strongly preferred)',
      'Strong TypeScript skills — our entire stack is strict TypeScript',
      'Experience with databases (PostgreSQL/Prisma), queues, and API design',
      'Comfort with ambiguity — you\'ll often be building systems where the spec is a Slack message',
      'Interest in AI/ML infrastructure (you don\'t need ML experience, but you need to care about the problem)',
    ],
    niceToHave: [
      'Experience in a Turborepo or monorepo codebase',
      'Background in data infrastructure, annotation platforms, or developer tools',
      'Familiarity with Vercel, AWS, or similar cloud platforms',
    ],
    compensation: '₹18–30L base + 0.5–1.5% equity (4yr vest, 1yr cliff)',
  },
  {
    title: 'ML / Data Engineer — Anti-Cheat & Quality',
    type: 'Full-time',
    location: 'San Francisco (hybrid) or Remote (US/India)',
    team: 'Engineering',
    description: 'You\'ll build and improve Iron Dome — our anti-cheat system that detects AI-generated annotations using keystroke dynamics, behavioral biometrics, and content analysis. This role sits at the intersection of ML, security, and data quality.',
    responsibilities: [
      'Improve Iron Dome detection models — keystroke analysis, paste detection, behavioral fingerprinting',
      'Build content analysis pipelines that identify AI-generated text in real time',
      'Design and maintain quality scoring systems for expert evaluations',
      'Create adversarial test suites to continuously challenge detection capabilities',
      'Build data pipelines for training data provenance and audit trail generation',
    ],
    requirements: [
      '2+ years working with ML models in production (classification, anomaly detection, NLP)',
      'Strong Python skills with experience in PyTorch, scikit-learn, or similar frameworks',
      'Experience with time-series data, behavioral analytics, or biometric systems',
      'Understanding of LLMs and how they generate text (for detection purposes)',
      'Comfort working across the stack — models need to integrate with production systems',
    ],
    niceToHave: [
      'Published research in AI safety, adversarial ML, or fraud detection',
      'Experience building anti-cheat or anti-fraud systems',
      'Background in keystroke dynamics or stylometry',
    ],
    compensation: '₹15–25L base + 0.3–1.0% equity (4yr vest, 1yr cliff)',
  },
  {
    title: 'Expert Operations Lead',
    type: 'Full-time',
    location: 'Remote (India preferred — overlap with expert network)',
    team: 'Operations',
    description: 'You\'ll manage and grow our network of 2,400+ verified domain experts across 45 countries. This role combines community management, credential verification, quality assurance, and operational scaling. You\'re the bridge between our experts and our technology.',
    responsibilities: [
      'Own the expert onboarding pipeline — from application review to credential verification to calibration',
      'Manage expert community across domains (medicine, law, engineering, finance, research)',
      'Design and run domain-specific skill assessments for new expert applicants',
      'Monitor expert quality scores and manage tier promotions/demotions',
      'Handle expert payments, disputes, and support across 45+ countries',
      'Scale the network from 2,400 to 10,000 experts over the next 18 months',
    ],
    requirements: [
      '3+ years in operations, community management, or marketplace operations',
      'Experience managing a distributed workforce or gig economy platform',
      'Strong communication skills — you\'ll work with PhDs, attorneys, and engineers daily',
      'Data-driven approach to quality management and process improvement',
      'Comfort with tools like spreadsheets, CRMs, and basic SQL for operational reporting',
    ],
    niceToHave: [
      'Experience at an annotation or data labeling company (Scale AI, Appen, Surge, Labelbox)',
      'Background in credential verification or professional licensing',
      'Multi-language capabilities (expert network spans 45+ countries)',
    ],
    compensation: '₹12–20L base + 0.2–0.5% equity (4yr vest, 1yr cliff)',
  },
  {
    title: 'Growth & Partnerships',
    type: 'Full-time',
    location: 'San Francisco or Remote (US)',
    team: 'Business',
    description: 'You\'ll be our first dedicated business hire, responsible for building relationships with AI labs, managing the sales pipeline, and closing design partnerships. This is founder-adjacent — you\'ll shape our go-to-market strategy and represent RawEval to the most important customers in AI.',
    responsibilities: [
      'Build and manage relationships with AI lab ML/data teams',
      'Own the sales pipeline from outbound to signed LOI to first delivery',
      'Scope pilot programs with design partner labs — define deliverables, SLAs, and success criteria',
      'Represent RawEval at AI conferences, YC events, and industry meetups',
      'Develop pricing strategy and packaging for enterprise deals',
      'Build partnerships with complementary infrastructure companies',
    ],
    requirements: [
      '2+ years in sales, BD, or partnerships at a B2B SaaS or infrastructure company',
      'Understanding of the AI/ML landscape — you should know what RLHF is and why it matters',
      'Track record of closing enterprise or startup deals ($50K+ ACV)',
      'Strong writing skills — proposals, cold outreach, and technical briefs',
      'Willingness to travel to SF, NYC, and conference locations as needed',
    ],
    niceToHave: [
      'Existing relationships at frontier AI labs (OpenAI, Anthropic, Google DeepMind, Mistral, Cohere)',
      'YC network connections',
      'Technical background (engineering degree or previous technical role)',
    ],
    compensation: '₹15–25L base + commission + 0.3–0.8% equity (4yr vest, 1yr cliff)',
  },
];

export default function CareersPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'var(--section-y)' }}>

      {/* Hero */}
      <section style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--section-y)' }}>
        <div style={{ maxWidth: 680 }}>
          <div className="eyebrow"><span className="eyebrow-text">Careers</span></div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-tight)',
            fontWeight: 400,
            margin: '0 0 var(--space-6)',
          }}>
            Build the infrastructure that makes AI trustworthy.
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            margin: '0 0 var(--space-6)',
          }}>
            We&apos;re a pre-seed team building the evaluation infrastructure layer for AI. Our pipeline captures model failures, routes them to verified domain experts, and delivers audit-ready training data to frontier labs. We&apos;re hiring people who want to own critical systems at the ground floor.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: 'var(--color-success)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)' }}>
                {openRoles.length} open roles
              </span>
            </div>
            <span style={{ color: 'var(--color-border-strong)', fontSize: '11px' }}>·</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)' }}>
              San Francisco + Remote
            </span>
            <span style={{ color: 'var(--color-border-strong)', fontSize: '11px' }}>·</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)' }}>
              Pre-seed stage
            </span>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-10)' }}>How we work</div>
          <div className="grid-cols-2-lg">
            {values.map((v) => (
              <div key={v.label} style={{ paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-3)' }}>{v.label}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-10)' }}>What you get</div>
          <div className="grid-cols-3-md">
            {[
              { label: 'Meaningful equity', body: '0.2–1.5% ownership depending on role and seniority. Standard 4-year vest with 1-year cliff.' },
              { label: 'Competitive base salary', body: 'Market-rate base adjusted for stage. We don\'t ask you to take a pay cut — we ask you to bet on upside.' },
              { label: 'Health coverage', body: 'Medical and dental insurance. We cover premiums for employees.' },
              { label: 'Equipment budget', body: '₹1.5L setup budget for your workspace. Laptop, monitor, chair — whatever you need to do your best work.' },
              { label: 'Flexible location', body: 'SF-based roles are hybrid (3 days/week). Remote roles available for engineering and operations.' },
              { label: 'Direct impact', body: 'At our size, there are no layers between you and the problem. Every commit, every expert onboarded — you see the impact immediately.' },
            ].map((perk) => (
              <div key={perk.label} style={{ paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-2)' }}>{perk.label}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{perk.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-12)' }}>
            <div className="mono-label" style={{ color: 'var(--color-text-faint)', flexShrink: 0 }}>Open roles</div>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <div className="mono-label" style={{ color: 'var(--color-text-faint)', flexShrink: 0 }}>{openRoles.length} positions</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
            {openRoles.map((role) => (
              <div
                key={role.title}
                style={{
                  padding: 'var(--space-8)',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                {/* Role header */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <span className="mono-label" style={{ color: 'var(--color-signal)', background: 'var(--color-signal-subtle)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: '10px' }}>{role.team}</span>
                    <span className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '10px' }}>{role.type}</span>
                    <span style={{ color: 'var(--color-border-strong)', fontSize: '10px' }}>·</span>
                    <span className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '10px' }}>{role.location}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-snug)', fontWeight: 400, margin: '0 0 var(--space-3)' }}>{role.title}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0, maxWidth: 640 }}>{role.description}</p>
                </div>

                <div className="grid-cols-2-lg" style={{ gap: 'var(--space-8)' }}>
                  <div>
                    <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)', fontSize: '10px' }}>What you&apos;ll do</div>
                    <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {role.responsibilities.map((r) => (
                        <li key={r} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)', fontSize: '10px' }}>What we need</div>
                    <ul style={{ margin: '0 0 var(--space-5)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {role.requirements.map((r) => (
                        <li key={r} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{r}</li>
                      ))}
                    </ul>
                    {role.niceToHave.length > 0 && (
                      <>
                        <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-3)', fontSize: '10px' }}>Nice to have</div>
                        <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          {role.niceToHave.map((r) => (
                            <li key={r} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>{r}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>

                {/* Compensation + Apply */}
                <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                  <div>
                    <div className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '10px', marginBottom: '2px' }}>Compensation</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{role.compensation}</div>
                  </div>
                  <a href={`mailto:careers@raweval.com?subject=Application: ${role.title}`} className="btn-primary">
                    Apply for this role →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Don't see your role */}
      <section style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', fontWeight: 400, margin: '0 0 var(--space-4)' }}>
            Don&apos;t see your role?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', maxWidth: 480, margin: '0 auto var(--space-6)' }}>
            We&apos;re always looking for exceptional people. Send us your resume and a note about what you&apos;d build at RawEval.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:careers@raweval.com" className="btn-dark">Email careers@raweval.com</a>
            <Link href="/experts" className="btn-secondary">Join as an expert instead →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
