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
  Search,
  Menu,
  Wallet,
  Settings,
  Crown,
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const projects = useProjectsStore((s) => s.projects);
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const createProject = useProjectsStore((s) => s.createProject);
  const renameProject = useProjectsStore((s) => s.renameProject);
  const deleteProject = useProjectsStore((s) => s.deleteProject);
  const getMessages = useChatStore((s) => s.getMessages);

  const leftSidebarOpen = useUiStore((s) => s.leftSidebarOpen);
  const toggleLeftSidebar = useUiStore((s) => s.toggleLeftSidebar);

  const handleSelectChat = (id: string) => {
    selectProject(id);
    if (id === 'p1') {
      router.push('/chat');
    } else {
      router.push(`/chat?id=${id}`);
    }
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
        if (nextProject.id === 'p1') {
          router.push('/chat');
        } else {
          router.push(`/chat?id=${nextProject.id}`);
        }
      } else {
        router.push('/chat');
      }
    }
    deleteProject(id);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isLoading = useProjectsStore((s) => s.isLoading);
  const loadProjects = useProjectsStore((s) => s.loadProjects);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [projects, searchQuery]);

  // Load chat history from backend on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Get user data from auth
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

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
      {/* Header: Actions like Gemini (Menu, New Chat, Search) */}
      <div className="flex h-14 shrink-0 items-center justify-between px-3">
        {/* Toggle Sidebar */}
        <button
          onClick={toggleLeftSidebar}
          className="text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Right side group: Search & New Chat */}
        <div className="flex items-center gap-1">
          {/* Animated Search */}
          <div
            className={cn(
              'text-muted-foreground relative flex h-9 items-center rounded-lg border-transparent transition-all',
              isSearchExpanded
                ? 'bg-background border-border ring-primary/20 z-10 w-44 shadow-sm ring-1'
                : 'hover:bg-muted/80 w-9 cursor-pointer justify-center border'
            )}
            onClick={() => {
              if (!isSearchExpanded) {
                setIsSearchExpanded(true);
              }
            }}
          >
            <Search
              className={cn(
                'h-4 w-4 shrink-0 transition-all',
                isSearchExpanded ? 'text-primary absolute left-2.5' : ''
              )}
            />
            {isSearchExpanded && (
              <>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery) setIsSearchExpanded(false);
                  }}
                  className="text-foreground placeholder:text-muted-foreground h-full w-full bg-transparent pr-8 pl-8 text-sm outline-none"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    setIsSearchExpanded(false);
                  }}
                  className="hover:bg-muted text-muted-foreground hover:text-foreground absolute right-1.5 rounded-md p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          {/* New Chat Action */}
          <button
            onClick={() => {
              const newId = createProject();
              selectProject(newId);
              router.push('/chat');
              if (isMobile) {
                toggleLeftSidebar();
              }
            }}
            className={cn(
              'text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
              isSearchExpanded ? 'hidden' : 'flex'
            )}
            aria-label="New Chat"
            title="New Chat"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat List - Scrollable */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2 pt-0">
          {isLoading ? (
            <div className="space-y-1.5 p-1 px-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex h-9 items-center gap-3 opacity-60">
                  <div
                    className="bg-muted h-4 w-4 shrink-0 animate-pulse rounded-full"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                  <div className="flex flex-1 flex-col justify-center gap-1.5">
                    <div
                      className="bg-muted h-2.5 w-3/4 animate-pulse rounded"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-80">
              <Search className="text-muted-foreground mb-3 h-6 w-6" />
              <p className="text-muted-foreground text-sm">
                {searchQuery ? 'No chats match your search' : 'No chats yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredProjects.map((project) => {
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
                          <DropdownMenuTrigger
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
                                // Archive = remove from list locally.
                                // No dedicated archive endpoint yet — uses same
                                // flow as delete but semantically distinct.
                                handleDelete(project.id);
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

      {/* Quick Nav Links */}
      <div className="border-border shrink-0 border-t px-2 py-2">
        <div className="space-y-0.5">
          <button
            onClick={() => {
              router.push('/wallet');
              if (isMobile) toggleLeftSidebar();
            }}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
          >
            <Wallet className="h-4 w-4 shrink-0" />
            Wallet
          </button>
          <button
            onClick={() => {
              router.push('/pricing');
              if (isMobile) toggleLeftSidebar();
            }}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
          >
            <Crown className="h-4 w-4 shrink-0" />
            Upgrade Plan
          </button>
          <button
            onClick={() => {
              router.push('/settings');
              if (isMobile) toggleLeftSidebar();
            }}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </button>
        </div>
      </div>

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
  if (!leftSidebarOpen) return null;

  return (
    <aside className="border-border bg-background relative z-auto flex h-screen w-[260px] flex-col border-r lg:block">
      <SidebarContent />
    </aside>
  );
}
