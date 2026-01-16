# Vercel CLI Fix Guide - Complete Setup

This guide uses Vercel CLI to properly configure your monorepo with 2 projects (landing and chat).

## Prerequisites

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

## Step 1: List All Projects

First, see what projects you have:

```bash
vercel projects list
```

This will show all projects in your account. Note down:
- Project names
- Project IDs
- Which ones are for landing/chat
- Which ones are duplicates/old

## Step 2: Check Current Project Links

Check if any projects are already linked in your monorepo:

```bash
cd /Users/durgesh/Code/Orgs/RawEval/monorepo

# Check for .vercel directories in apps
ls -la apps/*/.vercel 2>/dev/null || echo "No .vercel directories found"

# Check root for .vercel
ls -la .vercel 2>/dev/null || echo "No root .vercel directory"
```

## Step 3: Remove Old Project Links

If you have old `.vercel` directories, remove them:

```bash
# Remove any existing .vercel directories
rm -rf apps/landing/.vercel
rm -rf apps/chat/.vercel
rm -rf apps/experts/.vercel
rm -rf apps/admin/.vercel
rm -rf .vercel
```

## Step 4: Delete Old/Duplicate Projects (if needed)

If you have duplicate projects, delete them:

```bash
# List projects to find duplicates
vercel projects list

# Delete a project (replace PROJECT_ID with actual ID)
# vercel projects rm PROJECT_ID
```

**⚠️ Warning:** Only delete projects you're sure are duplicates. Get the project ID from `vercel projects list`.

## Step 5: Link Landing Project

### Option A: Link to Existing Project

If you already have a landing project:

```bash
cd apps/landing
vercel link
```

When prompted:
- **Set up and deploy?** → `N` (we'll configure manually)
- **Which scope?** → Select your account/team
- **Link to existing project?** → `Y`
- **What's the name of your existing project?** → Enter your landing project name (e.g., `monorepo-landing` or `raweval-landing`)

### Option B: Create New Project

If you need to create a new landing project:

```bash
cd apps/landing
vercel link
```

When prompted:
- **Set up and deploy?** → `N`
- **Which scope?** → Select your account/team
- **Link to existing project?** → `N`
- **What's your project's name?** → `raweval-landing` (or your preferred name)
- **In which directory is your code located?** → `./` (current directory)

## Step 6: Configure Landing Project via CLI

After linking, configure the project:

```bash
# Still in apps/landing directory
vercel env pull .env.local  # Optional: pull env vars

# Set project settings via Vercel Dashboard or use vercel.json
```

Create `apps/landing/vercel.json`:

```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/landing",
  "installCommand": "npm install -g pnpm@9 && pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rootDirectory": "apps/landing"
}
```

**OR** configure via Vercel Dashboard (recommended for first-time setup):
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your landing project
3. Go to **Settings** → **General**
4. Set:
   - **Root Directory**: `apps/landing`
   - **Build Command**: `cd ../.. && pnpm turbo run build --filter=@raweval/landing`
   - **Install Command**: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
   - **Output Directory**: `.next`
   - **Node.js Version**: `20.x`

## Step 7: Link Chat Project

```bash
cd ../chat
vercel link
```

When prompted:
- **Set up and deploy?** → `N`
- **Which scope?** → Select your account/team
- **Link to existing project?** → `Y` (if project exists) or `N` (to create new)
- **Project name?** → `raweval-chat` (or your existing chat project name)

## Step 8: Configure Chat Project

Create `apps/chat/vercel.json`:

```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/chat",
  "installCommand": "npm install -g pnpm@9 && pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rootDirectory": "apps/chat"
}
```

**OR** configure via Vercel Dashboard:
1. Go to your chat project
2. **Settings** → **General**
3. Set:
   - **Root Directory**: `apps/chat`
   - **Build Command**: `cd ../.. && pnpm turbo run build --filter=@raweval/chat`
   - **Install Command**: `npm install -g pnpm@9 && pnpm install --frozen-lockfile`
   - **Output Directory**: `.next`
   - **Node.js Version**: `20.x`

## Step 9: Verify Project Configurations

Check both projects are configured correctly:

```bash
# Check landing project
cd apps/landing
vercel inspect

# Check chat project
cd ../chat
vercel inspect
```

## Step 10: Connect Projects to GitHub (if not already)

For each project, ensure it's connected to GitHub:

1. Go to Vercel Dashboard
2. Select project (landing or chat)
3. Go to **Settings** → **Git**
4. If not connected:
   - Click **Connect Git Repository**
   - Select `RawEval/monorepo`
   - Select branch: `main` (or your default branch)
5. Verify:
   - ✅ Repository: `RawEval/monorepo`
   - ✅ Production Branch: `main`
   - ✅ Root Directory: `apps/landing` or `apps/chat`
   - ✅ Auto-deploy: Enabled

## Step 11: Test Deployment

Test both projects:

```bash
# Test landing deployment
cd apps/landing
vercel --prod

# Test chat deployment
cd ../chat
vercel --prod
```

Or trigger via Git push:

```bash
cd /Users/durgesh/Code/Orgs/RawEval/monorepo

# Make a test commit
git commit --allow-empty -m "Test deployment after Vercel CLI setup"
git push origin main
```

## Step 12: Verify Deployments

Check deployments:

```bash
# List all deployments
vercel ls

# Check specific project deployments
cd apps/landing
vercel ls

cd ../chat
vercel ls
```

## Complete Setup Script

Here's a complete script to set everything up:

```bash
#!/bin/bash

# Navigate to monorepo root
cd /Users/durgesh/Code/Orgs/RawEval/monorepo

# Remove old .vercel directories
echo "🧹 Cleaning up old .vercel directories..."
rm -rf apps/*/.vercel .vercel

# Link landing project
echo "🔗 Linking landing project..."
cd apps/landing
vercel link --yes --scope=YOUR_SCOPE --project=raweval-landing
cd ../..

# Link chat project
echo "🔗 Linking chat project..."
cd apps/chat
vercel link --yes --scope=YOUR_SCOPE --project=raweval-chat
cd ../..

echo "✅ Setup complete! Configure project settings in Vercel Dashboard."
```

**Note:** Replace `YOUR_SCOPE` with your Vercel team/account name.

## Troubleshooting

### "Project not found"
- List projects: `vercel projects list`
- Use exact project name from the list

### "Already linked to different project"
- Remove `.vercel` directory: `rm -rf apps/landing/.vercel`
- Run `vercel link` again

### "Build fails"
- Verify Install Command uses pnpm 9
- Check Root Directory is correct
- Ensure Build Command includes `cd ../..`

### "Deployments not triggering on push"
- Check Git integration in Vercel Dashboard
- Verify Production Branch matches your default branch
- Ensure Root Directory is set correctly

## Quick Reference Commands

```bash
# List all projects
vercel projects list

# Link project
cd apps/landing && vercel link

# Deploy to production
vercel --prod

# List deployments
vercel ls

# Inspect project config
vercel inspect

# Remove project link
rm -rf .vercel

# Check current project
vercel whoami
```

## Final Checklist

- [ ] Only 2 projects in Vercel (landing and chat)
- [ ] Both projects linked via CLI
- [ ] Root Directory set correctly for each
- [ ] Build Command includes `cd ../..`
- [ ] Install Command uses pnpm 9
- [ ] Both projects connected to GitHub
- [ ] Production branch set to `main`
- [ ] Test deployment successful
- [ ] Old/duplicate projects deleted

---

**After completing these steps, your deployments should work correctly!**
