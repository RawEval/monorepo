import 'react-native-gesture-handler';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { QueryProvider } from '@/providers/query-provider';
import { useAuthStore } from '@/stores/auth-store';
import { colors } from '@/constants/tokens';
import { AnimatedSplash } from '@/components/animated-splash';

export { ErrorBoundary } from 'expo-router';

// Keep native splash visible until we're ready
SplashScreen.preventAutoHideAsync();

const rawEvalDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.signal,
    background: colors.bgBase,
    card: colors.bgSurface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.signal,
  },
};

function AuthGuard() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      hasNavigated.current = true;
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      hasNavigated.current = true;
      router.replace('/(app)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return null;
}

export default function RootLayout() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [appReady, setAppReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => {
      // Hide native splash — our animated splash takes over
      SplashScreen.hideAsync();
      setAppReady(true);
    });
  }, [checkAuth]);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  // While auth is loading OR animated splash is playing, show our splash
  if (!appReady) {
    // Native splash is still visible — show nothing (dark bg matches splash bg)
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <QueryProvider>
      <ThemeProvider value={rawEvalDarkTheme}>
        <AuthGuard />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="+not-found" options={{ animation: 'fade' }} />
        </Stack>
        <StatusBar style="light" />

        {/* Animated splash overlay — renders on top of everything, fades out */}
        {!splashDone ? <AnimatedSplash onComplete={handleSplashComplete} /> : null}
      </ThemeProvider>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
});
