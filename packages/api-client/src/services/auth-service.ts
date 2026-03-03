import { ApiClient } from '../client';
import { TokenResponse, UserCreate, UserResponse } from '@raweval/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export class AuthService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>(
      '/auth/login',
      /* payload */
      new URLSearchParams({
        username: credentials.email,
        password: credentials.password,
      }).toString(),
      /* config */
      {
        skipAuth: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response;
  }

  /**
   * Register a new user
   */
  async register(data: UserCreate): Promise<UserResponse> {
    const response = await this.client.post<UserResponse>(
      '/auth/register',
      data,
      {
        skipAuth: true,
      }
    );

    return response;
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await this.client.get<UserResponse>('/users/me');

    return response;
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>(
      '/auth/refresh',
      { refresh_token: refreshToken },
      { skipAuth: true }
    );

    return response;
  }

  /**
   * Logout
   */
  async logout(refreshToken?: string): Promise<void> {
    await this.client.post(
      '/auth/logout',
      refreshToken ? { refresh_token: refreshToken } : undefined
    );
  }
}
