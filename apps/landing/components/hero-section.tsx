'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const platformCapabilities = [
  'Multi-model comparison',
  'One-click failure flagging',
  'Expert verification pipeline',
  'FActScore rubric generation',
  'Semantic entropy analysis',
  'Keystroke anti-cheat',
  'RLHF preference pairs',
  'EU AI Act provenance',
  'Domain-matched experts',
  'Inter-annotator agreement',
  'Adaptive AI interviews',
  'Real-time data delivery',
];

export function HeroSection() {
  return (
    <section
      style={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--color-bg-base)',
      }}
    >
      {/* Animated background — data flow visualization */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Gradient glow */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '140%',
          height: '80%',
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212, 68, 12, 0.06), transparent 70%)',
        }} />

        {/* Animated SVG data flow */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, opacity: 0.35 }}
        >
          {/* Grid */}
          {Array.from({ length: 30 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="800" stroke="var(--color-border)" strokeWidth="0.3" opacity="0.3" />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 40} x2="1200" y2={i * 40} stroke="var(--color-border)" strokeWidth="0.3" opacity="0.3" />
          ))}

          {/* Flowing data paths */}
          <path d="M0 400 C200 300, 400 500, 600 400 S1000 300, 1200 400" fill="none" stroke="var(--color-signal)" strokeWidth="1" opacity="0.15" strokeDasharray="8 12">
            <animate attributeName="stroke-dashoffset" values="0;-40" dur="4s" repeatCount="indefinite" />
          </path>
          <path d="M0 420 C300 320, 500 520, 700 420 S1100 320, 1200 420" fill="none" stroke="var(--color-signal)" strokeWidth="0.5" opacity="0.1" strokeDasharray="4 8">
            <animate attributeName="stroke-dashoffset" values="0;-24" dur="6s" repeatCount="indefinite" />
          </path>
          <path d="M0 380 C150 480, 350 280, 550 380 S950 480, 1200 380" fill="none" stroke="var(--color-signal)" strokeWidth="0.5" opacity="0.08" strokeDasharray="6 10">
            <animate attributeName="stroke-dashoffset" values="0;-32" dur="5s" repeatCount="indefinite" />
          </path>

          {/* Nodes along paths */}
          {[150, 350, 600, 850, 1050].map((x, i) => (
            <g key={`n${i}`}>
              <circle cx={x} cy={400 + (i % 2 ? -20 : 20)} r={i === 2 ? 4 : 2.5} fill="var(--color-signal)" opacity={0.2 + i * 0.05}>
                <animate attributeName="opacity" values={`${0.15 + i * 0.05};${0.3 + i * 0.05};${0.15 + i * 0.05}`} dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
              </circle>
              {i === 2 && (
                <circle cx={x} cy={400} r="12" fill="none" stroke="var(--color-signal)" strokeWidth="0.5" opacity="0.1">
                  <animate attributeName="r" values="8;16;8" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.15;0;0.15" dur="3s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          ))}

          {/* Floating particles */}
          {Array.from({ length: 12 }).map((_, i) => {
            const x = 100 + (i * 95);
            const y = 200 + (i % 3) * 200;
            return (
              <circle key={`p${i}`} cx={x} cy={y} r="1.5" fill="var(--color-signal)" opacity="0.12">
                <animate attributeName="cy" values={`${y};${y - 30};${y}`} dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.08;0.2;0.08" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
              </circle>
            );
          })}
        </svg>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: 'linear-gradient(transparent, var(--color-bg-base))',
        }} />
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: '120px var(--section-x) var(--section-y)',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        {/* Eyebrow badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-signal)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-signal-border)',
              background: 'var(--color-signal-subtle)',
            }}
          >
            AI Evaluation Infrastructure
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
            fontWeight: 400,
            maxWidth: '800px',
            margin: '0 auto var(--space-6)',
          }}
        >
          Turn AI failures into{' '}
          <span style={{ color: 'var(--color-signal)' }}>training data.</span>
        </h1>

        {/* Subhead */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            lineHeight: 'var(--leading-normal)',
            color: 'var(--color-text-secondary)',
            maxWidth: '560px',
            margin: '0 auto var(--space-10)',
          }}
        >
          Capture failed AI responses. Route to verified domain experts.
          Deliver audit-ready RLHF data.
        </p>

        {/* CTA row */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-12)' }}>
          <a href="https://chat.raweval.com" className="btn-primary" style={{ padding: '14px 32px', fontSize: 'var(--text-sm)' }}>
            Try the Chat <ArrowRight size={14} />
          </a>
          <Link href="/contact" className="btn-secondary" style={{ padding: '14px 28px', fontSize: 'var(--text-sm)' }}>
            Book a Demo
          </Link>
          <a href="https://work.raweval.com" className="btn-ghost" style={{ padding: '14px 20px', fontSize: 'var(--text-sm)' }}>
            Expert Workbench →
          </a>
        </div>

        {/* Capability pills — scrolling ticker-style */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-text-faint)',
              marginBottom: 'var(--space-5)',
            }}
          >
            End-to-end evaluation pipeline
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            maxWidth: 720,
            margin: '0 auto',
          }}>
            {platformCapabilities.map((name) => (
              <span
                key={name}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--color-text-faint)',
                  letterSpacing: 'var(--tracking-wide)',
                  padding: '4px 10px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Pipeline visualization — 4 steps */}
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--space-1)',
          }}
        >
          {[
            { step: '01', label: 'Capture', desc: 'Chat flags AI failures' },
            { step: '02', label: 'Route', desc: 'Match to domain experts' },
            { step: '03', label: 'Verify', desc: 'Iron Dome anti-cheat' },
            { step: '04', label: 'Deliver', desc: 'RLHF-ready training data' },
          ].map((s, i) => (
            <div
              key={s.step}
              style={{
                padding: 'var(--space-4) var(--space-3)',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: i === 0 ? 'var(--radius-lg) 0 0 var(--radius-lg)' : i === 3 ? '0 var(--radius-lg) var(--radius-lg) 0' : 0,
                textAlign: 'center',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'var(--color-signal)',
                letterSpacing: 'var(--tracking-wider)',
                marginBottom: '4px',
              }}>
                {s.step}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                fontWeight: 500,
                marginBottom: '2px',
              }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
              }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
