/**
 * Search Service
 *
 * Service for unified multi-model search operations.
 * All endpoints under /api/v1/chat/search/*.
 */

import { api } from '@/lib/api';
import { getStoredToken } from '@/lib/auth';
import type {
  SearchQueryRequest,
  SearchQueryResponse,
  MultiModelSearchRequest,
  MultiModelSearchResponse,
} from '@raweval/types';

const MAIN_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.raweval.com';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class SearchService {
  /** Execute a search query against a single model */
  async querySearch(data: SearchQueryRequest): Promise<SearchQueryResponse> {
    return api.post<SearchQueryResponse>('/chat/search/query', data);
  }

  /** Execute a search query against multiple models simultaneously */
  async multiModelSearch(
    data: MultiModelSearchRequest
  ): Promise<MultiModelSearchResponse> {
    return api.post<MultiModelSearchResponse>('/chat/search/multimodel', data);
  }

  /** List available search model shorthands */
  async getAvailableModels(): Promise<Record<string, unknown>> {
    return api.get('/chat/search/available-models');
  }

  /**
   * Execute a streamed multi-model search via SSE.
   * Returns the raw Response for EventSource-style consumption.
   */
  async multiModelSearchStream(params: {
    query_text: string;
    models?: string[];
    temperature?: number;
    max_tokens?: number;
    web_search?: boolean;
    system_prompt?: string;
    timeout?: number;
  }): Promise<Response> {
    const token = getStoredToken() || '';
    const qs = new URLSearchParams();
    qs.set('query_text', params.query_text);
    if (params.models) {
      params.models.forEach((m) => qs.append('models', m));
    }
    if (params.temperature !== undefined)
      qs.set('temperature', String(params.temperature));
    if (params.max_tokens !== undefined)
      qs.set('max_tokens', String(params.max_tokens));
    if (params.web_search !== undefined)
      qs.set('web_search', String(params.web_search));
    if (params.system_prompt) qs.set('system_prompt', params.system_prompt);
    if (params.timeout !== undefined) qs.set('timeout', String(params.timeout));

    const response = await fetch(
      `${MAIN_API_BASE}/api/${API_VERSION}/chat/search/multimodel/stream?${qs.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Stream request failed with status ${response.status}`);
    }

    return response;
  }
}

export const searchService = new SearchService();
