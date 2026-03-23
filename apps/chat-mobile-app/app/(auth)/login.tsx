import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, View, Button, Input } from '@/components/ui';
import { colors, spacing, radius, fontSize, fonts } from '@/constants/tokens';

const logoSource = require('@/assets/images/logo.png');
import { useAuthStore } from '@/stores/auth-store';
import { useGoogleAuth } from '@/hooks/use-google-auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useAuthStore((s) => s.login);
  const {
    signInWithGoogle,
    isLoading: isGoogleLoading,
    error: googleError,
  } = useGoogleAuth();

  // If Google auth succeeds, the hook sets isAuthenticated which triggers
  // the root layout's AuthGuard redirects to (app) when isAuthenticated becomes true
  // But for email login we explicitly navigate
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/(app)');
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'Please check your credentials'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    // Navigation is handled by useProtectedRoute in root layout
    // when isAuthenticated becomes true
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image source={logoSource} style={styles.logo} resizeMode="contain" tintColor={colors.signal} />
            <Text variant="caption" style={styles.subtitle}>
              Sign in to continue
            </Text>
          </View>

          {/* Google Sign-In */}
          <View style={styles.googleSection}>
            <Pressable
              onPress={handleGoogleSignIn}
              disabled={isGoogleLoading || isSubmitting}
              style={({ pressed }) => [
                styles.googleButton,
                pressed && styles.googleButtonPressed,
                isGoogleLoading && styles.googleButtonDisabled,
              ]}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Text style={styles.googleIcon}>G</Text>
              )}
              <Text style={styles.googleButtonText}>
                {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </Pressable>
            {googleError ? (
              <Text style={styles.errorText}>{googleError}</Text>
            ) : null}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email/Password */}
          <View style={styles.form}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              onSubmitEditing={handleLogin}
            />
            <Button
              title={isSubmitting ? 'Signing in...' : 'Sign In'}
              onPress={handleLogin}
              disabled={isSubmitting || isGoogleLoading}
            />
          </View>

          <View style={styles.footer}>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable>
                <Text style={styles.link}>Forgot password?</Text>
              </Pressable>
            </Link>
            <View style={styles.signupRow}>
              <Text variant="caption">Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <Pressable>
                  <Text style={styles.link}>Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing[6],
    gap: spacing[6],
  },
  header: {
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: 'transparent',
  },
  logo: {
    width: 160,
    height: 46,
  },
  subtitle: {
    textAlign: 'center',
  },
  // Google
  googleSection: {
    gap: spacing[2],
    backgroundColor: 'transparent',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#dadce0',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 48,
  },
  googleButtonPressed: {
    backgroundColor: '#f8faff',
    borderColor: '#d2e3fc',
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: '#3c4043',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: 'transparent',
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontFamily: fonts.mono,
  },
  // Form
  form: {
    gap: spacing[3],
    backgroundColor: 'transparent',
  },
  footer: {
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: 'transparent',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  link: {
    color: colors.signal,
    fontSize: fontSize.sm,
    fontFamily: fonts.monoMedium,
  },
});
