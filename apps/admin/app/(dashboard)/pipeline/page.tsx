'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, RefreshCcw, BarChart3, Globe, Loader2 } from 'lucide-react';
import { adminPipelineService } from '@/services/admin/pipeline-service';
import { queryKeys } from '@/lib/react-query/query-keys';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';

export default function PipelinePage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: queryKeys.pipeline.overview,
    queryFn: () => adminPipelineService.getPipelineOverview(),
  });

  const { data: domainSummary, isLoading: domainsLoading } = useQuery({
    queryKey: queryKeys.pipeline.domainSummary,
    queryFn: () => adminPipelineService.getDomainSummary(),
  });

  const { data: taskStatus } = useQuery({
    queryKey: queryKeys.pipeline.taskStatusSummary,
    queryFn: () => adminPipelineService.getTaskStatusSummary(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Pipeline Monitoring
          </h1>
          <p className="text-muted-foreground">
            Real-time overview of the data processing pipeline phases and task
            status.
          </p>
        </div>
        <Button className="gap-2 shadow-sm">
          <RefreshCcw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Pipeline Phases */}
      <div>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
          Pipeline Phases
        </h2>
        {overviewLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : overview?.phases && Array.isArray(overview.phases) ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-5">
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Tasks
                  </p>
                  <h3 className="text-foreground mt-2 text-2xl font-bold">
                    {overview.total_tasks}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {overview.tasks_with_rubric} with rubric
                  </p>
                </CardContent>
              </Card>
              {overview.bottleneck_phase && (
                <Card>
                  <CardContent className="p-5">
                    <p className="text-muted-foreground text-sm font-medium">
                      Bottleneck
                    </p>
                    <h3 className="text-foreground mt-2 text-2xl font-bold capitalize">
                      {overview.bottleneck_phase.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {overview.bottleneck_task_count} tasks
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="space-y-4">
              {overview.phases.map((phase) => (
                <Card key={phase.phase}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base capitalize">
                      {phase.phase.replace(/_/g, ' ')} ({phase.total_tasks})
                    </CardTitle>
                    {overview.phase_avg_duration_ms?.[phase.phase] != null && (
                      <CardDescription>
                        Avg:{' '}
                        {(
                          overview.phase_avg_duration_ms[phase.phase]! / 1000
                        ).toFixed(1)}
                        s
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {phase.statuses.map((s) => (
                        <div
                          key={s.code}
                          className="border-border flex items-center gap-2 rounded-lg border px-3 py-2"
                        >
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: s.color_hex ?? undefined,
                            }}
                          />
                          <span className="text-muted-foreground text-xs">
                            {s.display_name}
                          </span>
                          <span className="text-foreground font-semibold">
                            {s.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="text-primary h-5 w-5" />
                <div>
                  <p className="text-foreground text-lg font-bold">
                    {overview?.total_tasks ?? 0} tasks in pipeline
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Pipeline overview data loaded
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Task Status Summary */}
      {taskStatus && Array.isArray(taskStatus) && taskStatus.length > 0 && (
        <div>
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
            Task Status Breakdown
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {taskStatus.map((s) => (
              <Card key={s.status_code}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">
                      {s.display_name || s.status_code.replace(/_/g, ' ')}
                    </span>
                    <BarChart3 className="text-muted-foreground h-3.5 w-3.5" />
                  </div>
                  <p className="text-foreground mt-1 text-xl font-bold">
                    {s.count}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Domain Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="text-primary h-5 w-5" /> Domain Distribution
            </CardTitle>
            <CardDescription>
              Task distribution and progress across expertise domains.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {domainsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted/50 h-12 w-full animate-pulse rounded"
                  />
                ))
              ) : domainSummary && Array.isArray(domainSummary) ? (
                domainSummary.map((d) => {
                  const completionRate =
                    d.total_tasks > 0
                      ? ((d.completed ?? 0) / d.total_tasks) * 100
                      : 0;
                  return (
                    <div key={d.domain} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-bold capitalize">
                          {d.domain}
                        </span>
                        <div className="flex gap-4">
                          <span className="text-muted-foreground">
                            Total:{' '}
                            <span className="text-foreground font-mono">
                              {d.total_tasks}
                            </span>
                          </span>
                          <span className="text-success font-mono">
                            {completionRate.toFixed(0)}% done
                          </span>
                        </div>
                      </div>
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                      <div className="text-muted-foreground flex gap-4 text-xs">
                        <span>{d.completed ?? 0} completed</span>
                        <span>{d.in_progress ?? 0} in progress</span>
                        <span>{d.pending ?? 0} pending</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No domain data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="text-primary h-5 w-5" /> Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="bg-success h-2 w-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-foreground text-sm">
                  Total in Pipeline
                </span>
              </div>
              <span className="text-muted-foreground font-mono text-sm font-bold">
                {overview?.total_tasks ?? 0}
              </span>
            </div>
            {domainSummary && Array.isArray(domainSummary) && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary h-2 w-2 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                  <span className="text-foreground text-sm">
                    Active Domains
                  </span>
                </div>
                <span className="text-muted-foreground font-mono text-sm font-bold">
                  {domainSummary.length}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
