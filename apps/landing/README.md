# @raweval/landing

Landing page for www.raweval.com

## Development

```bash
pnpm --filter @raweval/landing dev
```

## Build

```bash
pnpm --filter @raweval/landing build
```

## Deployment

Deploy to Vercel:
- Custom domain: www.raweval.com
- Root directory: `apps/landing`
- Build command: `cd ../.. && pnpm turbo run build --filter=@raweval/landing`
