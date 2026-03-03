/**
 * Search API Types
 *
 * Types for the unified multi-model search endpoints
 */

/**
 * Search Query Request
 */
export interface SearchQueryRequest {
  query: string;
  model?: string;
  stream?: boolean;
}

/**
 * Search Query Response
 */
export interface SearchQueryResponse {
  answer: string;
  context?: Record<string, unknown>[];
  sources?: string[];
  model?: string;
  processing_time_ms?: number;
}

/**
 * Multi-Model Search Request
 */
export interface MultiModelSearchRequest {
  query: string;
  models: string[];
}

/**
 * Multi-Model Search Response List
 */
export type MultiModelSearchResponse = SearchQueryResponse[];
