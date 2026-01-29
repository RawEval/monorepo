/**
 * API Client Configuration
 *
 * Centralized configuration for API client
 */

export interface ApiConfig {
  baseUrl: string;
  llmCallsBaseUrl: string;
  apiVersion: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

/**
 * Get API configuration from environment variables
 */
export function getApiConfig(): ApiConfig {
  // In browser, use Next.js API routes to avoid CORS
  // In server-side, use direct API URL
  const isBrowser = typeof window !== 'undefined';

  // Base URL for general API calls
  const baseUrl = isBrowser
    ? '' // Browser: Use relative paths (proxied by Next.js)
    : process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_URL ||
      'https://api.raweval.com';

  // Base URL for LLM calls
  // CRITICAL: In browser, this MUST be empty to let the proxy handle routing
  // If it's set to an absolute URL, the proxy will wrap it (double prefixing)
  const llmCallsBaseUrl = isBrowser
    ? ''
    : process.env.NEXT_PUBLIC_LLM_CALLS_API_URL ||
      process.env.LLM_CALLS_API_URL ||
      baseUrl; // Default to main API URL if not specified

  const apiVersion =
    process.env.NEXT_PUBLIC_API_VERSION || process.env.API_VERSION || 'v1';

  const timeout = Number(
    process.env.NEXT_PUBLIC_API_TIMEOUT || process.env.API_TIMEOUT || '30000'
  );

  const retries = Number(
    process.env.NEXT_PUBLIC_API_RETRIES || process.env.API_RETRIES || '3'
  );

  const retryDelay = Number(
    process.env.NEXT_PUBLIC_API_RETRY_DELAY ||
      process.env.API_RETRY_DELAY ||
      '1000'
  );

  // Debug log in development to verify config loading
  if (process.env.NODE_ENV === 'development' && isBrowser) {
    // Only log once to avoid noise
    if (!(window as any).__raweval_config_logged) {
      console.log('API Client Config:', {
        isBrowser,
        baseUrl,
        llmCallsBaseUrl,
        apiVersion,
      });
      (window as any).__raweval_config_logged = true;
    }
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''), // Remove trailing slash
    llmCallsBaseUrl: llmCallsBaseUrl.replace(/\/$/, ''), // Remove trailing slash
    apiVersion,
    timeout,
    retries,
    retryDelay,
  };
}

/**
 * Get full API URL
 */
export function getApiUrl(path: string, config?: ApiConfig): string {
  const apiConfig = config || getApiConfig();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If baseUrl is empty (browser mode), use Next.js API proxy routes
  if (!apiConfig.baseUrl) {
    // Use /api/proxy for all routes to avoid CORS
    return `/api/proxy${cleanPath}`;
  }

  // Server-side: use full URL
  const versionedPath = cleanPath.startsWith(`/api/${apiConfig.apiVersion}`)
    ? cleanPath
    : `/api/${apiConfig.apiVersion}${cleanPath}`;

  return `${apiConfig.baseUrl}${versionedPath}`;
}

/**
 * Get LLM Calls API URL
 */
export function getLlmCallsApiUrl(path: string, config?: ApiConfig): string {
  const apiConfig = config || getApiConfig();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // LLM calls API uses /llm-calls prefix
  const llmPath = cleanPath.startsWith('/llm-calls')
    ? cleanPath
    : `/llm-calls${cleanPath}`;

  return `${apiConfig.llmCallsBaseUrl}${llmPath}`;
}
