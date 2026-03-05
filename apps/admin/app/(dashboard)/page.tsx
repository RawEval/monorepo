'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import { formatNumber, formatPercentage } from '@raweval/utils';
import {
  Users,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {
  adminExpertsService,
  adminPromptsService,
  adminWorkbenchService,
  adminPipelineService,
} from '@/services/admin';
import { queryKeys } from '@/lib/react-query/query-keys';

export default function DashboardPage() {
  const {
    data: experts,
    isLoading: expertsLoading,
    refetch: refetchExperts,
  } = useQuery({
    queryKey: queryKeys.expertsList(0, 5),
    queryFn: () => adminExpertsService.getExperts(0, 5),
  });

  const { data: prompts, isLoading: promptsLoading } = useQuery({
    queryKey: queryKeys.promptsList(0, 10),
    queryFn: () => adminPromptsService.getPrompts(0, 10),
  });

  const { data: failedPrompts, isLoading: failedLoading } = useQuery({
    queryKey: queryKeys.failedPrompts(),
    queryFn: () => adminPromptsService.getFailedPrompts(0, 10),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: queryKeys.availableTasks(),
    queryFn: () => adminWorkbenchService.getAvailableTasks(undefined, 0, 5),
  });

  const { data: pipelineStatus, isLoading: pipelineLoading } = useQuery({
    queryKey: queryKeys.adminPipelineStatus,
    queryFn: () => adminPipelineService.getPipelineStatus(),
  });

  const isLoading =
    expertsLoading ||
    promptsLoading ||
    failedLoading ||
    tasksLoading ||
    pipelineLoading;

  const totalExperts = experts?.length ?? 0;
  const totalPrompts = prompts?.length ?? 0;
  const totalFailed = failedPrompts?.length ?? 0;
  const totalTasks = tasks?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Overview of platform activity and key metrics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => refetchExperts()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experts</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="metric text-2xl font-bold">
              {expertsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                formatNumber(totalExperts)
              )}
            </div>
            <p className="text-muted-foreground text-xs">Registered experts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prompts</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="metric text-2xl font-bold">
              {promptsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                formatNumber(totalPrompts)
              )}
            </div>
            <p className="text-muted-foreground text-xs">Total prompts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="metric text-destructive text-2xl font-bold">
              {failedLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                formatNumber(totalFailed)
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Prompts needing review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="metric text-2xl font-bold">
              {tasksLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                formatNumber(totalTasks)
              )}
            </div>
            <p className="text-muted-foreground text-xs">Available tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Cards */}
      <div>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
          Pipeline
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Analysis Queue
              </CardTitle>
              <Activity className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {pipelineLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  formatNumber(pipelineStatus?.analysis_queue_depth ?? 0)
                )}
              </div>
              <p className="text-muted-foreground text-xs">Pending analysis</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Annotation Queue
              </CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {pipelineLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  formatNumber(pipelineStatus?.annotation_queue_depth ?? 0)
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Awaiting annotation
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Human Review
              </CardTitle>
              <AlertTriangle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-destructive text-2xl font-bold">
                {pipelineLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  formatNumber(pipelineStatus?.human_review_pending ?? 0)
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Pending human review
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Experts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Recent Experts
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/experts">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {expertsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
            ) : experts && experts.length > 0 ? (
              <div className="space-y-3">
                {experts.map((expert) => (
                  <div
                    key={expert.id}
                    className="border-border flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                        {expert.user_id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Expert #{expert.id}
                          </span>
                          <Badge
                            variant={
                              expert.tier === 1
                                ? 'default'
                                : expert.tier === 2
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="h-5 gap-0.5 text-[10px]"
                          >
                            <Award className="h-2.5 w-2.5" />T{expert.tier}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground flex gap-2 text-xs">
                          <span>
                            {formatPercentage(expert.accuracy_rate, 1)} acc
                          </span>
                          <span>
                            {formatNumber(expert.total_tasks_completed)} tasks
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="metric text-sm font-medium">
                      {expert.woe_score.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No experts found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Recent Tasks
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tasks">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
            ) : tasks && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border-border rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            task.status === 'completed'
                              ? 'default'
                              : task.status === 'in_progress'
                                ? 'secondary'
                                : 'destructive'
                          }
                          className="gap-1 text-xs"
                        >
                          {task.status === 'completed' && (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {task.status === 'in_progress' && (
                            <Clock className="h-3 w-3" />
                          )}
                          {task.status === 'pending' && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          Task #{task.id}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        Batch #{task.batch_id}
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-1.5 flex items-center gap-2 text-xs">
                      <span>Prompt #{task.prompt_id}</span>
                      {task.expert_id && (
                        <>
                          <span>Expert #{task.expert_id}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No tasks found
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Failed Prompts Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Failed Prompts
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/prompts">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {failedLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : failedPrompts && failedPrompts.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {failedPrompts.slice(0, 6).map((fp) => (
                <div
                  key={fp.id}
                  className="border-border rounded-lg border p-3"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <Badge
                      variant={
                        fp.priority === 'high'
                          ? 'destructive'
                          : fp.priority === 'medium'
                            ? 'secondary'
                            : 'outline'
                      }
                      className="text-[10px]"
                    >
                      {fp.priority}
                    </Badge>
                    <span className="code-label text-muted-foreground">
                      #{fp.id}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm">{fp.query_text}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Status: {fp.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No failed prompts
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
