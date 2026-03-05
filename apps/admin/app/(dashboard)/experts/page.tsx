'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import { formatNumber, formatPercentage } from '@raweval/utils';
import {
  Users,
  Award,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { expertsService } from '@/services/experts-service';
import type { ExpertResponse } from '@/services/experts-service';
import { queryKeys } from '@/lib/react-query/query-keys';

const PAGE_SIZE = 20;

export default function ExpertsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data: experts, isLoading } = useQuery({
    queryKey: queryKeys.expertsList(page * PAGE_SIZE, PAGE_SIZE),
    queryFn: () => expertsService.getExperts(page * PAGE_SIZE, PAGE_SIZE),
  });

  const filteredExperts = experts?.filter((e) =>
    search
      ? e.specializations.some((s) =>
          s.toLowerCase().includes(search.toLowerCase())
        ) || String(e.id).includes(search)
      : true
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Expert Management
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage registered experts, tiers, and certifications
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID or specialization..."
          className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:max-w-sm"
        />
      </div>

      {/* Experts table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Experts ({filteredExperts?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredExperts && filteredExperts.length > 0 ? (
            <>
              {/* Table header */}
              <div className="mb-2 hidden items-center gap-4 border-b border-border px-4 pb-2 text-xs font-medium text-muted-foreground sm:flex">
                <span className="w-16">ID</span>
                <span className="w-16">Tier</span>
                <span className="flex-1">Specializations</span>
                <span className="w-24 text-right">WoE Score</span>
                <span className="w-24 text-right">Accuracy</span>
                <span className="w-24 text-right">Tasks</span>
              </div>

              <div className="space-y-2">
                {filteredExperts.map((expert) => (
                  <div
                    key={expert.id}
                    className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="code-label w-16 text-muted-foreground">
                      #{expert.id}
                    </span>
                    <div className="w-16">
                      <Badge
                        variant={
                          expert.tier === 1
                            ? 'default'
                            : expert.tier === 2
                              ? 'secondary'
                              : 'outline'
                        }
                        className="gap-0.5"
                      >
                        <Award className="h-3 w-3" />
                        T{expert.tier}
                      </Badge>
                    </div>
                    <div className="flex flex-1 flex-wrap gap-1">
                      {expert.specializations.map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    <span className="metric w-24 text-right text-sm">
                      {expert.woe_score.toFixed(2)}
                    </span>
                    <span className="metric w-24 text-right text-sm">
                      {formatPercentage(expert.accuracy_rate, 1)}
                    </span>
                    <span className="metric w-24 text-right text-sm">
                      {formatNumber(expert.total_tasks_completed)}
                    </span>
                  </div>
                ))}
              </div>

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
                <span className="text-sm text-muted-foreground">
                  Page {page + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    !filteredExperts || filteredExperts.length < PAGE_SIZE
                  }
                  onClick={() => setPage((p) => p + 1)}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {search ? 'No experts match your search' : 'No experts found'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
