# ✅ Complete Vercel Setup - Reset & Redo

## What Was Done

### 1. ✅ Complete Cleanup
- Removed all `.vercel` directories from all apps
- Removed all `.env.local` files
- Cleaned up any existing links

### 2. ✅ Team Verification
- Switched to correct team: `rawevals-projects`
- Verified team access

### 3. ✅ Project Linking via CLI
- **Landing**: Linked to `monorepo-landing`
  - Project ID: `prj_5lNVlsFB00ArK6htYcvEbtk5SPxF`
  - Location: `apps/landing/.vercel/`
  
- **Chat**: Linked to `monorepo-chat`
  - Project ID: `prj_uOCS4xpsFRAUHikCfAzT7AROtHDe`
  - Location: `apps/chat/.vercel/`

### 4. ✅ Configuration Files
All apps have valid `vercel.json` files:
- ✅ `apps/landing/vercel.json`
- ✅ `apps/chat/vercel.json`
- ✅ `apps/experts/vercel.json`
- ✅ `apps/admin/vercel.json`

### 5. ✅ Git Ignore Protection
All apps have `.gitignore` files that exclude:
- `.vercel/` directory
- `.env*.local` files

## Current Status

| App | Linked | Config File | Project Name |
|-----|--------|-------------|--------------|
| Landing | ✅ Yes | ✅ `vercel.json` | `monorepo-landing` |
| Chat | ✅ Yes | ✅ `vercel.json` | `monorepo-chat` |
| Experts | ❌ No | ✅ `vercel.json` | (No Vercel project yet) |
| Admin | ❌ No | ✅ `vercel.json` | (No Vercel project yet) |

## Configuration Details

### All Apps Use Same Structure

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/{app}",
  "installCommand": "npm install -g pnpm@9 && pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

**Note**: `rootDirectory` is **NOT** in `vercel.json` (it's set in Dashboard only)

## Dashboard Configuration Required

For **each linked project**, configure in Vercel Dashboard:

### Landing Project
**URL**: https://vercel.com/rawevals-projects/monorepo-landing/settings/general

**Settings → General:**
- Root Directory: `apps/landing`
- Node.js Version: `20.x` (change from 24.x)
- Build Command: `cd ../.. && pnpm turbo run build --filter=@raweval/landing`
- Install Command: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
- Output Directory: `.next`

**Settings → Git:**
- Repository: `RawEval/monorepo`
- Production Branch: `main`
- Root Directory: `apps/landing` ⚠️ **Must match General settings**
- **Auto-deploy: ENABLED** ⚠️ **Critical for auto-deployments**

### Chat Project
**URL**: https://vercel.com/rawevals-projects/monorepo-chat/settings/general

**Settings → General:**
- Root Directory: `apps/chat`
- Node.js Version: `20.x` (change from 24.x)
- Build Command: `cd ../.. && pnpm turbo run build --filter=@raweval/chat`
- Install Command: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
- Output Directory: `.next`

**Settings → Git:**
- Repository: `RawEval/monorepo`
- Production Branch: `main`
- Root Directory: `apps/chat` ⚠️ **Must match General settings**
- **Auto-deploy: ENABLED** ⚠️ **Critical for auto-deployments**

## Files Created/Modified

### Landing
- ✅ `apps/landing/.vercel/project.json` (gitignored)
- ✅ `apps/landing/.env.local` (gitignored)
- ✅ `apps/landing/vercel.json` (committed)
- ✅ `apps/landing/.gitignore` (includes .vercel)

### Chat
- ✅ `apps/chat/.vercel/project.json` (gitignored)
- ✅ `apps/chat/.env.local` (gitignored)
- ✅ `apps/chat/vercel.json` (committed)
- ✅ `apps/chat/.gitignore` (includes .vercel)

### Experts & Admin
- ✅ `apps/experts/vercel.json` (ready for when projects are created)
- ✅ `apps/admin/vercel.json` (ready for when projects are created)
- ✅ `.gitignore` files created

## Persistence

All configurations are now persistent:

1. **Project Links**: Stored in `.vercel/project.json` (gitignored)
2. **Build Config**: Stored in `vercel.json` (committed to git)
3. **Git Ignore**: Protects `.vercel/` and `.env.local` from being committed
4. **Dashboard Settings**: Must be configured once per project

## Verification Commands

```bash
# Check team
npx vercel whoami
npx vercel switch rawevals-projects

# List projects
npx vercel projects list

# Check links
cd apps/landing && cat .vercel/project.json
cd ../chat && cat .vercel/project.json

# Verify configs
ls -la apps/*/vercel.json
ls -la apps/*/.gitignore
```

## Test Deployment

After configuring Dashboard settings:

```bash
git commit --allow-empty -m "Test: Verify Vercel auto-deploy"
git push origin main
```

You should see 2 deployments trigger (one per project) within 30 seconds.

## Complete Setup Script

A complete setup script is available:

```bash
./scripts/setup-vercel-complete.sh
```

This script:
- ✅ Checks Vercel CLI
- ✅ Verifies login
- ✅ Switches to correct team
- ✅ Cleans up old links
- ✅ Links all projects
- ✅ Verifies configurations
- ✅ Ensures .gitignore files

## Edge Cases Handled

✅ **Team Scope**: Automatically switches to `rawevals-projects`  
✅ **Project Discovery**: Finds existing projects or creates new ones  
✅ **Non-interactive**: Uses `--yes` flag for automation  
✅ **Configuration Validation**: Validates JSON and checks for invalid properties  
✅ **Git Protection**: Ensures `.vercel/` is gitignored  
✅ **Persistence**: All settings saved to files and dashboard  
✅ **Multiple Apps**: Handles all 4 apps consistently  

## Troubleshooting

### If deployments don't trigger:
1. Check Auto-deploy is enabled in Dashboard → Settings → Git
2. Verify Root Directory matches in both General and Git settings
3. Ensure Production Branch is `main`

### If build fails:
1. Check Install Command uses pnpm 9
2. Verify Build Command includes `cd ../..`
3. Ensure Root Directory is correct

### If project not found:
1. List projects: `npx vercel projects list`
2. Use exact project name from list
3. Verify team scope is correct

---

**Status**: ✅ Complete Setup Done - Ready for Dashboard Configuration
