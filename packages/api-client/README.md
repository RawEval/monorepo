# @raweval/api-client

API client package for RawEval backend integration.

## Features

- ✅ Type-safe API client with TypeScript
- ✅ Request/response interceptors
- ✅ Automatic error handling
- ✅ Retry logic with exponential backoff
- ✅ Request cancellation support
- ✅ OpenAPI/Swagger integration ready
- ✅ Authentication token management

## Usage

```typescript
import { apiClient } from '@raweval/api-client';

// Make API calls
const response = await apiClient.get('/api/v1/prompts');
const data = await apiClient.post('/api/v1/chat', { message: 'Hello' });
```

## Configuration

Set environment variables:

```bash
NEXT_PUBLIC_API_URL=https://api.raweval.com
NEXT_PUBLIC_API_VERSION=v1
```
