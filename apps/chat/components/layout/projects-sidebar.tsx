'use client';

import { ChevronRight, MoreVertical, Radio, Plus } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { useProjectsStore } from '@/stores/projects-store';

interface ProjectsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ProjectsSidebar({ isOpen, onToggle }: ProjectsSidebarProps) {
  const projects = useProjectsStore((s) => s.projects);
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const createProject = useProjectsStore((s) => s.createProject);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute right-0 top-1/2 z-50 -translate-y-1/2 rounded-l-lg border border-border bg-background p-2 shadow-lg transition-all hover:bg-muted"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>
    );
  }

  return (
    <aside className="flex w-80 flex-col border-l border-border bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Projects ({projects.length})
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 space-y-1 overflow-y-auto p-4">
        <button
          onClick={() => createProject()}
          className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border bg-muted/50 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
          <Radio className="ml-auto h-4 w-4" />
        </button>

        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => selectProject(project.id)}
            className={`flex w-full flex-col gap-1 rounded-lg border px-3 py-2 text-left transition-colors ${
              selectedProjectId === project.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-background hover:bg-muted'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  {project.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {project.description}
                </div>
              </div>
              <Radio
                className={`h-4 w-4 shrink-0 ${
                  selectedProjectId === project.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Collapse Button */}
      <button
        onClick={onToggle}
        className="absolute right-80 top-1/2 z-50 -translate-y-1/2 rounded-l-lg border border-r-0 border-border bg-background p-2 shadow-lg transition-all hover:bg-muted"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </aside>
  );
}
