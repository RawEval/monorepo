/**
 * Token Storage — SecureStore-based (React Native equivalent of js-cookie)
 *
 * Uses expo-secure-store for encrypted, persistent token storage.
 * All operations are wrapped in try/catch to handle device-level failures.
 */

import { logger } from '@/lib/logger';

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'raweval_access_token';
const REFRESH_TOKEN_KEY = 'raweval_refresh_token';

export async function storeToken(
  token: string,
  refreshToken?: string
): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch (e) {
    logger.error('Failed to store token:', e);
  }
}

export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getStoredRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    // Best-effort cleanup
  }
}

export async function hasValidToken(): Promise<boolean> {
  const token = await getStoredToken();
  return !!token;
}
