# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Package manager: pnpm ONLY (npm/yarn are rejected by .npmrc)
pnpm install                          # Install all dependencies
pnpm dev                              # Run all apps concurrently
pnpm --filter @raweval/chat dev       # Run single app (landing|chat|experts|admin|research)
pnpm build                            # Turbo build all with dependency resolution
pnpm --filter @raweval/chat build     # Build single app
pnpm lint                             # ESLint all packages
pnpm typecheck                        # TypeScript strict check all
pnpm format                           # Prettier format all
pnpm format:check                     # Check formatting without writing
pnpm clean                            # Remove all build artifacts & node_modules
pnpm kill-ports                       # Kill processes on ports 3000-3004

# Dependencies
pnpm --filter @raweval/chat add axios          # Add to specific app
pnpm --filter @raweval/ui add lucide-react     # Add to specific package
pnpm add -Dw turbo                             # Add dev dep to root

# Database (via @raweval/db)
pnpm --filter @raweval/db db:generate          # Generate Prisma client
pnpm --filter @raweval/db db:migrate           # Run migrations
pnpm --filter @raweval/db db:studio            # Open Prisma Studio
```

## Architecture

**Turborepo monorepo** with 5 Next.js 16 apps (App Router) and 7 shared packages.

### Apps (each deploys separately to Vercel)

| App | Subdomain | Port |
|-----|-----------|------|
| `landing` | www.raweval.com | 3000 |
| `chat` | chat.raweval.com | 3001 |
| `experts` | experts.raweval.com | 3002 |
| `admin` | admin.raweval.com | 3003 |
| `research` | research.raweval.com | 3004 |

### Packages

| Package | Purpose |
|---------|---------|
| `@raweval/ui` | Shadcn components (direct path imports: `@raweval/ui/button`) |
| `@raweval/types` | Shared TypeScript types (no runtime code, no dependencies) |
| `@raweval/utils` | Pure utility functions (subpath exports: `@raweval/utils/cn`) |
| `@raweval/config` | Shared Tailwind, TSConfig, ESLint, Prettier configs |
| `@raweval/auth` | RBAC permissions + session management (js-cookie) |
| `@raweval/db` | Prisma database client |
| `@raweval/api-client` | HTTP client with interceptors, retry, and cancellation |

### Dependency Flow (strictly enforced)

```
apps/* → packages/*                    ✅
packages/ui → packages/utils, types    ✅
packages/utils → packages/types        ✅
packages/auth → packages/types         ✅
packages/db → packages/types           ✅

packages/* → apps/*                    ❌ FORBIDDEN
apps/* → other apps/*                  ❌ FORBIDDEN
Circular imports                       ❌ FORBIDDEN
```

### App Internal Structure (feature-based)

```
apps/{app}/
├── app/                    # Next.js App Router
│   ├── (public)/           # Route group: no auth required
│   ├── (authenticated)/    # Route group: auth required
│   └── api/                # API routes
├── features/               # Feature modules (components, hooks, services, types per feature)
├── components/
│   ├── shared/             # Cross-feature components
│   └── layout/             # Layout components
├── services/               # Business logic layer (NOT in components)
├── stores/                 # Zustand state (chat, admin)
├── hooks/                  # Shared React hooks
├── lib/                    # App-specific utilities
└── middleware.ts           # Auth/routing middleware
```

### Key Patterns

- **Feature-based organization**: Feature components go in `features/*/components/`, NOT `components/{feature}/`
- **Services layer**: Business logic lives in `services/` or `features/*/services.ts`, never in components
- **Shadcn components**: Generated into `packages/ui/src/`, never edit directly — create wrappers in `features/*/components/` if customization needed
- **No barrel exports** in `@raweval/ui` — each component is a separate subpath export
- **Data fetching**: React Query (TanStack) in chat and admin apps
- **State management**: Zustand in chat and admin apps

## Import Conventions

```typescript
// Workspace packages — always use @raweval/*
import { Button } from '@raweval/ui/button';       // Direct subpath, no barrel
import type { User } from '@raweval/types';
import { cn } from '@raweval/utils/cn';
import { hasPermission } from '@raweval/auth';

// Internal app imports — always use @/ alias
import { ChatMessage } from '@/features/chat/components/chat-message';
import { chatService } from '@/services/chat-service';
```

## TypeScript Rules

- Strict mode with `noUncheckedIndexedAccess`, `noImplicitOverride`
- Use `unknown` instead of `any`; use `@ts-expect-error` instead of `@ts-ignore`
- Use `interface` for object shapes, `type` for unions/primitives
- Target: ES2022, module resolution: Bundler

## Design Tokens

All design tokens live in `packages/ui/src/tokens.css` (imported as `@raweval/ui/tokens`). This is the **single source of truth** for colors, typography, spacing, radius, and shadows.

- **Colors**: `--color-bg-base` (#f5f2ec warm parchment), `--color-bg-inverse` (#0d0d0d), `--color-signal` (#d4440c burnt orange accent)
- **Fonts**: `--font-display` (Instrument Serif), `--font-mono` (DM Mono), `--font-body` (system-ui)
- **Never use raw hex values** — always reference tokens
- Both landing and chat apps map Next.js font CSS variables (`--font-dm-mono`, `--font-instrument-serif`) to the token `--font-mono` and `--font-display` in their respective `globals.css`
- **IMPORTANT**: CSS `@import` of package-level CSS files is unreliable across Tailwind v4 + Next.js Turbopack. Token variables are therefore **inlined directly** in each app's `globals.css`. Do NOT rely on `@import '@raweval/ui/tokens'` — keep tokens in sync manually from `packages/ui/src/tokens.css`

## Styling

- Tailwind CSS v4 with shared base config from `@raweval/config/tailwind`
- Component variants via `class-variance-authority` (cva)
- Prettier plugin for Tailwind class sorting
- Chat app has CSS utility classes for message bubbles: `.msg-user`, `.msg-ai`, `.flag-button`, `.flag-bar`, `.payout-badge`
