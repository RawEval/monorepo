# @raweval/research

Landing page for research agencies at research.raweval.com

## Features

- Academic and research-focused landing page
- Research data access information
- Academic pricing and discounts
- Sample data structure and API documentation

## Development

```bash
pnpm --filter @raweval/research dev
```

Runs on http://localhost:3004

## Build

```bash
pnpm --filter @raweval/research build
```

## Deployment

Deploy to Vercel:
- Custom domain: research.raweval.com
- Root directory: `apps/research`
- Build command: `cd ../.. && pnpm turbo run build --filter=@raweval/research`
