/**
 * useGoogleAuth — Google OAuth hook for React Native
 *
 * Uses expo-auth-session to get Google ID token, then sends it to
 * our backend at /auth/google (same flow as web chat app).
 *
 * Flow: Google sign-in → ID token → POST /auth/google → store tokens → set user
 */

import { useCallback, useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

import { authService } from '@/services/auth-service';
import { storeToken } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth-store';

// Required for web browser redirect to close properly
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

interface UseGoogleAuthReturn {
  signInWithGoogle: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useGoogleAuth(): UseGoogleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  const redirectUri = makeRedirectUri({
    scheme: 'raweval',
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri,
  });

  // Handle the OAuth response
  useEffect(() => {
    if (response?.type !== 'success') return;

    const idToken = response.params['id_token'];
    if (!idToken) {
      setError('No ID token received from Google');
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        // Send ID token to our backend (same as web: POST /auth/google)
        const result = await authService.googleAuth(idToken);

        // Store tokens (SecureStore in mobile, cookies in web)
        await storeToken(result.access_token, result.refresh_token);

        // Fetch and set user profile
        const user = await authService.getCurrentUser();
        setUser(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [response, setUser]);

  const signInWithGoogle = useCallback(async () => {
    if (!request) {
      setError('Google sign-in is not available');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await promptAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
      setIsLoading(false);
    }
  }, [request, promptAsync]);

  return { signInWithGoogle, isLoading, error };
}
