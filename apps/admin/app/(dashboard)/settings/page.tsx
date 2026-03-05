'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Settings, User, Shield, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { adminUsersService } from '@/services/admin/users-service';
import { queryKeys } from '@/lib/react-query/query-keys';

export default function SettingsPage() {
  const { user } = useAuthStore();

  const { data: profileCompletion, isLoading: completionLoading } = useQuery({
    queryKey: queryKeys.users.profileCompletion,
    queryFn: () => adminUsersService.getProfileCompletion(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Account settings and profile information
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
                  <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold">
                    {user.full_name?.charAt(0)?.toUpperCase() ||
                      user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {user.full_name || 'Admin User'}
                    </h3>
                    <p className="text-muted-foreground text-sm">
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

                <div className="border-border space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">User ID</span>
                    <span className="font-mono text-xs">{user.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium">{user.role}</span>
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
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
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
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
            ) : profileCompletion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Status
                  </span>
                  <Badge
                    variant={
                      profileCompletion.profile_completed
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {profileCompletion.profile_completed
                      ? 'Complete'
                      : 'Incomplete'}
                  </Badge>
                </div>
                {profileCompletion.missing_fields.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Missing fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {profileCompletion.missing_fields.map(
                        (field: string) => (
                          <Badge
                            key={field}
                            variant="outline"
                            className="text-xs"
                          >
                            {field}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Unable to load profile completion data
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
