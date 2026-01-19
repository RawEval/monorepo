/**
 * Auth Service
 * 
 * Authentication service for user registration, login, and token management
 */

import { ApiService } from './api-service';
import type { TokenResponse, UserResponse, UserCreate } from '@raweval/types';

/**
 * Login Request
 * 
 * According to OpenAPI spec: https://api.raweval.com/openapi.json
 * LoginRequest requires: { email: string, password: string }
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends UserCreate {
  // email, full_name, password
}

export class AuthService extends ApiService {
  /**
   * Register a new user
   * 
   * According to OpenAPI spec: https://api.raweval.com/openapi.json
   * POST /api/v1/auth/register expects: { email: string, full_name: string, password: string }
   * Returns: 201 Created with UserResponse
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
   * Refresh access token using refresh token
   * 
   * According to OpenAPI spec: https://api.raweval.com/openapi.json
   * POST /api/v1/auth/refresh expects: { refresh_token: string }
   * Returns: TokenResponse with new access_token and optional refresh_token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>(
      '/auth/refresh',
      { refresh_token: refreshToken },
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
   * Logout and revoke refresh token
   * 
   * According to OpenAPI spec: https://api.raweval.com/openapi.json
   * POST /api/v1/auth/logout expects: { refresh_token: string }
   * Revokes the refresh token on the backend
   */
  async logout(refreshToken: string): Promise<void> {
    await this.client.post(
      '/auth/logout',
      { refresh_token: refreshToken },
      {
        skipAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}

export const authService = new AuthService();
