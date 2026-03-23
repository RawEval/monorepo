import { View as RNView, type ViewProps as RNViewProps, StyleSheet } from 'react-native';
import { colors } from '@/constants/tokens';

interface ViewProps extends RNViewProps {
  variant?: 'default' | 'surface' | 'muted';
}

export function View({ variant, style, ...props }: ViewProps) {
  return (
    <RNView
      style={[
        variant === 'surface' && styles.surface,
        variant === 'muted' && styles.muted,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.bgSurface,
  },
  muted: {
    backgroundColor: colors.bgMuted,
  },
});
