'use client';

import { useMemo } from 'react';
import { cn } from '@raweval/utils/cn';
import type { InterviewPhase } from '@/features/interview/types';

interface AIAvatarProps {
  phase: InterviewPhase;
  isSpeaking: boolean;
  className?: string;
}

/**
 * Professional AI interviewer avatar.
 * Head-and-shoulders silhouette with animated speaking indicators.
 */
export function AIAvatar({ phase, isSpeaking, className }: AIAvatarProps) {
  const stateClass = useMemo(() => {
    switch (phase) {
      case 'ai_speaking': return 'ava--speaking';
      case 'listening':
      case 'user_speaking': return 'ava--listening';
      case 'processing':
      case 'evaluating':
      case 'countdown': return 'ava--processing';
      case 'complete': return 'ava--complete';
      default: return 'ava--idle';
    }
  }, [phase]);

  const phaseLabel = useMemo(() => {
    switch (phase) {
      case 'ai_speaking': return 'Speaking';
      case 'listening': return 'Listening';
      case 'user_speaking': return 'Listening to you';
      case 'processing': return 'Processing';
      case 'evaluating': return 'Evaluating';
      case 'countdown': return 'Auto-submitting';
      case 'complete': return 'Interview Complete';
      case 'connected': return 'Ready';
      default: return 'Connecting';
    }
  }, [phase]);

  return (
    <div className={cn('ava-root', className)}>
      <style>{css}</style>

      <div className={cn('ava-container', stateClass)}>
        {/* Ambient rings */}
        <div className="ava-ring ava-ring--1" />
        <div className="ava-ring ava-ring--2" />

        {/* Soundwave bars (speaking) */}
        <div className="ava-wave">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="ava-wave-bar" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>

        {/* Avatar illustration */}
        <svg viewBox="0 0 240 240" className="ava-svg" xmlns="http://www.w3.org/2000/svg">
          {/* Background circle */}
          <circle cx="120" cy="120" r="110" className="ava-bg" />

          {/* Shoulders */}
          <path
            d="M40 210 C40 175 75 155 120 155 C165 155 200 175 200 210"
            className="ava-body"
          />

          {/* Neck */}
          <rect x="105" y="140" width="30" height="22" rx="6" className="ava-body" />

          {/* Head */}
          <ellipse cx="120" cy="105" rx="42" ry="50" className="ava-head" />

          {/* Hair / top styling */}
          <path
            d="M78 95 Q78 58 120 55 Q162 58 162 95"
            className="ava-hair"
          />

          {/* Left eye */}
          <g className="ava-eye-group">
            <ellipse cx="104" cy="105" rx="5" ry={isSpeaking ? '5.5' : '5'} className="ava-eye" />
            <ellipse cx="105" cy="103.5" rx="2" ry="2" className="ava-eye-light" />
          </g>

          {/* Right eye */}
          <g className="ava-eye-group">
            <ellipse cx="136" cy="105" rx="5" ry={isSpeaking ? '5.5' : '5'} className="ava-eye" />
            <ellipse cx="137" cy="103.5" rx="2" ry="2" className="ava-eye-light" />
          </g>

          {/* Eyebrows */}
          <path d="M95 93 Q104 89 113 92" className="ava-brow" />
          <path d="M127 92 Q136 89 145 93" className="ava-brow" />

          {/* Nose hint */}
          <path d="M118 112 L120 118 L122 112" className="ava-nose" />

          {/* Mouth */}
          {phase === 'ai_speaking' ? (
            <ellipse cx="120" cy="128" rx="10" ry="6" className="ava-mouth ava-mouth--open" />
          ) : phase === 'complete' ? (
            <path d="M108 125 Q120 135 132 125" className="ava-mouth ava-mouth--smile" />
          ) : (
            <path d="M110 128 Q120 132 130 128" className="ava-mouth ava-mouth--rest" />
          )}

          {/* Glasses / professional detail */}
          <circle cx="104" cy="105" r="12" className="ava-glasses" />
          <circle cx="136" cy="105" r="12" className="ava-glasses" />
          <line x1="116" y1="105" x2="124" y2="105" className="ava-glasses-bridge" />

          {/* Processing spinner */}
          {(phase === 'processing' || phase === 'evaluating') && (
            <circle cx="120" cy="120" r="105" className="ava-spinner" />
          )}
        </svg>

        {/* Glow */}
        <div className="ava-glow" />
      </div>

      {/* Label */}
      <div className="ava-label">
        <span className="ava-label-dot" />
        {phaseLabel}
      </div>
    </div>
  );
}

