/**
 * LLM Calls Service
 * 
 * Service for interacting with the LLM Call Host API
 * Handles chat, multi-model queries, and workflow execution
 */

import { ApiService } from './api-service';
import { getLlmCallsApiUrl } from '@raweval/api-client';

export interface WorkflowRequest {
  workflow_name: string;
  workflow_type: 'single_model' | 'multi_model_comparison' | 'parallel_processing' | 'file_processing' | 'autograder' | 'dynamic_model_call' | 'research' | 'code_analysis' | 'sentiment_analysis' | 'summarization' | 'translation' | 'classification' | 'qa_generation';
  user_prompt: string;
  system_prompt?: string | null;
  models: Array<{
    provider: 'openai' | 'claude' | 'gemini' | 'grok' | 'deepseek' | 'openrouter';
    model: string;
    system_prompt?: string | null;
    temperature?: number;
    max_tokens?: number | null;
    top_p?: number | null;
    frequency_penalty?: number | null;
    presence_penalty?: number | null;
  }>;
  files?: Array<{
    file_type: 'pdf' | 'csv' | 'json' | 'image' | 'video' | 'audio' | 'text';
    url?: string | null;
    base64?: string | null;
    s3_key?: string | null;
    s3_url?: string | null;
    attachment_location?: string | null;
    filename?: string | null;
    content_type?: string | null;
    file_size_bytes?: number | null;
  }> | null;
  session_id?: number | null;
  request_id?: string | null;
  conversation_messages?: Array<Record<string, unknown>> | null;
  use_langgraph?: boolean;
  langgraph_config?: Record<string, unknown> | null;
  webhook_url?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface DynamicLLMRequest {
  provider: 'openai' | 'claude' | 'gemini' | 'grok' | 'deepseek' | 'openrouter';
  model: string;
  prompt: string;
  system_prompt?: string | null;
  files?: Array<{
    file_type: 'pdf' | 'csv' | 'json' | 'image' | 'video' | 'audio' | 'text';
    url?: string | null;
    base64?: string | null;
    s3_key?: string | null;
    s3_url?: string | null;
    attachment_location?: string | null;
    filename?: string | null;
    content_type?: string | null;
    file_size_bytes?: number | null;
  }> | null;
  temperature?: number;
  max_tokens?: number | null;
  top_p?: number | null;
  frequency_penalty?: number | null;
  presence_penalty?: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface WorkflowResponse {
  workflow_name: string;
  workflow_type: string;
  request_id: string;
  status: 'success' | 'partial' | 'failed';
  results: Array<{
    provider: string;
    model: string;
    content: string;
    tokens_used?: {
      input: number;
      output: number;
      total: number;
    } | null;
    latency_ms: number;
    timestamp: string;
    metadata?: Record<string, unknown>;
    error?: string | null;
  }>;
  total_latency_ms: number;
  timestamp: string;
  error?: string | null;
  metadata?: Record<string, unknown>;
  session_id?: number | null;
  attachments?: Array<Record<string, unknown>> | null;
  conversation_turn_count?: number | null;
  conversation_messages?: Array<Record<string, unknown>> | null;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  providers: Record<string, string>;
}

export class LLMCallsService extends ApiService {
  /**
   * Check LLM Call Host health status
   * Endpoint: /llm-calls/health
   */
  async checkHealth(): Promise<HealthResponse> {
    // Health endpoint is at /llm-calls/health (not /health)
    const url = getLlmCallsApiUrl('/health');
    const response = await this.client.get<HealthResponse>(url, {
      skipAuth: true,
    });
    return this.handleResponse(response);
  }

  /**
   * Execute a workflow-based LLM call
   */
  async executeWorkflow(
    request: WorkflowRequest,
    userId?: number,
  ): Promise<WorkflowResponse> {
    const url = getLlmCallsApiUrl('/llm-calls/execute');
    const queryParams = userId ? `?user_id=${userId}` : '';
    
    const response = await this.client.post<WorkflowResponse>(
      `${url}${queryParams}`,
      request,
    );
    return this.handleResponse(response);
  }

  /**
   * Execute a direct LLM call (fastest, single model)
   */
  async executeDirect(
    request: DynamicLLMRequest,
    userId?: number,
  ): Promise<WorkflowResponse> {
    const url = getLlmCallsApiUrl('/dynamic-llm-calls/execute');
    const queryParams = userId ? `?user_id=${userId}` : '';
    
    const response = await this.client.post<WorkflowResponse>(
      `${url}${queryParams}`,
      request,
    );
    return this.handleResponse(response);
  }

  /**
   * Execute batch LLM calls
   */
  async executeBatch(
    requests: DynamicLLMRequest[],
    parallel: boolean = false,
    userId?: number,
    timeout?: number,
  ): Promise<WorkflowResponse> {
    const url = getLlmCallsApiUrl('/dynamic-llm-calls/batch');
    const queryParams = userId ? `?user_id=${userId}` : '';
    
    const response = await this.client.post<WorkflowResponse>(
      `${url}${queryParams}`,
      {
        requests,
        parallel,
        timeout,
      },
    );
    return this.handleResponse(response);
  }

  /**
   * Get request status
   */
  async getStatus(requestId: string): Promise<{
    status: string;
    request_id: string;
    [key: string]: unknown;
  }> {
    const url = getLlmCallsApiUrl(`/status/${requestId}`);
    const response = await this.client.get<{
      status: string;
      request_id: string;
      [key: string]: unknown;
    }>(url);
    return this.handleResponse(response);
  }

  /**
   * Get request results
   */
  async getResults(requestId: string): Promise<WorkflowResponse> {
    const url = getLlmCallsApiUrl(`/results/${requestId}`);
    const response = await this.client.get<WorkflowResponse>(url);
    return this.handleResponse(response);
  }

  /**
   * Get session conversation history
   */
  async getConversation(requestId: string): Promise<{
    session_id: number;
    conversation_messages: Array<Record<string, unknown>>;
    [key: string]: unknown;
  }> {
    const url = getLlmCallsApiUrl(`/sessions/${requestId}/conversation`);
    const response = await this.client.get<{
      session_id: number;
      conversation_messages: Array<Record<string, unknown>>;
      [key: string]: unknown;
    }>(url);
    return this.handleResponse(response);
  }

  /**
   * Upload files for LLM processing
   */
  async uploadFiles(files: File[]): Promise<{
    files: Array<{
      s3_key: string;
      s3_url: string;
      filename: string;
      file_type: string;
      file_size_bytes: number;
    }>;
  }> {
    const url = getLlmCallsApiUrl('/llm-calls/upload-files');
    
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.client.post<{
      files: Array<{
        s3_key: string;
        s3_url: string;
        filename: string;
        file_type: string;
        file_size_bytes: number;
      }>;
    }>(url, formData, {
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      },
    });
    return this.handleResponse(response);
  }
}

export const llmCallsService = new LLMCallsService();
