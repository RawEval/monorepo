#!/bin/bash
# Vercel install script - ensures correct pnpm version
set -e

# Enable Corepack (built into Node.js 16.9+)
corepack enable

# Prepare and activate pnpm 9.0.0
corepack prepare pnpm@9.0.0 --activate

# Verify pnpm version
pnpm --version

# Install dependencies
pnpm install --frozen-lockfile
