import { ApiService } from './api-service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export class AuthService extends ApiService {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>(
      '/auth/login',
      credentials,
      { skipAuth: true, headers: { 'Content-Type': 'application/json' } }
    );
    return this.handleResponse(response);
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response = await this.client.get<UserResponse>('/users/me');
    return this.handleResponse(response);
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>(
      '/auth/refresh',
      { refresh_token: refreshToken },
      { skipAuth: true }
    );
    return this.handleResponse(response);
  }
}

export const authService = new AuthService();
