'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import {
  Menu,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/experts': 'Expert Management',
  '/dashboard/prompts': 'Prompt Management',
  '/dashboard/tasks': 'Task Management',
  '/dashboard/payments': 'Payments',
  '/dashboard/users': 'User Management',
  '/dashboard/settings': 'Settings',
};

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  const pageTitle = PAGE_TITLES[pathname] || 'Dashboard';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <span className="text-muted-foreground">Admin</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="font-medium text-foreground">{pageTitle}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="destructive" className="hidden gap-1 sm:inline-flex">
          <Shield className="h-3 w-3" />
          Internal Only
        </Badge>

        {user && (
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium leading-tight text-foreground">
                {user.full_name || 'Admin'}
              </p>
              <p className="text-xs leading-tight text-muted-foreground">
                {user.role}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
