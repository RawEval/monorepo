/**
 * Prompts API Types
 */

/**
 * Prompt Response from API
 * (Distinct from the internal Prompt model)
 */
export interface PromptResponseFromAPI {
  id: number;
  query_text: string;
  original_response: string | null;
  status: string;
  domain: string | null;
  model_name?: string;
  created_at?: string;
}

/**
 * Failed Prompt Response
 */
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
  conversations?: Record<string, unknown>[];
}

/**
 * Create Failed Prompt Request
 */
export interface CreateFailedPromptRequest {
  prompt_id: number;
  priority?: 'low' | 'medium' | 'high' | string;
}

/**
 * Add Conversation Request
 */
export interface AddConversationRequest {
  conversation_json: Record<string, unknown>;
}
