# App URL Configuration

This utility provides environment-aware URL generation for the RawEval monorepo apps.

## Usage

```typescript
import { appUrls } from '@raweval/utils';

// Get landing page URL
const landingUrl = appUrls.landing();

// Get chat app URL with path
const chatUrl = appUrls.chat('/dashboard');

// Get experts app URL with hash
const expertsUrl = appUrls.experts('#apply');
```

## How It Works

### Development Mode
In development (`NODE_ENV !== 'production'`), URLs are generated using localhost with ports:
- Landing: `http://localhost:3000`
- Chat: `http://localhost:3001`
- Experts: `http://localhost:3002`
- Admin: `http://localhost:3003`

### Production Mode
In production, URLs use subdomains:
- Landing: `https://www.raweval.com`
- Chat: `https://chat.raweval.com`
- Experts: `https://experts.raweval.com`
- Admin: `https://admin.raweval.com`

## Environment Variables

### Optional Overrides

You can override individual app URLs:

```bash
NEXT_PUBLIC_LANDING_URL=http://localhost:3000
NEXT_PUBLIC_CHAT_URL=http://localhost:3001
NEXT_PUBLIC_EXPERTS_URL=http://localhost:3002
NEXT_PUBLIC_ADMIN_URL=http://localhost:3003
```

### Base Domain (Production)

```bash
NEXT_PUBLIC_BASE_DOMAIN=raweval.com
```

### Development Overrides

```bash
NEXT_PUBLIC_PROTOCOL=http
NEXT_PUBLIC_HOST=localhost
```

## Examples

### In Components

```tsx
import Link from 'next/link';
import { appUrls } from '@raweval/utils';

export function MyComponent() {
  return (
    <Link href={appUrls.chat()}>Go to Chat</Link>
  );
}
```

### With Paths

```tsx
<Link href={appUrls.experts('/dashboard')}>Expert Dashboard</Link>
<Link href={appUrls.landing('/organizations')}>Organizations</Link>
```

### With Hash Anchors

```tsx
<Link href={appUrls.experts('#apply')}>Apply Now</Link>
<Link href={appUrls.landing('#how-it-works')}>How It Works</Link>
```

## API Reference

### `appUrls.landing(path?: string)`
Returns the landing app URL with optional path.

### `appUrls.chat(path?: string)`
Returns the chat app URL with optional path.

### `appUrls.experts(path?: string)`
Returns the experts app URL with optional path.

### `appUrls.admin(path?: string)`
Returns the admin app URL with optional path.

### `getAppUrls()`
Returns an object with all app URLs:
```typescript
{
  landing: string;
  chat: string;
  experts: string;
  admin: string;
}
```

### `getAppUrlFor(app: AppName)`
Get URL for a specific app by name.

### `getAppPath(app: AppName, path: string)`
Get URL for a specific app with a path.
