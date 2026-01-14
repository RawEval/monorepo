#!/bin/bash

# Script to create the remaining 3 apps (chat, experts, admin)
# from the landing app template

set -e

echo "🚀 Creating remaining RawEval apps..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to create app from template
create_app() {
  local app_name=$1
  local port=$2
  local domain=$3
  
  echo -e "${BLUE}Creating $app_name app...${NC}"
  
  # Copy landing app
  cp -r apps/landing "apps/$app_name"
  
  # Update package.json
  sed -i '' "s/@raweval\/landing/@raweval\/$app_name/g" "apps/$app_name/package.json"
  sed -i '' "s/\"dev\": \"next dev\"/\"dev\": \"next dev --port $port\"/g" "apps/$app_name/package.json"
  
  # Update README.md
  cat > "apps/$app_name/README.md" << EOF
# @raweval/$app_name

$app_name app for $domain

## Development

\`\`\`bash
pnpm --filter @raweval/$app_name dev
\`\`\`

## Build

\`\`\`bash
pnpm --filter @raweval/$app_name build
\`\`\`

## Deployment

Deploy to Vercel:
- Custom domain: $domain
- Root directory: \`apps/$app_name\`
- Build command: \`cd ../.. && pnpm turbo run build --filter=@raweval/$app_name\`
EOF

  # Update app title and description
  local title="RawEval ${app_name^}"
  local desc=""
  
  case $app_name in
    chat)
      title="RawEval Chat | AI Chatbot"
      desc="Fully reinforced AI chatbot with multimodal support and expert verification"
      ;;
    experts)
      title="RawEval Experts | Workbench"
      desc="Secure expert workbench for AI evaluation and annotation"
      ;;
    admin)
      title="RawEval Admin | Dashboard"
      desc="Internal admin dashboard for managing experts, prompts, and organizations"
      ;;
  esac
  
  # Update layout.tsx metadata
  sed -i '' "s/title: 'RawEval | AI Evaluation Infrastructure'/title: '$title'/g" "apps/$app_name/app/layout.tsx"
  sed -i '' "s/description: 'Human-verified AI evaluation infrastructure. Capture, validate, and deliver gold-standard training data.'/description: '$desc'/g" "apps/$app_name/app/layout.tsx"
  
  echo -e "${GREEN}✓ Created $app_name app${NC}"
}

# Create the three apps
create_app "chat" "3001" "chat.raweval.com"
create_app "experts" "3002" "experts.raweval.com"
create_app "admin" "3003" "admin.raweval.com"

echo ""
echo -e "${GREEN}✅ All apps created successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. cd into the monorepo root"
echo "2. Run: pnpm install"
echo "3. Run: pnpm dev"
echo ""
echo "Apps will be available at:"
echo "  - Landing: http://localhost:3000"
echo "  - Chat: http://localhost:3001"
echo "  - Experts: http://localhost:3002"
echo "  - Admin: http://localhost:3003"
