# Vercel Deployment Troubleshooting Guide

## Issue: Pushes Don't Trigger Deployments

If you've connected your monorepo to Vercel but pushes don't trigger deployments, check these common issues:

## ✅ Checklist

### 1. **Git Integration**
- [ ] Go to Vercel Dashboard → Your Project → Settings → Git
- [ ] Verify the repository is connected: `RawEval/monorepo`
- [ ] Check the connected branch (usually `main` or `master`)
- [ ] Ensure "Production Branch" matches your default branch

### 2. **Root Directory Configuration**
For **Landing App**:
- Root Directory: `apps/landing`
- Build Command: `cd ../.. && pnpm turbo run build --filter=@raweval/landing`

For **Chat App**:
- Root Directory: `apps/chat`
- Build Command: `cd ../.. && pnpm turbo run build --filter=@raweval/chat`

### 3. **Install Command**
Both projects should have:
```
npm install -g pnpm@9 && pnpm install --frozen-lockfile
```

### 4. **Missing pnpm-lock.yaml**
If `pnpm-lock.yaml` is missing, Vercel won't deploy. Generate it:

```bash
cd /Users/durgesh/Code/Orgs/RawEval/monorepo
pnpm install
git add pnpm-lock.yaml
git commit -m "Add pnpm-lock.yaml"
git push
```

### 5. **Vercel Project Settings**

#### Landing Project Settings:
| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/landing` |
| **Build Command** | `cd ../.. && pnpm turbo run build --filter=@raweval/landing` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install -g pnpm@9 && pnpm install --frozen-lockfile` |
| **Node.js Version** | 20.x |

#### Chat Project Settings:
| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/chat` |
| **Build Command** | `cd ../.. && pnpm turbo run build --filter=@raweval/chat` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install -g pnpm@9 && pnpm install --frozen-lockfile` |
| **Node.js Version** | 20.x |

### 6. **Git Branch Settings**
- Go to Settings → Git
- Check "Production Branch" matches your default branch (usually `main`)
- Verify "Auto-deploy" is enabled
- Check "Ignore Build Step" is empty or returns false

### 7. **Webhook Configuration**
- Go to Settings → Git → Deploy Hooks
- Verify webhook is active
- Check if webhook URL is correct: `https://api.vercel.com/v1/integrations/deploy/...`

### 8. **Manual Trigger Test**
Try triggering a deployment manually:
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Or use Vercel CLI: `vercel --prod`

## 🔍 Debugging Steps

### Step 1: Check Vercel Dashboard
1. Go to your Vercel project
2. Check "Deployments" tab - are there any failed deployments?
3. Check "Settings" → "Git" - is the repo connected?
4. Check "Settings" → "General" → "Build & Development Settings"

### Step 2: Verify Git Push
```bash
# Check if you're pushing to the correct branch
git branch --show-current

# Check remote
git remote -v

# Push and watch for Vercel webhook
git push origin main
```

### Step 3: Check Vercel Logs
1. Go to Deployments tab
2. Click on a deployment
3. Check "Build Logs" for errors
4. Common errors:
   - `ERR_PNPM_UNSUPPORTED_ENGINE` → Fix Install Command
   - `Cannot find module '@raweval/ui'` → Fix Root Directory
   - `turbo: command not found` → Fix Build Command

### Step 4: Test Build Locally
```bash
# Test landing build
cd /Users/durgesh/Code/Orgs/RawEval/monorepo
pnpm turbo run build --filter=@raweval/landing

# Test chat build
pnpm turbo run build --filter=@raweval/chat
```

## 🚨 Common Issues & Fixes

### Issue 1: "No deployments triggered"
**Fix:**
- Verify Git integration in Vercel Dashboard
- Check branch name matches Production Branch
- Ensure `pnpm-lock.yaml` exists and is committed
- Try manual redeploy to test

### Issue 2: "Build fails immediately"
**Fix:**
- Check Install Command is set correctly
- Verify Root Directory is `apps/landing` or `apps/chat`
- Ensure Build Command includes `cd ../..`

### Issue 3: "Deployment stuck or cancelled"
**Fix:**
- Check Vercel build logs
- Verify Node.js version is 20.x
- Check for timeout issues (increase if needed)

### Issue 4: "Wrong app deployed"
**Fix:**
- Verify Root Directory matches the app
- Check Build Command filter matches app name
- Ensure separate Vercel projects for each app

## 📋 Quick Fix Commands

### Generate pnpm-lock.yaml (if missing):
```bash
cd /Users/durgesh/Code/Orgs/RawEval/monorepo
pnpm install
git add pnpm-lock.yaml
git commit -m "Add pnpm-lock.yaml for Vercel"
git push
```

### Test deployment manually:
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login
vercel login

# Deploy from root
cd /Users/durgesh/Code/Orgs/RawEval/monorepo
vercel --prod
```

## 🔧 Vercel Dashboard Settings Quick Reference

### For Landing Project:
1. Settings → General → Root Directory: `apps/landing`
2. Settings → General → Build Command: `cd ../.. && pnpm turbo run build --filter=@raweval/landing`
3. Settings → General → Install Command: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
4. Settings → General → Output Directory: `.next`
5. Settings → Git → Production Branch: `main` (or your default branch)
6. Settings → Git → Auto-deploy: ✅ Enabled

### For Chat Project:
1. Settings → General → Root Directory: `apps/chat`
2. Settings → General → Build Command: `cd ../.. && pnpm turbo run build --filter=@raweval/chat`
3. Settings → General → Install Command: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
4. Settings → General → Output Directory: `.next`
5. Settings → Git → Production Branch: `main` (or your default branch)
6. Settings → Git → Auto-deploy: ✅ Enabled

## 🎯 Next Steps

1. **Verify all settings** in Vercel Dashboard match the above
2. **Generate pnpm-lock.yaml** if missing
3. **Push a test commit** to trigger deployment
4. **Check deployment logs** for any errors
5. **Manually redeploy** if auto-deploy isn't working

## 📞 Still Not Working?

Check:
- Vercel project is connected to the correct GitHub repo
- Branch name in Vercel matches your default branch
- `pnpm-lock.yaml` is committed to the repository
- Build settings are saved in Vercel Dashboard
- No "Ignore Build Step" script is blocking deployments
