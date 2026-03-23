import { create } from 'zustand';
import { logger } from '@/lib/logger';
import { chatService } from '@/services/chat-service';

export interface Project {
  id: string;
  title: string;
  description: string;
  updatedAt: number;
  backendId?: number;
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
  renameProject: (id: string, title: string) => void;
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
      // Deduplicate concurrent calls
      if (get().isLoading) return;
      set({ isLoading: true, error: null });
      try {
        const response = await chatService.getChatSessions({
          page: 1,
          page_size: 50,
        });

        if (response?.items?.length) {
          const backendProjects: Project[] = response.items
            .filter((session) => (session.id ?? session.session_id) != null)
            .map((session) => {
              const sid = session.id ?? session.session_id;
              return {
                id: String(sid),
                backendId: sid,
                title:
                  session.title ||
                  session.last_user_message?.substring(0, 40) ||
                  `Chat ${sid}`,
                description:
                  session.last_assistant_message?.substring(0, 60) ||
                  session.system_prompt ||
                  '',
                updatedAt: session.updated_at
                  ? new Date(session.updated_at).getTime()
                  : session.created_at
                    ? new Date(session.created_at).getTime()
                    : Date.now(),
                status: session.status,
              };
            });

          set((s) => {
            // Keep local-only projects that have messages (active conversations not yet synced)
            const backendIds = new Set(backendProjects.map((p) => p.id));
            const localWithMessages = s.projects.filter((p) => {
              if (p.id === defaultProject.id) return false; // skip default, we'll add fresh
              if (backendIds.has(p.id)) return false; // already in backend list
              // Only keep if it has a backendId set (means it was used)
              return !!p.backendId;
            });

            const allProjects = [defaultProject, ...localWithMessages, ...backendProjects];
            return {
              projects: allProjects,
              selectedProjectId: s.selectedProjectId,
              isLoading: false,
            };
          });
        } else {
          set((s) => ({
            projects: [defaultProject],
            selectedProjectId: s.selectedProjectId || defaultProject.id,
            isLoading: false,
          }));
        }
      } catch (error) {
        logger.error('Failed to load projects from backend', error);
        set({ isLoading: false, error: 'Failed to sync with backend' });
      }
    },

    selectProject: (id) => set({ selectedProjectId: id }),

    renameProject: (id, title) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === id ? { ...p, title: trimmed, updatedAt: Date.now() } : p
        ),
      }));
      // Also update on backend if linked
      const project = get().projects.find((p) => p.id === id);
      if (project?.backendId) {
        chatService.updateChatSession(project.backendId, { title: trimmed } as never).catch(() => {});
      }
    },

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

    deleteProject: async (id) => {
      const project = get().projects.find((p) => p.id === id);
      const backendId = project?.backendId;

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

      if (backendId) {
        try {
          await chatService.deleteChatSession(backendId);
        } catch (error) {
          logger.error(`Failed to delete session ${backendId}`, error);
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
