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
import { authService } from '@/services/auth-service';

const logoSource = require('@/assets/images/logo.png');
import { useGoogleAuth } from '@/hooks/use-google-auth';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    signInWithGoogle,
    isLoading: isGoogleLoading,
    error: googleError,
  } = useGoogleAuth();

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
      // Send verification email, then navigate directly to verify screen
      try {
        await authService.sendVerification(email.trim());
      } catch {
        // Verification endpoint may not be required
      }
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: email.trim() },
      });
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'Please try again'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    // Navigation handled by useProtectedRoute in root layout
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
              Create your account
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
                {isGoogleLoading ? 'Signing up...' : 'Continue with Google'}
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
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
            />
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
              textContentType="newPassword"
              autoComplete="new-password"
              onSubmitEditing={handleSignup}
            />
            <Button
              title={isSubmitting ? 'Creating account...' : 'Sign Up'}
              onPress={handleSignup}
              disabled={isSubmitting || isGoogleLoading}
            />
          </View>

          <View style={styles.footer}>
            <View style={styles.loginRow}>
              <Text variant="caption">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={styles.link}>Sign in</Text>
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
  loginRow: {
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
