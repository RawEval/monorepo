// Authentication and Authorization Types

export type UserRole = 'user' | 'expert' | 'admin' | 'super_admin';

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  workspaceId?: string;
  workspaceRole?: WorkspaceRole;
  expiresAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: Date;
}

// RBAC Permissions
export type Permission =
  | 'chat:create'
  | 'chat:read'
  | 'chat:flag'
  | 'expert:view'
  | 'expert:assign'
  | 'expert:verify'
  | 'admin:view'
  | 'admin:manage'
  | 'workspace:manage'
  | 'workspace:invite'
  | 'billing:view'
  | 'billing:manage';

export interface RolePermissions {
  role: UserRole | WorkspaceRole;
  permissions: Permission[];
}
