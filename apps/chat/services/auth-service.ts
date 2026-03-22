/**
 * Auth Service
 *
 * Self-contained authentication service.
 * Uses lib/api.ts (direct fetch) instead of @raweval/api-client.
 */

import { api } from '@/lib/api';
import type { TokenResponse, UserCreate, UserResponse } from '@raweval/types';

export interface GoogleAuthResponse extends TokenResponse {
  is_new_user?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

class AuthService {
  /**
   * Login with email and password.
   * Backend accepts form-encoded: username=…&password=…
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return api.post<TokenResponse>(
      '/auth/login',
      {
        email: credentials.email,
        password: credentials.password,
      },
      {
        skipAuth: true,
      }
    );
  }

  /** Register a new user */
  async register(data: UserCreate): Promise<UserResponse> {
    return api.post<UserResponse>('/auth/register', data, { skipAuth: true });
  }

  /** Get current authenticated user */
  async getCurrentUser(): Promise<UserResponse> {
    return api.get<UserResponse>('/users/me');
  }

  /** Refresh access token */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return api.post<TokenResponse>(
      '/auth/refresh',
      { refresh_token: refreshToken },
      { skipAuth: true }
    );
  }

  /** Logout — revoke refresh token */
  async logout(refreshToken?: string): Promise<void> {
    await api.post(
      '/auth/logout',
      refreshToken ? { refresh_token: refreshToken } : undefined
    );
  }

  /** Send OTP verification code to email */
  async sendVerification(email: string): Promise<unknown> {
    return api.post('/auth/send-verification', { email }, { skipAuth: true });
  }

  /** Verify email with OTP code */
  async verifyEmail(email: string, code: string): Promise<TokenResponse> {
    return api.post<TokenResponse>(
      '/auth/verify-email',
      { email, code },
      { skipAuth: true }
    );
  }

  /** Authenticate with Google ID token */
  async googleAuth(idToken: string): Promise<GoogleAuthResponse> {
    return api.post<GoogleAuthResponse>(
      '/auth/google',
      { id_token: idToken },
      { skipAuth: true }
    );
  }

  /** Request password reset OTP */
  async forgotPassword(email: string): Promise<unknown> {
    return api.post('/auth/forgot-password', { email }, { skipAuth: true });
  }

  /** Reset password with OTP code */
  async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<unknown> {
    return api.post(
      '/auth/reset-password',
      { email, code, new_password: newPassword },
      { skipAuth: true }
    );
  }
}

export const authService = new AuthService();
