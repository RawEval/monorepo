'use client';

import { useState, useMemo } from 'react';
import { Folder, Plus, MoreVertical, Search } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Input } from '@/components/ui/input';
import { useProjectsStore } from '@/stores/projects-store';
import { useChatStore } from '@/stores/chat-store';
import { useRouter } from 'next/navigation';

export function ProjectsPage() {
  const router = useRouter();
  const projects = useProjectsStore((s) => s.projects);
  const createProject = useProjectsStore((s) => s.createProject);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const getMessages = useChatStore((s) => s.getMessages);
  const [searchQuery, setSearchQuery] = useState('');

  const projectsWithCounts = useMemo(() => {
    return projects.map((project) => ({
      ...project,
      messageCount: getMessages(project.id).length,
      updatedAt: new Date(project.updatedAt),
    }));
  }, [projects, getMessages]);

  const filteredProjects = useMemo(() => {
    return projectsWithCounts.filter((project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projectsWithCounts, searchQuery]);

  const handleNewProject = () => {
    const newId = createProject();
    selectProject(newId);
    router.push('/chat');
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">
              Organize and manage your chat projects
            </p>
          </div>
          <Button className="gap-2" onClick={handleNewProject}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-12 text-center">
            <Folder className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:bg-muted"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Folder className="h-5 w-5 text-primary" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{project.title}</h3>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
                </p>
                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.messageCount} messages</span>
                  <span>{project.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
