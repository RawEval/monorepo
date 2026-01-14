# @raweval/ui

Shared React UI components (Shadcn-based) for the RawEval monorepo.

## Usage

```typescript
import { Button } from '@raweval/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title <Badge>New</Badge></CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## Components

- **Button** - Various button variants (default, outline, ghost, etc.)
- **Card** - Card container with header, content, footer
- **Badge** - Small label badges

## Adding New Components

1. Create component file in `src/` (e.g., `src/input.tsx`)
2. Export from `package.json` exports field
3. Document in this README
4. Use in apps with direct import: `@raweval/ui/input`

## Rules

- ✅ Only React components
- ✅ No business logic
- ✅ No data fetching
- ✅ Props should be simple and typed
- ✅ Use Radix UI primitives when possible
- ❌ No barrel exports (for tree-shaking)
