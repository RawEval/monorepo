/**
 * Auth Service
 * 
 * Authentication service for user registration, login, and token management
 */

import { ApiService } from './api-service';
import type { TokenResponse, UserResponse, UserCreate } from '@raweval/types';

export interface LoginRequest {
  username: string; // email
  password: string;
}

export interface RegisterRequest extends UserCreate {
  // email, full_name, password
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
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await this.client.post<TokenResponse>(
      '/auth/login',
      formData.toString(),
      {
        skipAuth: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return this.handleResponse(response);
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await this.client.get<UserResponse>('/auth/me');
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
}

export const authService = new AuthService();
