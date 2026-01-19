/**
 * API Client
 * 
 * Main API client with request/response handling, retries, and interceptors
 */

import { getApiConfig, getApiUrl, type ApiConfig } from './config';
import {
  createApiError,
  NetworkError,
  TimeoutError,
} from './errors';
import {
  InterceptorManager,
  createAuthInterceptor,
  createErrorInterceptor,
  type RequestConfig,
} from './interceptors';
import type { ApiResponse, PaginatedResponse } from '@raweval/types';

export interface ClientOptions {
  config?: Partial<ApiConfig>;
  getAuthToken?: () => string | null | Promise<string | null>;
}

/**
 * API Client Class
 */
export class ApiClient {
  private config: ApiConfig;
  private interceptors: InterceptorManager;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(options: ClientOptions = {}) {
    this.config = { ...getApiConfig(), ...options.config };
    this.interceptors = new InterceptorManager();

    // Add default interceptors
    if (options.getAuthToken) {
      this.interceptors.useRequest(createAuthInterceptor(options.getAuthToken));
    }
    this.interceptors.useError(createErrorInterceptor());
  }

  /**
   * Get interceptors manager
   */
  getInterceptors(): InterceptorManager {
    return this.interceptors;
  }

  /**
   * Cancel a request by URL
   */
  cancelRequest(url: string): void {
    const controller = this.abortControllers.get(url);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(url);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    Array.from(this.abortControllers.values()).forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  /**
   * Create timeout promise
   */
  private createTimeout(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Execute request with retry logic
   */
  private async executeRequest<T>(
    config: RequestConfig,
    attempt = 0,
  ): Promise<T> {
    const fullUrl = getApiUrl(config.url, this.config);
    const timeout = config.timeout ?? this.config.timeout;
    const retries = config.retries ?? this.config.retries;
    const retryDelay = config.retryDelay ?? this.config.retryDelay;

    // Create abort controller
    const controller = new AbortController();
    this.abortControllers.set(fullUrl, controller);

    try {
      // Apply request interceptors
      const finalConfig = await this.interceptors.executeRequestInterceptors({
        ...config,
        url: fullUrl,
        signal: controller.signal,
      });

      // Create fetch promise with timeout
      const fetchPromise = fetch(fullUrl, finalConfig);
      const timeoutPromise = this.createTimeout(timeout);

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      // Remove controller
      this.abortControllers.delete(fullUrl);

      // Handle non-OK responses
      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        const error = createApiError(
          (errorData as { message?: string })?.message ||
            response.statusText ||
            'Request failed',
          response.status,
          errorData,
        );

        // Retry on server errors (5xx) or network errors
        if (
          attempt < retries &&
          (response.status >= 500 || response.status === 0)
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt)),
          );
          return this.executeRequest<T>(config, attempt + 1);
        }

        throw error;
      }

      // Parse JSON response
      let data: T;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as unknown as T;
      }

      // Apply response interceptors
      const result = await this.interceptors.executeResponseInterceptors<T>(
        data,
        finalConfig,
      );

      return result;
    } catch (error) {
      // Remove controller
      this.abortControllers.delete(fullUrl);

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new NetworkError(
          'Network error - please check your connection',
          error as Error,
        );

        // Retry on network errors
        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt)),
          );
          return this.executeRequest<T>(config, attempt + 1);
        }

        throw networkError;
      }

      // Handle timeout errors
      if (error instanceof TimeoutError) {
        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt)),
          );
          return this.executeRequest<T>(config, attempt + 1);
        }
      }

      // Apply error interceptors
      const finalError = await this.interceptors.executeErrorInterceptors(
        error as Error,
        config,
      );

      throw finalError;
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
  ): Promise<T> {
    return this.executeRequest<T>({
      ...config,
      url,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
  ): Promise<T> {
    // Handle FormData
    let body: string | FormData | undefined;
    const headers: Record<string, string> = {};

    // Copy existing headers if they exist
    if (config?.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value;
        }
      });
    }

    if (data instanceof FormData) {
      body = data;
      // Don't set Content-Type for FormData, browser will set it with boundary
    } else if (typeof data === 'string') {
      // For URL-encoded form data
      body = data;
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    } else if (data) {
      body = JSON.stringify(data);
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    return this.executeRequest<T>({
      ...config,
      url,
      method: 'POST',
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      body,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
  ): Promise<T> {
    return this.executeRequest<T>({
      ...config,
      url,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
  ): Promise<T> {
    return this.executeRequest<T>({
      ...config,
      url,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
  ): Promise<T> {
    return this.executeRequest<T>({
      ...config,
      url,
      method: 'DELETE',
    });
  }

  /**
   * Get typed API response
   */
  async getApiResponse<T>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
  ): Promise<ApiResponse<T>> {
    const response = await this.get<ApiResponse<T>>(url, config);
    return response;
  }

  /**
   * Get paginated response
   */
  async getPaginated<T>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
  ): Promise<PaginatedResponse<T>> {
    const response = await this.get<PaginatedResponse<T>>(url, config);
    return response;
  }
}

/**
 * Default API client instance
 * 
 * Note: Token retrieval is handled via interceptor system.
 * The getAuthToken is set to use @raweval/auth package's getStoredToken.
 * This is done at runtime to avoid circular dependencies.
 */
export const apiClient = new ApiClient({
  getAuthToken: () => {
    // Use dynamic import to avoid circular dependencies
    // This will be called at runtime when requests are made
    try {
      // Try to import auth package dynamically
      // In practice, the auth interceptor will handle this
      // This is a fallback for when interceptor isn't used
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = window.localStorage.getItem('raweval_access_token');
        if (token) {
          // Check expiry
          const expiry = window.localStorage.getItem('raweval_token_expiry');
          if (expiry) {
            const expiryTime = parseInt(expiry, 10);
            if (Date.now() < expiryTime) {
              return token;
            }
          }
        }
      }
    } catch {
      // Ignore errors
    }
    return null;
  },
});
