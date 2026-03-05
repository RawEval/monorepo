'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import {
  UserCog,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertTriangle,
  X,
  Plus,
} from 'lucide-react';
import { adminUsersService, type ListAdminUsersParams } from '@/services/admin/users-service';
import { queryKeys } from '@/lib/react-query/query-keys';

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [roleModal, setRoleModal] = useState<{
    userId: number;
    email: string;
  } | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleReason, setRoleReason] = useState('');

  const queryClient = useQueryClient();

  const params: ListAdminUsersParams = {
    page,
    page_size: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(roleFilter ? { role: roleFilter } : {}),
  };

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.users.list(params as Record<string, unknown>),
    queryFn: () => adminUsersService.listUsers(params),
  });

  const users = usersData?.items ?? [];
  const totalUsers = usersData?.total ?? 0;
  const totalPages = usersData?.total_pages ?? 1;

  const assignRoleMutation = useMutation({
    mutationFn: ({
      userId,
      roleName: rn,
      reason,
    }: {
      userId: number;
      roleName: string;
      reason: string;
    }) => adminUsersService.assignRole(userId, { role_name: rn, reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      setRoleModal(null);
      setRoleName('');
      setRoleReason('');
    },
  });

  const revokeRoleMutation = useMutation({
    mutationFn: ({
      userId,
      roleName: rn,
    }: {
      userId: number;
      roleName: string;
    }) =>
      adminUsersService.revokeRole(userId, {
        role_name: rn,
        reason: 'Admin action',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });

  const isMutating =
    assignRoleMutation.isPending || revokeRoleMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Assign Role Modal */}
      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="border-border bg-background w-full max-w-md rounded-xl border p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold">Assign Role</h2>
                <p className="text-muted-foreground text-sm">
                  {roleModal.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setRoleModal(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Role Name *
                </label>
                <select
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                >
                  <option value="">Select role...</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="annotator">Annotator</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Reason
                </label>
                <input
                  className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                  placeholder="Reason for assignment..."
                  value={roleReason}
                  onChange={(e) => setRoleReason(e.target.value)}
                />
              </div>
            </div>
            {assignRoleMutation.error && (
              <p className="text-destructive mt-2 text-xs">
                {assignRoleMutation.error.message}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRoleModal(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!roleName || assignRoleMutation.isPending}
                onClick={() =>
                  assignRoleMutation.mutate({
                    userId: roleModal.userId,
                    roleName,
                    reason: roleReason || 'Admin assignment',
                  })
                }
              >
                {assignRoleMutation.isPending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : null}
                Assign
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-foreground text-2xl font-semibold">
          User Management
        </h1>
        <p className="text-muted-foreground text-sm">
          View all platform users and manage their roles
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by email or name..."
            className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="border-input bg-background focus:ring-ring rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
          <option value="annotator">Annotator</option>
          <option value="reviewer">Reviewer</option>
          <option value="user">User</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCog className="h-4 w-4" />
            Users {usersData ? `(${totalUsers})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <AlertTriangle className="text-destructive h-8 w-8" />
              <p className="text-sm font-medium">Failed to load users</p>
              <p className="text-muted-foreground text-xs">{error.message}</p>
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      {user.full_name?.charAt(0)?.toUpperCase() ||
                        user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">
                          {user.full_name || 'No name'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          <Shield className="mr-1 h-3 w-3" />
                          {user.role}
                        </Badge>
                        <Badge
                          variant={user.is_active ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {user.email}
                      </p>
                      <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                        <span>
                          Joined{' '}
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                        {user.is_expert && (
                          <Badge variant="secondary" className="h-4 text-[10px]">
                            Expert
                          </Badge>
                        )}
                        {user.domain_count > 0 && (
                          <span>{user.domain_count} domains</span>
                        )}
                        {user.years_of_experience != null && (
                          <span>{user.years_of_experience}y exp</span>
                        )}
                        {!user.profile_completed && (
                          <span className="text-amber-600">Profile incomplete</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() =>
                        setRoleModal({ userId: user.id, email: user.email })
                      }
                      disabled={isMutating}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Assign Role
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-12 text-center text-sm">
              {search || roleFilter
                ? 'No users match your filters'
                : 'No users found'}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-muted-foreground text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
