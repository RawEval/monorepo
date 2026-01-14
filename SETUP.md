# Setup Guide

Complete setup instructions for the RawEval monorepo.

## Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0

## Installation Steps

### 1. Install pnpm

```bash
npm install -g pnpm@9
```

### 2. Install Dependencies

```bash
cd /path/to/raweval-monorepo
pnpm install
```

This will:
- Install all dependencies for all apps and packages
- Link workspace packages
- Setup TypeScript project references

### 3. Create Remaining Apps

The landing app is complete. Create the other 3 apps by copying the landing structure:

```bash
# Chat app (chat.raweval.com)
cp -r apps/landing apps/chat
# Update package.json name to "@raweval/chat"
# Update README.md
# Customize app/page.tsx for chat interface

# Experts app (experts.raweval.com)
cp -r apps/landing apps/experts
# Update package.json name to "@raweval/experts"
# Update README.md
# Customize app/page.tsx for expert workbench

# Admin app (admin.raweval.com)
cp -r apps/landing apps/admin
# Update package.json name to "@raweval/admin"
# Update README.md
# Customize app/page.tsx for admin dashboard
```

### 4. Update Port Numbers

In each app's `package.json`, set different ports:

**apps/chat/package.json:**
```json
{
  "scripts": {
    "dev": "next dev --port 3001"
  }
}
```

**apps/experts/package.json:**
```json
{
  "scripts": {
    "dev": "next dev --port 3002"
  }
}
```

**apps/admin/package.json:**
```json
{
  "scripts": {
    "dev": "next dev --port 3003"
  }
}
```

### 5. Verify Setup

```bash
# Run all apps
pnpm dev

# You should see:
# - landing on http://localhost:3000
# - chat on http://localhost:3001
# - experts on http://localhost:3002
# - admin on http://localhost:3003
```

### 6. Build Test

```bash
pnpm build
```

All apps and packages should build successfully.

## Next Steps

1. **Read `.cursorrules`** - Contains all monorepo best practices
2. **Customize app pages** - Update content for chat, experts, and admin
3. **Add more components** - Create shared components in `packages/ui`
4. **Set up deployment** - Configure Vercel projects

## Common Issues

### pnpm not found
```bash
npm install -g pnpm
```

### Module not found errors
```bash
pnpm install --force
```

### TypeScript errors
```bash
pnpm typecheck
```

### Build failures
```bash
pnpm clean
pnpm install
pnpm build
```

## Migration from Existing Project

To migrate from your current `client-landing` project:

```bash
# 1. Copy existing components
cp -r /path/to/client-landing/components/* apps/landing/components/

# 2. Copy existing pages
cp -r /path/to/client-landing/app/* apps/landing/app/

# 3. Update imports to use workspace packages
# Replace: import { Button } from "@/components/ui/button"
# With: import { Button } from "@raweval/ui/button"

# 4. Move shared components to packages
mv apps/landing/components/ui/* packages/ui/src/

# 5. Update package exports
# Add to packages/ui/package.json exports field
```

## Success Checklist

- [ ] pnpm installed
- [ ] Dependencies installed (`pnpm install`)
- [ ] All 4 apps created
- [ ] Each app has unique port
- [ ] Dev mode works (`pnpm dev`)
- [ ] Build works (`pnpm build`)
- [ ] Read `.cursorrules`
- [ ] Understand dependency flow
- [ ] Know how to add components
- [ ] Know how to add types

You're ready to build! 🚀
