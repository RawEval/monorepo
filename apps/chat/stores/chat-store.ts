import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ChatRole = 'user' | 'assistant';

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
}

interface ChatActions {
  getMessages: (projectId: string) => ChatMessage[];
  isTyping: (projectId: string) => boolean;
  sendUserMessage: (projectId: string, content: string, images?: string[]) => void;
  appendAssistantMessage: (projectId: string, content: string, verified?: boolean) => void;
  setTyping: (projectId: string, typing: boolean) => void;
  clearProject: (projectId: string) => void;
}

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      messagesByProject: {},
      typingByProject: {},

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
    }),
    { name: 'raweval-chat-messages' }
  )
);

