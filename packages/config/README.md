# @raweval/config

Shared configuration files for the RawEval monorepo.

## Contents

- **tailwind.config.ts** - Base Tailwind CSS configuration
- **tsconfig.json** - Base TypeScript configuration
- **.eslintrc.js** - Base ESLint configuration

## Usage

### Tailwind Config

```typescript
// apps/landing/tailwind.config.ts
import baseConfig from '@raweval/config/tailwind';

export default {
  ...baseConfig,
  content: ['./app/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  // Add app-specific customizations here
};
```

### TypeScript Config

```json
// apps/landing/tsconfig.json
{
  "extends": "@raweval/config/typescript",
  "compilerOptions": {
    // App-specific options
  }
}
```

### ESLint Config

```javascript
// apps/landing/.eslintrc.js
module.exports = {
  extends: ['@raweval/config/eslint'],
  // Add app-specific rules here
};
```
