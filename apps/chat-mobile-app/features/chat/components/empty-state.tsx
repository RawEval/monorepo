import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fontSize, fonts } from '@/constants/tokens';

interface EmptyStateProps {
  onSuggestion: (prompt: string) => void;
}

const suggestions = [
  { title: 'Writing', subtitle: 'Emails & reports', prompt: 'Help me write a professional email about requesting a meeting with a client' },
  { title: 'Research', subtitle: 'Analysis & insights', prompt: 'Research and summarize the latest trends in artificial intelligence for 2026' },
  { title: 'Code', subtitle: 'Debug & optimize', prompt: 'Write a TypeScript function that debounces an async function with proper error handling' },
  { title: 'Learning', subtitle: 'Concepts simplified', prompt: 'Explain quantum computing in simple terms with real-world analogies' },
] as const;

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  const handlePress = useCallback(
    (prompt: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSuggestion(prompt);
    },
    [onSuggestion],
  );

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <Text style={styles.title}>What can I help with?</Text>
      <Text style={styles.subtitle}>AI chatbot with expert verification</Text>
      <View style={styles.grid}>
        {suggestions.map((item) => (
          <Pressable
            key={item.title}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => handlePress(item.prompt)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.subtitle}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.bottomSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing[5] },
  spacer: { flex: 3 },
  bottomSpacer: { flex: 1 },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontFamily: fonts.display,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  card: {
    width: '48.5%',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  cardPressed: { backgroundColor: colors.bgMuted },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
});
