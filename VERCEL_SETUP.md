# Vercel Deployment Setup Guide

## ⚠️ Important: pnpm Version Configuration

Vercel uses pnpm 6.35.1 by default, but this monorepo requires **pnpm >= 9.0.0**.

## Solution: Configure Install Command

For each Vercel project, you need to set a custom **Install Command** that installs the correct pnpm version first.

### Step 1: Go to Project Settings

1. Open your Vercel project (e.g., `monorepo-landing`)
2. Go to **Settings** → **General**
3. Scroll to **Build & Development Settings**
4. Find **Install Command**

### Step 2: Set Install Command

Replace the default install command with:

```bash
npm install -g pnpm@9 && pnpm install --frozen-lockfile
```

**Why this approach:**

- ✅ More reliable than Corepack on Vercel
- ✅ npm is always available on Vercel build images
- ✅ Directly installs pnpm 9 globally
- ✅ No Corepack dependency

**Alternative (if the above doesn't work):**

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh - && export PATH="$HOME/.local/share/pnpm:$PATH" && pnpm install --frozen-lockfile
```

### Step 3: Configure Build Command

Set the **Build Command** to:

```bash
cd ../.. && pnpm turbo run build --filter=@raweval/landing
```

**Important:** The `cd ../..` is needed because Vercel runs commands from the root directory (`apps/landing`), but we need to be at the monorepo root to run turbo.

### Step 4: Configure Root Directory

Set **Root Directory** to:

```
apps/landing
```

(Or `apps/chat`, `apps/experts`, `apps/admin` for other projects)

### Step 5: Configure Output Directory

Set **Output Directory** to:

```
.next
```

---

## Complete Vercel Project Settings

### Landing App (`monorepo-landing`)

| Setting              | Value                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **Framework Preset** | Next.js                                                                                       |
| **Root Directory**   | `apps/landing`                                                                                |
| **Build Command**    | `cd ../.. && pnpm turbo run build --filter=@raweval/landing`                                  |
| **Output Directory** | `.next`                                                                                       |
| **Install Command**  | `corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile` |
| **Node.js Version**  | 20.x (or latest)                                                                              |

### Chat App (`monorepo-chat`)

| Setting              | Value                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **Framework Preset** | Next.js                                                                                       |
| **Root Directory**   | `apps/chat`                                                                                   |
| **Build Command**    | `cd ../.. && pnpm turbo run build --filter=@raweval/chat`                                     |
| **Output Directory** | `.next`                                                                                       |
| **Install Command**  | `corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile` |
| **Node.js Version**  | 20.x (or latest)                                                                              |

### Experts App (`monorepo-experts`)

| Setting              | Value                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **Framework Preset** | Next.js                                                                                       |
| **Root Directory**   | `apps/experts`                                                                                |
| **Build Command**    | `cd ../.. && pnpm turbo run build --filter=@raweval/experts`                                  |
| **Output Directory** | `.next`                                                                                       |
| **Install Command**  | `corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile` |
| **Node.js Version**  | 20.x (or latest)                                                                              |

### Admin App (`monorepo-admin`)

| Setting              | Value                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **Framework Preset** | Next.js                                                                                       |
| **Root Directory**   | `apps/admin`                                                                                  |
| **Build Command**    | `cd ../.. && pnpm turbo run build --filter=@raweval/admin`                                    |
| **Output Directory** | `.next`                                                                                       |
| **Install Command**  | `corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile` |
| **Node.js Version**  | 20.x (or latest)                                                                              |

---

## Why This Works

1. **Corepack** is built into Node.js 16.9+ and manages package manager versions
2. `corepack enable` activates Corepack
3. `corepack prepare pnpm@9.0.0 --activate` downloads and activates pnpm 9.0.0
4. `pnpm install --frozen-lockfile` installs dependencies using the lockfile

---

## Alternative: Environment Variable

You can also set an environment variable in Vercel:

**Name:** `ENABLE_EXPERIMENTAL_COREPACK`  
**Value:** `1`

However, the install command approach is more reliable.

---

## Troubleshooting

### "Unsupported environment (bad pnpm version)"

- ✅ Make sure the **Install Command** is set correctly
- ✅ Verify Node.js version is 20.x or later (Corepack requires Node 16.9+)
- ✅ Check that `pnpm-lock.yaml` exists in the repository

### "Cannot find module '@raweval/ui'"

- ✅ Ensure **Root Directory** is set to `apps/landing` (not root)
- ✅ Build command includes `cd ../..` to run from monorepo root
- ✅ Dependencies are installed at monorepo root level

### Build fails with "turbo: command not found"

- ✅ Install command must run `pnpm install` at monorepo root
- ✅ Build command must `cd ../..` first to reach monorepo root

---

## Quick Setup Checklist

For each Vercel project:

- [ ] Set **Root Directory** to `apps/[app-name]`
- [ ] Set **Install Command** to use Corepack + pnpm 9
- [ ] Set **Build Command** with `cd ../..` prefix
- [ ] Set **Output Directory** to `.next`
- [ ] Set **Node.js Version** to 20.x
- [ ] Add environment variables (if needed)
- [ ] Configure custom domain (optional)

---

## After Configuration

Once configured, push to your main branch and Vercel will:

1. Clone the repository
2. Run the install command (installs pnpm 9, then dependencies)
3. Run the build command (builds the specific app)
4. Deploy to production

---

**Need help?** Check [Vercel Documentation](https://vercel.com/docs) or the main [DEPLOYMENT.md](./DEPLOYMENT.md) file.
