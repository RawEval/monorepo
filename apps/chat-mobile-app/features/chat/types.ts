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
  groupId?: string;
  latencyMs?: number;
  tokensUsed?: { prompt?: number; completion?: number; total?: number };
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
