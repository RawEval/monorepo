'use client';

import { useMemo } from 'react';
import { cn } from '@raweval/utils/cn';
import type { InterviewPhase } from '@/features/interview/types';

interface AIAvatarProps {
  phase: InterviewPhase;
  isSpeaking: boolean;
  className?: string;
}

export function AIAvatar({ phase, isSpeaking, className }: AIAvatarProps) {
  const stateClass = useMemo(() => {
    switch (phase) {
      case 'ai_speaking':
        return 'ai-avatar--speaking';
      case 'listening':
      case 'user_speaking':
        return 'ai-avatar--listening';
      case 'processing':
      case 'evaluating':
      case 'countdown':
        return 'ai-avatar--processing';
      case 'complete':
        return 'ai-avatar--complete';
      default:
        return 'ai-avatar--idle';
    }
  }, [phase]);

  const phaseLabel = useMemo(() => {
    switch (phase) {
      case 'ai_speaking':
        return 'Speaking';
      case 'listening':
        return 'Listening';
      case 'user_speaking':
        return 'Listening';
      case 'processing':
        return 'Processing';
      case 'evaluating':
        return 'Evaluating';
      case 'countdown':
        return 'Submitting soon';
      case 'complete':
        return 'Complete';
      case 'connected':
        return 'Ready';
      default:
        return 'Waiting';
    }
  }, [phase]);

  return (
    <div className={cn('ai-avatar-root', className)}>
      <style>{avatarStyles}</style>
      <div className={cn('ai-avatar-container', stateClass)}>
        {/* Outer pulse rings */}
        <div className="ai-avatar-ring ai-avatar-ring--outer" />
        <div className="ai-avatar-ring ai-avatar-ring--middle" />
        <div className="ai-avatar-ring ai-avatar-ring--inner" />

        {/* Waveform bars (visible during speaking) */}
        <div className="ai-avatar-waveform">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="ai-avatar-waveform-bar"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>

        {/* Core avatar shape */}
        <svg
          viewBox="0 0 200 200"
          className="ai-avatar-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            className="ai-avatar-bg-circle"
          />

          {/* Head shape - geometric octagon-ish */}
          <path
            d="M100 30 L140 50 L155 90 L150 130 L130 155 L100 165 L70 155 L50 130 L45 90 L60 50 Z"
            className="ai-avatar-head"
          />

          {/* Left eye */}
          <ellipse
            cx="78"
            cy="88"
            rx="8"
            ry={isSpeaking || phase === 'ai_speaking' ? '9' : '8'}
            className="ai-avatar-eye"
          />

          {/* Right eye */}
          <ellipse
            cx="122"
            cy="88"
            rx="8"
            ry={isSpeaking || phase === 'ai_speaking' ? '9' : '8'}
            className="ai-avatar-eye"
          />

          {/* Mouth - morphs based on state */}
          {phase === 'ai_speaking' ? (
            <ellipse
              cx="100"
              cy="125"
              rx="12"
              ry="8"
              className="ai-avatar-mouth ai-avatar-mouth--speaking"
            />
          ) : (
            <path
              d="M85 122 Q100 132 115 122"
              className="ai-avatar-mouth ai-avatar-mouth--closed"
            />
          )}

          {/* Processing spinner overlay */}
          {(phase === 'processing' || phase === 'evaluating') && (
            <circle
              cx="100"
              cy="100"
              r="75"
              className="ai-avatar-spinner"
            />
          )}
        </svg>

        {/* Glow effect */}
        <div className="ai-avatar-glow" />
      </div>

      {/* Phase label */}
      <div className="ai-avatar-label">
        <span className="ai-avatar-label-dot" />
        {phaseLabel}
      </div>
    </div>
  );
}

