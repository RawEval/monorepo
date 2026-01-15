# 🔧 Fix: pnpm Still Not Activating on Vercel

## The Issue

Even after setting the install command, Vercel still uses pnpm 6.35.1 instead of 9.0.0.

## ✅ Solution: Install pnpm via npm First

### Step 1: Update Install Command

In Vercel Dashboard → Settings → General → Build & Development Settings:

**Replace the Install Command with:**

```bash
npm install -g pnpm@9 && pnpm install --frozen-lockfile
```

**Or if you want to be more explicit:**

```bash
npm install -g pnpm@9.0.0 && pnpm install --frozen-lockfile
```

### Step 2: Alternative (If Above Doesn't Work)

If npm install doesn't work, try this:

```bash
npm install -g pnpm@latest && pnpm install --frozen-lockfile
```

### Step 3: Most Reliable (If Both Fail)

Use this approach which ensures pnpm 9 is used:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh - && export PATH="$HOME/.local/share/pnpm:$PATH" && pnpm install --frozen-lockfile
```

---

## 🔍 Why Corepack Might Not Work

Corepack requires:

- Node.js 16.9+ (should be fine)
- Corepack enabled system-wide (might not be enabled on Vercel build image)

Using `npm install -g pnpm@9` is more reliable because:

- ✅ npm is always available
- ✅ Installs pnpm globally for that build
- ✅ Works on all Node.js versions
- ✅ No Corepack dependency

---

## 📋 Complete Settings

| Setting              | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| **Root Directory**   | `apps/landing`                                               |
| **Build Command**    | `cd ../.. && pnpm turbo run build --filter=@raweval/landing` |
| **Output Directory** | `.next`                                                      |
| **Install Command**  | `npm install -g pnpm@9 && pnpm install --frozen-lockfile`    |
| **Node.js Version**  | 20.x (or latest)                                             |

---

## 🧪 Test Each Solution

Try in this order:

1. **First try:**

   ```bash
   npm install -g pnpm@9 && pnpm install --frozen-lockfile
   ```

2. **If that fails:**

   ```bash
   npm install -g pnpm@latest && pnpm install --frozen-lockfile
   ```

3. **If both fail:**
   ```bash
   curl -fsSL https://get.pnpm.io/install.sh | sh - && export PATH="$HOME/.local/share/pnpm:$PATH" && pnpm install --frozen-lockfile
   ```

---

## 🔄 Update All Projects

Remember to update the Install Command for all 4 Vercel projects:

- ✅ `monorepo-landing`
- ✅ `monorepo-chat`
- ✅ `monorepo-experts`
- ✅ `monorepo-admin`

---

## ✅ Verification

After updating, check the build logs. You should see:

- ✅ `npm install -g pnpm@9` succeeds
- ✅ `pnpm --version` shows 9.x.x
- ✅ `pnpm install --frozen-lockfile` succeeds
- ✅ No "Unsupported environment" errors

---

**The npm install approach is more reliable on Vercel! 🚀**
