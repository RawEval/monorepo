# @raweval/experts

Expert workbench for experts.raweval.com

## Features

- Secure task workspace with biometric monitoring
- Real-time earnings tracking
- Performance metrics and tier progression
- Task browsing and acceptance
- Live security status indicators
- Camera and keystroke monitoring UI

## Development

```bash
pnpm --filter @raweval/experts dev
```

Runs on http://localhost:3002

## Build

```bash
pnpm --filter @raweval/experts build
```

## Deployment

Deploy to Vercel:
- Custom domain: experts.raweval.com
- Root directory: `apps/experts`
- Build command: `cd ../.. && pnpm turbo run build --filter=@raweval/experts`
