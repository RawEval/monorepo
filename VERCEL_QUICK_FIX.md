# 🚨 Quick Fix: pnpm Version Error on Vercel

## The Error

```
ERR_PNPM_UNSUPPORTED_ENGINE  Unsupported environment (bad pnpm and/or Node.js version)
Your pnpm version is incompatible with "/vercel/path0".
Expected version: >=9.0.0
Got: 6.35.1
```

## ✅ Solution (5 Minutes)

### Step 1: Go to Vercel Project Settings

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (e.g., `monorepo-landing`)
3. Go to **Settings** tab
4. Click **General** (left sidebar)
5. Scroll to **Build & Development Settings**

### Step 2: Update Install Command

Find the **Install Command** field and replace it with:

```bash
corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile
```

**Or click "Override" and paste:**

```bash
corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile
```

### Step 3: Verify Build Command

Make sure your **Build Command** is:

```bash
cd ../.. && pnpm turbo run build --filter=@raweval/landing
```

_(Replace `landing` with `chat`, `experts`, or `admin` for other apps)_

### Step 4: Save and Redeploy

1. Click **Save** at the bottom
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Or push a new commit to trigger automatic deployment

---

## 🔍 Verify Settings

Your complete settings should look like this:

| Setting              | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| **Root Directory**   | `apps/landing`                                               |
| **Build Command**    | `cd ../.. && pnpm turbo run build --filter=@raweval/landing` |
| **Output Directory** | `.next`                                                      |
| **Install Command**  | `npm install -g pnpm@9 && pnpm install --frozen-lockfile`    |
| **Node.js Version**  | 20.x (or latest)                                             |

---

## ⚡ Why This Works

1. **npm** is always available on Vercel build images
2. `npm install -g pnpm@9` directly installs pnpm 9 globally
3. `pnpm install --frozen-lockfile` installs dependencies using the lockfile
4. More reliable than Corepack which might not be enabled on Vercel's build environment

---

## 🔄 For All Projects

You'll need to do this for **each Vercel project**:

- ✅ `monorepo-landing` → `@raweval/landing`
- ✅ `monorepo-chat` → `@raweval/chat`
- ✅ `monorepo-experts` → `@raweval/experts`
- ✅ `monorepo-admin` → `@raweval/admin`

Just change the `--filter` flag in the Build Command.

---

## 📚 Full Documentation

See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for complete setup instructions.

---

**After updating, your deployment should work! 🎉**
