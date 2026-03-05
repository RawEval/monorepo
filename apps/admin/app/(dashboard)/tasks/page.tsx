'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import {
  Layers,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Globe,
  Plus,
  BarChart3,
} from 'lucide-react';
import { adminBatchesService, type ListBatchesParams } from '@/services/admin/batches-service';
import { adminPipelineService } from '@/services/admin/pipeline-service';
import { queryKeys } from '@/lib/react-query/query-keys';

const PAGE_SIZE = 20;

type Tab = 'batches' | 'status';

export default function TasksPage() {
  const [tab, setTab] = useState<Tab>('batches');
  const [page, setPage] = useState(1);
  const [domainFilter, _setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const batchParams: ListBatchesParams = {
    page,
    page_size: PAGE_SIZE,
    ...(domainFilter ? { domain: domainFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: queryKeys.batches.list(batchParams as Record<string, unknown>),
    queryFn: () => adminBatchesService.listBatches(batchParams),
    enabled: tab === 'batches',
  });

  const { data: taskStatus, isLoading: statusLoading } = useQuery({
    queryKey: queryKeys.pipeline.taskStatusSummary,
    queryFn: () => adminPipelineService.getTaskStatusSummary(),
    enabled: tab === 'status',
  });

  const isLoading = tab === 'batches' ? batchesLoading : statusLoading;

  const statusIcon = (s: string) => {
    if (s.includes('completed') || s.includes('done'))
      return <CheckCircle2 className="h-3 w-3" />;
    if (s.includes('progress') || s.includes('active'))
      return <Clock className="h-3 w-3" />;
    return <AlertTriangle className="h-3 w-3" />;
  };

  const statusVariant = (s: string) => {
    if (s.includes('completed') || s.includes('done')) return 'default' as const;
    if (s.includes('progress') || s.includes('active')) return 'secondary' as const;
    return 'outline' as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">
            Task Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage batches, view task status, and configure allocations
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Batch
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === 'batches' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setTab('batches'); setPage(1); }}
          className="gap-1.5"
        >
          <Layers className="h-4 w-4" />
          Batches
        </Button>
        <Button
          variant={tab === 'status' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setTab('status'); setPage(1); }}
          className="gap-1.5"
        >
          <BarChart3 className="h-4 w-4" />
          Task Status
        </Button>
      </div>

      {/* Filters for batches */}
      {tab === 'batches' && (
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border-input bg-background focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="created">Created</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {tab === 'batches' ? 'Batches' : 'Task Status Summary'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : tab === 'batches' && batches ? (
            <div className="space-y-2">
              {batches.items && batches.items.length > 0 ? (
                batches.items.map((batch) => (
                  <div
                    key={batch.id}
                    className="border-border rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono text-xs">
                          #{batch.id}
                        </span>
                        <Badge
                          variant={statusVariant(batch.status)}
                          className="gap-1 text-xs"
                        >
                          {statusIcon(batch.status)}
                          {batch.status.replace(/_/g, ' ')}
                        </Badge>
                        {batch.domain && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Globe className="h-3 w-3" />
                            {batch.domain}
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-2 flex gap-4 text-xs">
                      <span>{batch.total_tasks ?? 0} total tasks</span>
                      {batch.allocated_count !== undefined && (
                        <span>{batch.allocated_count} allocated</span>
                      )}
                      {batch.completed_count !== undefined && (
                        <span className="text-success">{batch.completed_count} completed</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  No batches found
                </p>
              )}
            </div>
          ) : tab === 'status' && taskStatus ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(taskStatus) && taskStatus.length > 0 ? (
                taskStatus.map((s) => (
                  <div
                    key={s.status_code}
                    className="border-border rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {s.display_name || s.status_code.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {s.count}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground col-span-full py-12 text-center text-sm">
                  No task status data
                </p>
              )}
            </div>
          ) : null}

          {tab === 'batches' && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {page} of {batches?.total_pages ?? 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (batches?.total_pages ?? 1)}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
