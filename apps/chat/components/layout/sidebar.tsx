'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  DollarSign,
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
import { format } from 'date-fns';
import { MobileSheet } from './mobile-sheet';
import { authService } from '@/services/auth-service';

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };
    onChange(mql);
    mql.addEventListener('change', onChange as (e: MediaQueryListEvent) => void);
    return () =>
      mql.removeEventListener('change', onChange as (e: MediaQueryListEvent) => void);
  }, []);

  return isMobile;
}

interface SidebarProps {
  showOnDesktop?: boolean;
}

export function Sidebar({ showOnDesktop = true }: SidebarProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const projects = useProjectsStore((s) => s.projects);
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const renameProject = useProjectsStore((s) => s.renameProject);
  const deleteProject = useProjectsStore((s) => s.deleteProject);
  const getMessages = useChatStore((s) => s.getMessages);

  const leftSidebarOpen = useUiStore((s) => s.leftSidebarOpen);
  const toggleLeftSidebar = useUiStore((s) => s.toggleLeftSidebar);
  const setLeftSidebarOpen = useUiStore((s) => s.setLeftSidebarOpen);

  useEffect(() => {
    if (isMobile && leftSidebarOpen) {
      setLeftSidebarOpen(false);
    }
    // Only run on mount / when breakpoint changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const closeSidebarOnMobile = useCallback(() => {
    if (isMobile) toggleLeftSidebar();
  }, [isMobile, toggleLeftSidebar]);

  const handleSelectChat = useCallback(
    (id: string) => {
      selectProject(id);
      router.push(id === 'p1' ? '/chat' : `/chat/${id}`);
      closeSidebarOnMobile();
    },
    [selectProject, router, closeSidebarOnMobile]
  );

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
        router.push(
          nextProject.id === 'p1' ? '/chat' : `/chat/${nextProject.id}`
        );
      } else {
        router.push('/chat');
      }
    }
    deleteProject(id);
  };

  const formatTime = (timestamp: number) => {
    return format(timestamp, 'MMM d, h:mm a');
  };

  const isLoading = useProjectsStore((s) => s.isLoading);
  const loadProjects = useProjectsStore((s) => s.loadProjects);

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

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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
        // Will be handled by middleware
      }
    };
    loadUser();
  }, []);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between px-3">
        <button
          onClick={toggleLeftSidebar}
          className="text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full transition-colors active:scale-95"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1">
          {/* Animated Search */}
          <div
            className={cn(
              'text-muted-foreground relative flex h-9 items-center rounded-lg border-transparent transition-all',
              isSearchExpanded
                ? 'bg-background border-border ring-primary/20 z-10 w-36 sm:w-44 shadow-sm ring-1'
                : 'hover:bg-muted/80 w-9 cursor-pointer justify-center border'
            )}
            onClick={() => {
              if (!isSearchExpanded) setIsSearchExpanded(true);
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

          <button
            onClick={() => {
              selectProject('p1');
              router.push('/chat');
              closeSidebarOnMobile();
            }}
            className={cn(
              'text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors active:scale-95',
              isSearchExpanded ? 'hidden' : 'flex'
            )}
            aria-label="New Chat"
            title="New Chat"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat List */}
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

                        {/* Context menu — visible on active/touch, hover on desktop */}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={cn(
                              'text-muted-foreground flex h-7 w-7 shrink-0 touch-manipulation items-center justify-center rounded-md transition-opacity active:scale-95',
                              isActive
                                ? 'opacity-100'
                                : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
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
                              onClick={() => handleDelete(project.id)}
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
              closeSidebarOnMobile();
            }}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors active:scale-[0.98]"
          >
            <Wallet className="h-4 w-4 shrink-0" />
            Wallet
          </button>
          <button
            onClick={() => {
              router.push('/payouts');
              closeSidebarOnMobile();
            }}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors active:scale-[0.98]"
          >
            <DollarSign className="h-4 w-4 shrink-0" />
            Payouts & Earnings
          </button>
          <button
            onClick={() => {
              router.push('/pricing');
              closeSidebarOnMobile();
            }}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors active:scale-[0.98]"
          >
            <Crown className="h-4 w-4 shrink-0" />
            Upgrade Plan
          </button>
          <button
            onClick={() => {
              router.push('/settings');
              closeSidebarOnMobile();
            }}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors active:scale-[0.98]"
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </button>
        </div>
      </div>

      {/* User Profile */}
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
              <p className="text-muted-foreground truncate text-xs">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-muted h-7 w-7 shrink-0 animate-pulse rounded-full sm:h-8 sm:w-8" />
            <div className="min-w-0 flex-1">
              <div className="bg-muted h-3 w-20 animate-pulse rounded sm:h-4" />
              <div className="bg-muted mt-1 h-2 w-32 animate-pulse rounded" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileSheet
        open={leftSidebarOpen}
        onOpenChange={(open) => setLeftSidebarOpen(open)}
        side="left"
      >
        <SidebarContent />
      </MobileSheet>
    );
  }

  if (!showOnDesktop || !leftSidebarOpen) return null;

  return (
    <aside
      className="relative z-auto flex h-screen w-[260px] shrink-0 flex-col"
      style={{ background: 'var(--color-bg-base)', borderRight: '1px solid var(--color-border)' }}
    >
      <SidebarContent />
    </aside>
  );
}
