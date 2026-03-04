import { create } from 'zustand';
import { chatService } from '@/services/chat-service';

export interface Project {
  id: string; // Local ID or Backend string ID
  title: string;
  description: string;
  updatedAt: number; // epoch ms
  backendId?: number; // Integer ID from LLM Host
  status?: string;
  hasUnread?: boolean;
}

interface ProjectsState {
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface ProjectsActions {
  selectProject: (id: string) => void;
  createProject: (title?: string) => string;
  renameProject: (id: string, title: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  touchProject: (id: string) => void;
  setBackendId: (id: string, backendId: number) => void;
  loadProjects: () => Promise<void>;
}

const defaultProject: Project = {
  id: 'p1',
  title: 'New Chat',
  description: 'Start a new conversation',
  updatedAt: Date.now(),
};

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export const useProjectsStore = create<ProjectsState & ProjectsActions>()(
  (set, get) => ({
    projects: [defaultProject],
    selectedProjectId: defaultProject.id,
    isLoading: false,
    error: null,

    loadProjects: async () => {
      set({ isLoading: true, error: null });
      try {
        // Fetch sessions from backend
        const response = await chatService.getChatSessions({
          page: 1,
          page_size: 50,
        });

        if (response && response.sessions && response.sessions.length > 0) {
          // Map backend sessions to frontend projects
          const backendProjects: Project[] = response.sessions.map(
            (session) => ({
              id: String(session.id),
              backendId: session.id,
              title:
                session.title ||
                session.last_user_message?.substring(0, 30) ||
                'Chat Session',
              description:
                session.system_prompt ||
                session.last_assistant_message?.substring(0, 50) ||
                'Conversation history',
              updatedAt: session.updated_at
                ? new Date(session.updated_at).getTime()
                : session.created_at
                  ? new Date(session.created_at).getTime()
                  : Date.now(),
              status: session.status,
            })
          );
          // We have backend projects. Replace the state and select the latest one.
          set({
            projects: [defaultProject, ...backendProjects],
            selectedProjectId: defaultProject.id,
            isLoading: false,
          });
        } else {
          // No sessions found, default to New Chat
          set({
            projects: [defaultProject],
            selectedProjectId: defaultProject.id,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Failed to load projects from backend', error);
        // Fallback to local state if backend fetch fails
        set({ isLoading: false, error: 'Failed to sync with backend' });
      }
    },

    selectProject: (id) => set({ selectedProjectId: id }),

    createProject: (title) => {
      const id = newId('p');
      const project: Project = {
        id,
        title: title?.trim() || 'New Chat',
        description: 'Start a new conversation',
        updatedAt: Date.now(),
      };
      set((s) => ({
        projects: [project, ...s.projects],
        selectedProjectId: id,
      }));
      return id;
    },

    renameProject: async (id, title) => {
      const project = get().projects.find((p) => p.id === id);

      // Optimistic update
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === id
            ? { ...p, title: title.trim() || p.title, updatedAt: Date.now() }
            : p
        ),
      }));

      // Not supported by backend natively yet - we might need to rely on local state
      // until a patch endpoint is exposed for renaming just the workflow_name or a 'title' field
      if (project?.backendId) {
        try {
          // We can't actually rename via API right now based on our interface,
          // but if we could, it would go here. The user said it's not directly supported,
          // so we fallback to local-only rename for now.
          console.log(
            `Rename for backend session ${project.backendId} is local-only currently`
          );
        } catch (e) {
          console.error('Rename failed', e);
        }
      }
    },

    deleteProject: async (id) => {
      const project = get().projects.find((p) => p.id === id);
      const backendId = project?.backendId;

      // Optimistic deletion
      set((s) => {
        const next = s.projects.filter((p) => p.id !== id);
        const selected =
          s.selectedProjectId === id
            ? (next[0]?.id ?? null)
            : s.selectedProjectId;
        return {
          projects: next.length > 0 ? next : [defaultProject],
          selectedProjectId: selected || defaultProject.id,
        };
      });

      // Backend deletion
      if (backendId) {
        try {
          await chatService.deleteChatSession(backendId);
        } catch (error) {
          console.error(
            `Failed to delete session ${backendId} on backend`,
            error
          );
          // Revert or show error could go here if critical
        }
      }
    },

    touchProject: (id) =>
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === id ? { ...p, updatedAt: Date.now() } : p
        ),
      })),

    setBackendId: (id, backendId) =>
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === id ? { ...p, backendId } : p
        ),
      })),
  })
);
