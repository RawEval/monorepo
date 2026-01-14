import type { Permission, UserRole, WorkspaceRole } from '@raweval/types';

/**
 * RBAC Permission Matrix
 * Defines what each role can do
 */

export const USER_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: ['chat:create', 'chat:read', 'chat:flag'],
  expert: [
    'chat:create',
    'chat:read',
    'chat:flag',
    'expert:view',
    'expert:assign',
  ],
  admin: [
    'chat:create',
    'chat:read',
    'chat:flag',
    'expert:view',
    'expert:assign',
    'expert:verify',
    'admin:view',
    'workspace:manage',
    'workspace:invite',
    'billing:view',
  ],
  super_admin: [
    'chat:create',
    'chat:read',
    'chat:flag',
    'expert:view',
    'expert:assign',
    'expert:verify',
    'admin:view',
    'admin:manage',
    'workspace:manage',
    'workspace:invite',
    'billing:view',
    'billing:manage',
  ],
};

export const WORKSPACE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  owner: [
    'workspace:manage',
    'workspace:invite',
    'billing:view',
    'billing:manage',
    'chat:create',
    'chat:read',
    'admin:view',
  ],
  admin: [
    'workspace:manage',
    'workspace:invite',
    'chat:create',
    'chat:read',
    'admin:view',
  ],
  member: ['chat:create', 'chat:read'],
  viewer: ['chat:read'],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole | WorkspaceRole,
  permission: Permission,
  isWorkspaceRole = false,
): boolean {
  const permissions = isWorkspaceRole
    ? WORKSPACE_PERMISSIONS[role as WorkspaceRole]
    : USER_PERMISSIONS[role as UserRole];

  return permissions?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getPermissions(
  role: UserRole | WorkspaceRole,
  isWorkspaceRole = false,
): Permission[] {
  return isWorkspaceRole
    ? WORKSPACE_PERMISSIONS[role as WorkspaceRole] ?? []
    : USER_PERMISSIONS[role as UserRole] ?? [];
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(
  role: UserRole | WorkspaceRole,
  requiredPermissions: Permission[],
  isWorkspaceRole = false,
): boolean {
  const userPermissions = getPermissions(role, isWorkspaceRole);
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(
  role: UserRole | WorkspaceRole,
  requiredPermissions: Permission[],
  isWorkspaceRole = false,
): boolean {
  const userPermissions = getPermissions(role, isWorkspaceRole);
  return requiredPermissions.every((perm) => userPermissions.includes(perm));
}
