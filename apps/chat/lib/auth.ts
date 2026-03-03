/**
 * Token Storage — Cookie-based
 *
 * Uses js-cookie for browser-safe cookie management.
 * Self-contained — replaces @raweval/auth dependency.
 */

import Cookies from 'js-cookie';

const TOKEN_KEY = 'raweval_access_token';
const REFRESH_TOKEN_KEY = 'raweval_refresh_token';

/** Store access token (and optional refresh token) in cookies */
export function storeToken(
  token: string,
  expiresIn: number,
  refreshToken?: string
): void {
  const expiryDate = new Date(Date.now() + expiresIn * 1000);

  Cookies.set(TOKEN_KEY, token, {
    expires: expiryDate,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 30, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
}

/** Get stored access token */
export function getStoredToken(): string | null {
  return Cookies.get(TOKEN_KEY) ?? null;
}

/** Get stored refresh token */
export function getStoredRefreshToken(): string | null {
  return Cookies.get(REFRESH_TOKEN_KEY) ?? null;
}

/** Clear all tokens */
export function clearToken(): void {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

/** Check if a valid token exists */
export function hasValidToken(): boolean {
  return !!getStoredToken();
}
