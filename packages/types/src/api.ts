/**
 * API Types
 * 
 * Common types for API requests and responses
 */

import type { ApiResponse, PaginatedResponse } from './index';

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request Headers
 */
export interface RequestHeaders {
  'Content-Type'?: string;
  Authorization?: string;
  'X-Request-ID'?: string;
  'X-Client-Version'?: string;
  [key: string]: string | undefined;
}

/**
 * Query Parameters
 */
export interface QueryParams extends Record<string, string | number | boolean | undefined> {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Sort Parameters
 */
export interface SortParams {
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Filter Parameters
 */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * API Request Options
 */
export interface ApiRequestOptions {
  headers?: RequestHeaders;
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Standard API Response
 */
export type StandardApiResponse<T> = ApiResponse<T>;

/**
 * Standard Paginated API Response
 */
export type StandardPaginatedResponse<T> = PaginatedResponse<T>;

/**
 * Error Response
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    validationErrors?: Record<string, string[]>;
  };
  timestamp: string;
  path: string;
}

/**
 * Success Response
 */
export interface SuccessResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Health Check Response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services?: Record<string, {
    status: 'up' | 'down';
    latency?: number;
  }>;
}

/**
 * API Version Info
 */
export interface ApiVersionInfo {
  version: string;
  buildDate: string;
  gitCommit?: string;
  environment: string;
}
