import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, spacing, chatBubbleRadius } from '@/constants/tokens';

export function ChatSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <View style={styles.container}>
      {/* Assistant */}
      <View style={styles.rowLeft}>
        <Animated.View style={[styles.bubbleLeft, { width: '85%', opacity }]}>
          <View style={styles.bar} />
          <View style={[styles.bar, { width: '70%' }]} />
          <View style={[styles.bar, { width: '50%' }]} />
        </Animated.View>
      </View>
      {/* User */}
      <View style={styles.rowRight}>
        <Animated.View style={[styles.bubbleRight, { width: '60%', opacity }]} />
      </View>
      {/* Assistant */}
      <View style={styles.rowLeft}>
        <Animated.View style={[styles.bubbleLeft, { width: '75%', opacity }]}>
          <View style={styles.bar} />
          <View style={[styles.bar, { width: '80%' }]} />
        </Animated.View>
      </View>
      {/* User */}
      <View style={styles.rowRight}>
        <Animated.View style={[styles.bubbleRight, { width: '50%', opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing[4], gap: spacing[3] },
  rowLeft: { flexDirection: 'row', justifyContent: 'flex-start' },
  rowRight: { flexDirection: 'row', justifyContent: 'flex-end' },
  bubbleLeft: {
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: chatBubbleRadius.assistant.topLeft,
    borderTopRightRadius: chatBubbleRadius.assistant.topRight,
    borderBottomLeftRadius: chatBubbleRadius.assistant.bottomLeft,
    borderBottomRightRadius: chatBubbleRadius.assistant.bottomRight,
    padding: spacing[4],
    gap: spacing[2],
  },
  bubbleRight: {
    backgroundColor: colors.bgMuted,
    borderTopLeftRadius: chatBubbleRadius.user.topLeft,
    borderTopRightRadius: chatBubbleRadius.user.topRight,
    borderBottomLeftRadius: chatBubbleRadius.user.bottomLeft,
    borderBottomRightRadius: chatBubbleRadius.user.bottomRight,
    height: 44,
  },
  bar: { height: 10, backgroundColor: colors.bgMuted, borderRadius: 4, width: '100%' },
});
