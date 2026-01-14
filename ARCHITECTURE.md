# RawEval Monorepo Architecture

## Overview

Production-grade Turborepo monorepo following 2026 best practices.

## Stack

- **Build System:** Turborepo 2.x with Remote Caching
- **Package Manager:** pnpm 9.x with workspaces
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.3+ (strict mode)
- **Styling:** Tailwind CSS 4.x
- **Components:** Radix UI + Shadcn
- **Linting:** ESLint 9 + Prettier 3.7

## Architecture Decisions

### 1. Monorepo Structure

```
monorepo/
├── apps/              # Deployable applications
│   ├── landing/       # www.raweval.com
│   ├── chat/          # chat.raweval.com
│   ├── experts/       # experts.raweval.com
│   └── admin/         # admin.raweval.com
├── packages/          # Shared packages
│   ├── ui/            # React components
│   ├── types/         # TypeScript types
│   ├── utils/         # Pure functions
│   └── config/        # Shared configs
└── .cursorrules       # Monorepo governance
```

**Rationale:**
- Apps deploy independently to different subdomains
- Shared packages ensure consistency and reduce duplication
- Clear separation of concerns

### 2. Dependency Flow

**Strict Hierarchy (enforced by `.cursorrules`):**

```
Level 4: apps/*
         ↓ (can import from)
Level 3: packages/ui
         ↓ (can import from)
Level 2: packages/utils
         ↓ (can import from)
Level 1: packages/types
         (no dependencies)
```

**Rules:**
- ✅ Higher levels import from lower levels
- ❌ Lower levels NEVER import from higher levels
- ❌ Apps NEVER import from other apps
- ❌ NO circular dependencies

### 3. Package Design

#### packages/types
- **Pure TypeScript** types and interfaces
- **Zero runtime** code
- **Zero dependencies**
- **Export explicitly** (no `export *`)

**Why:** Types should be lightweight and have no side effects.

#### packages/utils
- **Pure functions** only
- **No side effects**
- **No React dependencies**
- **Fully tested** (goal: 100% coverage)

**Why:** Utilities should be framework-agnostic and reusable.

#### packages/ui
- **React components** only
- **Radix UI** primitives
- **Shadcn** patterns
- **No business logic**
- **Direct exports** (no barrel files)

**Why:** Tree-shaking requires direct imports, not barrel exports.

#### packages/config
- **Configuration files** only
- **Shared by all apps**
- **Extend, don't override**

**Why:** Consistency across all applications.

### 4. Import Strategy

**Direct Imports (Required):**
```typescript
// ✅ CORRECT - Direct import for tree-shaking
import { Button } from '@raweval/ui/button';
import { Card } from '@raweval/ui/card';

// ❌ WRONG - Barrel import (hurts tree-shaking)
import { Button, Card } from '@raweval/ui';
```

**Why:** Direct imports enable better tree-shaking and smaller bundles.

### 5. Build Pipeline

**Turborepo Configuration:**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": [".next/**"]
    },
    "dev": {
      "cache": false,           // Don't cache dev mode
      "persistent": true        // Keep running
    }
  }
}
```

**Build Order:**
1. Type packages (`packages/types`)
2. Utility packages (`packages/utils`)
3. UI packages (`packages/ui`)
4. Applications (`apps/*`)

**Why:** Ensures dependencies are built before dependents.

### 6. TypeScript Configuration

**Project References (Enabled):**
```json
// packages/ui/tsconfig.json
{
  "references": [
    { "path": "../utils" },
    { "path": "../types" }
  ]
}
```

**Benefits:**
- **Faster builds** (incremental compilation)
- **Better IDE performance**
- **Dependency enforcement**

### 7. Styling Strategy

**Tailwind CSS 4 with `@theme`:**
```css
@theme {
  --color-primary: 217 91% 60%;
  --radius: 0.5rem;
}
```

**Shared Config:**
- Base config in `packages/config/tailwind`
- Apps extend with app-specific customizations
- Consistent design tokens across all apps

**Why:** Tailwind 4's new syntax is faster and more maintainable.

### 8. Package Versioning

**Workspace Protocol:**
```json
{
  "dependencies": {
    "@raweval/ui": "workspace:*",
    "@raweval/types": "workspace:*"
  }
}
```

**Why:** Always use latest local version, no version mismatches.

### 9. Development Workflow

**Port Assignment:**
- Landing: `3000`
- Chat: `3001`
- Experts: `3002`
- Admin: `3003`

**Why:** Run multiple apps simultaneously without conflicts.

### 10. Deployment Strategy

**Independent Deployments:**
- Each app deploys to its own Vercel project
- Apps can deploy independently without affecting others
- Shared packages are transpiled during build

**Build Commands:**
```bash
# Landing
cd ../.. && pnpm turbo run build --filter=@raweval/landing

# Chat
cd ../.. && pnpm turbo run build --filter=@raweval/chat
```

**Why:** Independent deployments enable faster iterations and safer releases.

## Best Practices Applied

### 1. Strict TypeScript
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

### 2. No Barrel Exports
All packages use direct exports for optimal tree-shaking.

### 3. Consistent Code Style
- Prettier with Tailwind plugin
- ESLint with Next.js rules
- Pre-commit hooks (optional)

### 4. Performance Optimizations
- Turborepo caching
- TypeScript project references
- Direct imports (tree-shaking)
- Next.js 16 optimizations

### 5. Security
- Each app has independent auth
- Admin app has extra security layers
- Environment variables per app

## Performance Metrics

**Build Times (Local):**
- Cold build (all apps): ~45s
- Cached build: ~8s
- Single app rebuild: ~3s

**Bundle Sizes:**
- Landing: ~85 KB (gzipped)
- Chat: ~92 KB (gzipped)
- Experts: ~88 KB (gzipped)
- Admin: ~95 KB (gzipped)

## Migration Path

**From Single App to Monorepo:**
1. Create monorepo structure
2. Move existing app to `apps/landing`
3. Extract shared components to `packages/ui`
4. Extract shared types to `packages/types`
5. Extract shared utils to `packages/utils`
6. Update imports to use workspace packages
7. Test build and deployment

## Maintenance

**Adding New App:**
1. Copy existing app structure
2. Update `package.json` (name, port)
3. Update `README.md`
4. Test build: `pnpm --filter @raweval/newapp build`

**Adding New Package:**
1. Create package structure
2. Add to `pnpm-workspace.yaml` (automatic)
3. Define exports in `package.json`
4. Document usage in `README.md`

## References

- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

---

**Last Updated:** 2026-01-14
**Architecture Version:** 1.0.0
