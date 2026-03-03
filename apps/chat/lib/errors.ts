/**
 * API Error Classes
 *
 * Typed error hierarchy for API responses.
 * Self-contained — no shared package dependency.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network error — check your connection') {
    super(message, 0);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class TimeoutError extends ApiError {
  constructor(message = 'Request timed out') {
    super(message, 408);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class ValidationError extends ApiError {
  public validationErrors?: Record<string, string[]>;
  constructor(message: string, validationErrors?: Record<string, string[]>) {
    super(message, 400, validationErrors);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', response?: unknown) {
    super(message, 401, response);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', response?: unknown) {
    super(message, 403, response);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not found', response?: unknown) {
    super(message, 404, response);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ServerError extends ApiError {
  constructor(message: string, statusCode: number, response?: unknown) {
    super(message, statusCode, response);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/** Type guard */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Factory — creates the right error subclass from an HTTP status */
export function createApiError(
  message: string,
  statusCode: number,
  response?: unknown
): ApiError {
  switch (statusCode) {
    case 400:
      return new ValidationError(
        message,
        response as Record<string, string[]> | undefined
      );
    case 401:
      return new UnauthorizedError(message, response);
    case 403:
      return new ForbiddenError(message, response);
    case 404:
      return new NotFoundError(message, response);
    case 408:
      return new TimeoutError(message);
    default:
      if (statusCode >= 500) {
        return new ServerError(message, statusCode, response);
      }
      return new ApiError(message, statusCode, response);
  }
}
