/**
 * @raweval/api-client
 *
 * API client package for RawEval backend integration
 */

export { ApiClient, apiClient } from './client';
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
} from './errors';
export {
  InterceptorManager,
  createAuthInterceptor,
  createErrorInterceptor,
  type RequestInterceptor,
  type ResponseInterceptor,
  type ErrorInterceptor,
  type RequestConfig,
} from './interceptors';

// Export services
export * from './services/auth-service';
export * from './services/llm-calls-service';

import { apiClient } from './client';
import { AuthService } from './services/auth-service';
import { LLMCallsService } from './services/llm-calls-service';

export const authService = new AuthService(apiClient);
export const llmCallsService = new LLMCallsService(apiClient);

export { getApiConfig, getApiUrl, type ApiConfig } from './config';
export { getLlmCallsApiUrl } from './config';
export {
  fetchOpenApiSpec,
  getEndpointFromSpec,
  generateTypesFromSpec,
  type OpenApiSpec,
  type OpenApiOperation,
  type OpenApiParameter,
  type OpenApiResponse,
} from './openapi';
