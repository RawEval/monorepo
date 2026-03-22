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
  selectedModels: ModelSelection[];
  compareMode: boolean;
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
  setSelectedModels: (models: ModelSelection[]) => void;
  setCompareMode: (enabled: boolean) => void;
  toggleModelInComparison: (model: ModelSelection) => void;
  /** Update specific fields on a message */
  updateMessage: (projectId: string, messageId: string, updates: Partial<ChatMessage>) => void;
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
  selectedModel: { provider: 'openai' as Provider, model: 'gpt-4o-mini' },
  webSearchEnabled: false,
  selectedModels: [],
  compareMode: false,

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

  updateMessage: (projectId, messageId, updates) =>
    set((s) => {
      const messages = s.messagesByProject[projectId] ?? [];
      return {
        messagesByProject: {
          ...s.messagesByProject,
          [projectId]: messages.map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          ),
        },
      };
    }),

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
  setSelectedModels: (models) => set({ selectedModels: models }),
  setCompareMode: (enabled) =>
    set((s) => {
      if (!enabled && s.selectedModels.length > 0) {
        const first = s.selectedModels[0]!;
        return {
          compareMode: false,
          selectedModel: first,
          selectedModels: [first],
        };
      }
      return { compareMode: enabled };
    }),
  toggleModelInComparison: (model) =>
    set((s) => {
      const exists = s.selectedModels.some(
        (m) => m.provider === model.provider && m.model === model.model
      );
      let next: ModelSelection[];
      if (exists) {
        next = s.selectedModels.filter(
          (m) => !(m.provider === model.provider && m.model === model.model)
        );
      } else {
        if (s.selectedModels.length >= 4) return {};
        next = [...s.selectedModels, model];
      }
      return {
        selectedModels: next,
        compareMode: next.length > 1,
        // Keep selectedModel in sync with first selection
        ...(next.length > 0 ? { selectedModel: next[0] } : {}),
      };
    }),
}));
