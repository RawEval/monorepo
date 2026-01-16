# ✅ Vercel CLI Setup - COMPLETED

## What Was Done

### 1. ✅ Team Verification
- Switched to correct team: `rawevals-projects`
- Verified both projects are accessible

### 2. ✅ Project Linking
- **Landing Project**: Successfully linked to `monorepo-landing`
  - Project ID: `prj_5lNVlsFB00ArK6htYcvEbtk5SPxF`
  - Location: `apps/landing/.vercel/`
  
- **Chat Project**: Successfully linked to `monorepo-chat`
  - Project ID: `prj_uOCS4xpsFRAUHikCfAzT7AROtHDe`
  - Location: `apps/chat/.vercel/`

### 3. ✅ Configuration Files Created
- `apps/landing/vercel.json` - Build configuration for landing
- `apps/chat/vercel.json` - Build configuration for chat

### 4. ✅ Environment Variables
- Both projects downloaded development environment variables
- Created `.env.local` files (already in `.gitignore`)

## Current Project Status

### Landing Project (`monorepo-landing`)
- **URL**: https://monorepo-landing-kohl.vercel.app
- **Linked**: ✅ Yes
- **Config File**: ✅ `apps/landing/vercel.json`
- **Node Version**: Currently 24.x (should be changed to 20.x in dashboard)

### Chat Project (`monorepo-chat`)
- **URL**: https://chat.raweval.com
- **Linked**: ✅ Yes
- **Config File**: ✅ `apps/chat/vercel.json`
- **Node Version**: Currently 24.x (should be changed to 20.x in dashboard)

## Next Steps: Configure in Vercel Dashboard

Even though we've created `vercel.json` files, you should **verify and update** these settings in the Vercel Dashboard to ensure they're applied:

### For `monorepo-landing`:
**Dashboard URL**: https://vercel.com/rawevals-projects/monorepo-landing/settings/general

**Settings to Verify/Update:**
- ✅ **Root Directory**: `apps/landing`
- ✅ **Build Command**: `cd ../.. && pnpm turbo run build --filter=@raweval/landing`
- ✅ **Install Command**: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
- ✅ **Output Directory**: `.next`
- ⚠️ **Node.js Version**: Change from `24.x` to `20.x`

### For `monorepo-chat`:
**Dashboard URL**: https://vercel.com/rawevals-projects/monorepo-chat/settings/general

**Settings to Verify/Update:**
- ✅ **Root Directory**: `apps/chat`
- ✅ **Build Command**: `cd ../.. && pnpm turbo run build --filter=@raweval/chat`
- ✅ **Install Command**: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
- ✅ **Output Directory**: `.next`
- ⚠️ **Node.js Version**: Change from `24.x` to `20.x`

## Verify Git Integration

### For `monorepo-landing`:
**Dashboard URL**: https://vercel.com/rawevals-projects/monorepo-landing/settings/git

Verify:
- ✅ Repository: `RawEval/monorepo`
- ✅ Production Branch: `main` (or your default branch)
- ✅ Root Directory: `apps/landing`
- ✅ Auto-deploy: Enabled

### For `monorepo-chat`:
**Dashboard URL**: https://vercel.com/rawevals-projects/monorepo-chat/settings/git

Verify:
- ✅ Repository: `RawEval/monorepo`
- ✅ Production Branch: `main` (or your default branch)
- ✅ Root Directory: `apps/chat`
- ✅ Auto-deploy: Enabled

## Test Deployment

After verifying settings in the dashboard:

```bash
cd /Users/durgesh/Code/Orgs/RawEval/monorepo
git add apps/landing/vercel.json apps/chat/vercel.json
git commit -m "Add Vercel configuration files"
git push origin main
```

You should see **2 deployments** trigger (one for each project).

## Quick Commands Reference

```bash
# Check current team
npx vercel whoami

# List projects
npx vercel projects list

# List deployments for landing
cd apps/landing && npx vercel ls

# List deployments for chat
cd apps/chat && npx vercel ls

# Deploy landing manually
cd apps/landing && npx vercel --prod

# Deploy chat manually
cd apps/chat && npx vercel --prod
```

## Files Created/Modified

- ✅ `apps/landing/.vercel/project.json` - Project link (gitignored)
- ✅ `apps/landing/.env.local` - Environment variables (gitignored)
- ✅ `apps/landing/vercel.json` - Build configuration
- ✅ `apps/chat/.vercel/project.json` - Project link (gitignored)
- ✅ `apps/chat/.env.local` - Environment variables (gitignored)
- ✅ `apps/chat/vercel.json` - Build configuration

## Important Notes

1. **Node.js Version**: Both projects currently use Node 24.x. Change to 20.x in dashboard for better compatibility.

2. **vercel.json vs Dashboard**: The `vercel.json` files provide defaults, but dashboard settings take precedence. Always verify in dashboard.

3. **Git Integration**: Ensure both projects are connected to `RawEval/monorepo` with correct root directories.

4. **Auto-deploy**: Should be enabled for both projects to trigger on pushes to `main`.

## Troubleshooting

### If deployments fail:
1. Check build logs in Vercel Dashboard
2. Verify Install Command uses pnpm 9
3. Ensure Root Directory is correct
4. Check Node.js version is 20.x

### If deployments don't trigger:
1. Verify Git integration in dashboard
2. Check Production Branch matches your default branch
3. Ensure Root Directory is set correctly
4. Verify Auto-deploy is enabled

---

**Status**: ✅ CLI Setup Complete - Ready for Dashboard Configuration
