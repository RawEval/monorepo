# Backend API Integration - Complete ✅

## Overview

Complete integration of RawEval backend APIs with the monorepo, including:
- ✅ Main API (Authentication, Users, Prompts, Experts, Workbench, Payments)
- ✅ LLM Call Host API (Chat, Multi-model queries, Workflows)

## API Endpoints

### Main API
**Base URL:** `http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com`

**Endpoints:**
- `/api/v1/auth/*` - Authentication (login, register, token management)
- `/api/v1/users/*` - User management
- `/api/v1/prompts/*` - Prompt management
- `/api/v1/experts/*` - Expert management
- `/api/v1/workbench/*` - Workbench operations
- `/api/v1/payments/*` - Payment management

### LLM Call Host API
**Base URL:** `http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com/llm-calls`

**Endpoints:**
- `/health` - Health check endpoint
- `/llm-calls/execute` - Execute workflow-based LLM calls
- `/dynamic-llm-calls/execute` - Direct LLM calls (fastest)
- `/dynamic-llm-calls/batch` - Batch LLM calls
- `/llm-calls/upload-files` - Upload files for processing
- `/status/{request_id}` - Get request status
- `/results/{request_id}` - Get request results
- `/sessions/{request_id}/conversation` - Get conversation history

**Health Check:**
- Endpoint: `http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com/llm-calls/health`
- Returns: Service status, version, available providers

## Services Created

### 1. Auth Service (`apps/chat/services/auth-service.ts`)

**Methods:**
- `register(data: RegisterRequest)` - Register new user
- `login(credentials: LoginRequest)` - Login and get token
- `getCurrentUser()` - Get current user info
- `refreshToken(refreshToken: string)` - Refresh access token

**Usage:**
```typescript
import { authService } from '@/services/auth-service';

// Register
const user = await authService.register({
  email: 'user@example.com',
  full_name: 'John Doe',
  password: 'SecurePass123!',
});

// Login
const tokenResponse = await authService.login({
  username: 'user@example.com',
  password: 'SecurePass123!',
});

// Store token
import { storeToken } from '@raweval/auth';
storeToken(tokenResponse.access_token, tokenResponse.expires_in);
```

### 2. LLM Calls Service (`apps/chat/services/llm-calls-service.ts`)

**Methods:**
- `executeWorkflow(request: WorkflowRequest, userId?)` - Execute workflow
- `executeDirect(request: DynamicLLMRequest, userId?)` - Direct LLM call
- `executeBatch(requests, parallel, userId?, timeout?)` - Batch calls
- `getStatus(requestId)` - Get request status
- `getResults(requestId)` - Get results
- `getConversation(requestId)` - Get conversation history
- `uploadFiles(files: File[])` - Upload files

**Usage:**
```typescript
import { llmCallsService } from '@/services/llm-calls-service';

// Check health
const health = await llmCallsService.checkHealth();
console.log('LLM Call Host status:', health.status);
console.log('Available providers:', health.providers);

// Direct call (fastest)
const response = await llmCallsService.executeDirect({
  provider: 'openai',
  model: 'gpt-4o',
  prompt: 'Explain quantum computing',
  temperature: 0.7,
}, userId);
```

### 3. Chat Service (`apps/chat/services/chat-service.ts`)

**Updated Methods:**
- `sendMessage(message, options)` - Send message using LLM Call Host
- `sendMessageWithComparison(message, models, options)` - Multi-model comparison
- `flagMessage(promptId)` - Mark prompt as wrong
- `getSession(requestId)` - Get conversation history

**Usage:**
```typescript
import { chatService } from '@/services/chat-service';

// Send message
const message = await chatService.sendMessage('Hello!', {
  userId: 123,
  model: 'openai',
  modelName: 'gpt-4o',
  temperature: 0.7,
});

// With files
const messageWithFiles = await chatService.sendMessage('Analyze this PDF', {
  userId: 123,
  files: [pdfFile],
});
```

## Configuration

### Environment Variables

Create `.env.local` in `apps/chat/`:

```bash
# Main API
NEXT_PUBLIC_API_URL=http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com
NEXT_PUBLIC_API_VERSION=v1

# LLM Calls API (defaults to main API URL if not set)
NEXT_PUBLIC_LLM_CALLS_API_URL=http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com

# Optional
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRIES=3
NEXT_PUBLIC_API_RETRY_DELAY=1000
```

## Authentication Flow

### 1. Registration
```typescript
import { authService } from '@/services/auth-service';
import { storeToken } from '@raweval/auth';

const user = await authService.register({
  email: 'user@example.com',
  full_name: 'John Doe',
  password: 'SecurePass123!',
});
```

