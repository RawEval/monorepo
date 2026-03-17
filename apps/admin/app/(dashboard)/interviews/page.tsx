'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mic, Loader2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { apiClient } from '@/lib/api-client';

interface InterviewSession {
  session_id: number;
  user_id: number;
  expert_id: number | null;
  user_email?: string;
  user_name?: string;
  title: string | null;
  status: string;
  workbench_job_id: number | null;
  job_title?: string | null;
  total_questions: number;
  overall_score: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface InterviewListResponse {
  items: InterviewSession[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default',
  in_progress: 'secondary',
  created: 'outline',
  cancelled: 'destructive',
};

export default function InterviewsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-interviews', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (statusFilter) params.set('status', statusFilter);
      return apiClient.get<InterviewListResponse>(`/admin/job-interviews?${params.toString()}`);
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Interview Sessions</h1>
          <p className="text-muted-foreground text-sm">View all expert interview sessions across jobs</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="created">Created</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mic className="h-4 w-4" />
            Sessions {data ? `(${data.total})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No interview sessions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-border border-b text-left">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-medium">ID</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Expert</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Job</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Questions</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Score</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Status</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Date</th>
                    <th className="px-4 py-2.5 text-xs font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {data.items.map((s) => (
                    <tr key={s.session_id} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-mono text-xs">#{s.session_id}</td>
                      <td className="px-4 py-2.5">
                        <div>{s.user_name || `User #${s.user_id}`}</div>
                        {s.user_email && <div className="text-muted-foreground text-xs">{s.user_email}</div>}
                      </td>
                      <td className="px-4 py-2.5 text-xs">
                        {s.job_title || (s.workbench_job_id ? `Job #${s.workbench_job_id}` : 'General')}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs">{s.total_questions}</td>
                      <td className="px-4 py-2.5 font-mono text-xs font-bold">
                        {s.overall_score != null ? (
                          <span className={s.overall_score >= 65 ? 'text-green-600' : s.overall_score >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                            {s.overall_score.toFixed(1)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={STATUS_COLORS[s.status] || 'outline'} className="text-[10px]">
                          {s.status}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground px-4 py-2.5 text-xs">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => window.open(`/conversations/${s.session_id}/analysis`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-muted-foreground text-xs">
                Page {data.page} of {data.total_pages} ({data.total} total)
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= data.total_pages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
