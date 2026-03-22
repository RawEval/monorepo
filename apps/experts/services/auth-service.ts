/**
 * Auth Service
 *
 * Authentication service for user registration, login, and token management
 */

import { ApiService } from './api-service';
import type { TokenResponse, UserResponse, UserCreate } from '@raweval/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends UserCreate {
  // email, full_name, password
}

export interface GoogleAuthResponse extends TokenResponse {
  is_new_user?: boolean;
}

export class AuthService extends ApiService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<UserResponse> {
    const response = await this.client.post<UserResponse>(
      '/auth/register',
      data,
      { skipAuth: true },
    );
    return this.handleResponse(response);
  }

  /**
   * Login and get access token
   *
   * According to OpenAPI spec: https://api.raweval.com/openapi.json
   * POST /api/v1/auth/login expects: { email: string, password: string }
   * Returns: TokenResponse with access_token, refresh_token, expires_in
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>(
      '/auth/login',
      {
        email: credentials.email,
        password: credentials.password,
      },
      {
        skipAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return this.handleResponse(response);
  }

  /**
   * Get current user information
   *
   * According to OpenAPI spec: https://api.raweval.com/openapi.json
   * GET /api/v1/users/me (requires Bearer token in Authorization header)
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await this.client.get<UserResponse>('/users/me');
    return this.handleResponse(response);
  }

  /**
   * Refresh access token (if supported)
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>(
      '/auth/refresh',
      { refresh_token: refreshToken },
      { skipAuth: true },
    );
    return this.handleResponse(response);
  }

  /**
   * Send OTP verification code to email
   */
  async sendVerification(email: string): Promise<unknown> {
    const response = await this.client.post(
      '/auth/send-verification',
      { email },
      { skipAuth: true },
    );
    return this.handleResponse(response);
  }

  /**
   * Verify email with OTP code
   */
  async verifyEmail(email: string, code: string): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>(
      '/auth/verify-email',
      { email, code },
      { skipAuth: true },
    );
    return this.handleResponse(response);
  }

  /**
   * Authenticate with Google ID token
   */
  async googleAuth(idToken: string): Promise<GoogleAuthResponse> {
    const response = await this.client.post<GoogleAuthResponse>(
      '/auth/google',
      { id_token: idToken },
      { skipAuth: true },
    );
    return this.handleResponse(response);
  }

  /**
   * Request password reset OTP
   */
  async forgotPassword(email: string): Promise<unknown> {
    const response = await this.client.post(
      '/auth/forgot-password',
      { email },
      { skipAuth: true },
    );
    return this.handleResponse(response);
  }

  /**
   * Reset password with OTP code
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<unknown> {
    const response = await this.client.post(
      '/auth/reset-password',
      { email, code, new_password: newPassword },
      { skipAuth: true },
    );
    return this.handleResponse(response);
  }
}

export const authService = new AuthService();
