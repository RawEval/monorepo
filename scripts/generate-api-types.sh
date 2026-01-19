#!/bin/bash
# Generate TypeScript types from OpenAPI/Swagger spec
#
# Usage:
#   ./scripts/generate-api-types.sh <openapi-url>
#
# Example:
#   ./scripts/generate-api-types.sh https://api.raweval.com/openapi.json

set -e

OPENAPI_URL="${1:-${OPENAPI_URL}}"
OUTPUT_DIR="packages/types/src/generated"

if [ -z "$OPENAPI_URL" ]; then
  echo "Error: OpenAPI URL is required"
  echo "Usage: $0 <openapi-url>"
  echo "   or: OPENAPI_URL=<url> $0"
  exit 1
fi

echo "📥 Fetching OpenAPI spec from: $OPENAPI_URL"
echo "📦 Generating types to: $OUTPUT_DIR"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Check if openapi-typescript is installed
if ! command -v openapi-typescript &> /dev/null; then
  echo "📦 Installing openapi-typescript..."
  pnpm add -Dw openapi-typescript
fi

# Generate types
echo "🔨 Generating TypeScript types..."
npx openapi-typescript "$OPENAPI_URL" -o "$OUTPUT_DIR/api.d.ts"

echo "✅ Types generated successfully!"
echo "📝 Import types with: import type { paths } from '@raweval/types/generated/api'"