const avatarStyles = `
  .ai-avatar-root {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    width: 100%;
  }

  .ai-avatar-container {
    position: relative;
    width: min(280px, 100%);
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ---- Rings ---- */
  .ai-avatar-ring {
    position: absolute;
    border-radius: 50%;
    border: 1.5px solid transparent;
    pointer-events: none;
    transition: all 0.6s ease;
  }

  .ai-avatar-ring--outer {
    inset: 0;
    border-color: rgba(212, 68, 12, 0.06);
  }
  .ai-avatar-ring--middle {
    inset: 12%;
    border-color: rgba(212, 68, 12, 0.08);
  }
  .ai-avatar-ring--inner {
    inset: 22%;
    border-color: rgba(212, 68, 12, 0.1);
  }

  /* Speaking: animated rings */
  .ai-avatar--speaking .ai-avatar-ring--outer {
    border-color: var(--color-signal);
    opacity: 0.4;
    animation: avatarPulseOuter 1.5s ease-in-out infinite;
  }
  .ai-avatar--speaking .ai-avatar-ring--middle {
    border-color: var(--color-signal);
    opacity: 0.5;
    animation: avatarPulseMiddle 1.5s ease-in-out 0.2s infinite;
  }
  .ai-avatar--speaking .ai-avatar-ring--inner {
    border-color: var(--color-signal);
    opacity: 0.6;
    animation: avatarPulseInner 1.5s ease-in-out 0.4s infinite;
  }

  /* Listening: subtle rings */
  .ai-avatar--listening .ai-avatar-ring--inner {
    border-color: var(--color-success);
    opacity: 0.3;
    animation: avatarBreathe 3s ease-in-out infinite;
  }

  /* Processing: spinning ring */
  .ai-avatar--processing .ai-avatar-ring--middle {
    border-color: transparent;
    border-top-color: var(--color-signal);
    border-right-color: var(--color-signal);
    opacity: 0.7;
    animation: avatarSpin 1s linear infinite;
  }

  /* Idle: breathing */
  .ai-avatar--idle .ai-avatar-ring--inner {
    border-color: rgba(212, 68, 12, 0.12);
    animation: avatarBreathe 4s ease-in-out infinite;
  }

  /* Complete: all green */
  .ai-avatar--complete .ai-avatar-ring--inner {
    border-color: var(--color-success);
    opacity: 0.5;
  }

  /* ---- SVG ---- */
  .ai-avatar-svg {
    width: 55%;
    height: 55%;
    z-index: 2;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  }

  .ai-avatar-bg-circle {
    fill: var(--color-bg-inverse);
    transition: fill 0.3s ease;
  }

  .ai-avatar--complete .ai-avatar-bg-circle {
    fill: var(--color-success);
  }

  .ai-avatar-head {
    fill: rgba(245, 242, 236, 0.08);
    stroke: rgba(245, 242, 236, 0.2);
    stroke-width: 1;
    transition: all 0.3s ease;
  }

  .ai-avatar--speaking .ai-avatar-head {
    fill: rgba(212, 68, 12, 0.12);
    stroke: rgba(212, 68, 12, 0.35);
  }

  .ai-avatar-eye {
    fill: var(--color-text-inverse);
    transition: all 0.2s ease;
  }

  .ai-avatar--speaking .ai-avatar-eye {
    fill: var(--color-signal-light);
    animation: avatarBlink 3s ease-in-out infinite;
  }

  .ai-avatar--idle .ai-avatar-eye,
  .ai-avatar--listening .ai-avatar-eye {
    animation: avatarBlink 4.5s ease-in-out infinite;
  }

  /* Mouth */
  .ai-avatar-mouth--speaking {
    fill: var(--color-signal);
    animation: avatarMouthSpeak 0.4s ease-in-out infinite alternate;
  }

  .ai-avatar-mouth--closed {
    fill: none;
    stroke: var(--color-text-inverse);
    stroke-width: 2;
    stroke-linecap: round;
  }

  .ai-avatar--complete .ai-avatar-mouth--closed {
    stroke: #fff;
  }

  /* Spinner */
  .ai-avatar-spinner {
    fill: none;
    stroke: var(--color-signal);
    stroke-width: 2;
    stroke-dasharray: 160 320;
    stroke-linecap: round;
    animation: avatarSpin 1.2s linear infinite;
    transform-origin: center;
  }

  /* ---- Waveform ---- */
  .ai-avatar-waveform {
    position: absolute;
    bottom: 18%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
    align-items: flex-end;
    height: 32px;
    z-index: 3;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .ai-avatar--speaking .ai-avatar-waveform {
    opacity: 1;
  }

  .ai-avatar-waveform-bar {
    width: 3px;
    background: var(--color-signal);
    border-radius: 2px;
    height: 8px;
    animation: avatarWave 0.6s ease-in-out infinite alternate;
  }

  /* ---- Glow ---- */
  .ai-avatar-glow {
    position: absolute;
    inset: 25%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(212, 68, 12, 0.06) 0%, transparent 70%);
    z-index: 0;
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .ai-avatar--speaking .ai-avatar-glow {
    opacity: 1;
    animation: avatarGlowPulse 2s ease-in-out infinite;
  }

  .ai-avatar--complete .ai-avatar-glow {
    background: radial-gradient(circle, rgba(45, 122, 78, 0.1) 0%, transparent 70%);
    opacity: 0.8;
  }

  /* ---- Label ---- */
  .ai-avatar-label {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
  }

  .ai-avatar-label-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-text-muted);
    transition: background 0.3s ease;
  }

  .ai-avatar--speaking .ai-avatar-label-dot {
    background: var(--color-signal);
    box-shadow: 0 0 6px rgba(212, 68, 12, 0.4);
    animation: avatarDotPulse 1s ease-in-out infinite;
  }

  .ai-avatar--listening .ai-avatar-label-dot {
    background: var(--color-success);
    box-shadow: 0 0 6px rgba(45, 122, 78, 0.4);
  }

  .ai-avatar--processing .ai-avatar-label-dot {
    background: var(--color-signal);
    animation: avatarDotPulse 0.8s ease-in-out infinite;
  }

  .ai-avatar--complete .ai-avatar-label-dot {
    background: var(--color-success);
  }

  /* ---- Keyframes ---- */
  @keyframes avatarPulseOuter {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.05); opacity: 0.5; }
  }

  @keyframes avatarPulseMiddle {
    0%, 100% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.04); opacity: 0.6; }
  }

  @keyframes avatarPulseInner {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.03); opacity: 0.7; }
  }

  @keyframes avatarBreathe {
    0%, 100% { transform: scale(1); opacity: 0.2; }
    50% { transform: scale(1.02); opacity: 0.35; }
  }

  @keyframes avatarSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes avatarBlink {
    0%, 90%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.1); }
  }

  @keyframes avatarMouthSpeak {
    0% { ry: 5; }
    100% { ry: 10; }
  }

  @keyframes avatarWave {
    0% { height: 6px; }
    100% { height: 28px; }
  }

  @keyframes avatarGlowPulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }

  @keyframes avatarDotPulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;
