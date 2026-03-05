'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import {
  UserCog,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usersService } from '@/services/users-service';
import { queryKeys } from '@/lib/react-query/query-keys';

export default function UsersPage() {
  const [search, setSearch] = useState('');

  // For now, we fetch the current user as the API may not expose a full user list
  // to non-super-admin roles. This page is a starting point.
  const { data: currentUser, isLoading } = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => usersService.getCurrentUser(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground">
          View and manage platform users, roles, and access
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by email or name..."
          className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCog className="h-4 w-4" />
            Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {currentUser.full_name?.charAt(0)?.toUpperCase() ||
                      currentUser.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {currentUser.full_name || 'No name'}
                      </span>
                      <Badge variant="default" className="text-xs">
                        {currentUser.role}
                      </Badge>
                      <Badge
                        variant={currentUser.is_active ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {currentUser.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(currentUser.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Full user listing requires super_admin access. Contact your
                  administrator to enable the user management API endpoint.
                </p>
              </div>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Unable to load user data
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
