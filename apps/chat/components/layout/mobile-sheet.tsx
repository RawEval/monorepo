'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@raweval/utils';

interface MobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
}

const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

export function MobileSheet({
  open,
  onOpenChange,
  children,
  side = 'left',
  className,
}: MobileSheetProps) {
  const [mounted, setMounted] = useState(open);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );

  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setDragOffset(0);
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

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!open) return;
      const touch = e.touches[0];
      if (!touch) return;
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },
    [open]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || !open) return;
      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

      if (deltaY > Math.abs(deltaX) && !isDragging) return;

      const isClosingDirection =
        side === 'left' ? deltaX < 0 : deltaX > 0;
      if (!isClosingDirection && !isDragging) return;

      setIsDragging(true);
      const offset = side === 'left' ? Math.min(0, deltaX) : Math.max(0, deltaX);
      setDragOffset(offset);
    },
    [open, side, isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !isDragging) {
      touchStartRef.current = null;
      setIsDragging(false);
      return;
    }

    const elapsed = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(dragOffset) / elapsed;
    const shouldClose =
      Math.abs(dragOffset) > SWIPE_THRESHOLD ||
      velocity > SWIPE_VELOCITY_THRESHOLD;

    if (shouldClose) {
      onOpenChange(false);
    }

    setDragOffset(0);
    setIsDragging(false);
    touchStartRef.current = null;
  }, [isDragging, dragOffset, onOpenChange]);

  const handleTransitionEnd = () => {
    if (!open) setMounted(false);
  };

  if (!mounted) return null;

  const dragTransform = isDragging
    ? `translateX(${dragOffset}px)`
    : undefined;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        style={
          isDragging
            ? {
                opacity: Math.max(
                  0,
                  0.5 * (1 - Math.abs(dragOffset) / 280)
                ),
              }
            : undefined
        }
        onClick={() => onOpenChange(false)}
        onTransitionEnd={handleTransitionEnd}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'border-border bg-background fixed top-0 bottom-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col border-r shadow-2xl',
          !isDragging && 'transition-transform duration-300 ease-out',
          side === 'left' ? 'left-0' : 'right-0',
          !isDragging &&
            (open
              ? 'translate-x-0'
              : side === 'left'
                ? '-translate-x-full'
                : 'translate-x-full'),
          className
        )}
        style={isDragging ? { transform: dragTransform } : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
      >
        {children}
      </div>
    </>
  );
}
