import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, fonts, fontSize as fontSizes, lineHeight, letterSpacing } from '@/constants/tokens';

interface TextProps extends RNTextProps {
  variant?: 'body' | 'heading' | 'caption' | 'mono' | 'label' | 'display';
  color?: string;
}

export function Text({ variant = 'body', color, style, ...props }: TextProps) {
  return (
    <RNText
      style={[
        styles.base,
        variant === 'heading' && styles.heading,
        variant === 'caption' && styles.caption,
        variant === 'mono' && styles.mono,
        variant === 'label' && styles.label,
        variant === 'display' && styles.display,
        color ? { color } : undefined,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.textPrimary,
    fontSize: fontSizes.base,
    lineHeight: fontSizes.base * lineHeight.normal,
    fontFamily: fonts.body,
  },
  heading: {
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeight.tight,
    fontWeight: '700',
    letterSpacing: letterSpacing.tight,
  },
  caption: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeight.normal,
    color: colors.textSecondary,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeight.normal,
  },
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
  display: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    lineHeight: fontSizes['2xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
});
