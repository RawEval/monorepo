import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
  id: string;
  title: string;
  description: string;
  updatedAt: number; // epoch ms
}

interface ProjectsState {
  projects: Project[];
  selectedProjectId: string | null;
}

interface ProjectsActions {
  selectProject: (id: string) => void;
  createProject: (title?: string) => string;
  renameProject: (id: string, title: string) => void;
  deleteProject: (id: string) => void;
  touchProject: (id: string) => void;
}

const seed: Project[] = [
  {
    id: 'p1',
    title: 'New Project',
    description: 'Start a new conversation',
    updatedAt: Date.now(),
  },
];

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export const useProjectsStore = create<ProjectsState & ProjectsActions>()(
  persist(
    (set, get) => ({
      projects: seed,
      selectedProjectId: seed[0]?.id ?? null,

      selectProject: (id) => set({ selectedProjectId: id }),

      createProject: (title) => {
        const id = newId('p');
        const project: Project = {
          id,
          title: title?.trim() || 'New Project',
          description: 'Start a new conversation',
          updatedAt: Date.now(),
        };
        set((s) => ({ projects: [project, ...s.projects], selectedProjectId: id }));
        return id;
      },

      renameProject: (id, title) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, title: title.trim() || p.title, updatedAt: Date.now() } : p
          ),
        })),

      deleteProject: (id) =>
        set((s) => {
          const next = s.projects.filter((p) => p.id !== id);
          const selected =
            s.selectedProjectId === id ? next[0]?.id ?? null : s.selectedProjectId;
          return { projects: next, selectedProjectId: selected };
        }),

      touchProject: (id) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, updatedAt: Date.now() } : p
          ),
        })),
    }),
    {
      name: 'raweval-chat-projects',
    }
  )
);

