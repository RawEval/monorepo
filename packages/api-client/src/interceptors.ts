/**
 * Request/Response Interceptors
 * 
 * Interceptor system for API client
 */

export type RequestInterceptor = (
  config: RequestConfig,
) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptor<T = unknown> = (
  response: T,
  config: RequestConfig,
) => T | Promise<T>;

export type ErrorInterceptor = (
  error: Error,
  config: RequestConfig,
) => Error | Promise<Error>;

export interface RequestConfig extends RequestInit {
  url: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
  metadata?: Record<string, unknown>;
}

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  /**
   * Add request interceptor
   */
  useRequest(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add response interceptor
   */
  useResponse<T = unknown>(interceptor: ResponseInterceptor<T>): () => void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor as ResponseInterceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add error interceptor
   */
  useError(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Execute request interceptors
   */
  async executeRequestInterceptors(
    config: RequestConfig,
  ): Promise<RequestConfig> {
    let finalConfig = config;
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }
    return finalConfig;
  }

  /**
   * Execute response interceptors
   */
  async executeResponseInterceptors<T = unknown>(
    response: T,
    config: RequestConfig,
  ): Promise<T> {
    let result: T = response;
    for (const interceptor of this.responseInterceptors) {
      result = (await interceptor(result as unknown, config)) as T;
    }
    return result;
  }

  /**
   * Execute error interceptors
   */
  async executeErrorInterceptors(
    error: Error,
    config: RequestConfig,
  ): Promise<Error> {
    let finalError = error;
    for (const interceptor of this.errorInterceptors) {
      finalError = await interceptor(finalError, config);
    }
    return finalError;
  }
}

/**
 * Default auth interceptor - adds auth token to headers
 */
export function createAuthInterceptor(
  getToken: () => string | null | Promise<string | null>,
): RequestInterceptor {
  return async (config) => {
    if (config.skipAuth) {
      return config;
    }

    const token = await getToken();
    if (token) {
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }

    return config;
  };
}

/**
 * Default error interceptor - handles common errors
 */
export function createErrorInterceptor(): ErrorInterceptor {
  return (error, config) => {
    if (config.skipErrorHandling) {
      return error;
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        error,
        url: config.url,
        method: config.method,
      });
    }

    return error;
  };
}
