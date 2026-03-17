/**
 * Users Service
 * 
 * Service for user management operations
 */

import { ApiService } from './api-service';

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface UserMetadata {
  [key: string]: unknown;
}

export interface UserProfile {
  full_name?: string;
  bio?: string | null;
  avatar_url?: string | null;
  professional_background?: string;
}

export interface UserDomain {
  id: number;
  user_id: number;
  domain: string;
  verified: boolean;
  created_at: string;
}

export interface AccessiblePage {
  page: string;
  accessible: boolean;
  reason?: string | null;
}

export class UsersService extends ApiService {
  /**
   * Get current user
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await this.client.get<UserResponse>('/users/me');
    return this.handleResponse(response);
  }

  /**
   * Get user by ID
   */
  async getUser(userId: number): Promise<UserResponse> {
    const response = await this.client.get<UserResponse>(
      `/users/${userId}`,
    );
    return this.handleResponse(response);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UserProfile): Promise<UserResponse> {
    const response = await this.client.put<UserResponse>(
      '/users/me/profile',
      data,
    );
    return this.handleResponse(response);
  }

  /**
   * Get user metadata.
   * NOTE: /users/me/metadata has a backend routing bug (FastAPI matches {user_id}
   * before /me). Workaround: fetch /users/me first to get ID, then /users/{id}/metadata.
   */
  async getMetadata(): Promise<UserMetadata> {
    const me = await this.client.get<UserResponse>('/users/me');
    const user = this.handleResponse(me);
    const response = await this.client.get<UserMetadata>(
      `/users/${user.id}/metadata`,
    );
    return this.handleResponse(response);
  }

  /**
   * Update user metadata
   */
  async updateMetadata(metadata: UserMetadata): Promise<UserMetadata> {
    const response = await this.client.put<UserMetadata>(
      '/users/me/profile',
      metadata,
    );
    return this.handleResponse(response);
  }

  /**
   * Get profile completion status
   */
  async getProfileCompletion(): Promise<{
    completed: boolean;
    missing_fields: string[];
    completion_percentage: number;
  }> {
    const response = await this.client.get<{
      completed: boolean;
      missing_fields: string[];
      completion_percentage: number;
    }>('/users/me/profile-completion');
    return this.handleResponse(response);
  }

  /**
   * Get accessible pages for current user
   */
  async getAccessiblePages(): Promise<AccessiblePage[]> {
    const response = await this.client.get<AccessiblePage[]>(
      '/users/me/accessible-pages',
    );
    return this.handleResponse(response);
  }

  /**
   * Get user domains
   */
  async getUserDomains(userId: number): Promise<UserDomain[]> {
    const response = await this.client.get<UserDomain[]>(
      `/users/${userId}/domains`,
    );
    return this.handleResponse(response);
  }

  /**
   * Get user metadata by user ID
   */
  async getUserMetadata(userId: number): Promise<UserMetadata> {
    const response = await this.client.get<UserMetadata>(
      `/users/${userId}/metadata`,
    );
    return this.handleResponse(response);
  }
}

export const usersService = new UsersService();
