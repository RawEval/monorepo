#!/bin/bash

# Complete Vercel Setup Script for RawEval Monorepo
# This script resets and reconfigures all Vercel projects via CLI

set -e

MONOREPO_ROOT="/Users/durgesh/Code/Orgs/RawEval/monorepo"
TEAM_SCOPE="rawevals-projects"

echo "🚀 Complete Vercel Setup for RawEval Monorepo"
echo "=============================================="
echo ""

# Step 1: Check Vercel CLI
echo "📋 Step 1: Checking Vercel CLI..."
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "✅ Vercel CLI available"
    npx vercel --version
fi
echo ""

# Step 2: Login check
echo "📋 Step 2: Verifying Vercel login..."
if ! npx vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in. Please login:"
    npx vercel login
else
    echo "✅ Logged in as: $(npx vercel whoami 2>&1 | tail -1)"
fi
echo ""

# Step 3: Switch to correct team
echo "📋 Step 3: Switching to team: $TEAM_SCOPE..."
cd "$MONOREPO_ROOT"
npx vercel switch "$TEAM_SCOPE" 2>&1 | tail -3
echo ""

# Step 4: List available projects
echo "📋 Step 4: Listing available projects..."
npx vercel projects list 2>&1 | grep -A 10 "Projects found" || echo "No projects found"
echo ""

# Step 5: Cleanup
echo "📋 Step 5: Cleaning up old Vercel links..."
rm -rf apps/*/.vercel apps/*/.env.local .vercel
echo "✅ Cleaned up all .vercel directories and .env.local files"
echo ""

# Step 6: Link Landing
echo "📋 Step 6: Linking Landing project..."
cd "$MONOREPO_ROOT/apps/landing"
if npx vercel link --yes --project=monorepo-landing --scope="$TEAM_SCOPE" 2>&1 | grep -q "Linked"; then
    echo "✅ Landing linked successfully"
    if [ -f .vercel/project.json ]; then
        echo "   Project: $(cat .vercel/project.json | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)"
    fi
else
    echo "❌ Landing link failed"
    exit 1
fi
echo ""

# Step 7: Link Chat
echo "📋 Step 7: Linking Chat project..."
cd "$MONOREPO_ROOT/apps/chat"
if npx vercel link --yes --project=monorepo-chat --scope="$TEAM_SCOPE" 2>&1 | grep -q "Linked"; then
    echo "✅ Chat linked successfully"
    if [ -f .vercel/project.json ]; then
        echo "   Project: $(cat .vercel/project.json | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)"
    fi
else
    echo "❌ Chat link failed"
    exit 1
fi
echo ""

# Step 8: Verify vercel.json files
echo "📋 Step 8: Verifying vercel.json files..."
cd "$MONOREPO_ROOT"
for app in landing chat experts admin; do
    if [ -f "apps/$app/vercel.json" ]; then
        if python3 -m json.tool "apps/$app/vercel.json" > /dev/null 2>&1; then
            echo "✅ $app: Valid vercel.json"
            # Check for invalid rootDirectory
            if grep -q "rootDirectory" "apps/$app/vercel.json" 2>/dev/null; then
                echo "   ⚠️  WARNING: rootDirectory found (should be removed)"
            else
                echo "   ✅ No rootDirectory (correct)"
            fi
        else
            echo "❌ $app: Invalid JSON in vercel.json"
        fi
    else
        echo "⚠️  $app: No vercel.json found"
    fi
done
echo ""

# Step 9: Ensure .gitignore files
echo "📋 Step 9: Ensuring .gitignore files..."
for app in landing chat experts admin; do
    if [ ! -f "apps/$app/.gitignore" ]; then
        echo -e ".vercel\n.env*.local" > "apps/$app/.gitignore"
        echo "✅ Created .gitignore for $app"
    elif ! grep -q ".vercel" "apps/$app/.gitignore" 2>/dev/null; then
        echo ".vercel" >> "apps/$app/.gitignore"
        echo "✅ Added .vercel to $app/.gitignore"
    fi
done
echo ""

# Step 10: Final verification
echo "📋 Step 10: Final verification..."
echo ""
echo "✅ Setup Summary:"
echo "----------------"
for app in landing chat; do
    if [ -f "apps/$app/.vercel/project.json" ]; then
        PROJECT_NAME=$(cat "apps/$app/.vercel/project.json" 2>/dev/null | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)
        echo "✅ $app: Linked to $PROJECT_NAME"
    else
        echo "❌ $app: Not linked"
    fi
done
echo ""

echo "📝 Next Steps:"
echo "=============="
echo ""
echo "1. Configure in Vercel Dashboard (for each project):"
echo "   - Settings → General → Root Directory: apps/{app-name}"
echo "   - Settings → General → Node.js Version: 20.x"
echo "   - Settings → Git → Repository: RawEval/monorepo"
echo "   - Settings → Git → Production Branch: main"
echo "   - Settings → Git → Root Directory: apps/{app-name}"
echo "   - Settings → Git → Auto-deploy: ENABLED"
echo ""
echo "2. Dashboard Links:"
echo "   Landing: https://vercel.com/$TEAM_SCOPE/monorepo-landing/settings/general"
echo "   Chat:    https://vercel.com/$TEAM_SCOPE/monorepo-chat/settings/general"
echo ""
echo "3. Test deployment:"
echo "   git commit --allow-empty -m 'Test: Verify Vercel setup'"
echo "   git push origin main"
echo ""
echo "🎉 Setup complete!"
