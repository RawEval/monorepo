'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SlidersHorizontal,
  Save,
  Lock,
  Zap,
  Trash2,
  Plus,
  Clock,
} from 'lucide-react';
import { adminConfigService } from '@/services/admin';
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
import { cn, formatCurrency } from '@raweval/utils';

export default function PlatformPage() {
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: queryKeys.platformConfig(),
    queryFn: () => adminConfigService.getPlatformConfig(),
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: queryKeys.subscriptionPlans(),
    queryFn: () => adminConfigService.listSubscriptionPlans(),
  });

  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => adminConfigService.updatePlatformConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platformConfig() });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Platform Configuration
          </h1>
          <p className="text-muted-foreground">
            Adjust global platform settings, subscription plans, and maintenance
            modes.
          </p>
        </div>
        <Button
          className="gap-2 shadow-sm"
          onClick={() => updateConfigMutation.mutate({})}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Core Settings */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <SlidersHorizontal className="text-primary h-5 w-5" /> General
                settings
              </CardTitle>
              <CardDescription>
                Core threshold and timeout limits for the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <ConfigInput
                  label="Max Upload Size (MB)"
                  value={config?.max_upload_size_mb}
                  icon={Zap}
                />
                <ConfigInput
                  label="Session Timeout (Min)"
                  value={config?.default_session_timeout_minutes}
                  icon={Clock}
                />
                <ConfigInput
                  label="Max Concurrent Models"
                  value={config?.max_concurrent_models}
                  icon={Zap}
                />
                <ConfigInput
                  label="LLM Timeout (Sec)"
                  value={config?.llm_timeout_seconds}
                  icon={Clock}
                />
              </div>

              <div className="space-y-4 pt-4">
                <ConfigToggle
                  label="Enable Search"
                  description="Allow models to perform real-time web search"
                  enabled={config?.enable_web_search}
                />
                <ConfigToggle
                  label="Enable Streaming"
                  description="Real-time token streaming for all requests"
                  enabled={config?.enable_streaming}
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Mode */}
          <Card
            className={cn(
              'border-l-4 transition-colors',
              config?.maintenance_mode
                ? 'border-l-destructive bg-destructive/5'
                : 'border-l-success bg-success/5'
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full',
                      config?.maintenance_mode
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-success/10 text-success'
                    )}
                  >
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-bold">
                      Maintenance Mode
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Toggle public access to the platform for all users.
                    </p>
                  </div>
                </div>
                <Button
                  variant={config?.maintenance_mode ? 'destructive' : 'outline'}
                >
                  {config?.maintenance_mode ? 'Disable Now' : 'Enable Mode'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Subscription Plans</CardTitle>
                <CardDescription>Manage tiers and pricing.</CardDescription>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {plansLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-muted/50 h-20 w-full animate-pulse rounded"
                    />
                  ))
                : plans?.map((plan) => (
                    <div
                      key={plan.id}
                      className="group border-border bg-card hover:border-primary/50 relative rounded-lg border p-4 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-foreground text-sm font-bold capitalize">
                          {plan.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          {formatCurrency(plan.price_monthly)}/mo
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {plan.features.slice(0, 3).map((f) => (
                          <span
                            key={f}
                            className="text-muted-foreground text-[10px]"
                          >
                            {f} •{' '}
                          </span>
                        ))}
                        <span className="text-primary text-[10px]">
                          and {plan.features.length - 3} more
                        </span>
                      </div>
                      <div className="absolute right-2 bottom-2 hidden group-hover:block">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ConfigInput({ label, value, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
        {label}
      </label>
      <div className="relative">
        <Icon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="number"
          defaultValue={value}
          className="border-input bg-background focus:ring-primary w-full rounded-md border py-2 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none"
        />
      </div>
    </div>
  );
}

function ConfigToggle({ label, description, enabled }: any) {
  return (
    <div className="border-border bg-muted/20 flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-1">
        <h5 className="text-foreground text-sm font-bold">{label}</h5>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <div
        className={cn(
          'h-6 w-11 cursor-pointer rounded-full p-1 transition-colors',
          enabled ? 'bg-primary' : 'bg-muted'
        )}
      >
        <div
          className={cn(
            'bg-background h-4 w-4 rounded-full transition-transform',
            enabled ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </div>
    </div>
  );
}
