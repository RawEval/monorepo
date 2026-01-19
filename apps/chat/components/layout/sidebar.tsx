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
import { authService } from '@/services/auth-service';

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
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get user data from auth (simplified - in production, use context or store)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser({
          name: userData.full_name,
          email: userData.email,
        });
      } catch {
        // User not authenticated, will be handled by middleware
      }
    };
    loadUser();
  }, []);

  // Sidebar content component
  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header: Logo */}
      <div className="border-border flex h-14 shrink-0 items-center justify-between border-b px-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          {/* Logo with plus */}
          <div className="bg-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-lg shadow-sm sm:h-7 sm:w-7">
            <Plus className="text-primary-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="text-foreground truncate text-sm font-semibold sm:text-base">
            RawEval
          </span>
        </div>
        {isMobile && (
          <button
            onClick={toggleLeftSidebar}
            className="text-muted-foreground active:bg-muted active:text-foreground flex h-8 w-8 shrink-0 touch-manipulation items-center justify-center rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Chat List - Scrollable */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">
          {sortedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="text-muted-foreground mb-3 h-8 w-8" />
              <p className="text-muted-foreground text-sm">No chats yet</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {sortedProjects.map((project) => {
                const messages = getMessages(project.id);
                const isActive = selectedProjectId === project.id;
                const isEditing = editingId === project.id;

                return (
                  <div
                    key={project.id}
                    className={cn(
                      'group relative flex items-center gap-2 rounded-md px-3 py-2.5 transition-colors',
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'hover:bg-muted/60 text-muted-foreground'
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
                        className="border-border bg-background focus-visible:ring-ring h-8 flex-1 rounded border px-2 text-sm outline-none focus-visible:ring-2"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => handleSelectChat(project.id)}
                          className="flex min-w-0 flex-1 touch-manipulation items-center gap-3 overflow-hidden rounded-md text-left active:scale-[0.98]"
                        >
                          <MessageSquare
                            className={cn(
                              'h-4 w-4 shrink-0 transition-colors',
                              isActive
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                'truncate text-sm transition-colors',
                                isActive
                                  ? 'text-foreground font-medium'
                                  : 'text-muted-foreground font-normal'
                              )}
                            >
                              {project.title}
                            </p>
                            {messages.length > 0 && (
                              <p className="text-muted-foreground mt-0.5 truncate text-xs">
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
                                'text-muted-foreground flex h-7 w-7 shrink-0 touch-manipulation items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100 active:scale-95',
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
                              onClick={() =>
                                handleRename(project.id, project.title)
                              }
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
      <div className="border-border bg-background shrink-0 border-t p-3 sm:p-4">
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar
              src={undefined}
              alt={user.name}
              fallback={user.name[0]?.toUpperCase() || 'U'}
              className="h-7 w-7 shrink-0 sm:h-8 sm:w-8"
            />
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-xs font-medium sm:text-sm">
                {user.name}
              </p>
              <p className="text-muted-foreground hidden truncate text-xs sm:block">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-muted h-7 w-7 shrink-0 animate-pulse rounded-full sm:h-8 sm:w-8" />
            <div className="min-w-0 flex-1">
              <div className="bg-muted h-3 w-20 animate-pulse rounded sm:h-4" />
              <div className="bg-muted mt-1 hidden h-2 w-32 animate-pulse rounded sm:block" />
            </div>
          </div>
        )}
      </div>
    </div>
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
    <aside className="border-border bg-background relative z-auto flex h-screen w-[260px] flex-col border-r lg:block">
      <SidebarContent />
    </aside>
  );
}
