/**
 * Search Service — multi-model search operations
 */
import { api, API_BASE_URL, API_VER } from '@/lib/api';
import type {
  SearchQueryRequest,
  SearchQueryResponse,
  MultiModelSearchRequest,
  MultiModelSearchResponse,
} from '@raweval/types';
import { getStoredToken } from '@/lib/auth';

class SearchService {
  async querySearch(data: SearchQueryRequest): Promise<SearchQueryResponse> {
    return api.post<SearchQueryResponse>('/chat/search', data);
  }

  async multiModelSearch(data: MultiModelSearchRequest): Promise<MultiModelSearchResponse> {
    return api.post<MultiModelSearchResponse>('/chat/search/multi', data);
  }

  async getAvailableModels(): Promise<unknown> {
    return api.get<unknown>('/chat/search/models');
  }

  async multiModelSearchStream(params: MultiModelSearchRequest): Promise<Response> {
    const token = await getStoredToken();
    return fetch(`${API_BASE_URL}/api/${API_VER}/chat/search/multi/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(params),
    });
  }
}

export const searchService = new SearchService();
