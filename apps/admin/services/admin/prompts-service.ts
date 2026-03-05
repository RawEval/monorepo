/**
 * Admin Prompts Service
 *
 * Manage prompts and failed prompts requiring review.
 */

import { ApiService } from '../api-service';

export interface PromptResponseFromAPI {
  id: number;
  query_text: string;
  original_response: string | null;
  status: string;
  domain: string | null;
}

export interface FailedPromptResponse {
  id: number;
  prompt_id: number;
  original_prompt_id: number;
  query_text: string;
  original_response: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export class AdminPromptsService extends ApiService {
  /**
   * Get all prompts
   */
  async getPrompts(skip = 0, limit = 100): Promise<PromptResponseFromAPI[]> {
    const response = await this.client.get<PromptResponseFromAPI[]>(
      `/prompts?skip=${skip}&limit=${limit}`
    );
    return this.handleResponse(response);
  }

  /**
   * Get prompt by ID
   */
  async getPromptById(promptId: number): Promise<PromptResponseFromAPI> {
    const response = await this.client.get<PromptResponseFromAPI>(
      `/prompts/${promptId}`
    );
    return this.handleResponse(response);
  }

  /**
   * Mark prompt as wrong
   */
  async markPromptAsWrong(promptId: number): Promise<void> {
    await this.client.post(`/prompts/${promptId}/mark-wrong`, {});
  }

  /**
   * Get failed prompts with filtering
   */
  async getFailedPrompts(
    skip = 0,
    limit = 100,
    status?: string,
    priority?: string
  ): Promise<FailedPromptResponse[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);

    const response = await this.client.get<FailedPromptResponse[]>(
      `/failed-prompts?${params.toString()}`
    );
    return this.handleResponse(response);
  }

  /**
   * Get failed prompt by ID
   */
  async getFailedPromptById(
    failedPromptId: number,
    includeConversations = true
  ): Promise<FailedPromptResponse> {
    const response = await this.client.get<FailedPromptResponse>(
      `/failed-prompts/${failedPromptId}?include_conversations=${includeConversations}`
    );
    return this.handleResponse(response);
  }
}

export const adminPromptsService = new AdminPromptsService();
