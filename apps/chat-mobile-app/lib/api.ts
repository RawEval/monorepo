/**
 * API Client — React Native fetch wrapper
 *
 * Ported from apps/chat/lib/api.ts with SecureStore-based auth.
 * Includes automatic token refresh on 401.
 * Main API → EXPO_PUBLIC_API_URL + /api/v1/…
 */

import { getStoredToken, getStoredRefreshToken, storeToken, clearToken } from './auth';
import { createApiError, NetworkError } from './errors';
import { router } from 'expo-router';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MAIN_API_BASE =
  process.env.EXPO_PUBLIC_API_URL || 'https://api.raweval.com';

const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || 'v1';

const DEFAULT_TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000');

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  // Deduplicate concurrent refresh calls
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = await getStoredRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${MAIN_API_BASE}/api/${API_VERSION}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) return false;

      const data = (await response.json()) as {
        access_token: string;
        refresh_token?: string;
      };

      await storeToken(data.access_token, data.refresh_token);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface FetchOptions extends Omit<RequestInit, 'body'> {
  skipAuth?: boolean;
  timeout?: number;
  body?: unknown;
  /** Internal: skip retry on 401 (prevents infinite loop) */
  _isRetry?: boolean;
}

async function request<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const {
    skipAuth,
    timeout = DEFAULT_TIMEOUT,
    body,
    headers: extraHeaders,
    _isRetry,
    ...rest
  } = opts;

  const headers = new Headers(extraHeaders as HeadersInit | undefined);

  if (!skipAuth) {
    const token = await getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let fetchBody: BodyInit | undefined;
  if (body instanceof FormData) {
    fetchBody = body;
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
      // Attempt token refresh on 401 (once)
      if (response.status === 401 && !skipAuth && !_isRetry) {
        const refreshed = await attemptTokenRefresh();
        if (refreshed) {
          return request<T>(url, { ...opts, _isRetry: true });
        }
        // Refresh failed — clear tokens, redirect, and stop
        await clearToken();
        router.replace('/(auth)/login');
        throw createApiError('Session expired', 401);
      }

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

      throw createApiError(
        typeof message === 'string' ? message : JSON.stringify(message),
        response.status,
        errorData
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  } catch (error) {
    // AbortError — DOMException doesn't exist on Android/RN, check by name
    if (error instanceof Error && error.name === 'AbortError') {
      throw createApiError('Request timed out', 408);
    }
    if (error instanceof TypeError && error.message?.includes('fetch')) {
      throw new NetworkError();
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

function mainUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${MAIN_API_BASE}/api/${API_VERSION}${clean}`;
}

/** Expose base URL for services that need direct fetch (e.g., streaming) */
export const API_BASE_URL = MAIN_API_BASE;
export const API_VER = API_VERSION;

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
