'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import {
  Users,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  RefreshCw,
  Loader2,
  Layers,
  Globe,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { adminExpertsService } from '@/services/admin/experts-service';
import { adminBatchesService } from '@/services/admin/batches-service';
import { adminPipelineService } from '@/services/admin/pipeline-service';
import { adminConversationsService } from '@/services/admin/conversations-service';
import { queryKeys } from '@/lib/react-query/query-keys';

export default function DashboardPage() {
  const {
    data: experts,
    isLoading: expertsLoading,
  } = useQuery({
    queryKey: queryKeys.experts.list({ page: 1, page_size: 5 }),
    queryFn: () => adminExpertsService.listExperts({ page: 1, page_size: 5 }),
  });

  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: queryKeys.batches.list({ page: 1, page_size: 5 }),
    queryFn: () => adminBatchesService.listBatches({ page: 1, page_size: 5 }),
  });

  const { data: pipelineOverview, isLoading: pipelineLoading } = useQuery({
    queryKey: queryKeys.pipeline.overview,
    queryFn: () => adminPipelineService.getPipelineOverview(),
  });

  const { data: taskStatusSummary, isLoading: statusLoading } = useQuery({
    queryKey: queryKeys.pipeline.taskStatusSummary,
    queryFn: () => adminPipelineService.getTaskStatusSummary(),
  });

  const { data: conversations, isLoading: convsLoading } = useQuery({
    queryKey: queryKeys.conversations.list({ page: 1, page_size: 5 }),
    queryFn: () =>
      adminConversationsService.listFailedConversations({
        page: 1,
        page_size: 5,
      }),
  });

  const { data: domainSummary } = useQuery({
    queryKey: queryKeys.pipeline.domainSummary,
    queryFn: () => adminPipelineService.getDomainSummary(),
  });

  const isLoading =
    expertsLoading || batchesLoading || pipelineLoading || statusLoading;

  const totalExperts = experts?.total ?? 0;
  const totalBatches = batches?.total ?? 0;
  const totalConversations = conversations?.total ?? 0;
  const totalInPipeline = pipelineOverview?.total_tasks ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Overview of platform activity and key metrics
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Experts"
          value={totalExperts}
          description="Registered experts"
          icon={Users}
          loading={expertsLoading}
        />
        <StatCard
          title="Batches"
          value={totalBatches}
          description="Active batches"
          icon={Layers}
          loading={batchesLoading}
        />
        <StatCard
          title="Failed Conversations"
          value={totalConversations}
          description="Pending review"
          icon={AlertTriangle}
          loading={convsLoading}
          variant="destructive"
        />
        <StatCard
          title="In Pipeline"
          value={totalInPipeline}
          description="Currently processing"
          icon={Activity}
          loading={pipelineLoading}
        />
      </div>

      {/* Task Status Summary */}
      {taskStatusSummary && Array.isArray(taskStatusSummary) && taskStatusSummary.length > 0 && (
        <div>
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
            Task Status
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {taskStatusSummary.map((s) => (
              <Card key={s.status_code}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium uppercase">
                      {s.display_name || s.status_code}
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
              <LoadingPlaceholder />
            ) : experts?.items && experts.items.length > 0 ? (
              <div className="space-y-3">
                {experts.items.map((expert) => (
                  <div
                    key={expert.expert_id}
                    className="border-border flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                        {expert.full_name?.charAt(0)?.toUpperCase() ??
                          expert.email?.charAt(0)?.toUpperCase() ??
                          `E${expert.expert_id}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {expert.full_name || expert.email || `Expert #${expert.expert_id}`}
                          </span>
                          {expert.expert_tier != null && (
                            <Badge
                              variant={
                                expert.expert_tier === 1
                                  ? 'default'
                                  : expert.expert_tier === 2
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className="h-5 gap-0.5 text-[10px]"
                            >
                              <Award className="h-2.5 w-2.5" />T
                              {expert.expert_tier}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Score: {expert.expert_score?.toFixed(2) ?? 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {expert.expert_status || 'active'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No experts found" />
            )}
          </CardContent>
        </Card>

        {/* Recent Batches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4" />
                Recent Batches
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tasks">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {batchesLoading ? (
              <LoadingPlaceholder />
            ) : batches?.items && batches.items.length > 0 ? (
              <div className="space-y-3">
                {batches.items.map((batch) => (
                  <div
                    key={batch.id}
                    className="border-border rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            batch.status === 'completed'
                              ? 'default'
                              : batch.status === 'in_progress'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="gap-1 text-xs"
                        >
                          {batch.status === 'completed' && (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {batch.status === 'in_progress' && (
                            <Clock className="h-3 w-3" />
                          )}
                          {batch.status}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          Batch #{batch.id}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {batch.total_tasks ?? 0} tasks
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-1.5 flex items-center gap-2 text-xs">
                      {batch.domain && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {batch.domain}
                        </span>
                      )}
                      <span>
                        {new Date(batch.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No batches found" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Domain Summary */}
      {domainSummary && Array.isArray(domainSummary) && domainSummary.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                Domain Summary
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/pipeline">View details</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {domainSummary.map((d) => (
                <div
                  key={d.domain}
                  className="border-border rounded-lg border p-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {d.domain}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {d.total_tasks} tasks
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex gap-3 text-xs">
                    <span className="text-success">
                      {d.completed ?? 0} done
                    </span>
                    <span className="text-primary">
                      {d.in_progress ?? 0} active
                    </span>
                    <span>{d.pending ?? 0} pending</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
  variant,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  variant?: 'destructive';
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${variant === 'destructive' ? 'text-destructive' : 'text-foreground'}`}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            value.toLocaleString()
          )}
        </div>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-muted-foreground py-8 text-center text-sm">{message}</p>
  );
}
