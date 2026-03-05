import { ApiService, type PaginatedResponse } from '../api-service';

export interface AdminUserView {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  is_expert: boolean;
  expert_id: number | null;
  expert_tier: number | null;
  expert_status: string | null;
  interview_completed: boolean | null;
  domain_count: number;
  profile_completed: boolean;
  years_of_experience: number | null;
}

export interface UserRoleAssignment {
  id: number;
  user_id: number;
  role_id: number;
  role_name: string;
  assigned_by: number | null;
  assignment_reason: string | null;
  is_active: boolean;
  assigned_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  role: {
    id: number;
    role_name: string;
    display_name: string;
  } | null;
}

export interface UserStatusResponse {
  user_id: number;
  email: string;
  full_name: string | null;
  base_role: string;
  context: string | null;
  roles: UserRoleAssignment[];
  available_roles: string[];
  workflows: string[];
  terms_acceptance: unknown;
  subscription_tier: string | null;
  is_on_workbench: boolean;
  is_on_admin: boolean;
  is_on_subscription: boolean;
  active_pages: string[];
}

export interface ListAdminUsersParams {
  page?: number;
  page_size?: number;
  role?: string;
  status?: string;
  search?: string;
}

export interface AssignRoleRequest {
  role_name: string;
  reason?: string;
}

export interface RevokeRoleRequest {
  role_name: string;
  reason?: string;
}

export interface ProfileCompletionStatus {
  profile_completed: boolean;
  missing_fields: string[];
}

export class AdminUsersService extends ApiService {
  async listUsers(
    params: ListAdminUsersParams = {}
  ): Promise<PaginatedResponse<AdminUserView>> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<PaginatedResponse<AdminUserView>>(
      `/admin/users${query}`
    );
    return this.handleResponse(response);
  }

  async getUserRoles(userId: number): Promise<UserRoleAssignment[]> {
    const response = await this.client.get<UserRoleAssignment[]>(
      `/admin/users/${userId}/roles`
    );
    return this.handleResponse(response);
  }

  async assignRole(
    userId: number,
    data: AssignRoleRequest
  ): Promise<UserRoleAssignment> {
    const response = await this.client.post<UserRoleAssignment>(
      `/admin/users/${userId}/assign-role`,
      data
    );
    return this.handleResponse(response);
  }

  async revokeRole(
    userId: number,
    data: RevokeRoleRequest
  ): Promise<unknown> {
    const response = await this.client.post(
      `/admin/users/${userId}/revoke-role`,
      data
    );
    return this.handleResponse(response);
  }

  async getProfileCompletion(): Promise<ProfileCompletionStatus> {
    const response = await this.client.get<ProfileCompletionStatus>(
      '/users/me/profile-completion'
    );
    return this.handleResponse(response);
  }

  async getUserStatus(): Promise<UserStatusResponse> {
    const response = await this.client.get<UserStatusResponse>(
      '/users/me/status'
    );
    return this.handleResponse(response);
  }
}

export const adminUsersService = new AdminUsersService();
