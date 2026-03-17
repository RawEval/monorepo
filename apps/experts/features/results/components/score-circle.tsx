'use client';

import { useEffect, useState } from 'react';
import { cn } from '@raweval/utils/cn';

interface ScoreCircleProps {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#1a6b3a';
  if (score >= 60) return '#2d7a4e';
  if (score >= 40) return '#8a6a00';
  return '#c0392b';
}

export function ScoreCircle({ score, size = 160, label, className }: ScoreCircleProps) {
  const [animatedOffset, setAnimatedOffset] = useState(283);
  const strokeWidth = 10;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [targetOffset]);

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="progress-ring"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <text
          x="50"
          y="46"
          textAnchor="middle"
          fontSize="22"
          fontWeight="500"
          fill="var(--color-text-primary)"
          fontFamily="var(--font-mono)"
        >
          {score}
        </text>
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fontSize="8"
          fill="var(--color-text-muted)"
          fontFamily="var(--font-mono)"
          letterSpacing="0.06em"
        >
          / 100
        </text>
      </svg>
      {label && (
        <span className="text-sm font-[family-name:var(--font-mono)] text-[var(--color-text-muted)]">
          {label}
        </span>
      )}
    </div>
  );
}
