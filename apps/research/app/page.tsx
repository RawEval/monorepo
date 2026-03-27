'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Shield,
  Users,
  FlaskConical,
  Globe,
  CheckCircle2,
  Activity,
  FileText,
  Microscope,
  Brain,
  Loader2,
  Send,
} from 'lucide-react';

/* ================================================================== */
/* Constants                                                           */
/* ================================================================== */

const STATS = [
  { value: '50+', label: 'Medical Experts', sub: 'Credentialed MDs, PhDs, pharmacologists' },
  { value: '100+', label: 'Projects Delivered', sub: 'Annotation and evaluation engagements' },
  { value: '96.8%', label: 'Annotator Agreement', sub: 'Measured via Krippendorff\u2019s \u03B1' },
  { value: '45', label: 'Countries', sub: 'Global expert network' },
  { value: '20+', label: 'Quality Checks', sub: 'Per data point, zero synthetic data' },
  { value: '12+', label: 'Research Partners', sub: 'Labs and institutions' },
];

const DOMAINS = [
  'Cardiology',
  'Oncology',
  'Pharmacology',
  'Radiology',
  'General Medicine',
  'Neurology',
  'Clinical Trials',
  'Medical Imaging',
];

const PIPELINE_STEPS = [
  {
    num: '01',
    title: 'Capture Real Failures',
    desc: 'Our platform captures genuine AI failures in healthcare contexts \u2014 hallucinated drug interactions, incorrect diagnoses, missed contraindications, fabricated citations \u2014 from real clinical and research workflows.',
    icon: Activity,
  },
  {
    num: '02',
    title: 'Expert Annotation Pipeline',
    desc: 'Every failure is evaluated by 3\u20139 credentialed medical professionals through structured rubrics. We measure inter-annotator agreement (Krippendorff\u2019s \u03B1, Fleiss \u03BA) and reject data below our quality threshold.',
    icon: Users,
  },
  {
    num: '03',
    title: 'Deliver Research-Ready Data',
    desc: 'You receive clean, provenance-rich RLHF preference pairs, corrected completions, and scored evaluations \u2014 with full audit trails, ready for fine-tuning, benchmarking, or publication.',
    icon: FileText,
  },
];

const ROLE_OPTIONS = [
  'Principal Investigator',
  'Postdoctoral Researcher',
  'Research Scientist',
  'PhD Student',
  'Industry Researcher',
  'Clinical Researcher',
  'Other',
];

const INTEREST_OPTIONS = [
  { value: 'pilot', label: 'Request a free pilot dataset' },
  { value: 'custom', label: 'Discuss a custom annotation project' },
  { value: 'collab', label: 'Explore a research collaboration' },
  { value: 'expert', label: 'Interested in becoming an expert annotator' },
];

/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

export default function ResearchPage() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <PipelineSection />
      <TeamStrip />
      <ContactSection />
    </div>
  );
}

/* ================================================================== */
/* FOLD 1 — Hero                                                       */
/* ================================================================== */

