/**
 * Token Storage
 *
 * Client-side token storage utilities using Cookies
 * OAuth2-compliant with access_token and refresh_token
 */

import Cookies from 'js-cookie';

const TOKEN_KEY = 'raweval_access_token';
const REFRESH_TOKEN_KEY = 'raweval_refresh_token';

/**
 * Store access token and optional refresh token in cookies
 */
export function storeToken(
  token: string,
  expiresIn: number,
  refreshToken?: string
): void {
  // Calculate expiry date
  const expiryDate = new Date(Date.now() + expiresIn * 1000);

  // Store access token with expiry
  Cookies.set(TOKEN_KEY, token, {
    expires: expiryDate,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  if (refreshToken) {
    // Refresh token usually has longer expiry, let's assume 30 days if not provided
    // or we can set it to never expire (user logout clears it)
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 30, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
}

/**
 * Get stored access token from cookies
 */
export function getStoredToken(): string | null {
  const token = Cookies.get(TOKEN_KEY);
  return token || null;
}

/**
 * Get stored refresh token from cookies
 */
export function getStoredRefreshToken(): string | null {
  const token = Cookies.get(REFRESH_TOKEN_KEY);
  return token || null;
}

/**
 * Clear stored tokens from cookies
 */
export function clearToken(): void {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

/**
 * Check if token exists and is valid
 */
export function hasValidToken(): boolean {
  return !!getStoredToken();
}
