# Vercel Deployment Not Triggering - Troubleshooting Guide

## Quick Checklist

### 1. ✅ Verify Git Integration in Vercel Dashboard

For **each project** (landing and chat), check:

**Dashboard URLs:**
- Landing: https://vercel.com/rawevals-projects/monorepo-landing/settings/git
- Chat: https://vercel.com/rawevals-projects/monorepo-chat/settings/git

**Required Settings:**
- ✅ **Repository**: `RawEval/monorepo`
- ✅ **Production Branch**: `main` (or your default branch)
- ✅ **Root Directory**: 
  - Landing: `apps/landing`
  - Chat: `apps/chat`
- ✅ **Auto-deploy**: **Enabled** (this is critical!)

### 2. ✅ Verify Root Directory in General Settings

**Dashboard URLs:**
- Landing: https://vercel.com/rawevals-projects/monorepo-landing/settings/general
- Chat: https://vercel.com/rawevals-projects/monorepo-chat/settings/general

**Required:**
- **Root Directory**: Must match Git Root Directory
  - Landing: `apps/landing`
  - Chat: `apps/chat`

### 3. ✅ Check Branch Name

Your local branch must match the Production Branch in Vercel:

```bash
# Check current branch
git branch --show-current

# Should be 'main' (or whatever is set in Vercel)
```

### 4. ✅ Verify Push to Correct Remote

```bash
# Check remote
git remote -v

# Should show: origin  git@github.com:RawEval/monorepo.git
```

### 5. ✅ Check Webhook Status

In Vercel Dashboard → Settings → Git:
- Look for webhook status
- Should show "Connected" or "Active"
- If disconnected, click "Reconnect" or "Connect Git Repository"

## Common Issues & Fixes

### Issue 1: Auto-deploy Disabled

**Symptom**: Pushes don't trigger deployments

**Fix:**
1. Go to project Settings → Git
2. Find "Auto-deploy" toggle
3. Enable it
4. Save

### Issue 2: Wrong Root Directory

**Symptom**: Builds fail or don't trigger

**Fix:**
1. Go to Settings → General
2. Set Root Directory to `apps/landing` (or `apps/chat`)
3. Go to Settings → Git
4. Set Root Directory to match (must be same in both places)
5. Save

### Issue 3: Wrong Production Branch

**Symptom**: Pushes to `main` don't trigger, but other branches do

**Fix:**
1. Go to Settings → Git
2. Check "Production Branch"
3. Should be `main` (or your default branch)
4. If different, update it

### Issue 4: Git Repository Not Connected

**Symptom**: No deployments at all

**Fix:**
1. Go to Settings → Git
2. If not connected, click "Connect Git Repository"
3. Select `RawEval/monorepo`
4. Select branch: `main`
5. Set Root Directory: `apps/landing` or `apps/chat`
6. Enable Auto-deploy
7. Save

### Issue 5: Webhook Issues

**Symptom**: Vercel shows connected but deployments don't trigger

**Fix:**
1. Go to Settings → Git
2. Click "Disconnect" (if connected)
3. Click "Connect Git Repository" again
4. Re-authenticate if needed
5. Re-enable Auto-deploy

## Step-by-Step Verification

### For Landing Project

1. **Check Git Integration:**
   ```
   https://vercel.com/rawevals-projects/monorepo-landing/settings/git
   ```
   - Repository: `RawEval/monorepo` ✅
   - Production Branch: `main` ✅
   - Root Directory: `apps/landing` ✅
   - Auto-deploy: **Enabled** ✅

2. **Check General Settings:**
   ```
   https://vercel.com/rawevals-projects/monorepo-landing/settings/general
   ```
   - Root Directory: `apps/landing` ✅
   - Build Command: `cd ../.. && pnpm turbo run build --filter=@raweval/landing` ✅
   - Install Command: `npm install -g pnpm@9 && pnpm install --frozen-lockfile` ✅

### For Chat Project

1. **Check Git Integration:**
   ```
   https://vercel.com/rawevals-projects/monorepo-chat/settings/git
   ```
   - Repository: `RawEval/monorepo` ✅
   - Production Branch: `main` ✅
   - Root Directory: `apps/chat` ✅
   - Auto-deploy: **Enabled** ✅

2. **Check General Settings:**
   ```
   https://vercel.com/rawevals-projects/monorepo-chat/settings/general
   ```
   - Root Directory: `apps/chat` ✅
   - Build Command: `cd ../.. && pnpm turbo run build --filter=@raweval/chat` ✅
   - Install Command: `npm install -g pnpm@9 && pnpm install --frozen-lockfile` ✅

## Manual Test

If auto-deploy still doesn't work, test manually:

```bash
# Test landing deployment
cd apps/landing
npx vercel --prod

# Test chat deployment
cd ../chat
npx vercel --prod
```

## Debugging Commands

```bash
# Check current branch
git branch --show-current

# Check remote
git remote -v

# Check recent commits
git log --oneline -5

# Check if vercel.json exists
ls -la apps/*/vercel.json

# Verify project links
cd apps/landing && cat .vercel/project.json
cd ../chat && cat .vercel/project.json
```

## Most Common Fix

**90% of the time, the issue is:**

1. **Auto-deploy is disabled** → Enable it in Settings → Git
2. **Root Directory mismatch** → Must match in both General and Git settings
3. **Wrong branch** → Production Branch must match your default branch

## After Fixing

1. Make a test commit:
   ```bash
   git commit --allow-empty -m "Test deployment trigger"
   git push origin main
   ```

2. Check Vercel Dashboard → Deployments
   - Should see 2 new deployments (one per project)
   - Should show "Building" status

3. Monitor build logs
   - Click on deployment
   - Check build logs for errors

---

**If deployments still don't trigger after checking all above, the issue is likely in Vercel Dashboard settings, not in code.**
