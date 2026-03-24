import { Pressable, type PressableProps, StyleSheet } from 'react-native';
import { colors, radius, spacing, fonts, letterSpacing } from '@/constants/tokens';
import { Text } from './Text';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'signal';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ title, variant = 'primary', size = 'md', style, ...props }: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'signal' && styles.signal,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed } as Parameters<typeof style>[0]) : style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.text,
          variant === 'primary' && styles.primaryText,
          variant === 'secondary' && styles.secondaryText,
          variant === 'ghost' && styles.ghostText,
          variant === 'signal' && styles.signalText,
          size === 'sm' && styles.smText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 44,
  },
  primary: { backgroundColor: colors.signal },
  secondary: { backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  signal: { backgroundColor: colors.signalSubtle, borderWidth: 1, borderColor: colors.signalBorder },
  sm: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], minHeight: 36 },
  lg: { paddingHorizontal: spacing[6], paddingVertical: spacing[4], minHeight: 52 },
  pressed: { opacity: 0.8 },
  text: { fontWeight: '600', fontSize: 15 },
  smText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: letterSpacing.wide },
  primaryText: { color: colors.textInverse },
  secondaryText: { color: colors.textPrimary },
  ghostText: { color: colors.signal },
  signalText: { color: colors.signal, fontFamily: fonts.monoMedium },
});
