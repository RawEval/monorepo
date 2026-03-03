import { ApiClient } from '../client';
import { getLlmCallsApiUrl } from '../config';
import {
  WorkflowRequest,
  WorkflowResponse,
  DynamicLLMRequest,
  BatchLLMRequest,
  HealthResponse,
} from '@raweval/types';

export class LLMCallsService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  /**
   * Execute Workflow-Based LLM Call
   * POST /execute
   */
  async executeWorkflow(
    request: WorkflowRequest,
    userId?: number
  ): Promise<WorkflowResponse> {
    const url = getLlmCallsApiUrl('/execute');
    const queryParams = userId ? `?user_id=${userId}` : '';

    const response = await this.client.post<WorkflowResponse>(
      `${url}${queryParams}`,
      request
    );

    return response;
  }

  /**
   * Execute Direct LLM Call
   * POST /dynamic/execute
   */
  async executeDirect(
    request: DynamicLLMRequest,
    userId?: number
  ): Promise<WorkflowResponse> {
    const url = getLlmCallsApiUrl('/dynamic/execute');
    const queryParams = userId ? `?user_id=${userId}` : '';

    const response = await this.client.post<WorkflowResponse>(
      `${url}${queryParams}`,
      request
    );

    return response;
  }

  /**
   * Execute Batch LLM Calls
   * POST /dynamic/batch
   */
  async executeBatch(
    request: BatchLLMRequest,
    userId?: number
  ): Promise<WorkflowResponse> {
    const url = getLlmCallsApiUrl('/dynamic/batch');
    const queryParams = userId ? `?user_id=${userId}` : '';

    const response = await this.client.post<WorkflowResponse>(
      `${url}${queryParams}`,
      request
    );

    return response;
  }

  /**
   * Upload Files for LLM Processing
   * POST /upload-files
   */
  async uploadFiles(files: File[]): Promise<any> {
    const url = getLlmCallsApiUrl('/upload-files');
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Content-Type header will be set automatically by browser/client for FormData
    const response = await this.client.post<any>(url, formData);

    return response;
  }

  /**
   * Get Request Status
   * GET /status/{request_id}
   */
  async getStatus(requestId: string): Promise<any> {
    const url = getLlmCallsApiUrl(`/status/${requestId}`);
    const response = await this.client.get<any>(url);

    return response;
  }

  /**
   * Get Request Results
   * GET /results/{request_id}
   */
  async getResults(requestId: string): Promise<WorkflowResponse> {
    const url = getLlmCallsApiUrl(`/results/${requestId}`);
    const response = await this.client.get<WorkflowResponse>(url);

    return response;
  }

  /**
   * Get Session Conversation History
   * GET /sessions/{request_id}/conversation
   */
  async getConversation(sessionId: string): Promise<any> {
    const url = getLlmCallsApiUrl(`/sessions/${sessionId}/conversation`);
    const response = await this.client.get<any>(url);

    return response;
  }

  /**
   * Check API Health
   * GET /health
   */
  async checkHealth(): Promise<HealthResponse> {
    const url = getLlmCallsApiUrl('/health');
    const response = await this.client.get<HealthResponse>(url);

    return response;
  }
}
