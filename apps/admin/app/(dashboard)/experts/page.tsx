'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import {
  Users,
  Award,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowUpDown,
} from 'lucide-react';
import { adminExpertsService, type ListExpertsParams } from '@/services/admin/experts-service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { cn } from '@raweval/utils';

const PAGE_SIZE = 20;

export default function ExpertsPage() {
  const [page, setPage] = useState(1);
  const [tierFilter, setTierFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, _setSortBy] = useState<string>('expert_score');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const queryClient = useQueryClient();

  const params: ListExpertsParams = {
    page,
    page_size: PAGE_SIZE,
    ...(tierFilter ? { tier: Number(tierFilter) } : {}),
    ...(statusFilter ? { expert_status: statusFilter } : {}),
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  const { data: expertsData, isLoading } = useQuery({
    queryKey: queryKeys.experts.list(params as Record<string, unknown>),
    queryFn: () => adminExpertsService.listExperts(params),
  });

  const experts = expertsData?.items ?? [];
  const totalExperts = expertsData?.total ?? 0;
  const totalPages = expertsData?.total_pages ?? 1;

  const recomputeMutation = useMutation({
    mutationFn: (expertId: number) =>
      adminExpertsService.recomputeScore(expertId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.experts.all });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">
            Expert Management
          </h1>
          <p className="text-muted-foreground text-sm">
            View and manage registered experts, tiers, scores, and status
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={tierFilter}
          onChange={(e) => {
            setTierFilter(e.target.value);
            setPage(1);
          }}
          className="border-input bg-background focus:ring-ring rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
        >
          <option value="">All Tiers</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border-input bg-background focus:ring-ring rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending_interview">Pending Interview</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
            setPage(1);
          }}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortOrder === 'desc' ? 'Highest first' : 'Lowest first'}
        </Button>
      </div>

      {/* Experts table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Experts ({totalExperts})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : experts.length > 0 ? (
            <>
              <div className="border-border text-muted-foreground mb-2 hidden items-center gap-4 border-b px-4 pb-2 text-xs font-medium sm:flex">
                <span className="w-16">ID</span>
                <span className="w-16">Tier</span>
                <span className="flex-1">Expert</span>
                <span className="w-24 text-right">Score</span>
                <span className="w-24 text-right">Status</span>
                <span className="w-24 text-right">Actions</span>
              </div>

              <div className="space-y-2">
                {experts.map((expert) => (
                  <div
                    key={expert.expert_id}
                    className="border-border flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="text-muted-foreground w-16 font-mono text-xs">
                      #{expert.expert_id}
                    </span>
                    <div className="w-16">
                      <Badge
                        variant={
                          expert.expert_tier === 1
                            ? 'default'
                            : expert.expert_tier === 2
                              ? 'secondary'
                              : expert.expert_tier === 3
                                ? 'outline'
                                : 'outline'
                        }
                        className="gap-0.5"
                      >
                        <Award className="h-3 w-3" />
                        {expert.expert_tier != null ? `T${expert.expert_tier}` : '—'}
                      </Badge>
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium">
                        {expert.full_name || expert.email || `User #${expert.user_id}`}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {expert.email}
                      </span>
                    </div>
                    <span className="w-24 text-right font-mono text-sm font-semibold">
                      {expert.expert_score?.toFixed(2) ?? 'N/A'}
                    </span>
                    <div className="w-24 text-right">
                      <Badge
                        variant={
                          expert.expert_status === 'active'
                            ? 'secondary'
                            : expert.expert_status === 'suspended'
                              ? 'destructive'
                              : 'outline'
                        }
                        className={cn(
                          'text-xs',
                          expert.is_on_probation &&
                            'border-amber-200 bg-amber-100 text-amber-700'
                        )}
                      >
                        {expert.is_on_probation
                          ? 'Probation'
                          : expert.expert_status || 'active'}
                      </Badge>
                    </div>
                    <div className="w-24 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => recomputeMutation.mutate(expert.expert_id)}
                        disabled={recomputeMutation.isPending}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Score
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-muted-foreground text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground py-12 text-center text-sm">
              No experts found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
