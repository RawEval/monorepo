'use client';

import { useState, useMemo } from 'react';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  TrendingUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@raweval/utils';

type ResponseStatus = 'pending' | 'approved' | 'rejected' | 'paid';

interface FailedResponse {
  id: string;
  messageId: string;
  prompt: string;
  response: string;
  status: ResponseStatus;
  markedAt: Date;
  qaCompletedAt?: Date;
  paidAt?: Date;
  payoutAmount?: number;
  qaNotes?: string;
}

// Mock data - replace with actual data from store/API
const mockResponses: FailedResponse[] = [
  {
    id: '1',
    messageId: 'msg-1',
    prompt: 'Explain quantum computing',
    response: 'Quantum computing uses classical bits...',
    status: 'paid',
    markedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    qaCompletedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    payoutAmount: 5.0,
  },
  {
    id: '2',
    messageId: 'msg-2',
    prompt: 'How does photosynthesis work?',
    response: 'Photosynthesis is a process where plants convert sunlight...',
    status: 'approved',
    markedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    qaCompletedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    payoutAmount: 5.0,
  },
  {
    id: '3',
    messageId: 'msg-3',
    prompt: 'Write a Python function to sort a list',
    response: 'def sort_list(lst): return sorted(lst)',
    status: 'pending',
    markedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    messageId: 'msg-4',
    prompt: 'What is the capital of France?',
    response: 'The capital of France is London...',
    status: 'rejected',
    markedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    qaCompletedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    qaNotes: 'Response was actually correct',
  },
];

const statusConfig: Record<ResponseStatus, { label: string; icon: typeof Clock; color: string }> = {
  pending: {
    label: 'Pending QA',
    icon: Clock,
    color: 'bg-muted text-muted-foreground border-border',
  },
  approved: {
    label: 'QA Approved',
    icon: CheckCircle2,
    color: 'bg-primary/10 text-primary border-primary/20',
  },
  rejected: {
    label: 'QA Rejected',
    icon: XCircle,
    color: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  paid: {
    label: 'Paid',
    icon: DollarSign,
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
};

export function PayoutsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ResponseStatus | 'all'>('all');

  // Filter responses
  const filteredResponses = useMemo(() => {
    let filtered = mockResponses;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.prompt.toLowerCase().includes(query) ||
          r.response.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockResponses.length;
    const pending = mockResponses.filter((r) => r.status === 'pending').length;
    const approved = mockResponses.filter((r) => r.status === 'approved').length;
    const paid = mockResponses.filter((r) => r.status === 'paid').length;
    const totalEarned = mockResponses
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + (r.payoutAmount || 0), 0);
    const pendingEarnings = mockResponses
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + (r.payoutAmount || 0), 0);

    return {
      total,
      pending,
      approved,
      paid,
      totalEarned,
      pendingEarnings,
    };
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-background px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Payouts & Earnings</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Track your marked responses and payouts
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="border-b border-border bg-muted/30 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border shadow-subtle hover:shadow-md transition-shadow card-hover">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
                    ${stats.totalEarned.toFixed(2)}
                  </p>
                </div>
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-subtle hover:shadow-md transition-shadow card-hover">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Pending Earnings</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
                    ${stats.pendingEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-subtle hover:shadow-md transition-shadow card-hover">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Pending QA</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.pending}</p>
                </div>
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-subtle hover:shadow-md transition-shadow card-hover">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Total Responses</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="border-b border-border bg-background px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search prompts or responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-3"
            />
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter === 'all' ? 'All Statuses' : statusConfig[statusFilter].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                All Statuses
              </DropdownMenuItem>
              {Object.entries(statusConfig).map(([status, config]) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setStatusFilter(status as ResponseStatus)}
                >
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Responses List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 sm:px-6 py-4">
          {filteredResponses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'No responses found'
                  : 'No marked responses yet'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mark responses as &quot;Wrong&quot; in the chat to start earning
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResponses.map((response) => {
                const statusInfo = statusConfig[response.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={response.id} className="border-border shadow-subtle hover:shadow-md transition-all hover-lift card-hover overflow-hidden">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-3 sm:space-y-4">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn('gap-1', statusInfo.color)}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </Badge>
                              {response.payoutAmount && (
                                <Badge variant="secondary" className="gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${response.payoutAmount.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Marked {formatTimeAgo(response.markedAt)} • {formatDate(response.markedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Prompt */}
                        <div className="min-w-0">
                          <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                            Your Prompt
                          </p>
                          <p className="text-sm text-foreground break-words line-clamp-2">{response.prompt}</p>
                        </div>

                        {/* Response */}
                        <div className="min-w-0">
                          <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                            AI Response (Marked as Wrong)
                          </p>
                          <p className="text-sm text-muted-foreground break-words line-clamp-3">
                            {response.response}
                          </p>
                        </div>

                        {/* Status-specific info */}
                        {response.status === 'approved' && response.payoutAmount && (
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                            <p className="text-xs font-medium text-primary">
                              QA Approved • Payment of ${response.payoutAmount.toFixed(2)} pending
                            </p>
                            {response.qaCompletedAt && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Approved on {formatDate(response.qaCompletedAt)}
                              </p>
                            )}
                          </div>
                        )}

                        {response.status === 'rejected' && (
                          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                            <p className="text-xs font-medium text-destructive">
                              QA Rejected • No payment
                            </p>
                            {response.qaNotes && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {response.qaNotes}
                              </p>
                            )}
                            {response.qaCompletedAt && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Rejected on {formatDate(response.qaCompletedAt)}
                              </p>
                            )}
                          </div>
                        )}

                        {response.status === 'paid' && response.paidAt && (
                          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                            <p className="text-xs font-medium text-green-600">
                              Payment Received • ${response.payoutAmount?.toFixed(2)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Paid on {formatDate(response.paidAt)}
                            </p>
                          </div>
                        )}

                        {response.status === 'pending' && (
                          <div className="rounded-lg border border-border bg-muted/30 p-3">
                            <p className="text-xs font-medium text-muted-foreground">
                              Waiting for QA verification...
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Our workbench team will review this response
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
