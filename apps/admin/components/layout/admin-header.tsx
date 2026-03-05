'use client';

import { Bell, Search, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@raweval/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth-store';

export function AdminHeader() {
  const { user, logout } = useAuthStore();

  return (
    <header className="border-border bg-card flex h-16 items-center border-b px-6">
      {/* Search Bar - Optional */}
      <div className="flex flex-1 items-center">
        <div className="relative hidden w-full max-w-sm lg:block">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search platform..."
            className="border-input bg-background focus:ring-primary w-full rounded-md border py-2 pr-4 pl-10 text-sm transition-colors focus:ring-1 focus:outline-none"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground relative"
        >
          <Bell className="h-5 w-5" />
          <span className="bg-primary absolute top-2 right-2 h-2 w-2 rounded-full" />
        </Button>

        <div className="bg-border h-6 w-px" />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="hover:bg-accent/50 flex items-center gap-3 px-2"
            >
              <div className="flex flex-col items-end text-right">
                <span className="text-foreground text-sm font-medium">
                  {user?.full_name || 'Admin User'}
                </span>
                <span className="text-muted-foreground text-xs capitalize">
                  {user?.role || 'Administrator'}
                </span>
              </div>
              <Avatar className="border-border h-9 w-9 border">
                {/* <AvatarImage src={user?.av || ''} /> */}
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.full_name?.substring(0, 2).toUpperCase() || 'AD'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href="/settings"
                className="flex cursor-pointer items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>Profile Settings</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
