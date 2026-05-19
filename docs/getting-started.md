# Getting Started with RawEval Monorepo

## 🎯 What You Have

I've created a **production-grade monorepo** with:

### ✅ Complete Setup
- **Root configuration** (Turborepo, pnpm, Prettier, ESLint, TypeScript)
- **4 Shared packages** (ui, types, utils, config)
- **1 Complete app** (landing)
- **Comprehensive documentation**
- **Strict Cursor rules** to prevent cyclic dependencies

### 📦 Structure

```
monorepo/
├── .cursorrules          ⭐ READ THIS FIRST! (Monorepo rules)
├── README.md             📚 Main documentation
├── SETUP.md              🔧 Setup instructions
├── DEPLOYMENT.md         🚀 Deployment guide
├── package.json          📦 Root package file
├── turbo.json            ⚡ Turborepo config
├── pnpm-workspace.yaml   🔗 Workspace config
│
├── apps/
│   └── landing/          ✅ Complete (www.raweval.com)
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── package.json
│       ├── next.config.ts
│       └── tailwind.config.ts
│
├── packages/
│   ├── ui/               ✅ Shadcn components (Button, Card, Badge)
│   ├── types/            ✅ TypeScript types (Expert, Prompt, Task, etc.)
│   ├── utils/            ✅ Utilities (cn, formatDate, etc.)
│   └── config/           ✅ Shared configs (Tailwind, TS, ESLint)
│
└── scripts/
    └── create-remaining-apps.sh  🔨 Script to create chat/experts/admin
```

## 🚀 Quick Start (5 Minutes)

### Step 1: Navigate to Monorepo

```bash
cd /Users/durgesh/Code/Orgs/RawEval/monorepo
```

### Step 2: Install pnpm (if needed)

```bash
npm install -g pnpm@9

# OR use Corepack (recommended - built into Node.js)
corepack enable
```

### Step 3: Install Dependencies

```bash
pnpm install

# ⚠️ IMPORTANT: Only pnpm is allowed!
# ❌ npm install  -> Will be rejected
# ❌ yarn install -> Will be rejected
# ✅ pnpm install -> Only this works
```

### Step 4: Create Remaining Apps

```bash
chmod +x scripts/create-remaining-apps.sh
./scripts/create-remaining-apps.sh
```

This creates `chat`, `experts`, and `admin` apps from the `landing` template.

### Step 5: Run All Apps

```bash
pnpm dev
```

Visit:
- **Landing:** http://localhost:3000
- **Chat:** http://localhost:3001
- **Experts:** http://localhost:3002
- **Admin:** http://localhost:3003

### Step 6: Build Test

```bash
pnpm build
```

All apps should build successfully! ✅

## 📖 Learn the Rules

**CRITICAL:** Read `.cursorrules` before making changes!

Key points:
- ✅ Apps can import from packages (`@raweval/ui`, `@raweval/types`)
- ❌ Packages NEVER import from apps
- ❌ Apps NEVER import from other apps
- ❌ NO cyclic dependencies

## 🎨 Customize Apps

### Update Chat App

```typescript
// apps/chat/app/page.tsx
import { Button } from '@raweval/ui/button';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <main>
      <h1>RawEval Chat</h1>
      <MessageSquare />
      {/* Add chat interface */}
    </main>
  );
}
```

### Update Experts App

```typescript
// apps/experts/app/page.tsx
import { Card } from '@raweval/ui/card';
import type { Expert } from '@raweval/types';

export default function ExpertsPage() {
  return (
    <main>
      <h1>Expert Workbench</h1>
      {/* Add workbench interface */}
    </main>
  );
}
```

### Update Admin App

```typescript
// apps/admin/app/page.tsx
import { Badge } from '@raweval/ui/badge';
import type { DashboardStats } from '@raweval/types';

export default function AdminPage() {
  return (
    <main>
      <h1>Admin Dashboard</h1>
      {/* Add admin interface */}
    </main>
  );
}
```

## 🔧 Common Tasks

### Add a New Component

```bash
# 1. Create component
echo "export function Input() { return <input /> }" > packages/ui/src/input.tsx

# 2. Export in package.json
# Add to packages/ui/package.json:
# "exports": {
#   "./input": "./src/input.tsx"
# }

# 3. Use in apps
import { Input } from '@raweval/ui/input';
```

### Add a New Type

```typescript
// packages/types/src/index.ts
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}
```

```typescript
// Use in apps
import type { ChatMessage } from '@raweval/types';
```

### Add a Dependency

```bash
# To an app
pnpm --filter @raweval/chat add axios

# To a package
pnpm --filter @raweval/ui add @radix-ui/react-dialog

# To root (dev tools)
pnpm add -Dw husky
```

## 🚀 Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

Quick version:
1. Create 4 Vercel projects
2. Set root directory for each (`apps/landing`, etc.)
3. Set build command: `cd ../.. && pnpm turbo run build --filter=@raweval/APPNAME`
4. Add custom domains

## 📚 Documentation

| File | Purpose |
|------|---------|
| `.cursorrules` | **MUST READ** - Monorepo best practices |
| `README.md` | Main documentation and command reference |
| `SETUP.md` | Detailed setup and migration guide |
| `DEPLOYMENT.md` | Production deployment instructions |
| `GETTING_STARTED.md` | This file - quick start guide |

## 🐛 Troubleshooting

### Module not found errors

```bash
pnpm install
```

### Type errors

```bash
pnpm typecheck
```

### Build failures

```bash
pnpm clean
pnpm install
pnpm build
```

### Port already in use

```bash
# Kill process on port 3000
kill -9 $(lsof -t -i:3000)
```

## 🎓 Learning Resources

- **Turborepo:** https://turbo.build/repo/docs
- **pnpm Workspaces:** https://pnpm.io/workspaces
- **Next.js:** https://nextjs.org/docs
- **Shadcn UI:** https://ui.shadcn.com

## ✅ Success Checklist

- [ ] pnpm installed
- [ ] Dependencies installed
- [ ] All 4 apps created
- [ ] Dev mode works (`pnpm dev`)
- [ ] Build works (`pnpm build`)
- [ ] Read `.cursorrules`
- [ ] Understand dependency flow
- [ ] Know how to add components
- [ ] Know how to add types
- [ ] Ready to customize apps!

## 🆘 Need Help?

1. Check `.cursorrules` for rules
2. Check `README.md` for commands
3. Check `SETUP.md` for setup issues
4. Check `DEPLOYMENT.md` for deployment issues

---

**You're all set!** 🎉 Start customizing your apps and building RawEval!
