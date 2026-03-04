import { create } from 'zustand';
import type { Provider } from '@raweval/types';
import type { ChatMessage } from '@/features/chat/types';

export type ChatRole = 'user' | 'assistant';

export interface ModelSelection {
  provider: Provider;
  model: string;
}

interface ChatState {
  messagesByProject: Record<string, ChatMessage[]>;
  selectedModel: ModelSelection;
  webSearchEnabled: boolean;
}

interface ChatActions {
  getMessages: (projectId: string) => ChatMessage[];
  sendUserMessage: (
    projectId: string,
    content: string,
    images?: string[]
  ) => void;
  appendAssistantMessage: (
    projectId: string,
    content: string,
    verified?: boolean,
    tempId?: string,
    isStreaming?: boolean
  ) => void;
  clearProject: (projectId: string) => void;
  setSelectedModel: (selection: ModelSelection) => void;
  setMessages: (projectId: string, messages: ChatMessage[]) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  // For streaming: Append token to a specific existing message
  appendToken: (projectId: string, messageId: string, token: string) => void;
  setIsStreaming: (
    projectId: string,
    messageId: string,
    isStreaming: boolean
  ) => void;
}

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export const useChatStore = create<ChatState & ChatActions>()((set, get) => ({
  messagesByProject: {},
  selectedModel: { provider: 'openai', model: 'gpt-4o-mini' },
  webSearchEnabled: false,

  getMessages: (projectId) => get().messagesByProject[projectId] ?? [],

  sendUserMessage: (projectId, content, images) => {
    const trimmed = content.trim();
    if (!trimmed && !images?.length) return;
    const msg: ChatMessage = {
      id: newId('u'),
      role: 'user',
      content: trimmed,
      images,
      createdAt: Date.now(),
    };
    set((s) => ({
      messagesByProject: {
        ...s.messagesByProject,
        [projectId]: [...(s.messagesByProject[projectId] ?? []), msg],
      },
    }));
  },

  appendAssistantMessage: (
    projectId,
    content,
    verified,
    tempId,
    isStreaming
  ) => {
    const msg: ChatMessage = {
      id: tempId || newId('a'),
      role: 'assistant',
      content,
      verified,
      createdAt: Date.now(),
      isStreaming: isStreaming ?? false,
    };
    set((s) => ({
      messagesByProject: {
        ...s.messagesByProject,
        [projectId]: [...(s.messagesByProject[projectId] ?? []), msg],
      },
    }));
  },

  appendToken: (projectId, messageId, token) =>
    set((s) => {
      const messages = s.messagesByProject[projectId] ?? [];
      const updatedMessages = messages.map((m) =>
        m.id === messageId ? { ...m, content: m.content + token } : m
      );
      return {
        messagesByProject: {
          ...s.messagesByProject,
          [projectId]: updatedMessages,
        },
      };
    }),

  setIsStreaming: (projectId, messageId, isStreaming) =>
    set((s) => {
      const messages = s.messagesByProject[projectId] ?? [];
      const updatedMessages = messages.map((m) =>
        m.id === messageId ? { ...m, isStreaming } : m
      );
      return {
        messagesByProject: {
          ...s.messagesByProject,
          [projectId]: updatedMessages,
        },
      };
    }),

  clearProject: (projectId) =>
    set((s) => ({
      messagesByProject: { ...s.messagesByProject, [projectId]: [] },
    })),

  setSelectedModel: (selection) => set({ selectedModel: selection }),
  setMessages: (projectId, messages) =>
    set((s) => ({
      messagesByProject: { ...s.messagesByProject, [projectId]: messages },
    })),
  setWebSearchEnabled: (enabled) => set({ webSearchEnabled: enabled }),
}));
