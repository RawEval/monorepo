/**
 * API Client Configuration
 *
 * Centralized configuration for API client
 *
 * Browser requests go through the Next.js API proxy (/api/proxy/...)
 * to avoid CORS issues. Server-side requests go directly to the backend.
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
 *
 * In browser: routes through /api/proxy to avoid CORS
 * On server: calls backend directly
 */
export function getApiConfig(): ApiConfig {
  const isBrowser = typeof window !== 'undefined';

  // Backend URL (used server-side or by the proxy)
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    'https://api.raweval.com';

  // In browser, use the Next.js proxy to avoid CORS
  // The proxy at /api/proxy/[...path] forwards to the backend
  const baseUrl = isBrowser ? '' : backendUrl;

  // Base URL for LLM calls
  const llmCallsBaseUrl =
    process.env.NEXT_PUBLIC_LLM_CALLS_API_URL ||
    process.env.LLM_CALLS_API_URL ||
    backendUrl;

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
    if (!(window as any).__raweval_config_logged) {
      console.log('API Client Config:', {
        isBrowser,
        baseUrl,
        backendUrl,
        apiVersion,
        mode: isBrowser ? 'proxy' : 'direct',
      });
      (window as any).__raweval_config_logged = true;
    }
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    llmCallsBaseUrl: llmCallsBaseUrl.replace(/\/$/, ''),
    apiVersion,
    timeout,
    retries,
    retryDelay,
  };
}

/**
 * Get full API URL for main API calls
 *
 * In browser: returns /api/proxy/{path} (relative URL through proxy)
 * On server: returns {backendUrl}/api/{version}/{path}
 */
export function getApiUrl(path: string, config?: ApiConfig): string {
  const apiConfig = config || getApiConfig();
  const isBrowser = typeof window !== 'undefined';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (isBrowser) {
    // Route through Next.js proxy — the proxy adds /api/v1 prefix
    return `/api/proxy${cleanPath}`;
  }

  // Server-side: direct to backend with version prefix
  // V2 paths (/v2/*) get /api prefix, V1 paths get /api/v1 prefix
  let versionedPath: string;
  if (cleanPath.startsWith(`/api/`)) {
    // Already has /api prefix (e.g., /api/v1/... or /api/v2/...)
    versionedPath = cleanPath;
  } else if (cleanPath.startsWith('/v2/')) {
    // V2 endpoints: /v2/interview/* → /api/v2/interview/*
    versionedPath = `/api${cleanPath}`;
  } else {
    // Default V1: /orchestrator/* → /api/v1/orchestrator/*
    versionedPath = `/api/${apiConfig.apiVersion}${cleanPath}`;
  }

  return `${apiConfig.baseUrl}${versionedPath}`;
}

/**
 * Get LLM Calls API URL
 */
export function getLlmCallsApiUrl(path: string, config?: ApiConfig): string {
  const apiConfig = config || getApiConfig();
  const isBrowser = typeof window !== 'undefined';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (isBrowser) {
    // Route through proxy with llm-calls prefix
    const llmPath = cleanPath.startsWith('/llm-calls')
      ? cleanPath
      : `/llm-calls${cleanPath}`;
    return `/api/proxy${llmPath}`;
  }

  // Server-side: direct
  const llmPath = cleanPath.startsWith('/llm-calls')
    ? cleanPath
    : `/llm-calls${cleanPath}`;

  return `${apiConfig.llmCallsBaseUrl}${llmPath}`;
}
