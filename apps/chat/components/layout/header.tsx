'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  LogOut,
  Menu,
  MoreVertical,
  Plus,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ModelSelector, type ModelType } from '@/components/model-selector';
import { useUiStore } from '@/stores/ui-store';
import { useProjectsStore } from '@/stores/projects-store';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth-service';
import {
  clearToken,
  getStoredToken,
  getStoredRefreshToken,
  storeToken,
} from '@raweval/auth';
import type { UserResponse } from '@raweval/types';

export function Header() {
  const router = useRouter();
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);
  const toggleLeftSidebar = useUiStore((s) => s.toggleLeftSidebar);
  const createProject = useProjectsStore((s) => s.createProject);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gpt-4');
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleNewChat = () => {
    const newId = createProject();
    selectProject(newId);
    router.push('/chat');
  };

  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 safe-area-inset-top sticky top-0 z-40 h-14 border-b backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-3 sm:px-4">
        {/* Left: Hamburger Menu + Model Selector */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {/* Hamburger Menu - Mobile only */}
          <button
            onClick={toggleLeftSidebar}
            className="text-foreground active:bg-muted flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-lg transition-all active:scale-95 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Model Selector - Clean minimal like ChatGPT */}
          <div className="min-w-0 flex-1 sm:flex-initial">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              className="h-auto px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        {/* Right: Options Menu */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* New Chat Button - Desktop only */}
          <Button
            onClick={handleNewChat}
            className="bg-primary text-primary-foreground hover:bg-primary/90 hidden h-9 touch-manipulation gap-2 px-3 shadow-sm transition-all hover:shadow-md active:scale-95 sm:flex"
          >
            <Plus className="h-4 w-4 shrink-0" />
            New Chat
          </Button>

          {/* Options Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="shrink-0 focus-visible:outline-none">
              <button
                className="text-foreground active:bg-muted flex h-9 w-9 touch-manipulation items-center justify-center rounded-lg transition-all active:scale-95"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
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
                onClick={handleNewChat}
                className="cursor-pointer sm:hidden"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </DropdownMenuItem>
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
