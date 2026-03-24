/**
 * Chat Service — ported from apps/chat/services/chat-service.ts
 */

import { api, API_BASE_URL, API_VER } from '@/lib/api';
import type { ChatMessage } from '@/features/chat/types';
import type {
  PaginatedSessionsResponse,
  SessionDetail,
  SessionUpdateRequest,
  Provider,
  MarkSessionFailedRequest,
  MarkSessionFailedResponse,
  MarkMessageFailedRequest,
  MarkMessageFailedResponse,
  DomainListResponse,
  ConversationDomainsResponse,
} from '@raweval/types';
import { getStoredToken } from '@/lib/auth';

export interface SendMessageOptions {
  sessionId?: string;
  backendSessionId?: number;
  userId?: number;
  model?: Provider | string;
  modelName?: string;
  models?: { provider: string; model: string }[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  webSearch?: boolean;
  attachmentIds?: number[];
}

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

interface CreateSessionRequest {
  title?: string;
  workflow_type?:
    | 'single_model'
    | 'parallel_processing'
    | 'chain_of_thought'
    | 'tool_use';
}

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
  async createSession(data?: CreateSessionRequest): Promise<ChatSessionSummary> {
    return api.post<ChatSessionSummary>('/chat/sessions', data || {});
  }

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

  async getChatSessionById(
    sessionId: number,
    includeMessages = true,
    includeAttachments = true
  ): Promise<SessionDetail> {
    return api.get<SessionDetail>(
      `/chat/sessions/${sessionId}?include_messages=${includeMessages}&include_attachments=${includeAttachments}`
    );
  }

  async deleteChatSession(sessionId: number): Promise<void> {
    return api.delete<void>(`/chat/sessions/${sessionId}`);
  }

  async updateChatSession(
    sessionId: number,
    request: SessionUpdateRequest
  ): Promise<ChatSessionSummary> {
    return api.patch<ChatSessionSummary>(
      `/chat/sessions/${sessionId}`,
      request
    );
  }

  async markSessionFailed(
    sessionId: number,
    request: MarkSessionFailedRequest = {}
  ): Promise<MarkSessionFailedResponse> {
    return api.post<MarkSessionFailedResponse>(
      `/chat/sessions/${sessionId}/mark-failed`,
      request
    );
  }

  async markMessageFailed(
    sessionId: number,
    messageId: number,
    request: MarkMessageFailedRequest = {}
  ): Promise<MarkMessageFailedResponse> {
    return api.post<MarkMessageFailedResponse>(
      `/chat/sessions/${sessionId}/messages/${messageId}/mark-failed`,
      request
    );
  }

