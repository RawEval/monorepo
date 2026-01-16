# 🔄 Fresh Vercel Setup - Complete Reset

## What Was Done

### 1. ✅ Complete Cleanup
- Removed all `.vercel` directories
- Removed all `.env.local` files
- Removed all `vercel.json` files (for fresh start)

### 2. ✅ Fresh Project Linking
- **Landing**: Freshly linked to `monorepo-landing`
- **Chat**: Freshly linked to `monorepo-chat`

### 3. ✅ Configuration Files Recreated
All apps now have fresh `vercel.json` files:
- ✅ `apps/landing/vercel.json`
- ✅ `apps/chat/vercel.json`
- ✅ `apps/experts/vercel.json`
- ✅ `apps/admin/vercel.json`

## Current Status

| App | Linked | Config File | Status |
|-----|--------|-------------|--------|
| Landing | ✅ Yes | ✅ `vercel.json` | Ready for Git connection |
| Chat | ✅ Yes | ✅ `vercel.json` | Ready for Git connection |
| Experts | ❌ No | ✅ `vercel.json` | Ready (no Vercel project yet) |
| Admin | ❌ No | ✅ `vercel.json` | Ready (no Vercel project yet) |

## ⚠️ CRITICAL: Connect to GitHub in Vercel Dashboard

Since you deleted all GitHub environments, you need to **reconnect each project to GitHub** in the Vercel Dashboard.

### For Landing Project

1. **Go to Git Settings:**
   https://vercel.com/rawevals-projects/monorepo-landing/settings/git

2. **Click "Connect Git Repository"** (or "Reconnect" if already connected)

3. **Select:**
   - Repository: `RawEval/monorepo`
   - Production Branch: `main`
   - Root Directory: `apps/landing` ⚠️ **Important!**

4. **Enable Auto-deploy** ⚠️ **Critical!**

5. **Click "Save"**

### For Chat Project

1. **Go to Git Settings:**
   https://vercel.com/rawevals-projects/monorepo-chat/settings/git

2. **Click "Connect Git Repository"** (or "Reconnect" if already connected)

3. **Select:**
   - Repository: `RawEval/monorepo`
   - Production Branch: `main`
   - Root Directory: `apps/chat` ⚠️ **Important!**

4. **Enable Auto-deploy** ⚠️ **Critical!**

5. **Click "Save"**

## Also Configure General Settings

### Landing Project
**URL**: https://vercel.com/rawevals-projects/monorepo-landing/settings/general

**Required Settings:**
- **Root Directory**: `apps/landing` ⚠️ **Must match Git Root Directory**
- **Node.js Version**: `20.x` (change from 24.x if needed)
- **Build Command**: `cd ../.. && pnpm turbo run build --filter=@raweval/landing`
- **Install Command**: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
- **Output Directory**: `.next`

### Chat Project
**URL**: https://vercel.com/rawevals-projects/monorepo-chat/settings/general

**Required Settings:**
- **Root Directory**: `apps/chat` ⚠️ **Must match Git Root Directory**
- **Node.js Version**: `20.x` (change from 24.x if needed)
- **Build Command**: `cd ../.. && pnpm turbo run build --filter=@raweval/chat`
- **Install Command**: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
- **Output Directory**: `.next`

## Important Notes

### Root Directory Must Match
The **Root Directory** must be **identical** in:
1. Settings → General → Root Directory
2. Settings → Git → Root Directory

If they don't match, deployments will fail!

### Auto-deploy Must Be Enabled
Without Auto-deploy enabled, pushes won't trigger deployments.

### GitHub Webhook
When you connect the repository, Vercel will:
1. Create a webhook in your GitHub repository
2. This webhook triggers deployments on push
3. The webhook appears in: GitHub → Settings → Webhooks

## Test After Connection

1. **Make a test commit:**
   ```bash
   git commit --allow-empty -m "Test: Verify GitHub connection after reset"
   git push origin main
   ```

2. **Check Vercel Dashboard:**
   - Go to Deployments tab for each project
   - Should see new deployments within 30 seconds
   - Status should be "Building" then "Ready"

3. **Check GitHub:**
   - Go to: https://github.com/RawEval/monorepo/settings/environments
   - Should see Vercel environments created automatically

## Verification Checklist

After connecting in Dashboard, verify:

- [ ] Landing: Git Settings → Repository: `RawEval/monorepo`
- [ ] Landing: Git Settings → Production Branch: `main`
- [ ] Landing: Git Settings → Root Directory: `apps/landing`
- [ ] Landing: Git Settings → Auto-deploy: **ENABLED**
- [ ] Landing: General Settings → Root Directory: `apps/landing` (matches Git)
- [ ] Chat: Git Settings → Repository: `RawEval/monorepo`
- [ ] Chat: Git Settings → Production Branch: `main`
- [ ] Chat: Git Settings → Root Directory: `apps/chat`
- [ ] Chat: Git Settings → Auto-deploy: **ENABLED**
- [ ] Chat: General Settings → Root Directory: `apps/chat` (matches Git)

## Quick Links

**Landing:**
- Git: https://vercel.com/rawevals-projects/monorepo-landing/settings/git
- General: https://vercel.com/rawevals-projects/monorepo-landing/settings/general

**Chat:**
- Git: https://vercel.com/rawevals-projects/monorepo-chat/settings/git
- General: https://vercel.com/rawevals-projects/monorepo-chat/settings/general

---

**Status**: ✅ Fresh Setup Complete - Ready for GitHub Reconnection in Dashboard
