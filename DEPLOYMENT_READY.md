# Deployment Ready Checklist ✅

## Build Status

✅ **All builds successful!**

```
Tasks:    16 successful, 16 total
Time:     17.626s
```

### Build Results:
- ✅ `@raweval/types` - Built successfully
- ✅ `@raweval/utils` - Built successfully
- ✅ `@raweval/auth` - Built successfully
- ✅ `@raweval/db` - Built successfully
- ✅ `@raweval/api-client` - Built successfully
- ✅ `@raweval/ui` - Built successfully
- ✅ `@raweval/landing` - Built successfully
- ✅ `@raweval/chat` - Built successfully
- ✅ `@raweval/experts` - Built successfully
- ✅ `@raweval/admin` - Built successfully
- ✅ `@raweval/research` - Built successfully

## Fixed Issues

### 1. TypeScript Errors ✅
- ✅ Removed unused imports in `apps/admin/app/(public)/page.tsx`
- ✅ Removed unused imports in `apps/experts/app/(public)/page.tsx`
- ✅ Removed unused imports in `apps/experts/components/navbar.tsx`
- ✅ Removed unused imports in `apps/research/app/page.tsx`

### 2. Next.js 16 API Route Compatibility ✅
- ✅ Fixed `apps/chat/app/api/proxy/[...path]/route.ts` to use Promise-based params
- ✅ Updated all route handlers to await params

### 3. CORS Issues ✅
- ✅ Created Next.js API proxy routes to avoid CORS
- ✅ Updated API client to use proxy routes in browser
- ✅ Direct API calls work server-side

## API Routes Created

### Chat App (`apps/chat/app/api/`)
- ✅ `/api/auth/register` - User registration
- ✅ `/api/auth/login` - User login
- ✅ `/api/auth/me` - Get current user
- ✅ `/api/proxy/[...path]` - Generic proxy for all other API calls

## Vercel Configuration

All apps have proper `vercel.json` configuration:

### Chat App
```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/chat",
  "installCommand": "npm install -g pnpm@9 && sh -c 'cd ../.. && pnpm install --frozen-lockfile'",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Landing App
```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/landing",
  "installCommand": "npm install -g pnpm@9 && sh -c 'cd ../.. && pnpm install --frozen-lockfile'",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Experts App
```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/experts",
  "installCommand": "npm install -g pnpm@9 && sh -c 'cd ../.. && pnpm install --frozen-lockfile'",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Admin App
```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/admin",
  "installCommand": "npm install -g pnpm@9 && sh -c 'cd ../.. && pnpm install --frozen-lockfile'",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

## Environment Variables Required

### All Apps
```env
NEXT_PUBLIC_API_URL=http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com
NEXT_PUBLIC_LLM_CALLS_API_URL=http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com
NEXT_PUBLIC_API_VERSION=v1
```

### Optional (for custom domains)
```env
NEXT_PUBLIC_BASE_DOMAIN=raweval.com
NEXT_PUBLIC_LANDING_URL=https://www.raweval.com
NEXT_PUBLIC_CHAT_URL=https://chat.raweval.com
NEXT_PUBLIC_EXPERTS_URL=https://experts.raweval.com
NEXT_PUBLIC_ADMIN_URL=https://admin.raweval.com
```

## Deployment Steps

### 1. Vercel Projects Setup
Create 4 separate Vercel projects:
- `raweval-landing` → `apps/landing`
- `raweval-chat` → `apps/chat`
- `raweval-experts` → `apps/experts`
- `raweval-admin` → `apps/admin`

### 2. Environment Variables
Set environment variables in each Vercel project:
- Go to Project Settings → Environment Variables
- Add all `NEXT_PUBLIC_*` variables
- Add any server-side variables (without `NEXT_PUBLIC_` prefix)

### 3. Custom Domains
Configure custom domains:
- `www.raweval.com` → Landing app
- `chat.raweval.com` → Chat app
- `experts.raweval.com` → Experts app
- `admin.raweval.com` → Admin app

### 4. Build Settings
Each project should have:
- **Root Directory:** `apps/{app-name}`
- **Build Command:** `cd ../.. && pnpm turbo run build --filter=@raweval/{app-name}`
- **Install Command:** `npm install -g pnpm@9 && sh -c 'cd ../.. && pnpm install --frozen-lockfile'`
- **Output Directory:** `.next`
- **Framework Preset:** Next.js

## Pre-Deployment Checklist

- [x] All builds successful
- [x] No TypeScript errors
- [x] No linting errors
- [x] CORS issues resolved
- [x] API routes configured
- [x] Vercel configs in place
- [ ] Environment variables set in Vercel
- [ ] Custom domains configured
- [ ] SSL certificates active
- [ ] Test deployments on staging

## Post-Deployment Testing

### Landing App
- [ ] Homepage loads
- [ ] All navigation links work
- [ ] All pages render correctly

### Chat App
- [ ] Login page works
- [ ] Registration works
- [ ] Chat interface loads
- [ ] API proxy routes work
- [ ] No CORS errors

### Experts App
- [ ] Landing page loads
- [ ] Workbench accessible
- [ ] Authentication works

### Admin App
- [ ] Landing page loads
- [ ] Dashboard accessible
- [ ] Admin authentication works

## Known Issues

### Middleware Warning
⚠️ Warning: `The "middleware" file convention is deprecated. Please use "proxy" instead.`

**Status:** Non-blocking. This is a deprecation warning for Next.js 16. The middleware still works but should be migrated to `proxy` in the future.

**Action:** Can be addressed post-deployment.

## API Integration Status

✅ **Complete**
- Authentication (login, register, getCurrentUser)
- Chat messages (via LLM Call Host)
- Expert management
- Workbench/task management
- User management
- Payment operations
- Prompt management

## Security Notes

1. **API Proxy Routes:** All browser requests go through Next.js API routes, avoiding CORS
2. **Token Storage:** Tokens stored in localStorage (client-side)
3. **Server-Side:** Direct API calls work server-side without CORS issues
4. **Environment Variables:** All sensitive configs use environment variables

## Performance

- ✅ All apps build in < 30 seconds
- ✅ Static pages pre-rendered
- ✅ API routes server-rendered on demand
- ✅ No unnecessary dependencies

---

**Status:** ✅ **READY FOR DEPLOYMENT**

All builds pass, TypeScript errors fixed, CORS resolved, and Vercel configurations in place.

**Last Updated:** 2026-01-26
