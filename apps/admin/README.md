# @raweval/admin

Internal admin dashboard for admin.raweval.com

## Features

- Real-time statistics and metrics
- Expert management and monitoring
- Task tracking and status
- Revenue and performance analytics
- Live data updates
- Export and filtering capabilities

## Development

```bash
pnpm --filter @raweval/admin dev
```

Runs on http://localhost:3003

## Build

```bash
pnpm --filter @raweval/admin build
```

## Deployment

Deploy to Vercel:
- Custom domain: admin.raweval.com
- Root directory: `apps/admin`
- Build command: `cd ../.. && pnpm turbo run build --filter=@raweval/admin`

## Security

This is an internal-only application. Ensure proper authentication and authorization is implemented before deploying to production.
