import { apiClient } from '@/lib/api-client';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export abstract class ApiService {
  protected client = apiClient;

  protected handleResponse<T>(response: unknown): T {
    if (response && typeof response === 'object' && 'success' in response) {
      const apiResponse = response as {
        success: boolean;
        data: T;
        error?: string;
      };
      if (!apiResponse.success || apiResponse.error) {
        throw new Error(apiResponse.error || 'API request failed');
      }
      return apiResponse.data;
    }
    return response as T;
  }

  protected buildQuery(params: Record<string, unknown>): string {
    const filtered = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    );
    if (filtered.length === 0) return '';
    const qs = new URLSearchParams(
      filtered.map(([k, v]) => [k, String(v)])
    ).toString();
    return `?${qs}`;
  }
}
