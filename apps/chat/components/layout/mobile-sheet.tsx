'use client';

import { useEffect } from 'react';
import { cn } from '@raweval/utils';

interface MobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
}

export function MobileSheet({
  open,
  onOpenChange,
  children,
  side = 'left',
  className,
}: MobileSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed top-0 bottom-0 z-50 w-[280px] flex h-full flex-col bg-background border-r border-border shadow-2xl transition-transform duration-300 ease-out lg:hidden',
          side === 'left' ? 'left-0' : 'right-0',
          open
            ? side === 'left'
              ? 'translate-x-0'
              : 'translate-x-0'
            : side === 'left'
            ? '-translate-x-full'
            : 'translate-x-full',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
      >
        {children}
      </div>
    </>
  );
}