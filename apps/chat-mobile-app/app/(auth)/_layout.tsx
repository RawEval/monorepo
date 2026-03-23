import { Stack } from 'expo-router';
import { colors } from '@/constants/tokens';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgBase },
        headerStyle: { backgroundColor: colors.bgSurface },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: true,
          title: 'Reset Password',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="verify-email"
        options={{
          headerShown: true,
          title: 'Verify Email',
        }}
      />
    </Stack>
  );
}
