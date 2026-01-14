'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  Folder,
  FileText,
  History,
  Settings,
  HelpCircle,
  ChevronLeft,
  Search,
  Sparkles,
} from 'lucide-react';
import { cn } from '@raweval/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Projects', href: '/projects', icon: Folder },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'History', href: '/history', icon: History },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="border-border bg-background hover:bg-muted absolute top-1/2 left-0 z-50 -translate-y-1/2 rounded-r-lg border p-2 shadow-lg transition-all"
      >
        <ChevronLeft className="h-4 w-4 rotate-180" />
      </button>
    );
  }

  return (
    <aside className="border-border bg-background flex w-64 flex-col border-r">
      {/* Logo and Search */}
      <div className="border-border border-b p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Sparkles className="text-primary-foreground h-4 w-4" />
          </div>
          <span className="text-foreground text-lg font-semibold">RawEval</span>
        </div>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border px-3 py-2 pl-9 text-sm focus:ring-2 focus:outline-none"
          />
          <kbd className="border-border bg-muted text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border px-1.5 py-0.5 font-mono text-xs select-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings & Help */}
      <div className="border-border border-t p-4">
        <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
          Settings & Help
        </div>
        <div className="space-y-1">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === '/settings'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <Link
            href="/help"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help</span>
          </Link>
        </div>
      </div>

      {/* User Profile */}
      <div className="border-border border-t p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
            U
          </div>
          <div className="flex-1">
            <div className="text-foreground text-sm font-medium">User Name</div>
            <div className="text-muted-foreground text-xs">
              user@example.com
            </div>
          </div>
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={onToggle}
        className="border-border bg-background hover:bg-muted absolute top-1/2 left-64 z-50 -translate-y-1/2 rounded-r-lg border border-l-0 p-2 shadow-lg transition-all"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </aside>
  );
}
