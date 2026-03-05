'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RefreshCcw,
  AlertCircle,
  Clock,
  CheckCircle2,
  MoreVertical,
  Layers,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  adminConversationsService,
  type ListFailedConversationsParams,
} from '@/services/admin/conversations-service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@raweval/utils';

const PAGE_SIZE = 20;

export default function ConversationsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [domain, _setDomain] = useState<string>('');

  const queryClient = useQueryClient();

  const params: ListFailedConversationsParams = {
    page,
    page_size: PAGE_SIZE,
    ...(status ? { status } : {}),
    ...(domain ? { domain } : {}),
  };

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: queryKeys.conversations.list(params as Record<string, unknown>),
    queryFn: () => adminConversationsService.listFailedConversations(params),
  });

  const conversations = conversationsData?.items ?? [];
  const totalPages = conversationsData?.total_pages ?? 1;

  const transitionMutation = useMutation({
    mutationFn: ({
      id,
      newStatus,
      reason,
    }: {
      id: number;
      newStatus: string;
      reason: string;
    }) =>
      adminConversationsService.transitionStatus(id, {
        new_status_code: newStatus,
        reason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    },
  });

  const rerunQCMutation = useMutation({
    mutationFn: (id: number) =>
      adminConversationsService.rerunQC(id, { reason: 'Admin re-run' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    },
  });

  const getStatusColor = (s: string | null | undefined) => {
    if (!s || typeof s !== 'string') return 'bg-muted text-muted-foreground border-border';
    if (s.includes('completed') || s.includes('done'))
      return 'bg-success/10 text-success border-success/20';
    if (s.includes('fail') || s.includes('error'))
      return 'bg-destructive/10 text-destructive border-destructive/20';
    if (s.includes('progress') || s.includes('annot'))
      return 'bg-primary/10 text-primary border-primary/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  const getStatusIcon = (s: string | null | undefined) => {
    if (!s || typeof s !== 'string') return <Clock className="h-3 w-3" />;
    if (s.includes('completed') || s.includes('done'))
      return <CheckCircle2 className="h-3 w-3" />;
    if (s.includes('fail') || s.includes('error'))
      return <AlertCircle className="h-3 w-3" />;
    if (s.includes('progress'))
      return <RefreshCcw className="h-3 w-3 animate-spin" />;
    return <Clock className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Failed Conversations
          </h1>
          <p className="text-muted-foreground">
            Monitor and triage conversations that failed automated quality
            checks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="border-input bg-background focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending_analysis">Pending Analysis</option>
            <option value="analysis_complete">Analysis Complete</option>
            <option value="in_annotation">In Annotation</option>
            <option value="annotation_complete">Annotation Complete</option>
            <option value="needs_human_review">Needs Human Review</option>
            <option value="completed">Completed</option>
          </select>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
              })
            }
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-border/50 bg-muted/30 border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Results ({conversationsData?.total ?? 0})
            </CardTitle>
            <div className="flex items-center gap-2">
              {status && (
                <Badge variant="outline" className="bg-background">
                  Status: {status.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-border bg-muted/30 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">QC Status</th>
                  <th className="px-6 py-3">Domain</th>
                  <th className="px-6 py-3">Failure Type</th>
                  <th className="px-6 py-3">User / Prob</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="bg-muted h-4 w-full rounded" />
                      </td>
                    </tr>
                  ))
                ) : conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <tr key={conv.conversation_id} className="group hover:bg-accent/50">
                      <td className="px-6 py-4">
                        <span className="text-foreground font-mono text-xs font-semibold">
                          #{conv.conversation_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'gap-1 py-0.5',
                            getStatusColor(conv.qc_status)
                          )}
                        >
                          {getStatusIcon(conv.qc_status)}
                          {(conv.qc_status ?? 'pending').replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground text-xs font-medium capitalize">
                          {conv.domain || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {conv.failure_type && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'py-0.5',
                              conv.failure_type === 'both'
                                ? 'bg-destructive/10 text-destructive border-destructive/20'
                                : 'bg-muted text-muted-foreground border-border'
                            )}
                          >
                            {conv.failure_type}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-muted-foreground line-clamp-1 max-w-xs text-xs">
                          {conv.user_email}
                          {conv.failure_probability != null && (
                            <span className="ml-1">
                              ({(conv.failure_probability * 100).toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-foreground h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer gap-2">
                              <ExternalLink className="h-4 w-4" /> View Full
                              Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2">
                              <Layers className="h-4 w-4" /> View Rubric
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-primary cursor-pointer gap-2"
                              onClick={() => rerunQCMutation.mutate(conv.conversation_id)}
                            >
                              <RefreshCcw className="h-4 w-4" /> Re-run QC
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-muted-foreground cursor-pointer gap-2"
                              onClick={() =>
                                transitionMutation.mutate({
                                  id: conv.conversation_id,
                                  newStatus: 'needs_human_review',
                                  reason: 'Admin escalation',
                                })
                              }
                            >
                              <AlertCircle className="h-4 w-4" /> Escalate to
                              Review
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-muted-foreground px-6 py-12 text-center"
                    >
                      No failed conversations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-border flex items-center justify-between border-t px-6 py-4">
            <span className="text-muted-foreground text-xs">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
