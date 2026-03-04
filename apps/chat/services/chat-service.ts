/**
 * Chat Service
 *
 * Session management and messaging via /api/v1/chat/sessions/*.
 * Search and models via /api/v1/chat/search/* and /api/v1/chat/models.
 * Migrated from llmApi to main api per the consumer-based API reorganization.
 */

import { api } from '@/lib/api';
import type { ChatMessage } from '@/features/chat/types';
import type {
  PaginatedSessionsResponse,
  SessionDetail,
  SessionUpdateRequest,
  Provider,
} from '@raweval/types';
import { getStoredToken } from '@/lib/auth';

export interface SendMessageOptions {
  sessionId?: string; // Local Project ID
  backendSessionId?: number; // Backend Session ID (Integer)
  userId?: number;
  model?: Provider | string;
  modelName?: string;
  models?: { provider: string; model: string }[]; // Array of model objects for multi-model parallel generation
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  webSearch?: boolean;
  files?: File[];
  attachmentIds?: number[];
}

/** Response shape from POST /chat/sessions/{id}/messages */
interface SendMessageResponse {
  user_message: {
    id: number;
    role: string;
    content: string;
    model?: string;
    provider?: string;
    tokens_used?: number;
    latency_ms?: number;
    created_at: string;
  };
  assistant_messages: {
    id: number;
    role: string;
    content: string;
    model?: string;
    provider?: string;
    tokens_used?: number;
    latency_ms?: number;
    created_at: string;
  }[];
}

/** Response shape from POST /chat/sessions */
interface CreateSessionRequest {
  title?: string;
  workflow_type?:
    | 'single_model'
    | 'parallel_processing'
    | 'chain_of_thought'
    | 'tool_use';
}

/** Response shape from POST /chat/sessions/{id}/upload */
interface UploadAttachmentResponse {
  attachment_id: number;
  filename: string;
  content_type: string;
  file_size_bytes: number;
  s3_key: string;
}

/** Chat session summary */
interface ChatSessionSummary {
  id: number;
  user_id: number;
  title: string;
  status: string;
  workflow_type: string;
  message_count: number;
  user_marked_failed: boolean;
  created_at: string;
  updated_at: string;
}

class ChatService {
  // ---------------------------------------------------------------------------
  // Session CRUD
  // ---------------------------------------------------------------------------

  /** Create a new chat session */
  async createSession(
    data?: CreateSessionRequest
  ): Promise<ChatSessionSummary> {
    return api.post<ChatSessionSummary>('/chat/sessions', data || {});
  }

