# Backend Integration Guide

Complete guide for integrating the RawEval backend API with the monorepo.

## 📦 Packages

### `@raweval/api-client`

Type-safe API client with:
- ✅ Request/response interceptors
- ✅ Automatic retry with exponential backoff
- ✅ Error handling
- ✅ Authentication token management
- ✅ OpenAPI/Swagger integration ready

**Location:** `packages/api-client/`

**Usage:**
```typescript
import { apiClient } from '@raweval/api-client';

// GET request
const prompts = await apiClient.get('/prompts');

// POST request
const response = await apiClient.post('/chat', { message: 'Hello' });

// Typed responses
const data = await apiClient.getApiResponse<Prompt>('/prompts/123');
```

### `@raweval/types`

Shared TypeScript types including:
- ✅ API request/response types
- ✅ Domain types (User, Expert, Prompt, etc.)
- ✅ Pagination types
- ✅ Error types

**Location:** `packages/types/`

## 🔧 Configuration

### Environment Variables

Create `.env.local` files in each app:

```bash
# apps/chat/.env.local
NEXT_PUBLIC_API_URL=https://api.raweval.com
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRIES=3
```

**Required:**
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_API_VERSION` - API version (default: v1)

**Optional:**
- `NEXT_PUBLIC_API_TIMEOUT` - Request timeout in ms (default: 30000)
- `NEXT_PUBLIC_API_RETRIES` - Number of retries (default: 3)
- `NEXT_PUBLIC_API_RETRY_DELAY` - Retry delay in ms (default: 1000)

## 🏗️ Architecture

### Service Layer Pattern

All API calls go through service classes:

```
apps/chat/services/
├── api-service.ts      # Base API service class
├── chat-service.ts     # Chat-specific API calls
└── ...
```

**Example:**
```typescript
import { ApiService } from './api-service';
import { apiClient } from '@raweval/api-client';

export class ChatService extends ApiService {
  async sendMessage(sessionId: string, message: string) {
    const response = await this.client.post('/chat/messages', {
      sessionId,
      message,
    });
    return this.handleResponse(response);
  }
}
```

### API Routes (Next.js)

For server-side API routes that proxy to backend:

```
apps/chat/app/api/
├── chat/
│   └── route.ts        # POST /api/chat
└── prompts/
    └── route.ts        # GET /api/prompts
```

**Example:**
```typescript
// app/api/chat/route.ts
import { chatService } from '@/services/chat-service';
import { requireSession } from '@raweval/auth';

export async function POST(request: Request) {
  const session = await requireSession();
  const body = await request.json();
  
  const message = await chatService.sendMessage(
    session.userId,
    body.message
  );
  
  return Response.json(message);
}
```

## 📚 OpenAPI/Swagger Integration

### Step 1: Fetch OpenAPI Spec

```typescript
import { fetchOpenApiSpec } from '@raweval/api-client/openapi';

const spec = await fetchOpenApiSpec('https://api.raweval.com/openapi.json');
```

### Step 2: Generate Types (Recommended Tools)

**Option 1: openapi-typescript**
```bash
pnpm add -Dw openapi-typescript
npx openapi-typescript https://api.raweval.com/openapi.json -o packages/types/src/generated/api.d.ts
```

**Option 2: swagger-typescript-api**
```bash
pnpm add -Dw swagger-typescript-api
npx swagger-typescript-api -p https://api.raweval.com/openapi.json -o packages/types/src/generated
```

### Step 3: Use Generated Types

```typescript
import type { paths } from '@raweval/types/generated/api';

type ChatMessageResponse = paths['/api/v1/chat']['post']['responses']['200']['content']['application/json'];
```

## 🔐 Authentication

The API client automatically adds auth tokens via interceptors:

```typescript
import { apiClient } from '@raweval/api-client';
import { getSession } from '@raweval/auth';

// Token is automatically added from auth package
const response = await apiClient.get('/protected-endpoint');
```

**Custom token provider:**
```typescript
import { ApiClient } from '@raweval/api-client';

const client = new ApiClient({
  getAuthToken: async () => {
    const session = await getSession();
    return session?.token ?? null;
  },
});
```

## 🚨 Error Handling

The API client provides typed errors:

```typescript
import { 
  apiClient, 
  isApiError, 
  UnauthorizedError,
  ValidationError 
} from '@raweval/api-client';

try {
  const data = await apiClient.get('/endpoint');
} catch (error) {
  if (isApiError(error)) {
    if (error instanceof UnauthorizedError) {
      // Handle 401
      redirect('/login');
    } else if (error instanceof ValidationError) {
      // Handle 400 with validation errors
      console.error(error.validationErrors);
    }
  }
}
```

## 📝 Best Practices

### 1. Always Use Services

❌ **Don't:**
```typescript
// In component
const response = await fetch('/api/chat');
```

✅ **Do:**
```typescript
// In service
import { chatService } from '@/services/chat-service';
const message = await chatService.sendMessage(sessionId, content);
```

### 2. Type Safety

✅ Always type API responses:
```typescript
import type { Prompt } from '@raweval/types';

const prompt = await apiClient.get<Prompt>('/prompts/123');
```

### 3. Error Handling

✅ Always handle errors:
```typescript
try {
  const data = await apiClient.get('/endpoint');
} catch (error) {
  if (isApiError(error)) {
    // Handle API errors
  } else {
    // Handle unexpected errors
  }
}
```

### 4. Request Cancellation

✅ Cancel requests when component unmounts:
```typescript
useEffect(() => {
  const controller = new AbortController();
  
  apiClient.get('/endpoint', { signal: controller.signal });
  
  return () => {
    controller.abort();
  };
}, []);
```

## 🔄 Integration Checklist

- [ ] Set environment variables in `.env.local`
- [ ] Install `@raweval/api-client` in apps that need it
- [ ] Create service classes extending `ApiService`
- [ ] Update existing services to use `apiClient`
- [ ] Add error handling in components
- [ ] Test API connectivity
- [ ] Generate types from OpenAPI spec (when available)
- [ ] Update API routes to use services
- [ ] Add request cancellation where needed

## 📖 Next Steps

Once you provide the Swagger/OpenAPI documentation:

1. **Generate Types:** Use openapi-typescript or swagger-typescript-api
2. **Create Service Methods:** Map each endpoint to a service method
3. **Update Components:** Replace mock data with real API calls
4. **Add Error Boundaries:** Handle API errors gracefully
5. **Add Loading States:** Show loading indicators during API calls
6. **Add Retry Logic:** Configure retry behavior per endpoint
7. **Add Caching:** Implement response caching where appropriate

---

**Ready for Swagger docs!** 🚀
