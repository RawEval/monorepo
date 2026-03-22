export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  verified?: boolean;
  images?: string[];
  createdAt: number;
  isStreaming?: boolean;
  isFailed?: boolean;
  model?: string;
  provider?: string;
  /** Groups multiple model responses for the same prompt */
  groupId?: string;
  /** Per-model completion stats */
  latencyMs?: number;
  tokensUsed?: { prompt?: number; completion?: number; total?: number };
  /** Per-model error */
  modelError?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  workspaceId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
