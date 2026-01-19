# API Client Integration Guide

## Quick Start

### 1. Install Dependencies

The `@raweval/api-client` package is already set up in the monorepo. No installation needed!

### 2. Configure Environment

Create `.env.local` in your app:

```bash
NEXT_PUBLIC_API_URL=https://api.raweval.com
NEXT_PUBLIC_API_VERSION=v1
```

### 3. Use in Services

```typescript
// apps/chat/services/chat-service.ts
import { ApiService } from './api-service';
import { apiClient } from '@raweval/api-client';
import type { ChatMessage } from '@/features/chat/types';

export class ChatService extends ApiService {
  async sendMessage(sessionId: string, message: string): Promise<ChatMessage> {
    const response = await this.client.post<ChatMessage>('/chat/messages', {
      sessionId,
      message,
    });
    return this.handleResponse(response);
  }
}
```

### 4. Use in Components

```typescript
// In your component
import { chatService } from '@/services/chat-service';

const handleSend = async () => {
  try {
    const message = await chatService.sendMessage(sessionId, content);
    // Handle success
  } catch (error) {
    if (isApiError(error)) {
      // Handle API error
    }
  }
};
```

## Features

- ✅ **Type-safe**: Full TypeScript support
- ✅ **Automatic retries**: Exponential backoff on failures
- ✅ **Request cancellation**: Cancel requests when needed
- ✅ **Interceptors**: Add auth, logging, etc.
- ✅ **Error handling**: Typed error classes
- ✅ **OpenAPI ready**: Utilities for Swagger integration

## Next Steps

1. **Add Swagger docs**: Provide OpenAPI spec URL
2. **Generate types**: Run `./scripts/generate-api-types.sh <openapi-url>`
3. **Update services**: Replace TODOs with real API calls
4. **Add auth**: Integrate with `@raweval/auth` package