const css = `
  .ava-root { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); width: 100%; }
  .ava-container { position: relative; width: min(260px, 100%); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; }

  /* Rings */
  .ava-ring { position: absolute; border-radius: 50%; border: 1.5px solid transparent; pointer-events: none; transition: all 0.6s ease; }
  .ava-ring--1 { inset: 0; border-color: rgba(212,68,12,0.06); }
  .ava-ring--2 { inset: 8%; border-color: rgba(212,68,12,0.08); }
  .ava--speaking .ava-ring--1 { border-color: var(--color-signal); opacity: 0.35; animation: avaRing 1.8s ease-in-out infinite; }
  .ava--speaking .ava-ring--2 { border-color: var(--color-signal); opacity: 0.5; animation: avaRing 1.8s ease-in-out 0.3s infinite; }
  .ava--listening .ava-ring--2 { border-color: var(--color-success); opacity: 0.25; animation: avaBreathe 3s ease-in-out infinite; }
  .ava--processing .ava-ring--2 { border-color: transparent; border-top-color: var(--color-signal); border-right-color: var(--color-signal); opacity: 0.6; animation: avaSpin 1s linear infinite; }
  .ava--complete .ava-ring--2 { border-color: var(--color-success); opacity: 0.4; }

  /* SVG */
  .ava-svg { width: 60%; height: 60%; z-index: 2; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25)); }
  .ava-bg { fill: #1a1a1a; stroke: rgba(245,242,236,0.06); stroke-width: 1; }
  .ava--complete .ava-bg { fill: #1a3a2a; }
  .ava-body { fill: rgba(212,68,12,0.15); stroke: rgba(212,68,12,0.25); stroke-width: 1; }
  .ava--speaking .ava-body { fill: rgba(212,68,12,0.25); stroke: rgba(212,68,12,0.4); }
  .ava--complete .ava-body { fill: rgba(45,122,78,0.2); stroke: rgba(45,122,78,0.3); }
  .ava-head { fill: rgba(245,242,236,0.12); stroke: rgba(245,242,236,0.2); stroke-width: 1; transition: all 0.3s; }
  .ava--speaking .ava-head { fill: rgba(245,242,236,0.16); stroke: rgba(212,68,12,0.3); }
  .ava-hair { fill: none; stroke: rgba(245,242,236,0.15); stroke-width: 3; stroke-linecap: round; }
  .ava-eye { fill: var(--color-text-inverse); transition: all 0.2s; }
  .ava--speaking .ava-eye { fill: var(--color-signal-light); }
  .ava-eye-light { fill: rgba(255,255,255,0.4); }
  .ava-eye-group { animation: avaBlink 4s ease-in-out infinite; }
  .ava--speaking .ava-eye-group { animation: avaBlink 3s ease-in-out infinite; }
  .ava-brow { fill: none; stroke: rgba(245,242,236,0.25); stroke-width: 1.5; stroke-linecap: round; }
  .ava-nose { fill: none; stroke: rgba(245,242,236,0.1); stroke-width: 1; stroke-linecap: round; }
  .ava-glasses { fill: none; stroke: rgba(245,242,236,0.18); stroke-width: 1.2; }
  .ava--speaking .ava-glasses { stroke: rgba(212,68,12,0.3); }
  .ava-glasses-bridge { stroke: rgba(245,242,236,0.15); stroke-width: 1.2; }
  .ava-mouth--open { fill: var(--color-signal); animation: avaMouth 0.35s ease-in-out infinite alternate; }
  .ava-mouth--rest { fill: none; stroke: rgba(245,242,236,0.3); stroke-width: 1.5; stroke-linecap: round; }
  .ava-mouth--smile { fill: none; stroke: var(--color-success); stroke-width: 2; stroke-linecap: round; }
  .ava-spinner { fill: none; stroke: var(--color-signal); stroke-width: 2; stroke-dasharray: 200 460; stroke-linecap: round; animation: avaSpin 1.2s linear infinite; transform-origin: center; }

  /* Soundwave */
  .ava-wave { position: absolute; bottom: 14%; left: 50%; transform: translateX(-50%); display: flex; gap: 3px; align-items: flex-end; height: 36px; z-index: 3; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
  .ava--speaking .ava-wave { opacity: 1; }
  .ava-wave-bar { width: 3px; background: var(--color-signal); border-radius: 2px; height: 6px; animation: avaWave 0.5s ease-in-out infinite alternate; }

  /* Glow */
  .ava-glow { position: absolute; inset: 20%; border-radius: 50%; background: radial-gradient(circle, rgba(212,68,12,0.08) 0%, transparent 70%); z-index: 0; opacity: 0; transition: opacity 0.5s; }
  .ava--speaking .ava-glow { opacity: 1; animation: avaGlow 2s ease-in-out infinite; }
  .ava--complete .ava-glow { background: radial-gradient(circle, rgba(45,122,78,0.1) 0%, transparent 70%); opacity: 0.7; }

  /* Label */
  .ava-label { display: flex; align-items: center; gap: var(--space-2); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-text-inverse-muted); letter-spacing: var(--tracking-wide); text-transform: uppercase; }
  .ava-label-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-text-inverse-faint); transition: all 0.3s; }
  .ava--speaking .ava-label-dot { background: var(--color-signal); box-shadow: 0 0 8px rgba(212,68,12,0.5); animation: avaDotPulse 1s infinite; }
  .ava--listening .ava-label-dot { background: var(--color-success); box-shadow: 0 0 6px rgba(45,122,78,0.4); }
  .ava--processing .ava-label-dot { background: var(--color-signal); animation: avaDotPulse 0.6s infinite; }
  .ava--complete .ava-label-dot { background: var(--color-success); }

  /* Keyframes */
  @keyframes avaRing { 0%,100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.04); opacity: 0.5; } }
  @keyframes avaBreathe { 0%,100% { transform: scale(1); opacity: 0.2; } 50% { transform: scale(1.02); opacity: 0.3; } }
  @keyframes avaSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes avaBlink { 0%,92%,100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
  @keyframes avaMouth { 0% { ry: 4; } 100% { ry: 8; } }
  @keyframes avaWave { 0% { height: 5px; } 100% { height: 30px; } }
  @keyframes avaGlow { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
  @keyframes avaDotPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }

  @media (prefers-reduced-motion: reduce) {
    .ava-ring, .ava-wave-bar, .ava-glow, .ava-eye-group, .ava-mouth--open, .ava-label-dot, .ava-spinner {
      animation: none !important;
    }
  }
`;
