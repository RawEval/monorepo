'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import {
  ListTodo,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { adminWorkbenchService } from '@/services/admin';
import { queryKeys } from '@/lib/react-query/query-keys';

const PAGE_SIZE = 20;

type Tab = 'tasks' | 'batches';

export default function TasksPage() {
  const [tab, setTab] = useState<Tab>('tasks');
  const [page, setPage] = useState(0);

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: queryKeys.availableTasks(),
    queryFn: () =>
      adminWorkbenchService.getAvailableTasks(
        undefined,
        page * PAGE_SIZE,
        PAGE_SIZE
      ),
    enabled: tab === 'tasks',
  });

  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: queryKeys.taskBatches(page * PAGE_SIZE, PAGE_SIZE),
    queryFn: () =>
      adminWorkbenchService.getTaskBatches(page * PAGE_SIZE, PAGE_SIZE),
    enabled: tab === 'batches',
  });

  const isLoading = tab === 'tasks' ? tasksLoading : batchesLoading;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'in_progress':
        return <Clock className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'in_progress':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold">
          Task Management
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage workbench tasks, batches, and expert allocations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === 'tasks' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setTab('tasks');
            setPage(0);
          }}
          className="gap-1.5"
        >
          <ListTodo className="h-4 w-4" />
          Tasks
        </Button>
        <Button
          variant={tab === 'batches' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setTab('batches');
            setPage(0);
          }}
          className="gap-1.5"
        >
          <Layers className="h-4 w-4" />
          Batches
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {tab === 'tasks' ? 'Available Tasks' : 'Task Batches'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : tab === 'tasks' && tasks ? (
            <div className="space-y-2">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border-border flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="code-label text-muted-foreground">
                        #{task.id}
                      </span>
                      <Badge
                        variant={statusVariant(task.status)}
                        className="gap-1 text-xs"
                      >
                        {statusIcon(task.status)}
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                      <span>Prompt #{task.prompt_id}</span>
                      <span>Batch #{task.batch_id}</span>
                      {task.expert_id && <span>Expert #{task.expert_id}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  No tasks found
                </p>
              )}
            </div>
          ) : tab === 'batches' && batches ? (
            <div className="space-y-2">
              {batches.length > 0 ? (
                batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="border-border rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="code-label text-muted-foreground">
                          #{batch.id}
                        </span>
                        <span className="text-sm font-medium">
                          {batch.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {batch.status}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {batch.description && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        {batch.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  No batches found
                </p>
              )}
            </div>
          ) : null}

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
