import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/ui';
import { colors, spacing, radius, fontSize, fonts, letterSpacing, shadows } from '@/constants/tokens';
import { formatCurrency } from '@/helpers/formatters';

export function BalanceCard({
  label,
  amount,
  accentColor,
}: {
  label: string;
  amount: number;
  accentColor: string;
}) {
  return (
    <View style={[styles.card, { borderColor: accentColor + '4D' }]}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <Text variant="label" color={colors.textMuted}>
        {label}
      </Text>
      <Text style={[styles.amount, { color: accentColor }]}>{formatCurrency(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: spacing[3],
    gap: spacing[1],
    ...shadows.sm,
  },
  accent: {
    width: spacing[5],
    height: 3,
    borderRadius: radius.full,
  },
  amount: {
    fontSize: fontSize.md,
    fontFamily: fonts.monoMedium,
    letterSpacing: letterSpacing.tight,
  },
});
