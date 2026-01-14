# @raweval/chat

Chat interface for chat.raweval.com

## Features

- Real-time AI chat with multimodal support
- Flag incorrect responses for expert review
- Image, video, and document processing
- Expert-verified responses
- User feedback system

## Development

```bash
pnpm --filter @raweval/chat dev
```

Runs on http://localhost:3001

## Build

```bash
pnpm --filter @raweval/chat build
```

## Deployment

Deploy to Vercel:
- Custom domain: chat.raweval.com
- Root directory: `apps/chat`
- Build command: `cd ../.. && pnpm turbo run build --filter=@raweval/chat`
