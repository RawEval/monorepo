# RawEval Monorepo Architecture v2

## 🎯 Production-Grade SaaS Structure

This document describes the improved architecture following industry best practices for large-scale SaaS applications.

## 📁 Directory Structure

```
monorepo/
├── apps/
│   ├── landing/          # www.raweval.com (marketing)
│   ├── chat/             # chat.raweval.com (main SaaS app)
│   ├── experts/          # experts.raweval.com (expert workbench)
│   ├── admin/            # admin.raweval.com (internal admin)
│   ├── api/              # api.raweval.com (optional BFF)
│   └── mcp/              # MCP/AI server (separate service)
│
├── packages/
│   ├── ui/               # Shared UI components (shadcn)
│   ├── types/            # TypeScript types
│   ├── utils/            # Pure utility functions
│   ├── config/           # Shared configs (TS, ESLint, Tailwind)
│   ├── auth/             # Authentication & RBAC
│   └── db/               # Database client & schema
│
├── infra/                # Infrastructure-as-code
│   ├── docker/
│   ├── terraform/
│   └── monitoring/
│
└── tooling/              # Development tooling
    ├── eslint/
    └── tsconfig/
```

## 🏗️ App Structure (Feature-Based)

Each app follows a feature-based architecture:

```
apps/chat/
├── app/
│   ├── (public)/         # Public routes (no auth)
│   │   ├── login/
│   │   ├── signup/
│   │   └── page.tsx
│   │
│   ├── (tenant)/         # Tenant-scoped routes
│   │   ├── [workspaceSlug]/
│   │   │   ├── chat/
│   │   │   ├── settings/
│   │   │   └── billing/
│   │
│   ├── api/              # Next.js API routes
│   │   ├── auth/
│   │   ├── webhooks/
│   │   └── trpc/
│   │
│   ├── layout.tsx
│   └── middleware.ts
│
├── features/             # Feature modules
│   ├── chat/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services.ts
│   │   └── types.ts
│   │
│   ├── auth/
│   ├── workspace/
│   └── billing/
│
├── components/
│   ├── ui/               # Re-export shadcn (app-specific overrides)
│   ├── shared/           # Cross-feature components
│   ├── layout/           # Layout components
│   └── providers/       # Context providers
│
├── services/             # Business logic layer
│   ├── chat-service.ts
│   ├── auth-service.ts
│   └── workspace-service.ts
│
├── hooks/                # Shared hooks
├── lib/                  # App-specific utilities
└── middleware.ts         # Auth & routing middleware
```

## 🔐 Authentication & Authorization

### Package: `@raweval/auth`

Provides:
- **RBAC**: Role-based access control with permissions
- **Session Management**: Get and validate user sessions
- **Workspace Support**: Multi-tenant access control

```typescript
import { hasPermission, getSession } from '@raweval/auth';

// Check permissions
if (hasPermission('admin', 'admin:view')) {
  // User can view admin panel
}

// Get session
const session = await getSession();
```

### Roles

**User Roles:**
- `user`: Basic user
- `expert`: Can view and assign expert tasks
- `admin`: Can manage workspace
- `super_admin`: Full access

**Workspace Roles:**
- `owner`: Full workspace control
- `admin`: Can manage members
- `member`: Can create chats
- `viewer`: Read-only

## 🗄️ Database

### Package: `@raweval/db`

Centralized database access:
- Type-safe database client
- Migration utilities
- Schema definitions

```typescript
import { db } from '@raweval/db';

const users = await db.user.findMany();
```

## 🎨 Component Organization

### Rule: Feature-first, not layer-first

```
✅ CORRECT:
features/chat/components/chat-message.tsx
features/auth/components/login-form.tsx

❌ WRONG:
components/chat/chat-message.tsx
components/auth/login-form.tsx
```

### Component Hierarchy

1. **`components/ui/`**: Re-export shadcn (app-specific overrides)
2. **`components/shared/`**: Cross-feature components (logo, empty-state)
3. **`components/layout/`**: Layout components (header, sidebar)
4. **`components/providers/`**: Context providers
5. **`features/*/components/`**: Feature-specific components

## 🔄 Services Layer

Business logic lives in `services/`, not in components:

```typescript
// services/chat-service.ts
export class ChatService {
  async sendMessage(sessionId: string, message: string) {
    // Business logic here
  }
}
```

**Why?**
- Testable in isolation
- Reusable across components
- Clear separation of concerns

## 🛣️ Routing with Route Groups

Next.js route groups `(groupName)` organize routes without affecting URLs:

```
app/
├── (public)/
│   ├── login/        # /login (not /(public)/login)
│   └── signup/       # /signup
│
├── (tenant)/
│   └── [workspaceSlug]/
│       └── chat/     # /[workspaceSlug]/chat
```

## 🚦 Middleware

`middleware.ts` handles:
- Authentication checks
- Workspace/tenant routing
- Redirects based on auth state
- Setting headers

```typescript
export function middleware(request: NextRequest) {
  const session = await getSession(request);
  if (!session && request.nextUrl.pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}
```

## 📦 Package Dependencies

Strict hierarchy (enforced):

```
apps/* → packages/* (✅)
packages/ui → packages/utils, packages/types (✅)
packages/utils → packages/types (✅)
packages/auth → packages/types (✅)
packages/db → packages/types (✅)

❌ FORBIDDEN:
packages/* → apps/* (NEVER)
apps/* → apps/* (NEVER)
Circular dependencies (NEVER)
```

## 🎯 Key Principles

1. **Feature-first architecture**: Organize by feature, not by layer
2. **Apps are shells**: Business logic in packages/services
3. **Type safety**: Types in `@raweval/types`, used everywhere
4. **RBAC as package**: Auth logic in `@raweval/auth`, not scattered
5. **Services layer**: Business logic separated from UI
6. **Independent deployment**: Each app deploys separately

## 🚀 Next Steps

1. ✅ Feature-based structure
2. ✅ Auth package with RBAC
3. ✅ DB package structure
4. ✅ Services layer
5. ✅ Middleware setup
6. ⏳ Implement actual auth (NextAuth/Clerk)
7. ⏳ Set up database (Prisma/Drizzle)
8. ⏳ Add MCP/AI server app
9. ⏳ Add API app (if needed)

## 📚 Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Turborepo](https://turbo.build/repo)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [RBAC Patterns](https://en.wikipedia.org/wiki/Role-based_access_control)
