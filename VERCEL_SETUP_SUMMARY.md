# ✅ Vercel CLI Setup - Complete Summary

## All Commands Executed Successfully

### Step 1: Team Verification ✅

```bash
npx vercel switch rawevals-projects
```

**Result**: Switched to correct team `rawevals-projects`

### Step 2: Project Discovery ✅

```bash
npx vercel projects list
```

**Result**: Found 2 projects:

- `monorepo-landing` (ID: prj_5lNVlsFB00ArK6htYcvEbtk5SPxF)
- `monorepo-chat` (ID: prj_uOCS4xpsFRAUHikCfAzT7AROtHDe)

### Step 3: Cleanup ✅

```bash
rm -rf apps/*/.vercel .vercel
```

**Result**: Removed any old `.vercel` directories

### Step 4: Link Landing Project ✅

```bash
cd apps/landing
npx vercel link --yes --project=monorepo-landing --scope=rawevals-projects
```

**Result**:

- ✅ Linked to `monorepo-landing`
- ✅ Created `.vercel/project.json`
- ✅ Downloaded environment variables to `.env.local`

### Step 5: Link Chat Project ✅

```bash
cd apps/chat
npx vercel link --yes --project=monorepo-chat --scope=rawevals-projects
```

**Result**:

- ✅ Linked to `monorepo-chat`
- ✅ Created `.vercel/project.json`
- ✅ Downloaded environment variables to `.env.local`

### Step 6: Create Configuration Files ✅

Created `vercel.json` for both projects with correct build settings.

## Current Status

| Project            | Linked | Config File                   | URL                                      |
| ------------------ | ------ | ----------------------------- | ---------------------------------------- |
| `monorepo-landing` | ✅ Yes | ✅ `apps/landing/vercel.json` | https://monorepo-landing-kohl.vercel.app |
| `monorepo-chat`    | ✅ Yes | ✅ `apps/chat/vercel.json`    | https://chat.raweval.com                 |

## Files Created

### Landing Project

- ✅ `apps/landing/.vercel/project.json` (gitignored)
- ✅ `apps/landing/.env.local` (gitignored)
- ✅ `apps/landing/vercel.json` (committed)

### Chat Project

- ✅ `apps/chat/.vercel/project.json` (gitignored)
- ✅ `apps/chat/.env.local` (gitignored)
- ✅ `apps/chat/vercel.json` (committed)

## Configuration Details

### Landing (`apps/landing/vercel.json`)

```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/landing",
  "installCommand": "npm install -g pnpm@9 && pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rootDirectory": "apps/landing"
}
```

### Chat (`apps/chat/vercel.json`)

```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/chat",
  "installCommand": "npm install -g pnpm@9 && pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rootDirectory": "apps/chat"
}
```

## Next Steps (Dashboard Configuration)

⚠️ **Important**: Verify these settings in Vercel Dashboard:

### 1. Node.js Version

Both projects currently show Node 24.x. Change to **20.x** in:

- Landing: https://vercel.com/rawevals-projects/monorepo-landing/settings/general
- Chat: https://vercel.com/rawevals-projects/monorepo-chat/settings/general

### 2. Verify Git Integration

Ensure both projects are connected to `RawEval/monorepo`:

- Landing: https://vercel.com/rawevals-projects/monorepo-landing/settings/git
- Chat: https://vercel.com/rawevals-projects/monorepo-chat/settings/git

### 3. Test Deployment

```bash
git add apps/landing/vercel.json apps/chat/vercel.json
git commit -m "Add Vercel configuration files"
git push origin main
```

## Verification Commands

```bash
# Check team
npx vercel whoami

# List projects
npx vercel projects list

# List landing deployments
cd apps/landing && npx vercel ls

# List chat deployments
cd apps/chat && npx vercel ls
```

## Edge Cases Handled

✅ **Team Scope**: Switched from personal account to team account  
✅ **Project Discovery**: Found both projects correctly  
✅ **Non-interactive Linking**: Used `--yes` flag with project names  
✅ **Configuration Files**: Created `vercel.json` for both projects  
✅ **Environment Variables**: Automatically downloaded  
✅ **Git Ignore**: `.vercel` and `.env.local` already in `.gitignore`

## Status: ✅ COMPLETE

All CLI commands executed successfully. Projects are linked and configured. Ready for dashboard verification and testing.
