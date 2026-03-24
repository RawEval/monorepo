import { TextInput, type TextInputProps, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize } from '@/constants/tokens';

interface InputProps extends TextInputProps {
  variant?: 'default' | 'ghost';
}

export function Input({ variant = 'default', style, ...props }: InputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[
        styles.base,
        variant === 'default' && styles.default,
        variant === 'ghost' && styles.ghost,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 44,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  default: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});
