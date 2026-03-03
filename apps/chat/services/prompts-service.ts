/**
 * Prompts Service
 *
 * Service for managing prompts and failed prompts.
 * All endpoints under /api/v1/chat/prompts/*.
 */

import { api } from '@/lib/api';
import type {
  PromptResponseFromAPI,
  FailedPromptResponse,
} from '@raweval/types';

class PromptsService {
  /** Get all prompts (paginated) */
  async getPrompts(
    skip = 0,
    limit = 100,
    status?: string
  ): Promise<PromptResponseFromAPI[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (status) params.append('status', status);
    return api.get<PromptResponseFromAPI[]>(
      `/chat/prompts/?${params.toString()}`
    );
  }

  /** Get prompt by ID */
  async getPromptById(promptId: number): Promise<PromptResponseFromAPI> {
    return api.get<PromptResponseFromAPI>(`/chat/prompts/${promptId}`);
  }

  /** Get prompt edit history */
  async getPromptEditHistory(
    promptId: number
  ): Promise<Record<string, unknown>[]> {
    return api.get<Record<string, unknown>[]>(
      `/chat/prompts/${promptId}/edit-history`
    );
  }

  /** Get failed prompts list */
  async getFailedPrompts(
    skip = 0,
    limit = 100
  ): Promise<FailedPromptResponse[]> {
    return api.get<FailedPromptResponse[]>(
      `/chat/prompts/failed/list?skip=${skip}&limit=${limit}`
    );
  }
}

export const promptsService = new PromptsService();