function HeroSection() {
  return (
    <section style={{
      padding: 'var(--space-24) var(--section-x) var(--space-20)',
      maxWidth: 'var(--max-content)',
      margin: '0 auto',
    }}>
      {/* Eyebrow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 'var(--space-6)',
        animation: 'fade-up 0.6s ease-out forwards',
        opacity: 0,
      }}>
        <div style={{ width: 20, height: 1, background: 'var(--color-signal)' }} />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
          color: 'var(--color-signal)',
        }}>
          Healthcare AI Evaluation Data
        </span>
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(36px, 5vw, 64px)',
        lineHeight: 'var(--leading-tight)',
        letterSpacing: 'var(--tracking-tight)',
        color: 'var(--color-text-primary)',
        maxWidth: '820px',
        margin: 0,
        marginBottom: 'var(--space-8)',
        animation: 'fade-up 0.6s ease-out 0.1s forwards',
        opacity: 0,
      }}>
        We are building the largest expert-annotated healthcare AI dataset
      </h1>

      {/* Sub-headline */}
      <p style={{
        fontSize: 'var(--text-lg)',
        lineHeight: 'var(--leading-relaxed)',
        color: 'var(--color-text-secondary)',
        maxWidth: '620px',
        margin: 0,
        marginBottom: 'var(--space-10)',
        animation: 'fade-up 0.6s ease-out 0.2s forwards',
        opacity: 0,
      }}>
        We work with leading AI labs and healthcare institutions to improve model
        safety and accuracy through rigorously annotated evaluation data. Our
        team of credentialed medical professionals has been delivering
        production-grade datasets to select partners.
      </p>

      {/* CTAs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        flexWrap: 'wrap',
        animation: 'fade-up 0.6s ease-out 0.3s forwards',
        opacity: 0,
      }}>
        <a href="#contact" className="btn-primary" style={{ padding: '14px 28px', fontSize: 'var(--text-sm)' }}>
          Request Pilot Access
          <ArrowRight size={16} />
        </a>
        <a href="#pipeline" className="btn-secondary" style={{ padding: '14px 28px', fontSize: 'var(--text-sm)' }}>
          How It Works
        </a>
      </div>

      {/* Trust line */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
        rowGap: 'var(--space-3)',
        marginTop: 'var(--space-12)',
        paddingTop: 'var(--space-8)',
        borderTop: '1px solid var(--color-border)',
        flexWrap: 'wrap',
        animation: 'fade-up 0.6s ease-out 0.4s forwards',
        opacity: 0,
      }}>
        <TrustItem icon={Shield} text="Every annotation verified as human-generated" />
        <TrustItem icon={FlaskConical} text="Multi-annotator consensus with IAA scoring" />
        <TrustItem icon={Globe} text="Experts across 45 countries" />
      </div>
    </section>
  );
}

function TrustItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
      }}>
        {text}
      </span>
    </div>
  );
}

/* ================================================================== */
/* FOLD 2 — Stats & Domains                                            */
/* ================================================================== */

