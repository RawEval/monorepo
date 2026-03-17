'use client';

import { cn } from '@raweval/utils/cn';

interface TierBadgeProps {
  tier: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
}

const tierConfig = {
  1: {
    label: 'Tier 1',
    bgClass: 'bg-[var(--color-signal-subtle)]',
    borderClass: 'border-[var(--color-signal-border)]',
    textClass: 'text-[var(--color-signal)]',
    dotClass: 'bg-[var(--color-signal)]',
  },
  2: {
    label: 'Tier 2',
    bgClass: 'bg-[var(--color-bg-muted)]',
    borderClass: 'border-[var(--color-border-strong)]',
    textClass: 'text-[var(--color-text-secondary)]',
    dotClass: 'bg-[var(--color-text-muted)]',
  },
  3: {
    label: 'Tier 3',
    bgClass: 'bg-[var(--color-bg-surface)]',
    borderClass: 'border-[var(--color-border)]',
    textClass: 'text-[var(--color-text-muted)]',
    dotClass: 'bg-[var(--color-text-faint)]',
  },
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
};

export function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const config = tierConfig[tier];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-[family-name:var(--font-mono)] uppercase tracking-[var(--tracking-wide)]',
        config.bgClass,
        config.borderClass,
        config.textClass,
        sizeConfig[size],
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  );
}
