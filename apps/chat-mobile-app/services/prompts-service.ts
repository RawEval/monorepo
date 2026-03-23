/**
 * Prompts Service — prompt management
 */
import { api } from '@/lib/api';
import type { PromptResponseFromAPI, FailedPromptResponse, PaginatedResponse } from '@raweval/types';

class PromptsService {
  async getPrompts(
    skip = 0,
    limit = 20,
    status?: string
  ): Promise<PaginatedResponse<PromptResponseFromAPI>> {
    const params = new URLSearchParams();
    params.set('skip', String(skip));
    params.set('limit', String(limit));
    if (status) params.set('status', status);
    return api.get<PaginatedResponse<PromptResponseFromAPI>>(`/prompts?${params}`);
  }

  async getPromptById(promptId: number): Promise<PromptResponseFromAPI> {
    return api.get<PromptResponseFromAPI>(`/prompts/${promptId}`);
  }

  async getPromptEditHistory(promptId: number): Promise<unknown[]> {
    return api.get<unknown[]>(`/prompts/${promptId}/edit-history`);
  }

  async getFailedPrompts(skip = 0, limit = 20): Promise<PaginatedResponse<FailedPromptResponse>> {
    return api.get<PaginatedResponse<FailedPromptResponse>>(
      `/prompts/failed?skip=${skip}&limit=${limit}`
    );
  }
}

export const promptsService = new PromptsService();
