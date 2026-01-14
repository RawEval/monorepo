# RawEval Monorepo

Production-grade monorepo for RawEval with 4 Next.js apps and shared packages.

## 🏗️ Structure

```
raweval/
├── apps/
│   ├── landing/      # www.raweval.com (public landing page)
│   ├── chat/         # chat.raweval.com (user chatbot interface)
│   ├── experts/      # experts.raweval.com (expert workbench)
│   └── admin/        # admin.raweval.com (internal admin dashboard)
├── packages/
│   ├── ui/           # Shared Shadcn UI components
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Shared utilities
│   └── config/       # Shared configs
└── .cursorrules      # **READ THIS** - Monorepo best practices
```

## 🚀 Quick Start

```bash
# 1. Install pnpm (if not already installed)
npm install -g pnpm@9

# 2. Install dependencies (ONLY pnpm allowed!)
pnpm install

# 3. Run all apps in dev mode
pnpm dev

# 4. Run specific app
pnpm --filter @raweval/landing dev
pnpm --filter @raweval/chat dev
pnpm --filter @raweval/experts dev
pnpm --filter @raweval/admin dev

# 5. Build all
pnpm build

# 6. Build specific app
pnpm --filter @raweval/landing build
```

## 📦 Apps

| App | Domain | Port | Description |
|-----|--------|------|-------------|
| **landing** | www.raweval.com | 3000 | Public landing page |
| **chat** | chat.raweval.com | 3001 | User chatbot interface |
| **experts** | experts.raweval.com | 3002 | Expert workbench |
| **admin** | admin.raweval.com | 3003 | Internal admin dashboard |

## 🔗 Shared Packages

### `@raweval/ui`
Shadcn-based React components. Import directly:
```typescript
import { Button } from '@raweval/ui/button';
import { Card } from '@raweval/ui/card';
```

### `@raweval/types`
TypeScript types and interfaces:
```typescript
import type { Expert, Prompt, Task } from '@raweval/types';
```

### `@raweval/utils`
Utility functions:
```typescript
import { cn, formatDate, isValidEmail } from '@raweval/utils';
```

### `@raweval/config`
Shared configurations (Tailwind, TypeScript, ESLint)

## 🛠️ Common Commands

```bash
# Development
pnpm dev                          # Run all apps
pnpm --filter @raweval/chat dev  # Run single app

# Building
pnpm build                        # Build all
pnpm --filter @raweval/chat build # Build single app

# Linting
pnpm lint                         # Lint all
pnpm format                       # Format all with Prettier

# Type Checking
pnpm typecheck                    # Type check all

# Cleaning
pnpm clean                        # Clean all build artifacts

# Add dependency
pnpm --filter @raweval/chat add axios           # To app
pnpm --filter @raweval/ui add lucide-react      # To package
pnpm add -Dw turbo                              # To root (dev tools)
```

## 🚨 Critical Rules

**BEFORE MAKING ANY CHANGES, READ `.cursorrules`**

### Dependency Flow (NEVER VIOLATE)
```
✅ apps/* → packages/*           (Apps can import from packages)
✅ packages/ui → packages/utils  (UI can use utils)
✅ packages/utils → packages/types (Utils can use types)

❌ packages/* → apps/*           (Packages NEVER import from apps)
❌ apps/chat → apps/landing      (Apps NEVER import from each other)
❌ Circular dependencies         (FORBIDDEN)
```

### Import Paths
```typescript
// ✅ CORRECT
import { Button } from '@raweval/ui/button';
import type { User } from '@raweval/types';
import { cn } from '@raweval/utils';

// ❌ WRONG
import { Button } from '../../../packages/ui';
```

## 🎨 Adding Components

1. Create in `packages/ui/src/my-component.tsx`
2. Export in `packages/ui/package.json`:
   ```json
   {
     "exports": {
       "./my-component": "./src/my-component.tsx"
     }
   }
   ```
3. Use in apps:
   ```typescript
   import { MyComponent } from '@raweval/ui/my-component';
   ```

## 🎭 Adding Types

1. Add to `packages/types/src/index.ts`:
   ```typescript
   export interface MyType {
     id: string;
     name: string;
   }
   ```
2. Use in apps:
   ```typescript
   import type { MyType } from '@raweval/types';
   ```

## 🚀 Deployment

### Vercel (Recommended)

Each app deploys separately:

1. **Create 4 Vercel projects** (one per app)
2. **Configure each project:**
   - **Root Directory:** `apps/landing` (or chat, experts, admin)
   - **Build Command:** `cd ../.. && pnpm turbo run build --filter=@raweval/landing`
   - **Output Directory:** `.next`
   - **Install Command:** `pnpm install`
   - **Framework:** Next.js

3. **Set custom domains:**
   - landing → www.raweval.com
   - chat → chat.raweval.com
   - experts → experts.raweval.com
   - admin → admin.raweval.com

### Environment Variables

Set per-app in Vercel dashboard or create `.env.local` files:

```bash
apps/landing/.env.local
apps/chat/.env.local
apps/experts/.env.local
apps/admin/.env.local
```

## 🐛 Troubleshooting

### "Cannot find module '@raweval/ui'"
```bash
pnpm install  # Run at root
```

### "Circular dependency detected"
Check `.cursorrules` for allowed dependency flow. Move shared code to `packages/`.

### "Type errors after package change"
```bash
pnpm --filter '@raweval/*' build  # Rebuild packages first
```

### Slow dev server
```bash
pnpm --filter @raweval/chat dev  # Run only one app
```

## 📚 Documentation

- **Cursor Rules:** `.cursorrules` (READ FIRST!)
- **Turborepo:** [turbo.build/repo](https://turbo.build/repo)
- **pnpm Workspaces:** [pnpm.io/workspaces](https://pnpm.io/workspaces)

## 🤝 Contributing

1. Read `.cursorrules` thoroughly
2. Follow import path conventions
3. Never violate dependency rules
4. Format code: `pnpm format`
5. Type check: `pnpm typecheck`
6. Build test: `pnpm build`

## 📄 License

© 2026 RawEval Inc. All rights reserved.