  async sendMessage(
    sessionId: number,
    message: string,
    options: Omit<SendMessageOptions, 'sessionId' | 'backendSessionId'> = {}
  ): Promise<ChatMessage & { backendSessionId?: number }> {
    const {
      model,
      modelName,
      models,
      systemPrompt,
      temperature = 0.7,
      maxTokens,
      webSearch = false,
      attachmentIds,
    } = options;

    const modelList =
      models && models.length > 0
        ? models.map((m) => ({ ...m, temperature }))
        : [{ provider: model || 'openai', model: modelName || 'gpt-4o-mini', temperature }];

    const body: Record<string, unknown> = {
      prompt: message,
      models: modelList,
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
   * Stream a message using XMLHttpRequest (React Native compatible).
   * React Native's fetch() does NOT support ReadableStream/getReader(),
   * so we use XHR with onprogress which gives us incremental responseText.
   */
  async streamMessage(
    sessionId: number,
    message: string,
    options: Omit<SendMessageOptions, 'sessionId' | 'backendSessionId'> = {},
    callbacks: {
      onStart?: (data: unknown) => void;
      onChunk?: (provider: string, model: string, delta: string) => void;
      onModelComplete?: (data: unknown) => void;
      onModelError?: (data: { provider: string; model: string; error: string }) => void;
      onDone?: (data: unknown) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    const {
      model,
      modelName,
      models,
      systemPrompt,
      temperature = 0.7,
      webSearch = false,
      attachmentIds,
    } = options;

    const modelList =
      models && models.length > 0
        ? models.map((m) => ({ ...m, temperature }))
        : [{ provider: model || 'openai', model: modelName || 'gpt-4o-mini', temperature }];

    const body: Record<string, unknown> = {
      prompt: message,
      models: modelList,
      include_history: true,
      web_search: webSearch,
    };
    if (systemPrompt) body.system_prompt = systemPrompt;
    if (attachmentIds?.length) body.attachment_ids = attachmentIds;

    const token = await getStoredToken();
    const url = `${API_BASE_URL}/api/${API_VER}/chat/sessions/${sessionId}/messages/stream`;

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let processedLength = 0;
      let buffer = '';

      const processSSE = (text: string) => {
        buffer += text;
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          if (!block.trim()) continue;
          const blockLines = block.split('\n');
          let eventType = 'message';
          let dataStr = '';

          for (const line of blockLines) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataStr += line.slice(5).trim();
            }
          }

          if (!dataStr) continue;

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
                if (callbacks.onModelError) {
                  callbacks.onModelError({ provider: data.provider, model: data.model, error: data.error });
                } else {
                  callbacks.onError?.(new Error(data.error));
                }
                break;
              case 'done':
                callbacks.onDone?.(data);
                resolve();
                return;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      };

      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'text/event-stream');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.onprogress = () => {
        const newText = xhr.responseText.slice(processedLength);
        processedLength = xhr.responseText.length;
        if (newText) {
          processSSE(newText);
        }
      };

      xhr.onload = () => {
        // Process any remaining data
        const remaining = xhr.responseText.slice(processedLength);
        if (remaining) {
          processSSE(remaining);
        }
        // If we haven't resolved yet (no 'done' event), resolve now
        resolve();
      };

      xhr.onerror = () => {
        const err = new Error(`Stream request failed: ${xhr.status}`);
        callbacks.onError?.(err);
        reject(err);
      };

      xhr.ontimeout = () => {
        const err = new Error('Stream request timed out');
        callbacks.onError?.(err);
        reject(err);
      };

      xhr.timeout = 120000; // 2 minute timeout for streaming
      xhr.send(JSON.stringify(body));
    });
  }

  async executeChatSession(
    message: string,
    options: SendMessageOptions = {}
  ): Promise<ChatMessage & { backendSessionId?: number }> {
    const { backendSessionId, model, modelName, models, systemPrompt, temperature = 0.7 } = options;

    let sessionId = backendSessionId;
    if (!sessionId) {
      const session = await this.createSession({ workflow_type: 'single_model' });
      sessionId = session.id;
    }

    return this.sendMessage(sessionId, message, {
      model,
      modelName,
      models,
      systemPrompt,
      temperature,
    });
  }

  /** Upload a file/image to a chat session (React Native compatible) */
  async uploadAttachment(
    sessionId: number,
    file: { uri: string; name: string; type: string } | File
  ): Promise<{ attachment_id: number; filename: string; content_type: string; file_size_bytes: number; s3_key: string }> {
    const formData = new FormData();
    formData.append('file', file as unknown as Blob);
    return api.post(`/chat/sessions/${sessionId}/upload`, formData);
  }

  async getAvailableModels(provider?: string): Promise<unknown> {
    const query = provider ? `?provider=${provider}` : '';
    return api.get<unknown>(`/chat/models${query}`);
  }

  async getProviders(): Promise<unknown> {
    return api.get<unknown>('/chat/providers');
  }

  async getDomains(): Promise<DomainListResponse> {
    return api.get<DomainListResponse>('/chat/failure/domains');
  }

  async getSessionDomains(sessionId: number): Promise<ConversationDomainsResponse> {
    return api.get<ConversationDomainsResponse>(`/chat/sessions/${sessionId}/domains`);
  }

  async getStats(): Promise<Record<string, unknown>> {
    return api.get('/chat/stats');
  }
}

export const chatService = new ChatService();
