'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  LogOut,
  Menu,
  MoreVertical,
  DollarSign,
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
import {
  clearToken,
  getStoredToken,
  getStoredRefreshToken,
  storeToken,
} from '@/lib/auth';
import type { UserResponse } from '@raweval/types';

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
  const isChatPage = pathname === '/chat' || pathname === '/';

  useEffect(() => {
    const loadUser = async () => {
      let token = getStoredToken();

      // If no access token, try to refresh if we have a refresh token
      if (!token) {
        const refreshToken = getStoredRefreshToken();
        if (refreshToken) {
          try {
            const tokenResponse = await authService.refreshToken(refreshToken);
            storeToken(
              tokenResponse.access_token,
              tokenResponse.expires_in,
              tokenResponse.refresh_token
            );
            token = tokenResponse.access_token;
          } catch (error) {
            console.error('Failed to refresh token:', error);
            clearToken();
            router.push('/login');
            return;
          }
        }
      }

      if (!token) {
        // No token and no valid refresh token
        router.push('/login');
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        // If getting user fails, check if it's a 401
        // (Though auth interceptor might have handled it, we should be safe)
        console.error('Failed to load user:', error);

        // Try one more refresh if we have a refresh token (in case token expired just now)
        const refreshToken = getStoredRefreshToken();
        if (refreshToken) {
          try {
            const tokenResponse = await authService.refreshToken(refreshToken);
            storeToken(
              tokenResponse.access_token,
              tokenResponse.expires_in,
              tokenResponse.refresh_token
            );
            // Retry get user
            const userDataRetry = await authService.getCurrentUser();
            setUser(userDataRetry);
            return;
          } catch (refreshError) {
            // Refresh failed
            clearToken();
            router.push('/login');
          }
        } else {
          // No refresh token, clear and redirect
          clearToken();
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 safe-area-inset-top sticky top-0 z-40 h-14 border-b backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-3 sm:px-4">
        {/* Left: Hamburger Menu and Branding */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {isChatPage && (
            <>
              <button
                onClick={toggleLeftSidebar}
                className={cn(
                  'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full transition-all active:scale-95',
                  leftSidebarOpen ? 'lg:hidden' : 'flex'
                )}
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="ml-1 flex items-center">
                <img
                  src="/logo.png"
                  alt="RawEval"
                  className="h-6 w-auto object-contain sm:h-7"
                />
              </div>
            </>
          )}
        </div>

        {/* Center: Chat Title */}
        {isChatPage && currentProject && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 w-full max-w-[50%] -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-foreground truncate text-sm font-medium">
              {currentProject.title === 'New Chat'
                ? 'New Chat'
                : currentProject.title}
            </span>
          </div>
        )}

        {/* Right: Options Menu */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Options Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="text-foreground active:bg-muted flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-lg transition-all focus-visible:outline-none active:scale-95"
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
                  // Get refresh token before clearing
                  const refreshToken = getStoredRefreshToken();

                  // Clear tokens immediately
                  clearToken();

                  // Call logout API if refresh token exists
                  if (refreshToken) {
                    try {
                      await authService.logout(refreshToken);
                    } catch (error) {
                      // Ignore errors on logout (token may already be invalid)
                      console.warn('Logout API call failed:', error);
                    }
                  }

                  // Redirect to login
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
