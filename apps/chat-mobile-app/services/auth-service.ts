/**
 * Auth Service — ported from apps/chat/services/auth-service.ts
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
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return api.post<TokenResponse>(
      '/auth/login',
      {
        email: credentials.email,
        password: credentials.password,
      },
      { skipAuth: true }
    );
  }

  async register(data: UserCreate): Promise<UserResponse> {
    return api.post<UserResponse>('/auth/register', data, { skipAuth: true });
  }

  async getCurrentUser(): Promise<UserResponse> {
    return api.get<UserResponse>('/users/me');
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return api.post<TokenResponse>(
      '/auth/refresh',
      { refresh_token: refreshToken },
      { skipAuth: true }
    );
  }

  async logout(refreshToken?: string): Promise<void> {
    await api.post(
      '/auth/logout',
      refreshToken ? { refresh_token: refreshToken } : undefined
    );
  }

  async sendVerification(email: string): Promise<unknown> {
    return api.post('/auth/send-verification', { email }, { skipAuth: true });
  }

  async verifyEmail(email: string, code: string): Promise<TokenResponse> {
    return api.post<TokenResponse>(
      '/auth/verify-email',
      { email, code },
      { skipAuth: true }
    );
  }

  async googleAuth(idToken: string): Promise<GoogleAuthResponse> {
    return api.post<GoogleAuthResponse>(
      '/auth/google',
      { id_token: idToken },
      { skipAuth: true }
    );
  }

  async forgotPassword(email: string): Promise<unknown> {
    return api.post('/auth/forgot-password', { email }, { skipAuth: true });
  }

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
