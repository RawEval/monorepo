# Package Manager Enforcement

## 🔒 pnpm Only

This monorepo **strictly enforces pnpm** as the package manager. No other package manager is allowed.

## Why pnpm?

1. **Efficient Disk Usage** - Shared dependencies across all projects
2. **Fast Installs** - Up to 2x faster than npm/yarn
3. **Strict by Default** - Prevents phantom dependencies
4. **Workspace Support** - Native monorepo support
5. **Node Modules Structure** - Proper isolation

## Enforcement Mechanisms

### 1. preinstall Script
```json
{
  "scripts": {
    "preinstall": "npx only-allow pnpm"
  }
}
```

If you try `npm install` or `yarn install`, you'll see:
```
Use "pnpm install" for installation in this project
```

### 2. .npmrc
```ini
engine-strict=true
package-lock=false
```

Enforces:
- Correct Node/pnpm versions
- No package-lock.json creation
- Strict peer dependencies

### 3. packageManager Field
```json
{
  "packageManager": "pnpm@9.0.0"
}
```

Corepack (built into Node 16.9+) will automatically use the correct version.

### 4. engines Field
```json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

With `engine-strict=true`, wrong versions are rejected.

## Installation

### First Time Setup

```bash
# 1. Install pnpm globally
npm install -g pnpm@9

# OR use Corepack (recommended)
corepack enable
corepack prepare pnpm@9.0.0 --activate

# 2. Install dependencies
pnpm install
```

### Using Corepack (Recommended)

Corepack is built into Node.js 16.9+ and automatically manages package manager versions:

```bash
# Enable Corepack
corepack enable

# Install dependencies (uses correct pnpm version automatically)
pnpm install
```

## What Happens If You Try Other Package Managers?

### npm install
```bash
$ npm install
Use "pnpm install" for installation in this project
npm ERR! code 1
```

### yarn install
```bash
$ yarn install
Use "pnpm install" for installation in this project
error Command failed with exit code 1.
```

### ✅ pnpm install
```bash
$ pnpm install
Lockfile is up to date, resolution step is skipped
Packages: +1247
++++++++++++++++++++++++++++++++++++++++++++++++
Packages are hard linked from the content-addressable store to the virtual store.
Content-addressable store is at: ~/.pnpm-store
Virtual store is at: node_modules/.pnpm
Progress: resolved 1247, reused 1247, downloaded 0, added 1247, done

Done in 3.2s
```

## Commands

All npm/yarn commands have pnpm equivalents:

| npm/yarn | pnpm |
|----------|------|
| `npm install` | `pnpm install` |
| `npm install <pkg>` | `pnpm add <pkg>` |
| `npm uninstall <pkg>` | `pnpm remove <pkg>` |
| `npm run <script>` | `pnpm <script>` |
| `npm run dev` | `pnpm dev` |
| `npm install --workspace <pkg>` | `pnpm --filter <pkg> add` |

## Workspace Commands

```bash
# Install in root
pnpm add -w <package>

# Install in specific app
pnpm --filter @raweval/chat add <package>

# Install in specific package
pnpm --filter @raweval/ui add <package>

# Run script in all workspaces
pnpm -r <script>

# Run script in specific workspace
pnpm --filter @raweval/chat dev
```

## CI/CD Setup

### GitHub Actions

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Option 1: Use pnpm action
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      
      # Option 2: Use Corepack
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

### Vercel

Vercel automatically detects `pnpm-lock.yaml` and uses pnpm.

No configuration needed!

### Docker

```dockerfile
FROM node:20-alpine

# Enable Corepack
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build
```

## Troubleshooting

### "only-allow not found"

The `preinstall` script uses `npx only-allow pnpm`. If this fails:

```bash
# Install globally
npm install -g only-allow

# Or use Corepack instead (remove preinstall script)
```

### "Wrong pnpm version"

```bash
# Update pnpm globally
npm install -g pnpm@9

# Or use Corepack
corepack prepare pnpm@9.0.0 --activate
```

### "Peer dependency issues"

pnpm is strict about peer dependencies by default. This is good!

To auto-install peers:
```bash
pnpm install --fix-peer-issues
```

Or add to `.npmrc`:
```ini
auto-install-peers=true
```

## Migration from npm/yarn

If you have existing `node_modules`:

```bash
# 1. Remove old artifacts
rm -rf node_modules package-lock.json yarn.lock

# 2. Install with pnpm
pnpm install

# 3. Commit pnpm-lock.yaml
git add pnpm-lock.yaml
git commit -m "chore: migrate to pnpm"
```

## Benefits in This Monorepo

1. **Shared Dependencies** - Each package (Button, Card, etc.) is stored once
2. **Fast CI/CD** - 2-3x faster than npm
3. **Consistent Installs** - `pnpm-lock.yaml` ensures everyone gets same versions
4. **Strict Mode** - Prevents phantom dependencies that cause production bugs
5. **Workspace Protocol** - `workspace:*` always uses local packages

## Questions?

- **Why not npm?** - Slower, less efficient, no native workspace support
- **Why not yarn?** - pnpm is faster and more disk-efficient
- **Why not yarn PnP?** - Many tools don't support it, pnpm is more compatible

---

**Summary:** Only pnpm is allowed. Period. This ensures consistency, speed, and reliability across the entire monorepo.
