'use client';

import { useState } from 'react';
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

export function Header() {
  const router = useRouter();
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);
  const toggleLeftSidebar = useUiStore((s) => s.toggleLeftSidebar);
  const createProject = useProjectsStore((s) => s.createProject);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gpt-4');

  // Mock user data - replace with actual auth
  const user = {
    name: 'Mark Anderson',
    email: 'markanderson@gmail.com',
    avatar: undefined,
    subscription: 'Free' as 'Free' | 'Pro' | 'Team',
  };

  const handleNewChat = () => {
    const newId = createProject();
    selectProject(newId);
    router.push('/chat');
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80 safe-area-inset-top">
      <div className="flex h-full items-center justify-between px-3 sm:px-4">
        {/* Left: Hamburger Menu + Model Selector */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Hamburger Menu - Mobile only */}
          <button
            onClick={toggleLeftSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground transition-all active:scale-95 active:bg-muted touch-manipulation lg:hidden"
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
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* New Chat Button - Desktop only */}
          <Button
            onClick={handleNewChat}
            className="hidden sm:flex h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all px-3 active:scale-95 touch-manipulation"
          >
            <Plus className="h-4 w-4 shrink-0" />
            New Chat
          </Button>

          {/* Options Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus-visible:outline-none shrink-0">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-all active:scale-95 active:bg-muted touch-manipulation"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
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
                onClick={() => {
                  // TODO: Implement actual logout logic
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
