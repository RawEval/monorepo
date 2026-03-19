'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Remotion-inspired animation utilities for landing pages.
 * Uses requestAnimationFrame + IntersectionObserver instead of Remotion's
 * useCurrentFrame(), but follows the same interpolation/spring patterns.
 */

// ─── Interpolation (mirrors Remotion's interpolate) ───

type Easing = (t: number) => number;

export const Easing = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 2),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  cubicOut: (t: number) => 1 - Math.pow(1 - t, 3),
  cubicInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  quartOut: (t: number) => 1 - Math.pow(1 - t, 4),
  backOut: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

export function interpolate(
  value: number,
  inputRange: [number, number],
  outputRange: [number, number],
  easing: Easing = Easing.linear,
): number {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;
  const clamped = Math.max(inMin, Math.min(inMax, value));
  const normalized = (clamped - inMin) / (inMax - inMin);
  const eased = easing(normalized);
  return outMin + eased * (outMax - outMin);
}

// ─── Spring Physics (mirrors Remotion's spring) ───

interface SpringConfig {
  damping?: number;
  mass?: number;
  stiffness?: number;
  overshootClamping?: boolean;
}

export function spring(
  progress: number,
  config: SpringConfig = {},
): number {
  const {
    damping = 10,
    mass = 1,
    stiffness = 100,
    overshootClamping = false,
  } = config;

  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const t = progress * 2;

  let result: number;
  if (zeta < 1) {
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    result = 1 - Math.exp(-zeta * omega * t) * (
      Math.cos(omegaD * t) + (zeta * omega / omegaD) * Math.sin(omegaD * t)
    );
  } else {
    result = 1 - (1 + omega * t) * Math.exp(-omega * t);
  }

  if (overshootClamping) {
    result = Math.min(1, Math.max(0, result));
  }

  return result;
}

// ─── useAnimationFrame: Remotion-style frame counter ───

export function useAnimationFrame(
  durationMs: number,
  options: {
    autoStart?: boolean;
    loop?: boolean;
    delay?: number;
  } = {},
): {
  progress: number;
  frame: number;
  isPlaying: boolean;
  start: () => void;
  reset: () => void;
} {
  const { autoStart = false, loop = false, delay = 0 } = options;
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoStart);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  const fps = 60;
  const totalFrames = Math.ceil((durationMs / 1000) * fps);

  const start = useCallback(() => {
    startTimeRef.current = null;
    setIsPlaying(true);
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    startTimeRef.current = null;
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp + delay;
      }

      const elapsed = timestamp - startTimeRef.current;
      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const p = Math.min(elapsed / durationMs, 1);
      setProgress(p);

      if (p < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else if (loop) {
        startTimeRef.current = null;
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, durationMs, loop, delay]);

  return {
    progress,
    frame: Math.floor(progress * totalFrames),
    isPlaying,
    start,
    reset,
  };
}

// ─── useScrollReveal: Trigger animation on scroll into view ───

export function useScrollReveal(
  threshold = 0.2,
): {
  ref: React.RefObject<HTMLDivElement | null>;
  isVisible: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ─── useSequence: Run stages with configurable timing ───

export function useSequence(
  stageCount: number,
  intervalMs: number,
  trigger: boolean,
): number {
  const [activeStage, setActiveStage] = useState(-1);

  useEffect(() => {
    if (!trigger) {
      setActiveStage(-1);
      return;
    }

    let current = -1;
    const interval = setInterval(() => {
      current++;
      if (current >= stageCount) {
        clearInterval(interval);
        return;
      }
      setActiveStage(current);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [trigger, stageCount, intervalMs]);

  return activeStage;
}

// ─── useTypewriter: Remotion-style string slicing ───

export function useTypewriter(
  text: string,
  options: {
    charDelayMs?: number;
    startDelay?: number;
    trigger?: boolean;
  } = {},
): {
  displayText: string;
  isComplete: boolean;
  cursorVisible: boolean;
} {
  const { charDelayMs = 40, startDelay = 0, trigger = true } = options;
  const [charIndex, setCharIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);

  useEffect(() => {
    if (!trigger) {
      setCharIndex(0);
      setStarted(false);
      return;
    }

    const timer = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(timer);
  }, [trigger, startDelay]);

  useEffect(() => {
    if (!started) return;
    if (charIndex >= text.length) return;

    const timer = setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, charDelayMs);

    return () => clearTimeout(timer);
  }, [started, charIndex, text.length, charDelayMs]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorBlink((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return {
    displayText: text.slice(0, charIndex),
    isComplete: charIndex >= text.length,
    cursorVisible: cursorBlink,
  };
}

// ─── useStaggerReveal: Reveal children one by one ───

export function useStaggerReveal(
  itemCount: number,
  staggerMs: number,
  trigger: boolean,
): boolean[] {
  const [revealed, setRevealed] = useState<boolean[]>(
    Array(itemCount).fill(false),
  );

  useEffect(() => {
    if (!trigger) {
      setRevealed(Array(itemCount).fill(false));
      return;
    }

    const timers: NodeJS.Timeout[] = [];
    for (let i = 0; i < itemCount; i++) {
      timers.push(
        setTimeout(() => {
          setRevealed((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, i * staggerMs),
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [trigger, itemCount, staggerMs]);

  return revealed;
}

// ─── useCountUp: Animated number counter ───

export function useCountUp(
  target: number,
  durationMs: number,
  trigger: boolean,
  easing: Easing = Easing.cubicOut,
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) {
      setValue(0);
      return;
    }

    const start = performance.now();
    let raf: number;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easing(progress);
      setValue(target * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [trigger, target, durationMs, easing]);

  return value;
}