### 2. Login
```typescript
import { authService } from '@/services/auth-service';
import { storeToken } from '@raweval/auth';

const tokenResponse = await authService.login({
  username: 'user@example.com',
  password: 'SecurePass123!',
});

// Store token for future requests
storeToken(tokenResponse.access_token, tokenResponse.expires_in);
```

### 3. Automatic Token Injection

The API client automatically adds the token to requests:
```typescript
import { apiClient } from '@raweval/api-client';

// Token is automatically added from localStorage
const user = await apiClient.get('/auth/me');
```

## Chat Integration

### Basic Chat Flow

```typescript
import { chatService } from '@/services/chat-service';

// Send message
const response = await chatService.sendMessage('Hello!', {
  userId: currentUserId,
  model: 'openai',
  modelName: 'gpt-4o',
});

// Response is a ChatMessage
console.log(response.content); // AI response
```

### Multi-Model Comparison

```typescript
const responses = await chatService.sendMessageWithComparison(
  'Explain quantum computing',
  [
    { provider: 'openai', model: 'gpt-4o' },
    { provider: 'claude', model: 'claude-3-5-sonnet' },
    { provider: 'gemini', model: 'gemini-2.0-pro' },
  ],
  { userId: currentUserId }
);

// Get responses from all models
responses.forEach((msg) => {
  console.log(`${msg.id}: ${msg.content}`);
});
```

### With File Upload

```typescript
const fileInput = document.querySelector('input[type="file"]');
const files = fileInput?.files ? Array.from(fileInput.files) : [];

const response = await chatService.sendMessage('Analyze this document', {
  userId: currentUserId,
  files,
});
```

## Error Handling

```typescript
import { isApiError, UnauthorizedError } from '@raweval/api-client';

try {
  const response = await chatService.sendMessage('Hello!');
} catch (error) {
  if (isApiError(error)) {
    if (error instanceof UnauthorizedError) {
      // Redirect to login
      window.location.href = '/login';
    } else {
      // Show error message
      console.error(error.message);
    }
  }
}
```

## Token Management

### Store Token After Login
```typescript
import { storeToken } from '@raweval/auth';

const tokenResponse = await authService.login(credentials);
storeToken(tokenResponse.access_token, tokenResponse.expires_in);
```

### Get Token
```typescript
import { getStoredToken } from '@raweval/auth';

const token = getStoredToken();
if (!token) {
  // User not logged in
}
```

### Clear Token (Logout)
```typescript
import { clearToken } from '@raweval/auth';

clearToken();
// Redirect to login
```

## Next Steps

1. **Update Login/Signup Pages:**
   - Use `authService.register()` in signup
   - Use `authService.login()` in login
   - Store token after successful login

2. **Update Chat Components:**
   - Replace mock data with `chatService.sendMessage()`
   - Add error handling
   - Add loading states

3. **Add Token Refresh:**
   - Implement token refresh logic
   - Handle token expiration

4. **Add File Upload UI:**
   - File input component
   - Preview uploaded files
   - Show upload progress

## Files Created/Updated

### New Files:
- `apps/chat/services/auth-service.ts` - Auth service
- `apps/chat/services/llm-calls-service.ts` - LLM calls service
- `packages/types/src/auth-api.ts` - Auth API types
- `packages/auth/src/session/token-storage.ts` - Token storage utilities
- `packages/types/src/generated/main-api.openapi.json` - Main API spec
- `packages/types/src/generated/llm-calls-api.openapi.json` - LLM calls API spec

### Updated Files:
- `apps/chat/services/chat-service.ts` - Integrated with LLM calls service
- `packages/api-client/src/config.ts` - Added LLM calls base URL support
- `packages/api-client/src/client.ts` - Added FormData support
- `packages/types/src/index.ts` - Exported auth API types

## Testing

### Test Authentication
```typescript
// Test login
const token = await authService.login({
  username: 'test@example.com',
  password: 'password123',
});
console.log('Token:', token.access_token);
```

### Test Chat
```typescript
// Test chat
const message = await chatService.sendMessage('Hello!', {
  userId: 1,
  model: 'openai',
  modelName: 'gpt-4o',
});
console.log('Response:', message.content);
```

## Status

✅ **All services integrated and ready!**

- [x] Auth service created
- [x] LLM calls service created
- [x] Chat service updated
- [x] Token storage implemented
- [x] API client supports both APIs
- [x] FormData support added
- [x] TypeScript types added
- [x] Error handling ready

**Ready for frontend integration!** 🚀
