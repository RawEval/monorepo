/**
 * API Service Base
 *
 * Base service class for API integration
 */

import { apiClient } from '@raweval/api-client';
import { createAuthInterceptor } from '@raweval/api-client/interceptors';
import type { ApiResponse, PaginatedResponse } from '@raweval/types';
import { getStoredToken } from '@/lib/auth';

// Add the auth interceptor to read the token from cookies (instead of the default localStorage)
apiClient
  .getInterceptors()
  .useRequest(createAuthInterceptor(() => getStoredToken()));

export abstract class ApiService {
  protected client = apiClient;

  /**
   * Handle API response
   * Backend API returns data directly, not wrapped in ApiResponse
   */
  protected handleResponse<T>(response: T | ApiResponse<T>): T {
    // Check if response is wrapped in ApiResponse format
    if (response && typeof response === 'object' && 'success' in response) {
      const apiResponse = response as ApiResponse<T>;
      if (!apiResponse.success || apiResponse.error) {
        throw new Error(apiResponse.error || 'API request failed');
      }
      if (apiResponse.data === null) {
        throw new Error('No data returned from API');
      }
      return apiResponse.data;
    }
    // Response is direct data
    return response as T;
  }

  /**
   * Handle paginated response
   */
  protected handlePaginatedResponse<T>(
    response: PaginatedResponse<T>
  ): PaginatedResponse<T> {
    return response;
  }
}
