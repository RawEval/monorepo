/**
 * Chat Service
 * 
 * Business logic for chat functionality
 * Separated from UI components for better testability
 */

import { ApiService } from './api-service';
import { llmCallsService } from './llm-calls-service';
import type { ChatMessage, ChatSession } from '@/features/chat/types';

export interface SendMessageOptions {
  sessionId?: string;
  userId?: number;
  model?: 'openai' | 'claude' | 'gemini' | 'grok' | 'deepseek' | 'openrouter';
  modelName?: string;
  systemPrompt?: string;
  temperature?: number;
  files?: File[];
}

export class ChatService extends ApiService {
  /**
   * Send a message and get AI response using LLM Call Host
   */
  async sendMessage(
    message: string,
    options: SendMessageOptions = {},
  ): Promise<ChatMessage> {
    const {
      userId,
      model = 'openai',
      modelName = 'gpt-4o',
      systemPrompt,
      temperature = 0.7,
      files = [],
    } = options;

    try {
      // If files are provided, upload them first
      let fileInputs: Array<{
        file_type: 'pdf' | 'csv' | 'json' | 'image' | 'video' | 'audio' | 'text';
        s3_key?: string | null;
        s3_url?: string | null;
        filename?: string | null;
        content_type?: string | null;
        file_size_bytes?: number | null;
      }> = [];

      if (files.length > 0) {
        const uploadResult = await llmCallsService.uploadFiles(files);
        fileInputs = uploadResult.files.map((file) => ({
          file_type: this.getFileType(file.filename),
          s3_key: file.s3_key,
          s3_url: file.s3_url,
          filename: file.filename,
          file_size_bytes: file.file_size_bytes,
        }));
      }

      // Execute direct LLM call (fastest for chat)
      const response = await llmCallsService.executeDirect(
        {
          provider: model,
          model: modelName,
          prompt: message,
          system_prompt: systemPrompt || null,
          files: fileInputs.length > 0 ? fileInputs : null,
          temperature,
        },
        userId,
      );

      // Convert response to ChatMessage
      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result) {
          return {
            id: response.request_id,
            role: 'assistant',
            content: result.content,
            verified: false,
            createdAt: new Date(result.timestamp),
          };
        }
      }

      throw new Error('No response from LLM');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send message with multi-model comparison
   */
  async sendMessageWithComparison(
    message: string,
    models: Array<{
      provider: 'openai' | 'claude' | 'gemini' | 'grok' | 'deepseek' | 'openrouter';
      model: string;
    }>,
    options: Omit<SendMessageOptions, 'model' | 'modelName'> = {},
  ): Promise<ChatMessage[]> {
    const { sessionId, userId, systemPrompt, temperature = 0.7 } = options;

    try {
      const response = await llmCallsService.executeWorkflow(
        {
          workflow_name: 'chat_comparison',
          workflow_type: 'multi_model_comparison',
          user_prompt: message,
          system_prompt: systemPrompt || null,
          models: models.map((m) => ({
            provider: m.provider,
            model: m.model,
            temperature,
          })),
          session_id: sessionId ? parseInt(sessionId, 10) : null,
        },
        userId,
      );

      // Convert all results to ChatMessages
      return response.results.map((result) => ({
        id: `${response.request_id}-${result.provider}`,
        role: 'assistant' as const,
        content: result.content,
        verified: false,
        createdAt: new Date(result.timestamp),
      }));
    } catch (error) {
      console.error('Error sending message with comparison:', error);
      throw error;
    }
  }

  /**
   * Flag a message as incorrect (mark prompt as wrong)
   */
  async flagMessage(promptId: number): Promise<void> {
    try {
      await this.client.post(`/prompts/${promptId}/mark-wrong`, {});
    } catch (error) {
      console.error('Error flagging message:', error);
      throw error;
    }
  }

  /**
   * Approve a message as correct
   */
  async approveMessage(_messageId: string): Promise<void> {
    // TODO: Implement if endpoint exists
    // For now, this might not be needed as the backend handles this differently
  }

  /**
   * Get chat session conversation history
   */
  async getSession(requestId: string): Promise<ChatSession | null> {
    try {
      const conversation = await llmCallsService.getConversation(requestId);
      
      // Convert conversation to ChatSession format
      const messages: ChatMessage[] = (conversation.conversation_messages || []).map(
        (msg: Record<string, unknown>, index: number) => ({
          id: `${requestId}-${index}`,
          role: (msg.role as 'user' | 'assistant') || 'user',
          content: (msg.content as string) || '',
          verified: false,
          createdAt: new Date((msg.timestamp as string) || new Date().toISOString()),
        }),
      );

      return {
        id: requestId,
        userId: conversation.session_id.toString(),
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Helper to determine file type from filename
   */
  private getFileType(filename: string): 'pdf' | 'csv' | 'json' | 'image' | 'video' | 'audio' | 'text' {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['pdf'].includes(ext)) return 'pdf';
    if (['csv'].includes(ext)) return 'csv';
    if (['json'].includes(ext)) return 'json';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'avi', 'mov', 'webm'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
    return 'text';
  }
}

export const chatService = new ChatService();
