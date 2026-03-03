/**
 * Users Service
 *
 * Service for user management operations.
 * Uses lib/api.ts directly — no @raweval/api-client dependency.
 */

import { api } from '@/lib/api';
import type {
  UserResponse,
  UserMetadata,
  UserProfile,
  UserDomain,
  AccessiblePage,
  UpdateFullNameRequest,
  ChangePasswordRequest,
  UpdateEmailRequest,
  UserDomainRequest,
  UpdateSubscriptionRequest,
} from '@raweval/types';

class UsersService {
  /** Get current user */
  async getCurrentUser(): Promise<UserResponse> {
    return api.get<UserResponse>('/users/me');
  }

  /** Get user by ID */
  async getUser(userId: number): Promise<UserResponse> {
    return api.get<UserResponse>(`/users/${userId}`);
  }

  /** Update user profile */
  async updateProfile(data: UserProfile): Promise<UserResponse> {
    return api.put<UserResponse>('/users/me/profile', data);
  }

  /** Get user metadata */
  async getMetadata(): Promise<UserMetadata> {
    return api.get<UserMetadata>('/users/me/metadata');
  }

  /** Get profile completion status */
  async getProfileCompletion(): Promise<{
    completed: boolean;
    missing_fields: string[];
    completion_percentage: number;
  }> {
    return api.get('/users/me/profile-completion');
  }

  /** Get accessible pages for current user */
  async getAccessiblePages(): Promise<AccessiblePage[]> {
    return api.get<AccessiblePage[]>('/users/me/accessible-pages');
  }

  /** Get user domains */
  async getUserDomains(userId: number): Promise<UserDomain[]> {
    return api.get<UserDomain[]>(`/users/${userId}/domains`);
  }

  /** Get user metadata by user ID */
  async getUserMetadata(userId: number): Promise<UserMetadata> {
    return api.get<UserMetadata>(`/users/${userId}/metadata`);
  }

  /** Upload resume file */
  async uploadResume(
    file: File
  ): Promise<{ message: string; extracted_text?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/me/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /** Get user earnings statistics */
  async getEarnings(): Promise<Record<string, unknown>> {
    return api.get('/users/me/earnings');
  }

  /** Update full name */
  async updateFullName(data: UpdateFullNameRequest): Promise<UserResponse> {
    return api.put<UserResponse>('/users/me/full-name', data);
  }

  /** Change password */
  async changePassword(
    data: ChangePasswordRequest
  ): Promise<{ message: string }> {
    return api.post('/users/me/change-password', data);
  }

  /** Update email address */
  async updateEmail(data: UpdateEmailRequest): Promise<UserResponse> {
    return api.put<UserResponse>('/users/me/email', data);
  }

  /** Get user domains - specific to current user */
  async getMyDomains(): Promise<UserDomain[]> {
    return api.get<UserDomain[]>('/users/me/domains');
  }

  /** Add user domain */
  async addDomain(
    data: UserDomainRequest
  ): Promise<{ message: string; domain: UserDomain }> {
    return api.post('/users/me/domains', data);
  }

  /** Remove user domain */
  async removeDomain(domainId: number): Promise<{ message: string }> {
    return api.delete(`/users/me/domains/${domainId}`);
  }

  /** Update subscription tier */
  async updateSubscription(
    data: UpdateSubscriptionRequest
  ): Promise<UserMetadata> {
    return api.put<UserMetadata>('/users/me/subscription', data);
  }

  /** Upload profile avatar */
  async uploadAvatar(
    file: File
  ): Promise<{ message: string; avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const usersService = new UsersService();
