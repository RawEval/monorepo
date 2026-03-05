'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@raweval/utils';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import {
  LayoutDashboard,
  Users,
  FileText,
  ListTodo,
  DollarSign,
  UserCog,
  Settings,
  Shield,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Experts',
    href: '/dashboard/experts',
    icon: Users,
  },
  {
    label: 'Prompts',
    href: '/dashboard/prompts',
    icon: FileText,
  },
  {
    label: 'Tasks',
    href: '/dashboard/tasks',
    icon: ListTodo,
  },
  {
    label: 'Payments',
    href: '/dashboard/payments',
    icon: DollarSign,
  },
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: UserCog,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const {
    sidebarOpen,
    sidebarCollapsed,
    setSidebarOpen,
    toggleSidebarCollapsed,
  } = useUIStore();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar transition-all duration-200',
          'lg:static lg:z-auto',
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
          sidebarOpen
            ? 'w-64 translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">
                  R
                </span>
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground">
                Admin
              </span>
              <Badge variant="destructive" className="gap-0.5 text-[10px] px-1.5 py-0">
                <Shield className="h-2.5 w-2.5" />
                <span className="sr-only">Internal only</span>
              </Badge>
            </div>
          )}

          {sidebarCollapsed && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                R
              </span>
            </div>
          )}

          {/* Close (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" role="navigation">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-3 py-3">
          {/* Collapse toggle (desktop only) */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 hidden w-full justify-start gap-3 text-sidebar-foreground/70 lg:flex"
            onClick={toggleSidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </Button>

          {/* User section */}
          {user && !sidebarCollapsed && (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user.full_name || 'Admin'}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/50">
                  {user.role}
                </p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full gap-3 text-sidebar-foreground/70 hover:text-destructive',
              sidebarCollapsed ? 'justify-center px-0' : 'justify-start'
            )}
            onClick={logout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