function StatsSection() {
  return (
    <section style={{
      padding: 'var(--space-20) var(--section-x)',
      background: 'var(--color-bg-surface)',
      borderTop: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
            <div style={{ width: 20, height: 1, background: 'var(--color-signal)' }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-signal)',
            }}>
              By the Numbers
            </span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
            margin: 0,
            maxWidth: '560px',
          }}>
            Built quietly, measured rigorously
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid-cols-3-md" style={{ marginBottom: 'var(--space-12)' }}>
          {STATS.map(({ value, label, sub }) => (
            <div
              key={label}
              className="stat-card"
              style={{
                padding: 'var(--space-6) var(--space-6) var(--space-5)',
                background: 'var(--color-bg-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
                lineHeight: 1.1,
              }}>
                {value}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-2)',
              }}>
                {label}
              </div>
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-normal)',
                opacity: 0.7,
              }}>
                {sub}
              </div>
            </div>
          ))}
        </div>

        {/* Domains */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-4)',
          }}>
            Active Annotation Domains
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {DOMAINS.map((domain) => (
              <span
                key={domain}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wide)',
                  color: 'var(--color-text-secondary)',
                  padding: '6px 14px',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* FOLD 3a — Pipeline                                                  */
/* ================================================================== */

function PipelineSection() {
  return (
    <section id="pipeline" style={{
      padding: 'var(--space-20) var(--section-x)',
      maxWidth: 'var(--max-content)',
      margin: '0 auto',
    }}>
      <div style={{ marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
          <div style={{ width: 20, height: 1, background: 'var(--color-signal)' }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--color-signal)',
          }}>
            How It Works
          </span>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          lineHeight: 'var(--leading-tight)',
          letterSpacing: 'var(--tracking-tight)',
          color: 'var(--color-text-primary)',
          margin: 0,
          maxWidth: '560px',
        }}>
          From AI failure to research-ready data
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {PIPELINE_STEPS.map(({ num, title, desc, icon: Icon }) => (
          <div
            key={num}
            className="card-surface"
            style={{
              padding: 'var(--space-8)',
            }}
          >
            <div
              className="pipeline-card-inner"
              style={{
                display: 'flex',
                gap: 'var(--space-6)',
                alignItems: 'flex-start',
              }}
            >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-signal-subtle)',
              border: '1px solid var(--color-signal-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={20} style={{ color: 'var(--color-signal)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  letterSpacing: 'var(--tracking-wide)',
                }}>
                  {num}
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xl)',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  lineHeight: 'var(--leading-snug)',
                }}>
                  {title}
                </h3>
              </div>
              <p style={{
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--leading-relaxed)',
                color: 'var(--color-text-secondary)',
                margin: 0,
                maxWidth: '640px',
              }}>
                {desc}
              </p>
            </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data formats note */}
      <div style={{
        marginTop: 'var(--space-8)',
        padding: 'var(--space-5) var(--space-6)',
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
        }}>
          Delivery formats
        </span>
        {['JSON', 'JSONL', 'CSV', 'Parquet', 'REST API', 'Batch Export'].map((fmt) => (
          <span
            key={fmt}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              padding: '4px 10px',
              background: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            {fmt}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/* Team Strip                                                          */
/* ================================================================== */

const TEAM = [
  {
    name: 'Raghav Gupta',
    prev: 'Cofounder, 1% Club \u00B7 CEO, Futurense',
    image: null,
    initials: 'RG',
  },
  {
    name: 'Mrinal Raj',
    prev: 'Ex FDE, Mercor',
    image: '/team/mrinal.jpg',
    initials: 'MR',
  },
  {
    name: 'Durgesh Kumar',
    prev: 'Ex TPM, Mercor',
    image: '/team/durgesh.jpg',
    initials: 'DK',
  },
];

function TeamStrip() {
  return (
    <section style={{
      padding: 'var(--space-16) var(--section-x)',
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-bg-base)',
    }}>
      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto' }}>
        {/* Eyebrow */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 'var(--space-8)',
        }}>
          <div style={{ width: 20, height: 1, background: 'var(--color-signal)' }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--color-signal)',
          }}>
            The Team
          </span>
        </div>

        {/* People cards */}
        <div className="grid-cols-3-md">
          {TEAM.map(({ name, prev, image, initials }) => (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                padding: 'var(--space-5)',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                transition: 'border-color 0.2s ease',
              }}
              className="hover-lift"
            >
              {/* Avatar */}
              {image ? (
                <img
                  src={image}
                  alt={name}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--color-border-strong)',
                    background: 'var(--color-bg-muted)',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--color-bg-muted)',
                  border: '2px solid var(--color-border-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'var(--color-text-muted)',
                  letterSpacing: 'var(--tracking-wide)',
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
              )}

              {/* Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <span style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-snug)',
                }}>
                  {name}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  letterSpacing: 'var(--tracking-wide)',
                  lineHeight: 'var(--leading-normal)',
                }}>
                  {prev}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* FOLD 3b — Contact Form                                              */
/* ================================================================== */

function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    role: '',
    researchArea: '',
    interests: [] as string[],
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleInterest(value: string) {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter((i) => i !== value)
        : [...prev.interests, value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission — replace with actual API call
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  }

  const canSubmit = formData.name.trim() && formData.email.trim() && formData.institution.trim() && formData.role;

  if (submitted) {
    return (
      <section
        id="contact"
        style={{
          padding: 'var(--space-20) var(--section-x)',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-surface)',
        }}
      >
        <div style={{
          maxWidth: '560px',
          margin: '0 auto',
          textAlign: 'center',
          padding: 'var(--space-12) 0',
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--color-success-subtle)',
            border: '2px solid var(--color-success-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6)',
          }}>
            <CheckCircle2 size={28} style={{ color: 'var(--color-success)' }} />
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--space-3)',
          }}>
            Request received
          </h3>
          <p style={{
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}>
            Thank you, {formData.name.split(' ')[0]}. Our team will reach out
            within 48 hours to discuss your pilot dataset and research needs.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contact"
      style={{
        padding: 'var(--space-20) var(--section-x)',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
      }}
    >
      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto' }}>
        <div className="grid-cols-2-lg">
          {/* Left — messaging */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
              <div style={{ width: 20, height: 1, background: 'var(--color-signal)' }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                color: 'var(--color-signal)',
              }}>
                Get in Touch
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-text-primary)',
              margin: '0 0 var(--space-5)',
            }}>
              Request a pilot dataset for your research
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-secondary)',
              margin: '0 0 var(--space-8)',
              maxWidth: '460px',
            }}>
              We are selectively partnering with research teams working on
              healthcare AI safety, evaluation, and alignment. Tell us about
              your work and we will send you a curated sample dataset.
            </p>

            {/* What you get */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                { icon: Microscope, text: 'Curated pilot dataset (50\u2013100 annotated samples)' },
                { icon: Brain, text: 'Multi-annotator consensus with full provenance' },
                { icon: FileText, text: 'Delivered in your preferred format within 48 hours' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                  <Icon size={16} style={{ color: 'var(--color-signal)', marginTop: 2, flexShrink: 0 }} />
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-normal)',
                  }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div>
            <form
              onSubmit={handleSubmit}
              style={{
                background: 'var(--color-bg-muted)',
                border: '1px solid var(--color-border)',
                borderTop: '2px solid var(--color-signal)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
              }}
            >
              {/* Name */}
              <FormField label="Full Name" required>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Dr. Jane Smith"
                  style={inputStyle}
                />
              </FormField>

              {/* Email */}
              <FormField label="Work Email" required>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="jane.smith@university.edu"
                  style={inputStyle}
                />
              </FormField>

              {/* Institution */}
              <FormField label="Institution / Organization" required>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => updateField('institution', e.target.value)}
                  placeholder="Stanford University"
                  style={inputStyle}
                />
              </FormField>

              {/* Role */}
              <FormField label="Role" required>
                <select
                  value={formData.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  style={{
                    ...inputStyle,
                    color: formData.role ? 'var(--color-text-primary)' : 'var(--color-text-faint)',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2371717A\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '36px',
                  }}
                >
                  <option value="" disabled>Select your role</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </FormField>

              {/* Research area */}
              <FormField label="Research Focus">
                <input
                  type="text"
                  value={formData.researchArea}
                  onChange={(e) => updateField('researchArea', e.target.value)}
                  placeholder="e.g., Clinical NLP, drug safety, radiology AI"
                  style={inputStyle}
                />
              </FormField>

              {/* Interests */}
              <FormField label="I'm interested in">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {INTEREST_OPTIONS.map(({ value, label }) => {
                    const checked = formData.interests.includes(value);
                    return (
                      <label
                        key={value}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          cursor: 'pointer',
                          fontSize: 'var(--text-sm)',
                          color: checked ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          padding: '6px 0',
                        }}
                      >
                        <span style={{
                          width: 16,
                          height: 16,
                          borderRadius: 'var(--radius-sm)',
                          border: checked ? '2px solid var(--color-signal)' : '2px solid var(--color-border-strong)',
                          background: checked ? 'var(--color-signal)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}>
                          {checked && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleInterest(value)}
                          style={{ display: 'none' }}
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </FormField>

              {/* Message */}
              <FormField label="Anything else">
                <textarea
                  value={formData.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  rows={3}
                  placeholder="Optional"
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                />
              </FormField>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary"
                disabled={!canSubmit || submitting}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: 'var(--text-sm)',
                  marginTop: 'var(--space-2)',
                  opacity: (!canSubmit || submitting) ? 0.5 : 1,
                  cursor: (!canSubmit || submitting) ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    Request Pilot Access
                    <Send size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Form Helpers                                                        */
/* ================================================================== */

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <label style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: 'var(--tracking-wider)',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        {label}
        {required && <span style={{ color: 'var(--color-signal)', fontSize: '10px' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
  background: 'var(--color-bg-base)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  transition: 'border-color 0.15s ease',
};
