/**
 * LLM Calls API Types
 *
 * Types for LLM Calls endpoints from the backend API
 * Based on: https://api.raweval.com/llm-calls/openapi.json
 */

/**
 * LLM Provider enumeration
 */
export type Provider =
  | 'openai'
  | 'anthropic'
  | 'claude'
  | 'gemini'
  | 'grok'
  | 'deepseek'
  | 'openrouter';

/**
 * Workflow Type enumeration
 */
export type WorkflowType =
  | 'single_model'
  | 'multi_model_comparison'
  | 'parallel_processing'
  | 'file_processing'
  | 'autograder'
  | 'dynamic_model_call'
  | 'research'
  | 'code_analysis'
  | 'sentiment_analysis'
  | 'summarization'
  | 'translation'
  | 'classification'
  | 'qa_generation';

/**
 * Token Usage Information
 */
export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

import type { FileInput } from './files-api';

export type { FileInput };

/**
 * Model Configuration
 */
export interface ModelConfig {
  provider: Provider;
  model: string;
  system_prompt?: string | null;
  temperature?: number; // default: 0.7
  max_tokens?: number | null;
  top_p?: number | null;
  frequency_penalty?: number | null; // -2.0 to 2.0
  presence_penalty?: number | null; // -2.0 to 2.0
  metadata?: Record<string, unknown> | null;
}

/**
 * Individual Model Result
 */
export interface ModelResult {
  provider: Provider;
  model: string;
  content: string;
  tokens_used?: TokenUsage | null;
  latency_ms: number;
  timestamp: string; // ISO date-time
  metadata?: Record<string, unknown>;
  error?: string | null;
}

/**
 * Workflow Execution Request
 */
export interface WorkflowRequest {
  workflow_name: string;
  workflow_type: WorkflowType;
  user_prompt: string;
  system_prompt?: string | null;
  models: ModelConfig[];
  files?: FileInput[] | null;
  session_id?: number | null;
  request_id?: string | null;
  conversation_messages?: Record<string, unknown>[] | null;
  use_langgraph?: boolean; // default: false
  langgraph_config?: Record<string, unknown> | null;
  webhook_url?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Workflow Execution Response
 */
export interface WorkflowResponse {
  workflow_name: string;
  workflow_type: string;
  request_id: string;
  status: 'success' | 'partial' | 'failed';
  results: ModelResult[];
  total_latency_ms: number;
  timestamp: string; // ISO date-time
  error?: string | null;
  metadata?: Record<string, unknown>;
  session_id?: number | null;
  attachments?: Record<string, unknown>[] | null;
  conversation_turn_count?: number | null;
  conversation_messages?: Record<string, unknown>[] | null;
}

/**
 * Direct LLM Call Request (No Workflow)
 */
export interface DynamicLLMRequest {
  provider: Provider;
  model: string;
  prompt: string;
  system_prompt?: string | null;
  files?: FileInput[] | null;
  temperature?: number; // default: 0.7
  max_tokens?: number | null;
  top_p?: number | null;
  frequency_penalty?: number | null;
  presence_penalty?: number | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Batch LLM Call Request
 */
export interface BatchLLMRequest {
  requests: DynamicLLMRequest[];
  parallel?: boolean; // default: false
  timeout?: number | null;
}

/**
 * Session Detail (Chat History)
 */
export interface SessionDetail {
  id?: number; // Backend uses 'id' instead of 'session_id' in some endpoints
  session_id: number;
  request_id: string;
  user_id?: number | null;
  title?: string | null;
  system_prompt?: string | null;
  workflow_name: string;
  workflow_type: string;
  status: string;
  total_latency_ms?: number | null;
  error_message?: string | null;
  user_marked_failed: boolean;
  request_metadata?: Record<string, unknown> | null;
  response_metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
  completed_at?: string | null;
  total_messages: number;
  total_attachments: number;
  image_attachments: number;
  last_user_message?: string | null;
  last_assistant_message?: string | null;
  messages?: Record<string, unknown>[] | null;
  attachments?: Record<string, unknown>[] | null;
}

/**
 * Paginated Sessions Response
 */
export interface PaginatedSessionsResponse {
  sessions: SessionDetail[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Session Update Request
 */
export interface SessionUpdateRequest {
  user_marked_failed?: boolean | null;
  status?: 'success' | 'failed' | 'partial' | 'in_progress' | null;
  error_message?: string | null;
}

/**
 * Health Check Response
 */
export interface HealthResponse {
  status: string;
  version?: string;
  providers?: Record<string, string>;
}
