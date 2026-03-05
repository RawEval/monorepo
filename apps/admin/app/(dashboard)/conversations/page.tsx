'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Filter,
  RefreshCcw,
  AlertCircle,
  Clock,
  CheckCircle2,
  MoreVertical,
  Layers,
  ExternalLink,
} from 'lucide-react';
import {
  adminConversationsService,
  type AdminConversationStatus,
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

export default function ConversationsPage() {
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const [status, setStatus] = useState<AdminConversationStatus | undefined>(
    undefined
  );
  const [domain, setDomain] = useState<string | undefined>(undefined);

  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useQuery({
    queryKey: queryKeys.failedConversations(skip, limit, status, domain),
    queryFn: () =>
      adminConversationsService.listFailedConversations({
        skip,
        limit,
        status,
        domain,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: AdminConversationStatus;
    }) => adminConversationsService.updateConversationStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', 'failed'] });
    },
  });

  const getStatusColor = (status: AdminConversationStatus) => {
    switch (status) {
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'processing':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'ignored':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getStatusIcon = (status: AdminConversationStatus) => {
    switch (status) {
      case 'failed':
        return <AlertCircle className="h-3 w-3" />;
      case 'processing':
        return <RefreshCcw className="h-3 w-3 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'ignored':
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
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
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            className="gap-2"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ['conversations', 'failed'],
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
              Results ({conversations?.length || 0})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background">
                Status: {status || 'All'}
              </Badge>
              <Badge variant="outline" className="bg-background">
                Domain: {domain || 'All'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-border bg-muted/30 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase">
                <tr>
                  <th className="px-6 py-3">Conversation ID</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Domain</th>
                  <th className="px-6 py-3">Failure Prob</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="bg-muted h-4 w-full rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : conversations && conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <tr key={conv.id} className="group hover:bg-accent/50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-foreground font-mono text-xs font-semibold">
                            {conv.id.substring(0, 8)}...
                          </span>
                          <span className="text-muted-foreground mt-1 line-clamp-1 max-w-xs text-xs">
                            {conv.query_text}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'gap-1 py-0.5',
                            getStatusColor(conv.status)
                          )}
                        >
                          {getStatusIcon(conv.status)}
                          {conv.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'py-0.5',
                            conv.priority === 'high'
                              ? 'bg-destructive/10 text-destructive border-destructive/20'
                              : conv.priority === 'medium'
                                ? 'border-amber-200 bg-amber-100 text-amber-700'
                                : 'bg-muted text-muted-foreground border-border'
                          )}
                        >
                          {conv.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground text-xs font-medium capitalize">
                          {conv.domain || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                conv.failure_probability > 0.7
                                  ? 'bg-destructive'
                                  : 'bg-primary'
                              )}
                              style={{
                                width: `${conv.failure_probability * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-muted-foreground text-xs font-medium">
                            {(conv.failure_probability * 100).toFixed(0)}%
                          </span>
                        </div>
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
                              <ExternalLink className="h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2">
                              <Layers className="h-4 w-4" /> View Rubric
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-primary cursor-pointer gap-2"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: conv.id,
                                  status: 'processing',
                                })
                              }
                            >
                              <RefreshCcw className="h-4 w-4" /> Retry Analysis
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-muted-foreground cursor-pointer gap-2"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: conv.id,
                                  status: 'ignored',
                                })
                              }
                            >
                              <Clock className="h-4 w-4" /> Mark as Ignored
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
              Showing {skip + 1} to {skip + (conversations?.length || 0)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSkip(Math.max(0, skip - limit))}
                disabled={skip === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSkip(skip + limit)}
                disabled={!conversations || conversations.length < limit}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
