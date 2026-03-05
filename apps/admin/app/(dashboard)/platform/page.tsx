'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SlidersHorizontal,
  Loader2,
  Database,
  Settings2,
  Check,
  X,
  Pencil,
} from 'lucide-react';
import {
  adminConfigService,
  type PlatformConfigItem,
} from '@/services/admin/config-service';
import { queryKeys } from '@/lib/react-query/query-keys';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';

export default function PlatformPage() {
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: configData, isLoading } = useQuery({
    queryKey: queryKeys.config.platform(),
    queryFn: () => adminConfigService.getPlatformConfig(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminConfigService.updateConfig(key, { value }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.config.all });
      setEditingKey(null);
      setEditValue('');
    },
  });

  const seedConfigMutation = useMutation({
    mutationFn: () => adminConfigService.seedDefaultConfig(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.config.all });
    },
  });

  const seedPlansMutation = useMutation({
    mutationFn: () => adminConfigService.seedDefaultPlans(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.config.all });
    },
  });

  const configs = configData?.configs ?? [];

  const grouped = configs.reduce(
    (acc, item) => {
      const cat = item.category || 'general';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, PlatformConfigItem[]>
  );

  const startEdit = (item: PlatformConfigItem) => {
    setEditingKey(item.key);
    setEditValue(item.raw_value);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const formatValue = (item: PlatformConfigItem) => {
    if (item.type === 'bool')
      return item.value ? 'Enabled' : 'Disabled';
    if (item.type === 'float')
      return `$${Number(item.value).toFixed(2)}`;
    if (item.type === 'int' && Number(item.value) === -1)
      return 'Unlimited';
    return String(item.value);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bool': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'int': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'float': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Platform Configuration
          </h1>
          <p className="text-muted-foreground">
            Manage global platform settings.
            {configData && (
              <span className="ml-1 font-medium">
                {configData.total} total configs
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => seedConfigMutation.mutate()}
            disabled={seedConfigMutation.isPending}
          >
            {seedConfigMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Seed Config
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => seedPlansMutation.mutate()}
            disabled={seedPlansMutation.isPending}
          >
            {seedPlansMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Seed Plans
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      ) : configs.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg capitalize">
                  <Settings2 className="text-primary h-5 w-5" />
                  {category.replace(/_/g, ' ')}
                </CardTitle>
                <CardDescription>
                  {items.length} configuration{' '}
                  {items.length === 1 ? 'item' : 'items'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">
                            {item.key.replace(/_/g, ' ')}
                          </span>
                          <Badge
                            variant="outline"
                            className={`font-mono text-[10px] ${getTypeColor(item.type)}`}
                          >
                            {item.type}
                          </Badge>
                          {!item.is_editable && (
                            <Badge variant="outline" className="text-[10px]">
                              Read-only
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {item.description}
                          </p>
                        )}
                        <p className="text-muted-foreground mt-0.5 text-[10px]">
                          Updated{' '}
                          {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingKey === item.key ? (
                          <>
                            <input
                              className="border-input bg-background focus:ring-ring w-32 rounded-md border px-2 py-1 font-mono text-sm focus:ring-2 focus:outline-none"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateMutation.mutate({
                                  key: item.key,
                                  value: editValue,
                                })
                              }
                              disabled={updateMutation.isPending}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={cancelEdit}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="text-foreground rounded-md bg-slate-50 px-3 py-1 font-mono text-sm font-semibold dark:bg-slate-900">
                              {formatValue(item)}
                            </span>
                            {item.is_editable && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => startEdit(item)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <SlidersHorizontal className="text-muted-foreground h-10 w-10" />
            <div>
              <p className="text-sm font-medium">No configuration found</p>
              <p className="text-muted-foreground text-xs">
                Use &quot;Seed Config&quot; to initialize default platform
                settings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
