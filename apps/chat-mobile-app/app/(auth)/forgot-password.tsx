import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, View, Button, Input } from '@/components/ui';
import { colors, spacing, fontSize, fonts } from '@/constants/tokens';
import { authService } from '@/services/auth-service';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      Alert.alert(
        'Check your email',
        'If an account exists with this email, you will receive a reset code.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Please try again'
      );
    } finally {
      setIsSubmitting(false);
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
              Reset Password
            </Text>
            <Text variant="caption" style={styles.subtitle}>
              Enter your email to receive a reset code
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
              onSubmitEditing={handleSubmit}
            />
            <Button
              title={isSubmitting ? 'Sending...' : 'Send Reset Code'}
              onPress={handleSubmit}
              disabled={isSubmitting}
            />
          </View>

          <View style={styles.footer}>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.link}>Back to Sign In</Text>
              </Pressable>
            </Link>
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
  footer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  link: {
    color: colors.signal,
    fontSize: fontSize.sm,
    fontFamily: fonts.monoMedium,
  },
});
