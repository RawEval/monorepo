/**
 * Admin Users Service
 *
 * Comprehensive user management for platform administrators.
 */

import { ApiService } from '../api-service';

export interface AdminUserView {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  status: 'active' | 'suspended' | 'pending';
  is_suspended: boolean;
  subscription_tier: string;
  wallet_balance: number;
  total_sessions: number;
  total_failures: number;
  total_failed_prompts: number;
  created_at: string;
  last_login: string | null;
}

export interface ListAdminUsersParams {
  skip?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  role?: string;
  status?: 'active' | 'suspended' | 'pending';
}

export class AdminUsersService extends ApiService {
  /**
   * List all users with comprehensive details and filters
   */
  async listUsers(params: ListAdminUsersParams = {}): Promise<AdminUserView[]> {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.client.get<AdminUserView[]>(
      `/admin/users?${query}`
    );
    return this.handleResponse(response);
  }

  /**
   * Get comprehensive details for a specific user
   */
  async getUserDetails(userId: number): Promise<AdminUserView> {
    const response = await this.client.get<AdminUserView>(
      `/admin/users/${userId}`
    );
    return this.handleResponse(response);
  }

  /**
   * Update user details or role
   */
  async updateUser(
    userId: number,
    data: UpdateUserRequest
  ): Promise<AdminUserView> {
    const response = await this.client.patch<AdminUserView>(
      `/admin/users/${userId}`,
      data
    );
    return this.handleResponse(response);
  }

  /**
   * Suspend a user's account
   */
  async suspendUser(userId: number, reason: string): Promise<void> {
    const response = await this.client.post(`/admin/users/${userId}/suspend`, {
      reason,
    });
    this.handleResponse(response);
  }

  /**
   * Activate a suspended user account
   */
  async activateUser(userId: number): Promise<void> {
    const response = await this.client.post(`/admin/users/${userId}/activate`);
    this.handleResponse(response);
  }

  /**
   * Delete a user account (irreversible)
   */
  async deleteUser(userId: number): Promise<void> {
    const response = await this.client.delete(`/admin/users/${userId}`);
    this.handleResponse(response);
  }

  /**
   * Get profile completion status for current admin
   */
  async getProfileCompletion(): Promise<{
    completed: boolean;
    missing_fields: string[];
    completion_percentage: number;
  }> {
    const response = await this.client.get<any>('/users/me/profile-completion');
    return this.handleResponse(response);
  }

  /**
   * Get accessible pages for current admin
   */
  async getAccessiblePages(): Promise<
    Array<{ page: string; accessible: boolean }>
  > {
    const response = await this.client.get<any>('/users/me/accessible-pages');
    return this.handleResponse(response);
  }
}

export const adminUsersService = new AdminUsersService();
