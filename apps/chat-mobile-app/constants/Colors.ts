import { colors } from './tokens';

/**
 * Color scheme map for React Navigation theming.
 * Dark-first design matching the web chat app.
 */
export default {
  light: {
    text: colors.textInverse,
    background: colors.bgInverse,
    tint: colors.signal,
    tabIconDefault: colors.textMuted,
    tabIconSelected: colors.signal,
    surface: '#F4F4F5',
    border: '#E4E4E7',
  },
  dark: {
    text: colors.textPrimary,
    background: colors.bgBase,
    tint: colors.signal,
    tabIconDefault: colors.textMuted,
    tabIconSelected: colors.signal,
    surface: colors.bgSurface,
    border: colors.border,
  },
} as const;
