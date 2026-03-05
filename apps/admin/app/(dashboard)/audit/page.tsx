'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  User,
  ShieldAlert,
} from 'lucide-react';
import { adminAuditService, type ListAuditLogsParams } from '@/services/admin';
import { queryKeys } from '@/lib/react-query/query-keys';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils';

export default function AuditPage() {
  const [params, _setParams] = useState<ListAuditLogsParams>({
    skip: 0,
    limit: 20,
  });
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: queryKeys.auditLogs(params),
    queryFn: () => adminAuditService.listAuditLogs(params),
  });

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
          <div className="space-y-0.5">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="text-primary h-5 w-5" /> Admin Actions
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search actor email..."
                className="border-input bg-background h-8 rounded-md border pr-3 pl-8 text-xs focus:outline-none"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Filter className="h-3 w-3" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-border bg-muted/30 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase">
                <tr>
                  <th className="w-10 px-6 py-3"></th>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Resource</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="bg-muted h-4 w-full rounded" />
                        </td>
                      </tr>
                    ))
                  : logs?.map((log) => (
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
                                {log.actor_email}
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
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="outline"
                              className={cn(
                                'gap-1 py-0.5',
                                log.status === 'success'
                                  ? 'bg-success/10 text-success border-success/20'
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                              )}
                            >
                              {log.status === 'success' ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <AlertCircle className="h-3 w-3" />
                              )}
                              {log.status}
                            </Badge>
                          </td>
                        </tr>
                        {expandedId === log.id && (
                          <tr className="bg-muted/30">
                            <td colSpan={6} className="px-10 py-6">
                              <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <h5 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                                    Original Value
                                  </h5>
                                  <pre className="border-border bg-card text-foreground min-h-[100px] overflow-auto rounded-lg border p-4 font-mono text-[10px] leading-relaxed shadow-inner">
                                    {JSON.stringify(log.old_value, null, 2) ||
                                      'None'}
                                  </pre>
                                </div>
                                <div className="space-y-2">
                                  <h5 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                                    New Value
                                  </h5>
                                  <pre className="border-border bg-card text-foreground min-h-[100px] overflow-auto rounded-lg border p-4 font-mono text-[10px] leading-relaxed shadow-inner">
                                    {JSON.stringify(log.new_value, null, 2) ||
                                      'None'}
                                  </pre>
                                </div>
                              </div>
                              <div className="text-muted-foreground border-border mt-4 flex items-center gap-6 border-t pt-4 text-[10px]">
                                <span>
                                  Actor ID:{' '}
                                  <span className="text-foreground font-mono">
                                    {log.actor_id}
                                  </span>
                                </span>
                                <span>
                                  Resource ID:{' '}
                                  <span className="text-foreground font-mono">
                                    {log.resource_id}
                                  </span>
                                </span>
                                <span>
                                  IP Address:{' '}
                                  <span className="text-foreground font-mono">
                                    {log.ip_address}
                                  </span>
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
