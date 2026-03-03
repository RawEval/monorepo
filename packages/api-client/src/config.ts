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
 *
 * Both browser and server use direct API URLs.
 * The backend has CORS configured (allow_origins=["*"]), so no proxy is needed.
 */
export function getApiConfig(): ApiConfig {
  const isBrowser = typeof window !== 'undefined';

  // Base URL for general API calls (same for browser and server)
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    'http://raweval-alb-1123950706.ap-northeast-1.elb.amazonaws.com';

  // Base URL for LLM calls
  const llmCallsBaseUrl =
    process.env.NEXT_PUBLIC_LLM_CALLS_API_URL ||
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
 * Get full API URL for main API calls
 *
 * Prepends /api/{version} to the path and combines with baseUrl.
 */
export function getApiUrl(path: string, config?: ApiConfig): string {
  const apiConfig = config || getApiConfig();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

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
