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
  selectedModels: ModelSelection[];
  compareMode: boolean;
  webSearchEnabled: boolean;
}

interface ChatActions {
  getMessages: (projectId: string) => ChatMessage[];
  sendUserMessage: (projectId: string, content: string, images?: string[]) => void;
  appendAssistantMessage: (
    projectId: string,
    content: string,
    verified?: boolean,
    tempId?: string,
    isStreaming?: boolean,
    model?: string,
    provider?: string,
    groupId?: string,
  ) => void;
  clearProject: (projectId: string) => void;
  setSelectedModel: (selection: ModelSelection) => void;
  setMessages: (projectId: string, messages: ChatMessage[]) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  updateMessage: (projectId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  appendToken: (projectId: string, messageId: string, token: string) => void;
  setIsStreaming: (projectId: string, messageId: string, isStreaming: boolean) => void;
  setCompareMode: (enabled: boolean) => void;
  setSelectedModels: (models: ModelSelection[]) => void;
  toggleModelInComparison: (model: ModelSelection) => void;
}

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export const useChatStore = create<ChatState & ChatActions>()((set, get) => ({
  messagesByProject: {},
  selectedModel: { provider: 'openai' as Provider, model: 'gpt-4o' },
  selectedModels: [],
  compareMode: false,
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

  appendAssistantMessage: (projectId, content, verified, tempId, isStreaming, model, provider, groupId) => {
    const msg: ChatMessage = {
      id: tempId || newId('a'),
      role: 'assistant',
      content,
      verified,
      createdAt: Date.now(),
      isStreaming: isStreaming ?? false,
      model,
      provider,
      groupId,
    };
    set((s) => ({
      messagesByProject: {
        ...s.messagesByProject,
        [projectId]: [...(s.messagesByProject[projectId] ?? []), msg],
      },
    }));
  },

  updateMessage: (projectId, messageId, updates) =>
    set((s) => ({
      messagesByProject: {
        ...s.messagesByProject,
        [projectId]: (s.messagesByProject[projectId] ?? []).map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
      },
    })),

  appendToken: (projectId, messageId, token) =>
    set((s) => ({
      messagesByProject: {
        ...s.messagesByProject,
        [projectId]: (s.messagesByProject[projectId] ?? []).map((m) =>
          m.id === messageId ? { ...m, content: m.content + token } : m
        ),
      },
    })),

  setIsStreaming: (projectId, messageId, isStreaming) =>
    set((s) => ({
      messagesByProject: {
        ...s.messagesByProject,
        [projectId]: (s.messagesByProject[projectId] ?? []).map((m) =>
          m.id === messageId ? { ...m, isStreaming } : m
        ),
      },
    })),

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

  setCompareMode: (enabled) =>
    set((s) => {
      if (!enabled && s.selectedModels.length > 0) {
        const first = s.selectedModels[0]!;
        return { compareMode: false, selectedModel: first, selectedModels: [first] };
      }
      return { compareMode: enabled };
    }),

  setSelectedModels: (models) => set({ selectedModels: models }),

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
        ...(next.length > 0 ? { selectedModel: next[0] } : {}),
      };
    }),
}));
