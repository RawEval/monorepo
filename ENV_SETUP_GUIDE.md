# Environment Variables Setup Guide

Complete guide for setting up environment variables across the RawEval monorepo.

## Quick Start

1. **Copy the example file:**

   ```bash
   # For chat app
   cp apps/chat/.env.example apps/chat/.env.local

   # For other apps
   cp apps/experts/.env.example apps/experts/.env.local
   cp apps/admin/.env.example apps/admin/.env.local
   ```

2. **Fill in your values:**
   - Edit `.env.local` files with your actual configuration
   - `.env.local` is git-ignored, so your secrets are safe

3. **Restart your dev server:**
   ```bash
   pnpm dev
   ```

## File Structure

```
monorepo/
├── .env.example              # Root-level template (optional)
├── .env.local                # Root-level local vars (git-ignored)
├── apps/
│   ├── chat/
│   │   ├── .env.example      # Chat app template
│   │   └── .env.local        # Chat app local vars (git-ignored)
│   ├── experts/
│   │   ├── .env.example      # Experts app template
│   │   └── .env.local        # Experts app local vars
│   ├── admin/
│   │   ├── .env.example      # Admin app template
│   │   └── .env.local        # Admin app local vars
│   └── landing/
│       ├── .env.example      # Landing app template
│       └── .env.local        # Landing app local vars
```

## Required Variables

### Chat App (`apps/chat/.env.local`)

**Required:**

```bash
NEXT_PUBLIC_API_URL=http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com
NEXT_PUBLIC_API_VERSION=v1
```

**Optional:**

```bash
NEXT_PUBLIC_LLM_CALLS_API_URL=http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRIES=3
NEXT_PUBLIC_API_RETRY_DELAY=1000
NEXT_PUBLIC_DEBUG_API=false
NEXT_PUBLIC_MOCK_API=false
```

### Experts App (`apps/experts/.env.local`)

**Required:**

```bash
NEXT_PUBLIC_API_URL=http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com
NEXT_PUBLIC_API_VERSION=v1
```

### Admin App (`apps/admin/.env.local`)

**Required:**

```bash
NEXT_PUBLIC_API_URL=http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com
NEXT_PUBLIC_API_VERSION=v1
```

### Landing App (`apps/landing/.env.local`)

**Optional:**

```bash
# Only needed if landing page makes API calls
NEXT_PUBLIC_API_URL=http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com
NEXT_PUBLIC_API_VERSION=v1
```

## Variable Priority

Next.js loads environment variables in this order (highest to lowest priority):

1. `.env.local` (always loaded, git-ignored)
2. `.env.development` or `.env.production` (based on NODE_ENV)
3. `.env` (git-ignored)
4. `.env.example` (committed to git, template only)

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Use them for client-side configuration only.

## Production Setup

### Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings > Environment Variables**
3. Add each variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com`
   - **Environment:** Production, Preview, Development (select all)
4. Repeat for all required variables
5. Redeploy your application

### Other Platforms

Set environment variables in your platform's configuration:

- **Netlify:** Site Settings > Environment Variables
- **Railway:** Project Settings > Variables
- **Docker:** Use `-e` flag or `.env` file
- **Kubernetes:** ConfigMaps and Secrets

## Security Best Practices

### ✅ DO:

- Use `.env.local` for local development (git-ignored)
- Use `NEXT_PUBLIC_` prefix only for public, non-sensitive values
- Store secrets in platform environment variables (Vercel, etc.)
- Use different API URLs for development and production
- Rotate API keys regularly

### ❌ DON'T:

- Commit `.env.local` files to git
- Put secrets in `.env.example` files
- Expose API keys or tokens with `NEXT_PUBLIC_` prefix
- Share `.env.local` files in chat or email
- Use production credentials in development

## Troubleshooting

### Variables not loading?

1. **Check file location:**
   - Variables must be in the app's root directory
   - For `apps/chat`, use `apps/chat/.env.local`

2. **Check variable names:**
   - Must start with `NEXT_PUBLIC_` for client-side access
   - Case-sensitive

3. **Restart dev server:**

   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   pnpm dev
   ```

4. **Check Next.js config:**
   - Ensure `next.config.ts` doesn't override env vars

### API calls failing?

1. **Verify API URLs:**

   ```bash
   # Test Main API health
   curl http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com/api/v1/health

   # Test LLM Call Host health
   curl http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com/llm-calls/health
   ```

   The health endpoints should return JSON with service status. If you get connection errors, check:
   - Network connectivity
   - Firewall rules
   - API URL is correct (no typos)

2. **Check CORS:**
   - Ensure backend allows requests from your domain
   - Check browser console for CORS errors
   - Verify `Access-Control-Allow-Origin` headers

3. **Verify authentication:**
   - Check if token is being sent in request headers
   - Verify token is valid and not expired
   - Test with `authService.getCurrentUser()` to verify auth

4. **Check LLM Call Host status:**

   ```typescript
   import { llmCallsService } from '@/services/llm-calls-service';

   // Check health
   const health = await llmCallsService.checkHealth();
   console.log('LLM Call Host status:', health.status);
   console.log('Available providers:', health.providers);
   ```

## Example Configurations

### Development

```bash
# apps/chat/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_DEBUG_API=true
```

### Production

```bash
# Set in Vercel Dashboard
NEXT_PUBLIC_API_URL=http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_DEBUG_API=false
```

### Testing

```bash
# apps/chat/.env.local
NEXT_PUBLIC_API_URL=http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_MOCK_API=true
```

## Health Check Endpoints

### Main API Health

- **Endpoint:** `http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com/api/v1/health`
- **Method:** GET
- **Auth:** Not required
- **Response:** API status and version

### LLM Call Host Health

- **Endpoint:** `http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com/llm-calls/health`
- **Method:** GET
- **Auth:** Not required
- **Response:** Service status, version, and available LLM providers

**Example Response:**

```json
{
  "status": "healthy",
  "service": "LLM Call Host",
  "version": "2.0.0",
  "timestamp": "2024-01-16T22:30:00Z",
  "providers": {
    "openai": "available",
    "claude": "available",
    "gemini": "available"
  }
}
```

**Using in Code:**

```typescript
import { llmCallsService } from '@/services/llm-calls-service';
import { healthService } from '@/services/health-service';

// Check LLM Call Host health
const health = await llmCallsService.checkHealth();

// Check all APIs
const allHealth = await healthService.checkAllHealth();
```

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [API Client Configuration](../BACKEND_INTEGRATION.md)
- [API Integration Guide](../API_INTEGRATION_COMPLETE.md)

---

**Need help?** Check the main integration docs:

- `INTEGRATION_SUMMARY.md`
- `API_INTEGRATION_COMPLETE.md`
- `BACKEND_INTEGRATION.md`
