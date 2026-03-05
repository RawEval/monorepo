'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import {
  FileText,
  AlertTriangle,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { adminPromptsService } from '@/services/admin';
import { queryKeys } from '@/lib/react-query/query-keys';

const PAGE_SIZE = 20;

type Tab = 'all' | 'failed';

export default function PromptsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data: prompts, isLoading: promptsLoading } = useQuery({
    queryKey: queryKeys.promptsList(page * PAGE_SIZE, PAGE_SIZE),
    queryFn: () => adminPromptsService.getPrompts(page * PAGE_SIZE, PAGE_SIZE),
    enabled: tab === 'all',
  });

  const { data: failedPrompts, isLoading: failedLoading } = useQuery({
    queryKey: queryKeys.failedPrompts(),
    queryFn: () =>
      adminPromptsService.getFailedPrompts(page * PAGE_SIZE, PAGE_SIZE),
    enabled: tab === 'failed',
  });

  const isLoading = tab === 'all' ? promptsLoading : failedLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold">
          Prompt Management
        </h1>
        <p className="text-muted-foreground text-sm">
          Browse prompts and review failed prompts that need attention
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setTab('all');
            setPage(0);
          }}
          className="gap-1.5"
        >
          <FileText className="h-4 w-4" />
          All Prompts
        </Button>
        <Button
          variant={tab === 'failed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setTab('failed');
            setPage(0);
          }}
          className="gap-1.5"
        >
          <AlertTriangle className="h-4 w-4" />
          Failed Prompts
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts..."
          className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:max-w-sm"
        />
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {tab === 'all' ? 'All Prompts' : 'Failed Prompts'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : tab === 'all' && prompts ? (
            <div className="space-y-2">
              {prompts.length > 0 ? (
                prompts
                  .filter((p) =>
                    search
                      ? p.query_text
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      : true
                  )
                  .map((prompt) => (
                    <div
                      key={prompt.id}
                      className="border-border rounded-lg border p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="code-label text-muted-foreground">
                            #{prompt.id}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {prompt.status}
                          </Badge>
                          {prompt.domain && (
                            <Badge variant="outline" className="text-xs">
                              {prompt.domain}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-foreground line-clamp-2 text-sm">
                        {prompt.query_text}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  No prompts found
                </p>
              )}
            </div>
          ) : tab === 'failed' && failedPrompts ? (
            <div className="space-y-2">
              {failedPrompts.length > 0 ? (
                failedPrompts
                  .filter((fp) =>
                    search
                      ? fp.query_text
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      : true
                  )
                  .map((fp) => (
                    <div
                      key={fp.id}
                      className="border-border rounded-lg border p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="code-label text-muted-foreground">
                            #{fp.id}
                          </span>
                          <Badge
                            variant={
                              fp.priority === 'high'
                                ? 'destructive'
                                : fp.priority === 'medium'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="text-xs"
                          >
                            {fp.priority}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {fp.status}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {new Date(fp.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-foreground line-clamp-2 text-sm">
                        {fp.query_text}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  No failed prompts
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
