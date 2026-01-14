# Deployment Guide

How to deploy the RawEval monorepo to production.

## Vercel Deployment (Recommended)

### Overview

Deploy each app as a separate Vercel project:
- ✅ Independent deployments
- ✅ Automatic previews per PR
- ✅ Edge functions support
- ✅ Custom domains per app

### Step 1: Create Vercel Projects

Create 4 separate projects on [vercel.com](https://vercel.com):

1. **raweval-landing**
2. **raweval-chat**
3. **raweval-experts**
4. **raweval-admin**

### Step 2: Configure Each Project

For each project, set these settings:

#### Landing (www.raweval.com)

**Build & Development Settings:**
- Framework Preset: `Next.js`
- Root Directory: `apps/landing`
- Build Command: `cd ../.. && pnpm turbo run build --filter=@raweval/landing`
- Output Directory: `.next`
- Install Command: `pnpm install`

**Domains:**
- Primary: `www.raweval.com`
- Also add: `raweval.com` (redirect to www)

#### Chat (chat.raweval.com)

**Build & Development Settings:**
- Framework Preset: `Next.js`
- Root Directory: `apps/chat`
- Build Command: `cd ../.. && pnpm turbo run build --filter=@raweval/chat`
- Output Directory: `.next`
- Install Command: `pnpm install`

**Domains:**
- Primary: `chat.raweval.com`

#### Experts (experts.raweval.com)

**Build & Development Settings:**
- Framework Preset: `Next.js`
- Root Directory: `apps/experts`
- Build Command: `cd ../.. && pnpm turbo run build --filter=@raweval/experts`
- Output Directory: `.next`
- Install Command: `pnpm install`

**Domains:**
- Primary: `experts.raweval.com`

#### Admin (admin.raweval.com)

**Build & Development Settings:**
- Framework Preset: `Next.js`
- Root Directory: `apps/admin`
- Build Command: `cd ../.. && pnpm turbo run build --filter=@raweval/admin`
- Output Directory: `.next`
- Install Command: `pnpm install`

**Domains:**
- Primary: `admin.raweval.com`

### Step 3: Environment Variables

Set environment variables in Vercel dashboard for each project:

```bash
# Common across all apps
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.raweval.com

# App-specific
# chat app:
NEXT_PUBLIC_CHAT_WS_URL=wss://chat.raweval.com/ws

# experts app:
NEXT_PUBLIC_WORKBENCH_API=https://api.raweval.com/experts

# admin app:
DATABASE_URL=postgresql://...
ADMIN_SECRET_KEY=...
```

### Step 4: DNS Configuration

Point your DNS records to Vercel:

```
Type    Name       Value                    TTL
------  ---------  -----------------------  -----
CNAME   www        cname.vercel-dns.com     Auto
CNAME   chat       cname.vercel-dns.com     Auto
CNAME   experts    cname.vercel-dns.com     Auto
CNAME   admin      cname.vercel-dns.com     Auto
A       @          76.76.19.19              Auto
```

### Step 5: Deploy

```bash
# Option 1: Push to main branch (auto-deploys)
git push origin main

# Option 2: Use Vercel CLI
pnpm dlx vercel --prod
```

### Step 6: Verify

Check each subdomain:
- https://www.raweval.com
- https://chat.raweval.com
- https://experts.raweval.com
- https://admin.raweval.com

## Alternative: Self-Hosted

### Docker Setup

Create a Dockerfile for each app:

**apps/landing/Dockerfile:**
```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm@9

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/landing/package.json ./apps/landing/
COPY packages/*/package.json ./packages/*/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm turbo run build --filter=@raweval/landing

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/apps/landing/.next ./apps/landing/.next
COPY --from=builder /app/apps/landing/public ./apps/landing/public
COPY --from=builder /app/apps/landing/package.json ./apps/landing/
EXPOSE 3000
CMD ["node", "apps/landing/.next/standalone/server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  landing:
    build:
      context: .
      dockerfile: apps/landing/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production

  chat:
    build:
      context: .
      dockerfile: apps/chat/Dockerfile
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production

  experts:
    build:
      context: .
      dockerfile: apps/experts/Dockerfile
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - "3003:3000"
    environment:
      - NODE_ENV=production
```

### Nginx Reverse Proxy

```nginx
server {
    server_name www.raweval.com raweval.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}

server {
    server_name chat.raweval.com;
    location / {
        proxy_pass http://localhost:3001;
    }
}

server {
    server_name experts.raweval.com;
    location / {
        proxy_pass http://localhost:3002;
    }
}

server {
    server_name admin.raweval.com;
    location / {
        proxy_pass http://localhost:3003;
    }
}
```

## CI/CD

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [landing, chat, experts, admin]

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm turbo run build --filter=@raweval/${{ matrix.app }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_${{ matrix.app }} }}
          working-directory: apps/${{ matrix.app }}
```

## Monitoring

### Vercel Analytics

Enable Vercel Analytics for each project:

```typescript
// apps/landing/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Sentry Error Tracking

```bash
pnpm add -w @sentry/nextjs
```

**sentry.client.config.ts:**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Rollback

To rollback a deployment on Vercel:

1. Go to project deployments
2. Find previous working deployment
3. Click "Promote to Production"

Or use CLI:

```bash
vercel rollback
```

## Performance Optimization

1. **Enable Edge Functions** for faster response times
2. **Use Image Optimization** (`next/image`)
3. **Enable ISR** (Incremental Static Regeneration) where appropriate
4. **Configure caching** headers
5. **Use Turbo Remote Cache** for faster CI/CD builds

```bash
pnpm turbo login
pnpm turbo link
```

---

**Questions?** Check the main [README.md](./README.md) or [Vercel Docs](https://vercel.com/docs).
