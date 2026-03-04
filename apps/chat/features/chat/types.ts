export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  verified?: boolean;
  images?: string[];
  createdAt: number;
  isStreaming?: boolean;
  isFailed?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  workspaceId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
