'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  RefreshCcw,
  Clock,
  CheckCircle2,
  BarChart3,
  Globe,
  Users2,
  Zap,
} from 'lucide-react';
import { adminPipelineService } from '@/services/admin';
import { queryKeys } from '@/lib/react-query/query-keys';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { cn } from '@raweval/utils';

export default function PipelinePage() {
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: queryKeys.pipelineStatus(),
    queryFn: () => adminPipelineService.getPipelineStatus(),
  });

  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: queryKeys.pipelineDomains(),
    queryFn: () => adminPipelineService.getDomainAnalytics(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Pipeline Monitoring
          </h1>
          <p className="text-muted-foreground">
            Real-time throughput and health metrics for the data ingestion and
            evaluation pipeline.
          </p>
        </div>
        <Button className="gap-2 shadow-sm">
          <RefreshCcw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* High Level Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Processed"
          value={status?.total_conversations_processed.toLocaleString()}
          icon={CheckCircle2}
          isLoading={statusLoading}
          description="Last 30 days"
        />
        <StatCard
          title="Analysis Queue"
          value={status?.analysis_queue_depth.toLocaleString()}
          icon={Zap}
          isLoading={statusLoading}
          trend="high"
          description="Pending analysis"
        />
        <StatCard
          title="Avg. Latency"
          value={`${status?.average_processing_time_minutes} min`}
          icon={Clock}
          isLoading={statusLoading}
          description="E2E processing time"
        />
        <StatCard
          title="Human Review"
          value={status?.human_review_pending.toLocaleString()}
          icon={Users2}
          isLoading={statusLoading}
          description="Pending validation"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Domain Analytics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="text-primary h-5 w-5" /> Domain Distribution
            </CardTitle>
            <CardDescription>
              Throughput and failure rates across different expertise domains.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {domainsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-muted/50 h-12 w-full animate-pulse rounded"
                    />
                  ))
                : domains?.map((d) => (
                    <div key={d.domain} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-bold capitalize">
                          {d.domain}
                        </span>
                        <div className="flex gap-4">
                          <span className="text-muted-foreground">
                            Processed:{' '}
                            <span className="text-foreground font-mono">
                              {d.total_processed}
                            </span>
                          </span>
                          <span
                            className={cn(
                              'font-mono',
                              d.failure_rate > 0.1
                                ? 'text-destructive'
                                : 'text-success'
                            )}
                          >
                            Error: {(d.failure_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className={cn(
                            'h-full transition-all',
                            d.failure_rate > 0.1
                              ? 'bg-destructive/60'
                              : 'bg-primary'
                          )}
                          style={{
                            width: `${Math.min(100, (d.total_processed / (status?.total_conversations_processed || 1)) * 500)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="text-primary h-5 w-5" /> Infrastructure
              Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HealthIndicator
              label="Worker Availability"
              status="healthy"
              value="98.2%"
            />
            <HealthIndicator
              label="API Latency (p95)"
              status="healthy"
              value="142ms"
            />
            <HealthIndicator
              label="DB Connection Pool"
              status="warning"
              value="82%"
            />
            <HealthIndicator
              label="Storage Utilization"
              status="healthy"
              value="44%"
            />

            <div className="bg-muted/30 border-border/50 mt-6 rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <BarChart3 className="text-primary h-4 w-4" />
                <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  Queue Pressure
                </span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Analysis queue is currently experiencing high load. Auto-scaling
                in progress to handle the surge.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  description,
  trend,
}: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <div
            className={cn(
              'rounded-md p-1',
              trend === 'high'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary/10 text-primary'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          {isLoading ? (
            <div className="bg-muted h-8 w-24 animate-pulse rounded" />
          ) : (
            <h3 className="text-foreground text-2xl font-bold tracking-tight">
              {value}
            </h3>
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

function HealthIndicator({ label, status, value }: any) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            status === 'healthy'
              ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]'
              : 'bg-warning shadow-[0_0_8px_rgba(234,179,8,0.4)]'
          )}
        />
        <span className="text-foreground text-sm">{label}</span>
      </div>
      <span className="text-muted-foreground font-mono text-xs font-bold">
        {value}
      </span>
    </div>
  );
}
