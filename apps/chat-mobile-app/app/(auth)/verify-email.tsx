import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, View, Button, Input } from '@/components/ui';
import { colors, spacing, fontSize, fonts } from '@/constants/tokens';
import { authService } from '@/services/auth-service';
import { storeToken } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth-store';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email ?? '');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);

  const handleVerify = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the full 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authService.verifyEmail(email.trim(), code);
      await storeToken(response.access_token, response.refresh_token);

      const user = await authService.getCurrentUser();
      setUser(user);

      router.replace('/(app)');
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        error instanceof Error ? error.message : 'Invalid or expired code'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    setIsResending(true);
    try {
      await authService.sendVerification(email.trim());
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to resend code'
      );
    } finally {
      setIsResending(false);
    }
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
            <Text variant="display" style={styles.title}>
              Verify Email
            </Text>
            <Text variant="caption" style={styles.subtitle}>
              Enter the code sent to your email
            </Text>
          </View>

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
              placeholder="000000"
              value={code}
              onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              style={styles.codeInput}
            />

            <Button
              title={isVerifying ? 'Verifying...' : 'Verify'}
              onPress={handleVerify}
              disabled={isVerifying}
            />
          </View>

          <View style={styles.footer}>
            <Pressable onPress={handleResend} disabled={isResending}>
              <Text style={styles.link}>
                {isResending ? 'Sending...' : 'Resend code'}
              </Text>
            </Pressable>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.link}>Back to Sign In</Text>
            </Pressable>
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
    gap: spacing[8],
  },
  header: {
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: 'transparent',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    gap: spacing[3],
    backgroundColor: 'transparent',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: fontSize.xl,
    fontFamily: fonts.monoMedium,
    letterSpacing: 8,
  },
  footer: {
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: 'transparent',
  },
  link: {
    color: colors.signal,
    fontSize: fontSize.sm,
    fontFamily: fonts.monoMedium,
  },
});
