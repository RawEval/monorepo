'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Settings, Plus, Trash2, Clock, UserPlus } from 'lucide-react';
import { adminRolesService } from '@/services/admin';
import { queryKeys } from '@/lib/react-query/query-keys';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils';

export default function RolesPage() {
  const queryClient = useQueryClient();

  const { data: roles, isLoading } = useQuery({
    queryKey: queryKeys.rolesList(),
    queryFn: () => adminRolesService.listRoles(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminRolesService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rolesList() });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Role Management
          </h1>
          <p className="text-muted-foreground">
            Define platform-wide roles and their associated permission sets.
          </p>
        </div>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Create New Role
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="bg-muted/50 h-16" />
                <CardContent className="bg-muted/30 mt-4 h-32" />
              </Card>
            ))
          : roles?.map((role) => (
              <Card
                key={role.id}
                className="flex flex-col shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        role.is_system_role
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Shield className="h-6 w-6" />
                    </div>
                    {role.is_system_role && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-bold tracking-tighter uppercase"
                      >
                        System Role
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <CardTitle className="text-lg font-bold">
                      {role.name}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2 min-h-[40px]">
                      {role.description || 'No description provided.'}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pb-6">
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.slice(0, 6).map((perm) => (
                      <Badge
                        key={perm}
                        variant="outline"
                        className="bg-muted/30 border-border/50 font-mono text-[10px]"
                      >
                        {perm}
                      </Badge>
                    ))}
                    {role.permissions.length > 6 && (
                      <Badge
                        variant="outline"
                        className="bg-muted/30 font-mono text-[10px]"
                      >
                        +{role.permissions.length - 6} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-border/50 bg-muted/10 flex justify-between border-t px-6 py-4">
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <Clock className="h-3 w-3" />
                    {new Date(role.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    {!role.is_system_role && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete the role "${role.name}"?`
                            )
                          ) {
                            deleteMutation.mutate(role.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}

        <button className="border-border/50 bg-muted/10 hover:bg-muted/20 hover:border-primary/50 group flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all">
          <div className="bg-background border-border flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-110">
            <UserPlus className="text-primary h-6 w-6" />
          </div>
          <h4 className="text-foreground mt-4 text-sm font-bold">
            Add New Role
          </h4>
          <p className="text-muted-foreground mt-1 px-4 text-xs">
            Create a custom role with specific platform permissions.
          </p>
        </button>
      </div>
    </div>
  );
}
