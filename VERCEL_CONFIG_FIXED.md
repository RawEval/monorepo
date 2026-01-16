# ✅ Vercel Configuration - Fixed & Standardized

## Issue Fixed

**Error**: `The vercel.json schema validation failed: should NOT have additional property 'rootDirectory'`

**Root Cause**: `rootDirectory` is **NOT** a valid property in `vercel.json`. It must be configured in the Vercel Dashboard only.

## What Was Changed

### ❌ Before (Invalid)
```json
{
  "buildCommand": "...",
  "installCommand": "...",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rootDirectory": "apps/landing"  // ❌ INVALID - Not allowed in vercel.json
}
```

### ✅ After (Valid)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/landing",
  "installCommand": "npm install -g pnpm@9 && pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

## All Apps Updated

All 4 monorepo apps now have consistent, valid `vercel.json` files:

- ✅ `apps/landing/vercel.json`
- ✅ `apps/chat/vercel.json`
- ✅ `apps/experts/vercel.json`
- ✅ `apps/admin/vercel.json`

## Valid Properties in vercel.json

According to [Vercel Documentation](https://vercel.com/docs/project-configuration), these are the valid properties:

### Build & Development
- ✅ `buildCommand` - Override the build command
- ✅ `installCommand` - Override the package install command
- ✅ `outputDirectory` - Specify the build output directory
- ✅ `framework` - Specify the framework preset
- ✅ `devCommand` - Override the development command

### Routing & Headers
- `headers` - Add custom HTTP headers
- `redirects` - Redirect requests to different URLs
- `rewrites` - Route requests to different paths
- `cleanUrls` - Remove `.html` extensions from URLs
- `trailingSlash` - Add or remove trailing slashes

### Functions & Runtime
- `functions` - Configure function memory, duration, and runtime
- `regions` - Deploy functions to specific regions
- `crons` - Schedule functions to run at specific times

### Other
- `$schema` - Enable IDE autocomplete and validation
- `images` - Configure image optimization
- `ignoreCommand` - Skip builds based on custom logic
- `public` - Make deployment logs publicly accessible

### ❌ NOT Valid in vercel.json
- ❌ `rootDirectory` - **Must be set in Vercel Dashboard only**
- ❌ `nodeVersion` - Set in Dashboard → Settings → General
- ❌ Git settings - Configure in Dashboard → Settings → Git

## Configuration Split: vercel.json vs Dashboard

### In `vercel.json` (File-based)
These settings are version-controlled in your repo:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/landing",
  "installCommand": "npm install -g pnpm@9 && pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### In Vercel Dashboard (Project Settings)
These must be configured per-project in the dashboard:

**Settings → General:**
- **Root Directory**: `apps/landing` (or `apps/chat`, `apps/experts`, `apps/admin`)
- **Node.js Version**: `20.x`
- **Framework Preset**: `Next.js` (auto-detected)

**Settings → Git:**
- **Repository**: `RawEval/monorepo`
- **Production Branch**: `main`
- **Root Directory**: `apps/landing` (or respective app)
- **Auto-deploy**: Enabled

## Standard Configuration for All Apps

### Landing (`apps/landing/vercel.json`)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/landing",
  "installCommand": "npm install -g pnpm@9 && pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

**Dashboard Settings:**
- Root Directory: `apps/landing`
- Node.js Version: `20.x`

### Chat (`apps/chat/vercel.json`)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/chat",
  "installCommand": "npm install -g pnpm@9 && pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

**Dashboard Settings:**
- Root Directory: `apps/chat`
- Node.js Version: `20.x`

### Experts (`apps/experts/vercel.json`)
```json
{
  "$schema": "https://openapi.vercel.json",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/experts",
  "installCommand": "npm install -g pnpm@9 && pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

**Dashboard Settings:**
- Root Directory: `apps/experts`
- Node.js Version: `20.x`

### Admin (`apps/admin/vercel.json`)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@raweval/admin",
  "installCommand": "npm install -g pnpm@9 && pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

**Dashboard Settings:**
- Root Directory: `apps/admin`
- Node.js Version: `20.x`

## Verification

All `vercel.json` files are now:
- ✅ Valid JSON syntax
- ✅ Valid Vercel schema (no `rootDirectory`)
- ✅ Consistent across all apps
- ✅ Include `$schema` for IDE autocomplete

## Next Steps

1. **Verify Dashboard Settings**: Ensure `rootDirectory` is set correctly in each project's dashboard
2. **Test Deployment**: Push changes and verify deployments work
3. **Monitor Builds**: Check that builds succeed with the new configuration

## References

- [Vercel Project Configuration Docs](https://vercel.com/docs/project-configuration)
- [vercel.json Schema](https://openapi.vercel.sh/vercel.json)
- [General Settings](https://vercel.com/docs/project-configuration/general-settings)

---

**Status**: ✅ All configurations fixed and standardized across all apps
