# Quick Reference: New Architecture

## 🎯 Key Changes

### 1. Feature-Based Structure
```
apps/chat/features/chat/
├── components/    # ChatMessage, ChatInput
├── hooks/         # useChat
├── services.ts    # ChatService
└── types.ts       # ChatMessage, ChatSession
```

### 2. New Packages

#### `@raweval/auth`
```typescript
import { hasPermission, getSession } from '@raweval/auth';

// Check permission
if (hasPermission('admin', 'admin:view')) { }

// Get session
const session = await getSession();
```

#### `@raweval/db`
```typescript
import { db } from '@raweval/db';

// Use database (after setup)
const users = await db.user.findMany();
```

### 3. Component Organization
```
components/
├── ui/           # Re-export shadcn
├── shared/       # Cross-feature
├── layout/       # Header, Sidebar
└── providers/    # Context providers
```

### 4. Services Layer
```typescript
// services/chat-service.ts
import { chatService } from '@/services/chat-service';

await chatService.sendMessage(sessionId, message);
```

### 5. Route Groups
```
app/
├── (public)/     # No auth required
│   └── page.tsx
└── (tenant)/     # Auth required
    └── [workspaceSlug]/
```

## 📦 Package Usage

### Auth Package
```typescript
// Check permissions
import { hasPermission, hasAllPermissions } from '@raweval/auth';

if (hasPermission('admin', 'admin:view')) {
  // Show admin panel
}

// Get permissions for role
import { getPermissions } from '@raweval/auth';
const perms = getPermissions('admin');
// ['chat:create', 'admin:view', ...]
```

### Types Package
```typescript
import type { Session, Workspace, Permission } from '@raweval/types';

// Use in components
const session: Session = await getSession();
```

## 🏗️ Architecture Rules

1. **Feature-first**: Organize by feature, not by layer
2. **Services layer**: Business logic in `services/`, not components
3. **Type safety**: Types in `@raweval/types`
4. **RBAC**: Auth logic in `@raweval/auth`
5. **No circular deps**: Follow dependency hierarchy

## 🚀 Next Steps

1. Install packages: `pnpm install`
2. Set up auth: Integrate NextAuth/Clerk
3. Set up database: Choose Prisma/Drizzle
4. Implement workspace routing: Add `[workspaceSlug]` routes
5. Add MCP server: Create `apps/mcp/` for AI logic

## 📚 Full Docs

- `ARCHITECTURE_V2.md` - Complete architecture guide
- `IMPROVEMENTS_SUMMARY.md` - What changed and why
- `.cursorrules` - Monorepo governance rules