  /** List paginated chat sessions */
  async getChatSessions(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    failed_only?: boolean;
  }): Promise<PaginatedSessionsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<PaginatedSessionsResponse>(
      `/chat/sessions${query ? `?${query}` : ''}`
    );
  }

  /** Get a single chat session by ID (with messages + attachments) */
  async getChatSessionById(
    sessionId: number,
    includeMessages = true,
    includeAttachments = true
  ): Promise<SessionDetail> {
    return api.get<SessionDetail>(
      `/chat/sessions/${sessionId}?include_messages=${includeMessages}&include_attachments=${includeAttachments}`
    );
  }

  /** Delete a chat session permanently */
  async deleteChatSession(sessionId: number): Promise<void> {
    return api.delete<void>(`/chat/sessions/${sessionId}`);
  }

  /** Update chat session status, title, or user_marked_failed */
  async updateChatSession(
    sessionId: number,
    request: SessionUpdateRequest
  ): Promise<ChatSessionSummary> {
    return api.patch<ChatSessionSummary>(
      `/chat/sessions/${sessionId}`,
      request
    );
  }

  /** Mark a session as failed */
  async markSessionFailed(
    sessionId: number,
    failureProbability = 1.0
  ): Promise<ChatSessionSummary> {
    return api.post<ChatSessionSummary>(
      `/chat/sessions/${sessionId}/mark-failed`,
      { failure_probability: failureProbability }
    );
  }

  /** Mark a specific message within a session as failed */
  async markMessageFailed(
    sessionId: number,
    messageId: number,
    failureProbability = 1.0
  ): Promise<Record<string, unknown>> {
    return api.post<Record<string, unknown>>(
      `/chat/sessions/${sessionId}/messages/${messageId}/mark-failed`,
      { failure_probability: failureProbability }
    );
  }

  // ---------------------------------------------------------------------------
  // Messaging
  // ---------------------------------------------------------------------------

  /**
   * Send a message and get an LLM response via /chat/sessions/{id}/messages.
   * This is the primary chat endpoint — replaces the old llmApi /execute flow.
   */
  async sendMessage(
    sessionId: number,
    message: string,
    options: Omit<SendMessageOptions, 'sessionId' | 'backendSessionId'> = {}
  ): Promise<ChatMessage & { backendSessionId?: number }> {
    const {
      model = 'openai',
      modelName = 'gpt-4o',
      models,
      systemPrompt,
      temperature = 0.7,
      maxTokens,
      webSearch = false,
      attachmentIds,
    } = options;

    const body: Record<string, unknown> = {
      prompt: message, // backend expects 'prompt' instead of 'content'
      provider: model,
      model: modelName,
      models:
        models && models.length > 0
          ? models
          : [{ provider: model, model: modelName }], // send array of objects
      temperature,
      include_history: true,
      web_search: webSearch,
    };
    if (systemPrompt) body.system_prompt = systemPrompt;
    if (maxTokens) body.max_tokens = maxTokens;
    if (attachmentIds?.length) body.attachment_ids = attachmentIds;

    const response = await api.post<SendMessageResponse>(
      `/chat/sessions/${sessionId}/messages`,
      body
    );

    const assistantMsg = response.assistant_messages?.[0];
    if (!assistantMsg) {
      throw new Error('No assistant message returned from API');
    }

    return {
      id: String(assistantMsg.id),
      role: 'assistant',
      content: assistantMsg.content,
      verified: false,
      createdAt: new Date(assistantMsg.created_at).getTime(),
      backendSessionId: sessionId,
    };
  }

  /**
   * Stream a message and get an LLM response via /chat/sessions/{id}/messages/stream.
   * This uses the standard fetch API to decode the Server-Sent Events stream incrementally.
   */
  async streamMessage(
    sessionId: number,
    message: string,
    options: Omit<SendMessageOptions, 'sessionId' | 'backendSessionId'> = {},
    callbacks: {
      onStart?: (data: any) => void;
      onChunk?: (provider: string, model: string, delta: string) => void;
      onModelComplete?: (data: any) => void;
      onDone?: (data: any) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    const {
      model = 'openai',
      modelName = 'gpt-4o',
      models,
      systemPrompt,
      temperature = 0.7,
      maxTokens,
      webSearch = false,
      attachmentIds,
    } = options;

    const body: Record<string, unknown> = {
      prompt: message,
      provider: model,
      model: modelName,
      models:
        models && models.length > 0
          ? models
          : [{ provider: model, model: modelName }],
      temperature,
      include_history: true,
      web_search: webSearch,
    };
    if (systemPrompt) body.system_prompt = systemPrompt;
    if (maxTokens) body.max_tokens = maxTokens;
    if (attachmentIds?.length) body.attachment_ids = attachmentIds;

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'https://api.raweval.com';
      const response = await fetch(
        `${baseUrl}/api/v1/chat/sessions/${sessionId}/messages/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(getStoredToken()
              ? { Authorization: `Bearer ${getStoredToken()}` }
              : {}),
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        let errorMsg = `Streaming API Error: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData?.error?.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      if (!response.body) {
        throw new Error('No readable stream available in the response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');

        // The last element is either empty (if buffer ended with \n\n) or
        // an incomplete event block, so we keep it in the buffer.
        buffer = lines.pop() || '';

        for (const block of lines) {
          const linesInBlock = block.split('\n');
          let eventType = 'message';
          let dataStr = '';

          for (const line of linesInBlock) {
            if (line.startsWith('event:')) {
              eventType = line.replace('event:', '').trim();
            } else if (line.startsWith('data:')) {
              // Reconstruct potentially multi-line data payloads
              // by stripping the prefix "data:" from each data line.
              // Note: SSE data parsing natively usually appends newlines unless it's JSON.
              dataStr += line.substring(5).trim();
            }
          }

          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              switch (eventType) {
                case 'stream_start':
                  callbacks.onStart?.(data);
                  break;
                case 'chunk':
                  callbacks.onChunk?.(data.provider, data.model, data.delta);
                  break;
                case 'model_complete':
                  callbacks.onModelComplete?.(data);
                  break;
                case 'model_error':
                  callbacks.onError?.(new Error(data.error));
                  break;
                case 'done':
                  callbacks.onDone?.(data);
                  return; // End the stream successfully
              }
            } catch (e) {
              console.error(
                'Failed to parse SSE JSON data:',
                e,
                'Data string:',
                dataStr
              );
            }
          }
        }
      }
    } catch (err) {
      callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }

  /**
   * High-level helper: ensures a session exists on the backend, sends the
   * message, and returns the response. Used by the useChat hook.
   */
  async executeChatSession(
    message: string,
    options: SendMessageOptions = {}
  ): Promise<ChatMessage & { backendSessionId?: number }> {
    const {
      backendSessionId,
      model = 'openai',
      modelName = 'gpt-4o',
      models,
      systemPrompt,
      temperature = 0.7,
      files = [],
    } = options;

    try {
      // Ensure we have a backend session
      let sessionId = backendSessionId;
      if (!sessionId) {
        const session = await this.createSession({
          workflow_type: 'single_model',
        });
        sessionId = session.id;
      }

      // Upload attachments if any
      let attachmentIds: number[] = [];
      if (files.length > 0) {
        for (const file of files) {
          const att = await this.uploadAttachment(sessionId, file);
          attachmentIds.push(att.attachment_id);
        }
      }

      // Send the message
      return await this.sendMessage(sessionId, message, {
        model,
        modelName,
        models,
        systemPrompt,
        temperature,
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
      });
    } catch (error) {
      // The error is intentionally thrown so React Query's `onError` callback
      // inside `use-chat.ts` can catch it and handle subscriptions UX gracefully.
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // File Uploads
  // ---------------------------------------------------------------------------

  /** Upload a file/image to a chat session */
  async uploadAttachment(
    sessionId: number,
    file: File
  ): Promise<UploadAttachmentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<UploadAttachmentResponse>(
      `/chat/sessions/${sessionId}/upload`,
      formData
    );
  }

  // ---------------------------------------------------------------------------
  // Models & Providers
  // ---------------------------------------------------------------------------

  /** Get available models, optionally filtered by provider */
  async getAvailableModels(provider?: string): Promise<any> {
    const query = provider ? `?provider=${provider}` : '';
    return api.get<any>(`/chat/models${query}`);
  }

  /** Get available providers */
  async getProviders(): Promise<any> {
    return api.get<any>('/chat/providers');
  }

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  /** Get chat usage statistics */
  async getStats(): Promise<Record<string, unknown>> {
    return api.get('/chat/stats');
  }
}

export const chatService = new ChatService();
