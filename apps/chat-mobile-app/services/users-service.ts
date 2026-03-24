/**
 * Users Service — user profile management
 */
import { api } from '@/lib/api';
import type {
  UserResponse,
  UserProfile,
  UserMetadata,
  UserDomain,
  AccessiblePage,
  UpdateFullNameRequest,
  ChangePasswordRequest,
  UpdateEmailRequest,
  UserDomainRequest,
  UpdateSubscriptionRequest,
  UserEarnings,
} from '@raweval/types';

class UsersService {
  async getCurrentUser(): Promise<UserResponse> {
    return api.get<UserResponse>('/users/me');
  }

  async getUser(userId: number): Promise<UserResponse> {
    return api.get<UserResponse>(`/users/${userId}`);
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserResponse> {
    return api.patch<UserResponse>('/users/me', data);
  }

  async getMetadata(): Promise<UserMetadata> {
    return api.get<UserMetadata>('/users/me/metadata');
  }

  async getUserMetadata(userId: number): Promise<UserMetadata> {
    return api.get<UserMetadata>(`/users/${userId}/metadata`);
  }

  async getProfileCompletion(): Promise<{ completion_percentage: number; missing_fields: string[] }> {
    return api.get<{ completion_percentage: number; missing_fields: string[] }>('/users/me/profile-completion');
  }

  async getAccessiblePages(): Promise<AccessiblePage[]> {
    return api.get<AccessiblePage[]>('/users/me/accessible-pages');
  }

  async getUserDomains(userId?: number): Promise<UserDomain[]> {
    const path = userId ? `/users/${userId}/domains` : '/users/me/domains';
    return api.get<UserDomain[]>(path);
  }

  async uploadResume(file: { uri: string; name: string; type: string }): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    return api.post<unknown>('/users/me/resume', formData);
  }

  async getEarnings(): Promise<UserEarnings> {
    return api.get<UserEarnings>('/users/me/earnings');
  }

  async updateFullName(data: UpdateFullNameRequest): Promise<UserResponse> {
    return api.put<UserResponse>('/users/me/full-name', data);
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return api.post<{ message: string }>('/users/me/change-password', data);
  }

  async updateEmail(data: UpdateEmailRequest): Promise<UserResponse> {
    return api.put<UserResponse>('/users/me/email', data);
  }

  async getMyDomains(): Promise<UserDomain[]> {
    return api.get<UserDomain[]>('/users/me/domains');
  }

  async addDomain(data: UserDomainRequest): Promise<UserDomain> {
    return api.post<UserDomain>('/users/me/domains', data);
  }

  async removeDomain(domainId: number): Promise<void> {
    return api.delete<void>(`/users/me/domains/${domainId}`);
  }

  async updateSubscription(data: UpdateSubscriptionRequest): Promise<UserResponse> {
    return api.patch<UserResponse>('/users/me/subscription', data);
  }

  async uploadAvatar(file: { uri: string; name: string; type: string }): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    return api.post<{ avatar_url: string }>('/users/me/avatar', formData);
  }

  async deleteAccount(): Promise<void> {
    return api.delete<void>('/users/me');
  }
}

export const usersService = new UsersService();
