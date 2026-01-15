'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  Archive,
  X,
  Plus,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useProjectsStore } from '@/stores/projects-store';
import { useChatStore } from '@/stores/chat-store';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@raweval/utils';
import { Avatar } from '@/components/ui/avatar';
import { MobileSheet } from './mobile-sheet';

export function Sidebar() {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const projects = useProjectsStore((s) => s.projects);
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const renameProject = useProjectsStore((s) => s.renameProject);
  const deleteProject = useProjectsStore((s) => s.deleteProject);
  const getMessages = useChatStore((s) => s.getMessages);

  const leftSidebarOpen = useUiStore((s) => s.leftSidebarOpen);
  const toggleLeftSidebar = useUiStore((s) => s.toggleLeftSidebar);

  // Sort projects by updatedAt (most recent first)
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [projects]);

  const handleSelectChat = (id: string) => {
    selectProject(id);
    router.push('/chat');
    if (isMobile) {
      toggleLeftSidebar();
    }
  };

  const handleRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
  };

  const handleSaveRename = (id: string) => {
    if (editValue.trim()) {
      renameProject(id, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (id: string) => {
    if (selectedProjectId === id) {
      const remaining = projects.filter((p) => p.id !== id);
      const nextProject = remaining[0];
      if (nextProject) {
        selectProject(nextProject.id);
        router.push('/chat');
      } else {
        router.push('/chat');
      }
    }
    deleteProject(id);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock user data
  const user = {
    name: 'Mark Anderson',
    email: 'markanderson@gmail.com',
    avatar: undefined,
  };

  // Sidebar content component
  const SidebarContent = () => (
    <>
      {/* Header: Logo */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          {/* Logo with plus */}
          <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
          </div>
          <span className="text-sm sm:text-base font-semibold text-foreground truncate">RawEval</span>
        </div>
        {isMobile && (
          <button
            onClick={toggleLeftSidebar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors active:bg-muted active:text-foreground touch-manipulation"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Chat List - Scrollable */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 sm:p-3">
          {sortedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No chats yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedProjects.map((project) => {
                const messages = getMessages(project.id);
                const isActive = selectedProjectId === project.id;
                const isEditing = editingId === project.id;

                return (
                  <div
                    key={project.id}
                    className={cn(
                      'group relative flex items-center gap-2 rounded-lg px-2 py-2.5 transition-all',
                      isActive
                        ? 'bg-accent text-accent-foreground border-l-2 border-primary'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    {isEditing ? (
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveRename(project.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(project.id);
                          if (e.key === 'Escape') {
                            setEditingId(null);
                            setEditValue('');
                          }
                        }}
                        className="h-8 flex-1 rounded border border-border bg-background px-2 text-sm focus-visible:ring-ring focus-visible:ring-2 outline-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => handleSelectChat(project.id)}
                          className="flex flex-1 items-center gap-2 overflow-hidden text-left min-w-0 touch-manipulation active:scale-[0.98] rounded-md"
                        >
                          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {project.title}
                            </p>
                            {messages.length > 0 && (
                              <p className="truncate text-xs text-muted-foreground">
                                {formatTime(project.updatedAt)}
                              </p>
                            )}
                          </div>
                        </button>

                        {/* Context Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 touch-manipulation active:scale-95',
                                isActive && 'opacity-100'
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              aria-label="More options"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRename(project.id, project.title)}
                            >
                              <Pencil className="h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                // TODO: Implement archive functionality
                                alert('Archive functionality coming soon!');
                              }}
                            >
                              <Archive className="h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User Profile - Sticky at bottom */}
      <div className="shrink-0 border-t border-border bg-background p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar
            src={user.avatar}
            alt={user.name}
            fallback={user.name[0]?.toUpperCase() || 'M'}
            className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs sm:text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground hidden sm:block">{user.email}</p>
          </div>
        </div>
      </div>
    </>
  );

  // Mobile: Use MobileSheet component
  if (isMobile) {
    return (
      <MobileSheet
        open={leftSidebarOpen}
        onOpenChange={toggleLeftSidebar}
        side="left"
        className="w-[280px]"
      >
        <SidebarContent />
      </MobileSheet>
    );
  }

  // Desktop: Regular sidebar
  return (
    <aside className="relative z-auto flex h-screen w-[260px] flex-col border-r border-border bg-background lg:block">
      <SidebarContent />
    </aside>
  );
}
