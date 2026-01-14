'use client';

import { useState } from 'react';
import { Folder, Plus, MoreVertical, Search } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Input } from '@/components/ui/input';

interface Project {
  id: string;
  name: string;
  description: string;
  updatedAt: Date;
  messageCount: number;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'AI Chat Copywriter',
    description: 'Generate engaging copy for chat interfaces',
    updatedAt: new Date(),
    messageCount: 24,
  },
  {
    id: '2',
    name: 'Learning From 100 Years',
    description: 'Research on historical learning patterns',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
    messageCount: 18,
  },
  {
    id: '3',
    name: 'Research Officiants',
    description: 'Maxwell equations foundation study',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    messageCount: 12,
  },
];

export function ProjectsPage() {
  const [projects] = useState(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button className="gap-2">
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
                <h3 className="mb-2 font-semibold text-foreground">{project.name}</h3>
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
