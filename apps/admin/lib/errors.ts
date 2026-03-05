/**
 * API Error Re-exports
 *
 * Re-exports error classes from @raweval/api-client for convenient use
 * within admin app components. Consistent with chat app's error pattern.
 */

export {
  ApiError,
  NetworkError,
  TimeoutError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  isApiError,
  createApiError,
} from '@raweval/api-client';
