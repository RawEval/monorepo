import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View, Dimensions } from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/constants/tokens';

const { width: SCREEN_W } = Dimensions.get('window');
const logoSource = require('@/assets/images/logo.png');

interface Props {
  onComplete: () => void;
}

export function AnimatedSplash({ onComplete }: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Phase 1: Logo fades in + scales up (0–400ms)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Phase 2: Accent line sweeps across (400–800ms)
      Animated.timing(lineWidth, {
        toValue: 1,
        duration: 400,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false, // width can't use native driver
      }).start(() => {
        // Phase 3: Hold 300ms then fade out everything (800–1400ms)
        setTimeout(() => {
          Animated.timing(containerOpacity, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }).start(onComplete);
        }, 300);
      });
    });
  }, [logoOpacity, logoScale, lineWidth, containerOpacity, onComplete]);

  const lineWidthInterp = lineWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_W * 0.4],
  });

  return (
    <Animated.View style={[s.container, { opacity: containerOpacity }]}>
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <Image source={logoSource} style={s.logo} resizeMode="contain" tintColor={colors.signal} />
      </Animated.View>

      <Animated.View style={[s.accentLine, { width: lineWidthInterp }]} />

      <Text style={s.tagline}>AI with expert verification</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  logo: {
    width: 200,
    height: 56,
  },
  accentLine: {
    height: 2,
    backgroundColor: colors.signal,
    borderRadius: 1,
    marginTop: spacing[4],
  },
  tagline: {
    color: colors.textFaint,
    fontSize: fontSize.xs,
    fontFamily: fonts.mono,
    letterSpacing: 1,
    marginTop: spacing[3],
    textTransform: 'uppercase',
  },
});
