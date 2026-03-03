/**
 * API Client — Self-contained fetch wrapper
 *
 * Two base URLs:
 *   Main API  → NEXT_PUBLIC_API_URL + /api/v1/…
 *
 * Auth: reads JWT from cookie via getStoredToken().
 * Errors: throws typed ApiError subclasses.
 * No proxy — direct CORS requests to backend.
 */

import { getStoredToken } from './auth';
import { createApiError, NetworkError } from './errors';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MAIN_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.raweval.com';

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

const DEFAULT_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface FetchOptions extends Omit<RequestInit, 'body'> {
  /** Skip adding Authorization header (e.g. login/register) */
  skipAuth?: boolean;
  /** Request timeout in ms */
  timeout?: number;
  /** Body — can be string, FormData, or serialisable object */
  body?: unknown;
}

/**
 * Core fetch wrapper — all API calls go through this.
 */
async function request<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const {
    skipAuth,
    timeout = DEFAULT_TIMEOUT,
    body,
    headers: extraHeaders,
    ...rest
  } = opts;

  // Build headers
  const headers = new Headers(extraHeaders as HeadersInit | undefined);

  // Auth header
  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Body handling
  let fetchBody: BodyInit | undefined;
  if (body instanceof FormData) {
    fetchBody = body;
    // Don't set Content-Type — browser will add the multipart boundary
  } else if (typeof body === 'string') {
    fetchBody = body;
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded');
    }
  } else if (body !== undefined && body !== null) {
    fetchBody = JSON.stringify(body);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  // Abort controller for timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...rest,
      headers,
      body: fetchBody,
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text().catch(() => null);
      }

      const message =
        (errorData as { detail?: string })?.detail ??
        (errorData as { message?: string })?.message ??
        response.statusText ??
        'Request failed';

      // Handle 401 Unauthorized - Auto-logout
      if (response.status === 401) {
        // Prevent redirect loop if already on login page
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login')
        ) {
          // Import dynamically to avoid circular dependencies if any (though clean structure avoids it)
          // But we can use the imported clearToken directly since we are in async function
          const { clearToken } = require('./auth');
          clearToken();
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }

      throw createApiError(
        typeof message === 'string' ? message : JSON.stringify(message),
        response.status,
        errorData
      );
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw createApiError('Request timed out', 408);
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError();
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Public helpers — Main API (/api/v1/…)
// ---------------------------------------------------------------------------

/** Build full Main API URL from a path like `/auth/login` */
function mainUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${MAIN_API_BASE}/api/${API_VERSION}${clean}`;
}

export const api = {
  get<T>(path: string, opts?: FetchOptions): Promise<T> {
    return request<T>(mainUrl(path), { ...opts, method: 'GET' });
  },
  post<T>(path: string, body?: unknown, opts?: FetchOptions): Promise<T> {
    return request<T>(mainUrl(path), { ...opts, method: 'POST', body });
  },
  put<T>(path: string, body?: unknown, opts?: FetchOptions): Promise<T> {
    return request<T>(mainUrl(path), { ...opts, method: 'PUT', body });
  },
  patch<T>(path: string, body?: unknown, opts?: FetchOptions): Promise<T> {
    return request<T>(mainUrl(path), { ...opts, method: 'PATCH', body });
  },
  delete<T>(path: string, opts?: FetchOptions): Promise<T> {
    return request<T>(mainUrl(path), { ...opts, method: 'DELETE' });
  },
};
