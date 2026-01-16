#!/bin/bash

# Script to check Vercel Git integration status
# This helps diagnose why deployments aren't triggering

echo "🔍 Vercel Git Integration Checker"
echo "=================================="
echo ""

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

echo "📋 Current Git Status:"
echo "---------------------"
echo "Branch: $(git branch --show-current)"
echo "Remote: $(git remote get-url origin 2>/dev/null || echo 'Not set')"
echo ""

echo "📦 Vercel Projects:"
echo "-------------------"
npx vercel projects list 2>&1 | grep -A 10 "Projects found" || echo "No projects found"
echo ""

echo "🔗 Project Links:"
echo "-----------------"
for app in landing chat; do
    if [ -f "apps/$app/.vercel/project.json" ]; then
        PROJECT_NAME=$(cat apps/$app/.vercel/project.json 2>/dev/null | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)
        echo "✅ $app: Linked to $PROJECT_NAME"
    else
        echo "❌ $app: Not linked"
    fi
done
echo ""

echo "📝 Recent Deployments:"
echo "---------------------"
for app in landing chat; do
    if [ -f "apps/$app/.vercel/project.json" ]; then
        echo ""
        echo "📦 $app:"
        cd "apps/$app" 2>/dev/null && npx vercel ls --limit=2 2>&1 | grep -E "(Age|Deployment|Status)" | head -5 || echo "  No deployments found"
        cd ../.. 2>/dev/null
    fi
done
echo ""

echo "✅ Checklist for Vercel Dashboard:"
echo "===================================="
echo ""
echo "For EACH project (landing and chat), verify in Vercel Dashboard:"
echo ""
echo "1. Settings → Git:"
echo "   ✅ Repository: RawEval/monorepo"
echo "   ✅ Production Branch: main"
echo "   ✅ Root Directory: apps/landing (or apps/chat)"
echo "   ✅ Auto-deploy: ENABLED (most important!)"
echo ""
echo "2. Settings → General:"
echo "   ✅ Root Directory: apps/landing (or apps/chat)"
echo "   ✅ Must match Git Root Directory exactly"
echo ""
echo "3. If Auto-deploy is disabled:"
echo "   → Enable it in Settings → Git"
echo "   → Save changes"
echo ""
echo "4. If Root Directory doesn't match:"
echo "   → Update both General and Git settings"
echo "   → They must be identical"
echo ""
echo "🔗 Dashboard Links:"
echo "-------------------"
echo "Landing: https://vercel.com/rawevals-projects/monorepo-landing/settings/git"
echo "Chat:    https://vercel.com/rawevals-projects/monorepo-chat/settings/git"
echo ""
