import { create } from 'zustand';
import type { Provider } from '@raweval/types';

export type ChatRole = 'user' | 'assistant';

export interface ModelSelection {
  provider: Provider;
  model: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  images?: string[];
  verified?: boolean;
  createdAt: number; // epoch ms
}

interface ChatState {
  messagesByProject: Record<string, ChatMessage[]>;
  typingByProject: Record<string, boolean>;
  selectedModel: ModelSelection;
}

interface ChatActions {
  getMessages: (projectId: string) => ChatMessage[];
  isTyping: (projectId: string) => boolean;
  sendUserMessage: (
    projectId: string,
    content: string,
    images?: string[]
  ) => void;
  appendAssistantMessage: (
    projectId: string,
    content: string,
    verified?: boolean
  ) => void;
  setTyping: (projectId: string, typing: boolean) => void;
  clearProject: (projectId: string) => void;
  setSelectedModel: (selection: ModelSelection) => void;
  setMessages: (projectId: string, messages: ChatMessage[]) => void;
}

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export const useChatStore = create<ChatState & ChatActions>()((set, get) => ({
  messagesByProject: {},
  typingByProject: {},
  selectedModel: { provider: 'openai', model: 'gpt-4o' },

  getMessages: (projectId) => get().messagesByProject[projectId] ?? [],
  isTyping: (projectId) => Boolean(get().typingByProject[projectId]),

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

  appendAssistantMessage: (projectId, content, verified) => {
    const msg: ChatMessage = {
      id: newId('a'),
      role: 'assistant',
      content,
      verified,
      createdAt: Date.now(),
    };
    set((s) => ({
      messagesByProject: {
        ...s.messagesByProject,
        [projectId]: [...(s.messagesByProject[projectId] ?? []), msg],
      },
    }));
  },

  setTyping: (projectId, typing) =>
    set((s) => ({
      typingByProject: { ...s.typingByProject, [projectId]: typing },
    })),

  clearProject: (projectId) =>
    set((s) => ({
      messagesByProject: { ...s.messagesByProject, [projectId]: [] },
      typingByProject: { ...s.typingByProject, [projectId]: false },
    })),

  setSelectedModel: (selection) => set({ selectedModel: selection }),
  setMessages: (projectId, messages) =>
    set((s) => ({
      messagesByProject: { ...s.messagesByProject, [projectId]: messages },
    })),
}));
