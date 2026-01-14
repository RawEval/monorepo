# @raweval/types

Shared TypeScript types for the RawEval monorepo.

## Usage

```typescript
import type { Expert, Prompt, Task } from '@raweval/types';

const expert: Expert = {
  id: '123',
  userId: 'user-456',
  tier: 1,
  // ...
};
```

## Rules

- **No runtime code** - Only types and interfaces
- **No dependencies** - Keep this package dependency-free
- **Export everything explicitly** - No `export *`
- **Use `interface` for objects** - Use `type` for unions/primitives
- **Document complex types** - Add JSDoc comments for clarity
