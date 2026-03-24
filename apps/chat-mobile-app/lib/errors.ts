/**
 * API Error classes — strict typed, matching web chat app exactly.
 */

export class ApiError extends Error {
  readonly statusCode: number;
  readonly response?: unknown;

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network error — check your connection') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message = 'Request timed out') {
    super(message, 408);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends ApiError {
  readonly validationErrors?: Record<string, string[]>;

  constructor(
    message: string,
    validationErrors?: Record<string, string[]>,
    response?: unknown
  ) {
    super(message, 400, response);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', response?: unknown) {
    super(message, 401, response);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', response?: unknown) {
    super(message, 403, response);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not found', response?: unknown) {
    super(message, 404, response);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends ApiError {
  constructor(message = 'Internal server error', statusCode = 500, response?: unknown) {
    super(message, statusCode, response);
    this.name = 'ServerError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function createApiError(
  message: string,
  statusCode: number,
  response?: unknown
): ApiError {
  switch (statusCode) {
    case 0:
      return new NetworkError(message);
    case 400:
      return new ValidationError(message, undefined, response);
    case 401:
      return new UnauthorizedError(message, response);
    case 403:
      return new ForbiddenError(message, response);
    case 404:
      return new NotFoundError(message, response);
    case 408:
      return new TimeoutError(message);
    default:
      if (statusCode >= 500) return new ServerError(message, statusCode, response);
      return new ApiError(message, statusCode, response);
  }
}
