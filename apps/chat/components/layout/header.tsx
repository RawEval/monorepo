'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  LogOut,
  Menu,
  DollarSign,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useUiStore } from '@/stores/ui-store';
import { useProjectsStore } from '@/stores/projects-store';
import { cn } from '@raweval/utils';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth-service';
import { clearToken, getStoredToken, getStoredRefreshToken } from '@/lib/auth';
import type { UserResponse } from '@raweval/types';

const PAGE_TITLES: Record<string, string> = {
  '/settings': 'Settings',
  '/wallet': 'Wallet',
  '/pricing': 'Pricing',
  '/documents': 'Documents',
  '/templates': 'Templates',
  '/payouts': 'Payouts',
};

export function Header() {
  const router = useRouter();
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);
  const toggleLeftSidebar = useUiStore((s) => s.toggleLeftSidebar);
  const leftSidebarOpen = useUiStore((s) => s.leftSidebarOpen);
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const projects = useProjectsStore((s) => s.projects);
  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const isChatPage = pathname.startsWith('/chat') || pathname === '/';
  const pageTitle = PAGE_TITLES[pathname];

  useEffect(() => {
    // Auth gating is handled by middleware + AuthGuard.
    // Header only needs to load the user profile for display.
    const loadUser = async () => {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch {
        // If getCurrentUser fails, AuthGuard will handle the redirect.
        // Header just shows a fallback state.
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const chatTitle =
    isChatPage && currentProject
      ? currentProject.title === 'New Chat'
        ? 'New Chat'
        : currentProject.title
      : null;

  return (
    <header
      className="safe-area-inset-top sticky top-0 z-40 h-14 backdrop-blur-xl"
      style={{
        background: 'var(--color-bg-base)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="flex h-full items-center justify-between px-3 sm:px-4">
        {/* Left: Hamburger + Logo + mobile title */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            onClick={toggleLeftSidebar}
            className={cn(
              'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full transition-all active:scale-95',
              isChatPage
                ? leftSidebarOpen
                  ? 'lg:hidden'
                  : 'flex'
                : 'lg:hidden'
            )}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/logo.png"
              alt="RawEval"
              className="h-6 w-auto shrink-0 object-contain sm:h-7"
              style={{ filter: 'brightness(0) saturate(100%) invert(55%) sepia(82%) saturate(2200%) hue-rotate(344deg) brightness(105%) contrast(96%)' }}
            />
            {/* Page title for non-chat pages */}
            {!isChatPage && pageTitle && (
              <span className="text-muted-foreground hidden text-sm font-medium sm:inline">
                / {pageTitle}
              </span>
            )}
            {/* Chat title on mobile — visible inline next to logo */}
            {chatTitle && (
              <span className="text-muted-foreground truncate text-xs font-medium sm:hidden">
                {chatTitle}
              </span>
            )}
          </div>
        </div>

        {/* Center: Chat title on desktop */}
        {chatTitle && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 hidden w-full max-w-[40%] -translate-x-1/2 -translate-y-1/2 text-center sm:block">
            <span className="text-foreground truncate text-sm font-medium">
              {chatTitle}
            </span>
          </div>
        )}

        {/* Right: Options Menu */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="text-foreground active:bg-muted flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-lg transition-all focus-visible:outline-none active:scale-95"
              aria-label="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {loading ? (
                <div className="px-2 py-1.5">
                  <p className="text-muted-foreground text-sm">Loading...</p>
                </div>
              ) : user ? (
                <div className="px-2 py-1.5">
                  <p className="text-foreground text-sm font-medium">
                    {user.full_name}
                  </p>
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                </div>
              ) : null}
              <Separator />
              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openUpgradeModal}>
                <CreditCard className="h-4 w-4" />
                Billing / Subscription
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/payouts')}
                className="cursor-pointer"
              >
                <DollarSign className="h-4 w-4" />
                Payouts & Earnings
              </DropdownMenuItem>
              <Separator />
              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  const refreshToken = getStoredRefreshToken();
                  clearToken();

                  if (refreshToken) {
                    try {
                      await authService.logout(refreshToken);
                    } catch (error) {
                      console.warn('Logout API call failed:', error);
                    }
                  }

                  router.push('/login');
                }}
                className="cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
