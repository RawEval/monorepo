'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  ChevronDown,
  ChevronUp,
  User,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { adminAuditService, type ListAuditLogsParams } from '@/services/admin/audit-service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils';

const PAGE_SIZE = 20;

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const params: ListAuditLogsParams = {
    page,
    page_size: PAGE_SIZE,
    ...(actionFilter ? { action: actionFilter } : {}),
  };

  const { data: logsData, isLoading } = useQuery({
    queryKey: queryKeys.audit.list(params as Record<string, unknown>),
    queryFn: () => adminAuditService.listAuditLogs(params),
  });

  const logs = logsData?.items ?? [];
  const totalPages = logsData?.total_pages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Audit Trail
          </h1>
          <p className="text-muted-foreground">
            Trace all administrative actions and configuration changes for
            security and compliance.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Audit Logs
        </Button>
      </div>

      <Card>
        <CardHeader className="border-border/50 bg-muted/20 flex flex-row items-center justify-between border-b py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="text-primary h-5 w-5" /> Admin Actions
          </CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="border-input bg-background h-8 rounded-md border px-3 text-xs focus:outline-none"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="assign">Assign</option>
              <option value="revoke">Revoke</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-border bg-muted/30 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase">
                <tr>
                  <th className="w-10 px-6 py-3" />
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Resource</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="bg-muted h-4 w-full rounded" />
                      </td>
                    </tr>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr
                        className={cn(
                          'group cursor-pointer transition-colors',
                          expandedId === log.id
                            ? 'bg-accent/30'
                            : 'hover:bg-accent/50'
                        )}
                        onClick={() =>
                          setExpandedId(expandedId === log.id ? null : log.id)
                        }
                      >
                        <td className="px-6 py-4">
                          {expandedId === log.id ? (
                            <ChevronUp className="text-muted-foreground h-4 w-4" />
                          ) : (
                            <ChevronDown className="text-muted-foreground h-4 w-4" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-foreground font-medium">
                              {new Date(log.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
                              <User className="h-3 w-3" />
                            </div>
                            <span className="text-foreground font-medium">
                              {log.admin_user?.email || `User #${log.admin_user_id}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="bg-background font-mono text-[10px] uppercase"
                          >
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-muted-foreground text-xs">
                            {log.resource_type}
                            {log.resource_id && ` #${log.resource_id}`}
                          </span>
                        </td>
                      </tr>
                      {expandedId === log.id && (
                        <tr className="bg-muted/30">
                          <td colSpan={5} className="px-10 py-6">
                            <div className="grid gap-6 md:grid-cols-2">
                              <div className="space-y-2">
                                <h5 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                                  Original Value
                                </h5>
                                <pre className="border-border bg-card text-foreground min-h-[80px] overflow-auto rounded-lg border p-4 font-mono text-[10px] leading-relaxed shadow-inner">
                                  {JSON.stringify(log.old_value, null, 2) || 'None'}
                                </pre>
                              </div>
                              <div className="space-y-2">
                                <h5 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                                  New Value
                                </h5>
                                <pre className="border-border bg-card text-foreground min-h-[80px] overflow-auto rounded-lg border p-4 font-mono text-[10px] leading-relaxed shadow-inner">
                                  {JSON.stringify(log.new_value, null, 2) || 'None'}
                                </pre>
                              </div>
                            </div>
                            <div className="text-muted-foreground border-border mt-4 flex items-center gap-6 border-t pt-4 text-[10px]">
                              <span>
                                IP: <span className="text-foreground font-mono">{log.ip_address || 'N/A'}</span>
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-muted-foreground px-6 py-12 text-center">
                      No audit logs found
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
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
