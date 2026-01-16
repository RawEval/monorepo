# Next Steps: Complete Vercel Setup

## ✅ Current Status

You're now logged into the correct team (`rawevals-projects`) and can see your 2 projects:
- `monorepo-chat` → https://chat.raweval.com
- `monorepo-landing` → https://monorepo-landing-kohl.vercel.app

## Step 1: Link Landing Project

```bash
cd apps/landing
npx vercel link
```

When prompted:
- **Set up and deploy?** → `N`
- **Which scope?** → Select `rawevals-projects` (RawEval's projects)
- **Link to existing project?** → `Y`
- **What's the name of your existing project?** → `monorepo-landing`

## Step 2: Link Chat Project

```bash
cd ../chat
npx vercel link
```

When prompted:
- **Set up and deploy?** → `N`
- **Which scope?** → Select `rawevals-projects` (RawEval's projects)
- **Link to existing project?** → `Y`
- **What's the name of your existing project?** → `monorepo-chat`

## Step 3: Configure Projects in Vercel Dashboard

### For `monorepo-landing`:

Go to: https://vercel.com/rawevals-projects/monorepo-landing/settings/general

**Build & Development Settings:**
- **Root Directory**: `apps/landing`
- **Build Command**: `cd ../.. && pnpm turbo run build --filter=@raweval/landing`
- **Install Command**: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
- **Output Directory**: `.next`
- **Node.js Version**: `20.x` (currently shows 24.x, change to 20.x)

### For `monorepo-chat`:

Go to: https://vercel.com/rawevals-projects/monorepo-chat/settings/general

**Build & Development Settings:**
- **Root Directory**: `apps/chat`
- **Build Command**: `cd ../.. && pnpm turbo run build --filter=@raweval/chat`
- **Install Command**: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
- **Output Directory**: `.next`
- **Node.js Version**: `20.x` (currently shows 24.x, change to 20.x)

## Step 4: Verify Git Integration

### For `monorepo-landing`:

Go to: https://vercel.com/rawevals-projects/monorepo-landing/settings/git

Verify:
- ✅ Repository: `RawEval/monorepo`
- ✅ Production Branch: `main` (or your default branch)
- ✅ Root Directory: `apps/landing`
- ✅ Auto-deploy: Enabled

### For `monorepo-chat`:

Go to: https://vercel.com/rawevals-projects/monorepo-chat/settings/git

Verify:
- ✅ Repository: `RawEval/monorepo`
- ✅ Production Branch: `main` (or your default branch)
- ✅ Root Directory: `apps/chat`
- ✅ Auto-deploy: Enabled

## Step 5: Delete Old/Duplicate Projects (if any)

If you see any other projects in your Vercel dashboard that aren't these 2, delete them:
1. Go to project settings
2. Scroll to bottom
3. Click "Delete Project"

## Step 6: Test Deployment

After configuration, test with:

```bash
cd /Users/durgesh/Code/Orgs/RawEval/monorepo
git commit --allow-empty -m "Test deployment after Vercel CLI setup"
git push origin main
```

You should see 2 deployments trigger (one for each project).

## Quick Commands Reference

```bash
# Switch to correct team (if needed)
npx vercel switch rawevals-projects

# List projects
npx vercel projects list

# Link landing project
cd apps/landing && npx vercel link

# Link chat project
cd apps/chat && npx vercel link

# Check current account/team
npx vercel whoami
```

## Important Notes

1. **Node.js Version**: Both projects currently show `24.x` but should be `20.x` for compatibility
2. **Root Directory**: Must be set correctly (`apps/landing` and `apps/chat`)
3. **Build Command**: Must include `cd ../..` to reach monorepo root
4. **Install Command**: Must use pnpm 9 (not default pnpm 6)

---

**After completing these steps, your deployments will work correctly!**
