import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/ui';
import { colors, spacing, radius, fontSize, fonts, letterSpacing } from '@/constants/tokens';

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

export function SettingsRow({
  label,
  value,
  onPress,
  destructive,
  chevron,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  chevron?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
    >
      <Text style={[styles.rowLabel, destructive && styles.destructive]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={styles.rowValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {chevron && onPress ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wider,
    marginBottom: spacing[2],
    marginTop: spacing[4],
    paddingHorizontal: spacing[1],
  },
  sectionCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.bgMuted,
  },
  rowLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexShrink: 1,
  },
  rowValue: {
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
  },
  destructive: {
    color: colors.error,
  },
});
