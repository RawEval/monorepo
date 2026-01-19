/**
 * API Error Classes
 * 
 * Custom error types for API client error handling
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NetworkError extends ApiError {
  constructor(message: string, originalError?: Error) {
    super(message, 0, undefined, originalError);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class TimeoutError extends ApiError {
  constructor(message = 'Request timeout', originalError?: Error) {
    super(message, 408, undefined, originalError);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public validationErrors?: Record<string, string[]>,
    originalError?: Error,
  ) {
    super(message, 400, validationErrors, originalError);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', originalError?: Error) {
    super(message, 401, undefined, originalError);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', originalError?: Error) {
    super(message, 403, undefined, originalError);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not found', originalError?: Error) {
    super(message, 404, undefined, originalError);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ServerError extends ApiError {
  constructor(message: string, statusCode: number, response?: unknown, originalError?: Error) {
    super(message, statusCode, response, originalError);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Create appropriate error from response
 */
export function createApiError(
  message: string,
  statusCode: number,
  response?: unknown,
  originalError?: Error,
): ApiError {
  switch (statusCode) {
    case 400:
      return new ValidationError(message, response as Record<string, string[]> | undefined, originalError);
    case 401:
      return new UnauthorizedError(message, originalError);
    case 403:
      return new ForbiddenError(message, originalError);
    case 404:
      return new NotFoundError(message, originalError);
    case 408:
      return new TimeoutError(message, originalError);
    default:
      if (statusCode >= 500) {
        return new ServerError(message, statusCode, response, originalError);
      }
      return new ApiError(message, statusCode, response, originalError);
  }
}
