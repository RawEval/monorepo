# @raweval/auth

Authentication and Authorization package for RawEval monorepo.

## Features

- **RBAC (Role-Based Access Control)**: User and workspace roles with permissions
- **Session Management**: Get and validate user sessions
- **Permission Checking**: Utility functions to check user permissions
- **Multi-tenant Support**: Workspace-based access control

## Usage

```typescript
import { hasPermission, getPermissions } from '@raweval/auth';
import { getSession, requireSession } from '@raweval/auth';

// Check permissions
if (hasPermission('admin', 'admin:view')) {
  // User can view admin panel
}

// Get session
const session = await getSession();
if (session) {
  console.log(session.userId, session.role);
}

// Require session (throws if not authenticated)
const session = await requireSession();
```

## Roles

### User Roles
- `user`: Basic user, can create and read chats
- `expert`: Can view and assign expert tasks
- `admin`: Can manage workspace and view admin panel
- `super_admin`: Full access including billing management

### Workspace Roles
- `owner`: Full workspace control
- `admin`: Can manage workspace members
- `member`: Can create and read chats
- `viewer`: Read-only access

## Permissions

See `src/rbac/permissions.ts` for the full permission matrix.
