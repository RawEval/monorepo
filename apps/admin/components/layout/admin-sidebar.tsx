'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@raweval/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Wallet,
  Coins,
  ShieldCheck,
  Settings,
  History,
  Shield,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Layers,
  Globe,
  BarChart3,
} from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { useUIStore } from '@/stores/ui-store';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Core',
    items: [
      { title: 'Dashboard', href: '/', icon: LayoutDashboard },
      { title: 'Users', href: '/users', icon: Users },
      { title: 'Conversations', href: '/conversations', icon: FileText },
      { title: 'Pipeline', href: '/pipeline', icon: Activity },
      { title: 'Experts', href: '/experts', icon: ShieldCheck },
      { title: 'Batches & Tasks', href: '/tasks', icon: Layers },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { title: 'Wallets', href: '/wallets', icon: Wallet },
      { title: 'Payments', href: '/payments', icon: Coins },
      { title: 'Analytics', href: '/prompts', icon: BarChart3 },
      { title: 'Audit Logs', href: '/audit', icon: History },
    ],
  },
  {
    label: 'Platform',
    items: [
      { title: 'QC Config', href: '/qc-config', icon: Shield },
      { title: 'Domains', href: '/roles', icon: Globe },
      { title: 'Config', href: '/platform', icon: SlidersHorizontal },
      { title: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'border-border bg-card relative flex flex-col border-r transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="border-border flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <span className="text-primary-foreground text-lg font-bold">R</span>
          </div>
          {sidebarOpen && (
            <span className="text-foreground text-lg font-bold tracking-tight whitespace-nowrap">
              RawEval <span className="text-primary">Admin</span>
            </span>
          )}
        </Link>
      </div>

      <div className="scroll-area flex-1 overflow-x-hidden overflow-y-auto py-4">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div
            key={group.label}
            className={cn('mb-6 px-4', groupIdx === 0 && 'mt-2')}
          >
            {sidebarOpen ? (
              <h3 className="text-muted-foreground/70 mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
                {group.label}
              </h3>
            ) : (
              <div className="border-border/50 mb-2 h-4 w-full border-b" />
            )}
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      !sidebarOpen && 'justify-center px-0'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-accent-foreground',
                        sidebarOpen && 'mr-3'
                      )}
                    />
                    {sidebarOpen && <span>{item.title}</span>}
                    {!sidebarOpen && (
                      <div className="border-border bg-popover text-popover-foreground absolute left-full z-50 ml-4 hidden rounded-md border px-2 py-1 text-xs whitespace-nowrap shadow-md group-hover:block">
                        {item.title}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-border border-t p-4">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'text-muted-foreground hover:text-foreground flex w-full items-center',
            sidebarOpen ? 'justify-start px-2' : 'justify-center px-0'
          )}
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span>Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
