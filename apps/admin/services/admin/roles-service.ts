/**
 * Admin Roles Service
 *
 * Manage platform roles, permissions, and user role assignments.
 */

import { ApiService } from '../api-service';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  is_system_role: boolean;
  created_at: string;
}

export interface UserRoleAssignment {
  user_id: number;
  user_email: string;
  role_id: number;
  role_name: string;
  assigned_at: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string | null;
  permissions: string[];
}

export class AdminRolesService extends ApiService {
  /**
   * List all available roles
   */
  async listRoles(): Promise<Role[]> {
    const response = await this.client.get<Role[]>('/admin/roles');
    return this.handleResponse(response);
  }

  /**
   * Create a new role
   */
  async createRole(data: CreateRoleRequest): Promise<Role> {
    const response = await this.client.post<Role>('/admin/roles', data);
    return this.handleResponse(response);
  }

  /**
   * Get role details
   */
  async getRole(id: number): Promise<Role> {
    const response = await this.client.get<Role>(`/admin/roles/${id}`);
    return this.handleResponse(response);
  }

  /**
   * Update a role
   */
  async updateRole(
    id: number,
    data: Partial<CreateRoleRequest>
  ): Promise<Role> {
    const response = await this.client.patch<Role>(`/admin/roles/${id}`, data);
    return this.handleResponse(response);
  }

  /**
   * Delete a role (only non-system roles)
   */
  async deleteRole(id: number): Promise<void> {
    const response = await this.client.delete(`/admin/roles/${id}`);
    this.handleResponse(response);
  }

  /**
   * Assign a role to a user
   */
  async assignRole(
    userId: number,
    roleId: number
  ): Promise<UserRoleAssignment> {
    const response = await this.client.post<UserRoleAssignment>(
      `/admin/users/${userId}/roles`,
      { role_id: roleId }
    );
    return this.handleResponse(response);
  }

  /**
   * Remove a role from a user
   */
  async revokeRole(userId: number, roleId: number): Promise<void> {
    const response = await this.client.delete(
      `/admin/users/${userId}/roles/${roleId}`
    );
    this.handleResponse(response);
  }
}

export const adminRolesService = new AdminRolesService();
