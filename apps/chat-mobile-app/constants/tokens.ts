/**
 * Design Tokens — Single source of truth for the mobile chat app.
 *
 * Aligned with packages/ui/src/tokens.css and apps/chat/app/globals.css.
 * Dark theme matching the web chat app exactly.
 */

export const colors = {
  // Backgrounds (from --color-bg-*)
  bgBase: '#0A0A0B',
  bgSurface: '#141415',
  bgMuted: '#1C1C1E',
  bgElevated: '#232326',
  bgInverse: '#FAFAFA',

  // Text (from --color-text-*)
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textFaint: '#52525B',
  textInverse: '#0A0A0B',

  // Brand / Signal (from --color-signal*)
  signal: '#FF6B35',
  signalHover: '#FF8A5C',
  signalActive: '#E55A2B',
  signalSubtle: 'rgba(255, 107, 53, 0.1)',
  signalBorder: 'rgba(255, 107, 53, 0.3)',
  signalGlow: 'rgba(255, 107, 53, 0.15)',

  // Semantic
  success: '#22C55E',
  successSubtle: 'rgba(34, 197, 94, 0.1)',
  successBorder: 'rgba(34, 197, 94, 0.3)',
  info: '#3B82F6',
  warning: '#EAB308',
  error: '#EF4444',

  // Borders (from --color-border*)
  border: '#27272A',
  borderStrong: '#3F3F46',
  borderSubtle: '#1C1C1E',
  borderFocus: '#FF6B35',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
} as const;

export const fonts = {
  display: 'InstrumentSerif-Regular',
  displayItalic: 'InstrumentSerif-Italic',
  mono: 'DMMono-Regular',
  monoMedium: 'DMMono-Medium',
  body: 'System',
} as const;

// Aligned with --space-* from web tokens
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

// Aligned with --radius-* from web chat app
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Aligned with --text-* from web chat app
export const fontSize = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 32,
} as const;

// Aligned with --leading-* from web chat app
export const lineHeight = {
  tight: 1.08,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.7,
} as const;

// Aligned with --tracking-* from web chat app
export const letterSpacing = {
  tight: -0.32, // -0.02em at 16px
  normal: 0,
  wide: 0.96,   // 0.06em at 16px
  wider: 1.92,  // 0.12em at 16px
} as const;

// Shadows matching web chat app
export const shadows = {
  sm: {
    shadowColor: '#0D0D0D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#0D0D0D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0D0D0D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

// Chat-specific message bubble radii (from .msg-user / .msg-ai in globals.css)
export const chatBubbleRadius = {
  user: {
    topLeft: 20,
    topRight: 20,
    bottomLeft: 20,
    bottomRight: 4,
  },
  assistant: {
    topLeft: 10,
    topRight: 10,
    bottomLeft: 2,
    bottomRight: 10,
  },
} as const;
