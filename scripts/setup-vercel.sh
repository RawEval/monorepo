#!/bin/bash

# Vercel CLI Setup Script for Monorepo
# This script helps you properly configure your 2 Vercel projects (landing and chat)

set -e

MONOREPO_ROOT="/Users/durgesh/Code/Orgs/RawEval/monorepo"

echo "🚀 Vercel CLI Setup for RawEval Monorepo"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
else
    echo "✅ Vercel CLI is installed"
    vercel --version
fi

echo ""
echo "🔐 Step 1: Login to Vercel"
echo "---------------------------"
echo "You'll be prompted to login. Follow the instructions."
vercel login

echo ""
echo "📋 Step 2: Listing all projects"
echo "---------------------------------"
vercel projects list

echo ""
echo "🧹 Step 3: Cleaning up old .vercel directories"
echo "------------------------------------------------"
cd "$MONOREPO_ROOT"
rm -rf apps/landing/.vercel
rm -rf apps/chat/.vercel
rm -rf apps/experts/.vercel
rm -rf apps/admin/.vercel
rm -rf .vercel
echo "✅ Cleaned up old .vercel directories"

echo ""
echo "🔗 Step 4: Linking Landing Project"
echo "-------------------------------------"
echo "Navigate to apps/landing and link your project"
cd "$MONOREPO_ROOT/apps/landing"
echo "Current directory: $(pwd)"
echo ""
echo "When prompted:"
echo "  - Set up and deploy? → N"
echo "  - Link to existing project? → Y (if you have one) or N (to create new)"
echo "  - Project name → raweval-landing (or your existing name)"
echo ""
read -p "Press Enter to continue with vercel link..."
vercel link

echo ""
echo "🔗 Step 5: Linking Chat Project"
echo "----------------------------------"
cd "$MONOREPO_ROOT/apps/chat"
echo "Current directory: $(pwd)"
echo ""
echo "When prompted:"
echo "  - Set up and deploy? → N"
echo "  - Link to existing project? → Y (if you have one) or N (to create new)"
echo "  - Project name → raweval-chat (or your existing name)"
echo ""
read -p "Press Enter to continue with vercel link..."
vercel link

echo ""
echo "✅ Linking complete!"
echo ""
echo "📝 Next Steps:"
echo "=============="
echo ""
echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
echo ""
echo "2. For EACH project (landing and chat), configure:"
echo "   - Settings → General → Root Directory: apps/landing (or apps/chat)"
echo "   - Settings → General → Build Command:"
echo "     cd ../.. && pnpm turbo run build --filter=@raweval/landing"
echo "     (or @raweval/chat for chat project)"
echo "   - Settings → General → Install Command:"
echo "     npm install -g pnpm@9 && pnpm install --frozen-lockfile"
echo "   - Settings → General → Output Directory: .next"
echo "   - Settings → General → Node.js Version: 20.x"
echo ""
echo "3. For EACH project, verify Git integration:"
echo "   - Settings → Git → Repository: RawEval/monorepo"
echo "   - Settings → Git → Production Branch: main"
echo "   - Settings → Git → Root Directory: apps/landing (or apps/chat)"
echo "   - Settings → Git → Auto-deploy: Enabled"
echo ""
echo "4. Delete any old/duplicate projects from Vercel Dashboard"
echo ""
echo "5. Test deployment:"
echo "   git commit --allow-empty -m 'Test deployment'"
echo "   git push origin main"
echo ""
echo "🎉 Setup complete!"
