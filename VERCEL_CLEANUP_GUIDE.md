# Vercel Projects Cleanup Guide

## Understanding GitHub Deployments vs Vercel Projects

GitHub's **Deployments** page shows **all deployments** from **all Vercel projects** connected to your repository. This can be confusing if you have:
- Old/duplicate projects
- Auto-detected projects from Vercel
- Multiple projects pointing to the same repo

## Current Situation

Based on your GitHub deployments page, you have:
- ✅ `monorepo-chat` - Your chat project (active)
- ❓ `Production` (unnamed) - Likely your landing project or an old project
- ❌ `monorepo-landing-aa2w` - Old/duplicate project (failed)

## Step 1: Identify Your Active Vercel Projects

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Check all projects in your account
3. You should only have **2 active projects**:
   - One for **landing** (e.g., `monorepo-landing` or `raweval-landing`)
   - One for **chat** (e.g., `monorepo-chat` or `raweval-chat`)

## Step 2: Clean Up Duplicate/Old Projects

### Option A: Delete Old Projects in Vercel

1. Go to Vercel Dashboard
2. Find projects that are **NOT** your 2 active ones:
   - `monorepo-landing-aa2w` (old/duplicate)
   - Any other projects you don't recognize
3. For each old project:
   - Click on the project
   - Go to **Settings** → **General**
   - Scroll to bottom
   - Click **Delete Project**
   - Confirm deletion

### Option B: Disconnect Old Projects from GitHub

If you want to keep the projects but stop deployments:

1. Go to the old project in Vercel
2. Go to **Settings** → **Git**
3. Click **Disconnect** next to the repository
4. This will stop new deployments but keep the project

## Step 3: Verify Your Active Projects

### Landing Project Should Have:
- **Project Name**: `monorepo-landing` or `raweval-landing`
- **Root Directory**: `apps/landing`
- **Build Command**: `cd ../.. && pnpm turbo run build --filter=@raweval/landing`
- **Install Command**: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
- **Connected to**: `RawEval/monorepo` (main branch)
- **Domain**: Your landing domain (e.g., `www.raweval.com`)

### Chat Project Should Have:
- **Project Name**: `monorepo-chat` or `raweval-chat`
- **Root Directory**: `apps/chat`
- **Build Command**: `cd ../.. && pnpm turbo run build --filter=@raweval/chat`
- **Install Command**: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
- **Connected to**: `RawEval/monorepo` (main branch)
- **Domain**: Your chat domain (e.g., `chat.raweval.com`)

## Step 4: Rename Projects for Clarity (Optional)

If your projects have unclear names:

1. Go to project **Settings** → **General**
2. Change **Project Name** to something clear:
   - Landing: `raweval-landing` or `monorepo-landing`
   - Chat: `raweval-chat` or `monorepo-chat`
3. Click **Save**

## Step 5: Verify GitHub Integration

For each active project:

1. Go to **Settings** → **Git**
2. Verify:
   - ✅ Repository: `RawEval/monorepo`
   - ✅ Production Branch: `main` (or your default branch)
   - ✅ Auto-deploy: Enabled
   - ✅ Root Directory: `apps/landing` or `apps/chat`

## Step 6: Test Deployment

After cleanup:

1. Make a small change (e.g., update a comment)
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test deployment after cleanup"
   git push origin main
   ```
3. Check Vercel Dashboard - you should see **only 2 deployments** (one per project)
4. Check GitHub Deployments - should show only your 2 active projects

## Troubleshooting

### "I see deployments but they're not deploying"

- Check if projects are connected to the correct branch
- Verify Root Directory is set correctly
- Check Build Command includes `cd ../..`
- Verify Install Command uses pnpm 9

### "Old deployments still showing on GitHub"

- GitHub keeps deployment history even after deleting Vercel projects
- This is normal and doesn't affect new deployments
- Old deployments will fade over time

### "Multiple projects deploying the same app"

- Check Root Directory - each project should point to a different app
- Landing: `apps/landing`
- Chat: `apps/chat`
- Verify Build Command filter matches the app

## Quick Checklist

- [ ] Only 2 projects in Vercel Dashboard
- [ ] Each project has correct Root Directory
- [ ] Each project has correct Build Command
- [ ] Each project has correct Install Command
- [ ] Each project is connected to `RawEval/monorepo`
- [ ] Old/duplicate projects are deleted or disconnected
- [ ] Test deployment works for both projects

## After Cleanup

You should see:
- **Vercel Dashboard**: 2 active projects
- **GitHub Deployments**: 2 deployment environments (one per project)
- **New pushes**: Trigger deployments for both projects automatically

---

**Need help?** Check [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed setup instructions.
