'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import {
  Settings,
  User,
  Shield,
  Loader2,
  Globe,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { usersService } from '@/services/users-service';
import { queryKeys } from '@/lib/react-query/query-keys';

export default function SettingsPage() {
  const { user } = useAuthStore();

  const { data: profileCompletion, isLoading: completionLoading } = useQuery({
    queryKey: ['profileCompletion'],
    queryFn: () => usersService.getProfileCompletion(),
  });

  const { data: accessiblePages, isLoading: pagesLoading } = useQuery({
    queryKey: ['accessiblePages'],
    queryFn: () => usersService.getAccessiblePages(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Account settings, profile, and access information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                    {user.full_name?.charAt(0)?.toUpperCase() ||
                      user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {user.full_name || 'Admin User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="default" className="gap-1">
                        <Shield className="h-3 w-3" />
                        {user.role}
                      </Badge>
                      <Badge
                        variant={user.is_active ? 'secondary' : 'destructive'}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 rounded-lg border border-border p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">User ID</span>
                    <span className="code-label">{user.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <span className="system-state">{user.role}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member since</span>
                    <span>
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completionLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : profileCompletion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Completion
                  </span>
                  <span className="metric text-lg font-semibold">
                    {profileCompletion.completion_percentage}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${profileCompletion.completion_percentage}%`,
                    }}
                  />
                </div>
                {profileCompletion.missing_fields.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Missing fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {profileCompletion.missing_fields.map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Unable to load profile completion data
              </p>
            )}
          </CardContent>
        </Card>

        {/* Accessible Pages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Access Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : accessiblePages && accessiblePages.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {accessiblePages.map((page) => (
                  <div
                    key={page.page}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <span className="text-sm">{page.page}</span>
                    <Badge
                      variant={page.accessible ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {page.accessible ? 'Allowed' : 'Denied'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No access permission data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
