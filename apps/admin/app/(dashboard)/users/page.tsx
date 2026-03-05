'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import { formatCurrency, formatNumber } from '@raweval/utils';
import {
  UserCog,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldBan,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { adminUsersService } from '@/services/admin/users-service';
import type { AdminUserView } from '@/services/admin/users-service';
import { queryKeys } from '@/lib/react-query/query-keys';

const PAGE_SIZE = 20;

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  variant,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'destructive' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="border-border bg-background w-full max-w-md rounded-xl border p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <AlertTriangle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'activate' | 'delete';
    user: AdminUserView;
  } | null>(null);

  const queryClient = useQueryClient();

  const params = {
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(roleFilter ? { role: roleFilter } : {}),
  };

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.adminUsers(params),
    queryFn: () => adminUsersService.listUsers(params),
  });

  const suspendMutation = useMutation({
    mutationFn: (userId: number) =>
      adminUsersService.suspendUser(userId, 'Admin action'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setConfirmAction(null);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (userId: number) => adminUsersService.activateUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setConfirmAction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => adminUsersService.deleteUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setConfirmAction(null);
    },
  });

  const isMutating =
    suspendMutation.isPending ||
    activateMutation.isPending ||
    deleteMutation.isPending;

  const mutationError =
    suspendMutation.error?.message ||
    activateMutation.error?.message ||
    deleteMutation.error?.message;

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'suspend') {
      suspendMutation.mutate(confirmAction.user.id);
    } else if (confirmAction.type === 'activate') {
      activateMutation.mutate(confirmAction.user.id);
    } else {
      deleteMutation.mutate(confirmAction.user.id);
    }
  };

  return (
    <div className="space-y-6">
      {confirmAction && (
        <ConfirmDialog
          open
          title={
            confirmAction.type === 'suspend'
              ? 'Suspend User'
              : confirmAction.type === 'activate'
                ? 'Activate User'
                : 'Delete User'
          }
          message={
            confirmAction.type === 'delete'
              ? `This will permanently delete ${confirmAction.user.email}. This action cannot be undone.`
              : `Are you sure you want to ${confirmAction.type} ${confirmAction.user.email}?`
          }
          confirmLabel={
            confirmAction.type === 'suspend'
              ? 'Suspend'
              : confirmAction.type === 'activate'
                ? 'Activate'
                : 'Delete'
          }
          variant={
            confirmAction.type === 'delete' || confirmAction.type === 'suspend'
              ? 'destructive'
              : 'default'
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <div>
        <h1 className="text-foreground text-2xl font-semibold">
          User Management
        </h1>
        <p className="text-muted-foreground text-sm">
          View and manage all platform users, roles, and access
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
              setPage(0);
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
            setPage(0);
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

      {mutationError && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {mutationError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCog className="h-4 w-4" />
            Users {users ? `(${users.length})` : ''}
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
                          {user.role}
                        </Badge>
                        {user.is_suspended ? (
                          <Badge variant="destructive" className="text-xs">
                            Suspended
                          </Badge>
                        ) : user.is_active ? (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                        {user.subscription_tier && (
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {user.subscription_tier}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {user.email}
                      </p>
                      <div className="text-muted-foreground mt-0.5 flex gap-3 text-xs">
                        {user.wallet_balance != null && (
                          <span>
                            Wallet: {formatCurrency(user.wallet_balance)}
                          </span>
                        )}
                        <span>
                          {formatNumber(user.total_sessions)} sessions
                        </span>
                        <span>
                          {formatNumber(user.total_failed_prompts)} failures
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {user.is_suspended ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        disabled={isMutating}
                        onClick={() =>
                          setConfirmAction({ type: 'activate', user })
                        }
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Activate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs text-amber-600 hover:text-amber-600"
                        disabled={isMutating}
                        onClick={() =>
                          setConfirmAction({ type: 'suspend', user })
                        }
                      >
                        <ShieldBan className="h-3.5 w-3.5" />
                        Suspend
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive gap-1.5 text-xs"
                      disabled={isMutating}
                      onClick={() => setConfirmAction({ type: 'delete', user })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-muted-foreground text-sm">
              Page {page + 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!users || users.length < PAGE_SIZE}
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
