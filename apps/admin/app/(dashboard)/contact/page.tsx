'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  Search,
  Eye,
  Trash2,
  MessageSquare,
  Archive,
  Plus,
  X,
  Loader2,
  Send,
  Building2,
  Tag,
  Clock,
  MailCheck,
  Inbox,
} from 'lucide-react';
import { adminContactService, type ContactInquiry } from '@/services/admin/contact-service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  read: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  replied: 'bg-green-500/10 text-green-400 border-green-500/20',
  archived: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export default function ContactPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [showTopicManager, setShowTopicManager] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // ── Queries ──
  const { data: statsData } = useQuery({
    queryKey: queryKeys.contact.stats,
    queryFn: () => adminContactService.getStats(),
  });

  const { data: inquiriesData, isLoading } = useQuery({
    queryKey: queryKeys.contact.list({ page, status: statusFilter, search }),
    queryFn: () => adminContactService.listInquiries({ page, page_size: 20, status: statusFilter || undefined, search: search || undefined }),
  });

  const { data: topicsData } = useQuery({
    queryKey: queryKeys.contact.topics,
    queryFn: () => adminContactService.getTopics(),
  });

  // ── Mutations ──
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status?: string; admin_notes?: string } }) =>
      adminContactService.updateInquiry(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.contact.all });
      setSelectedInquiry(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminContactService.deleteInquiry(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.contact.all });
      setSelectedInquiry(null);
    },
  });

  const addTopicMutation = useMutation({
    mutationFn: (topic: string) => adminContactService.createTopic(topic),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.contact.topics });
      setNewTopic('');
    },
  });

  const removeTopicMutation = useMutation({
    mutationFn: (topic: string) => adminContactService.deleteTopic(topic),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.contact.topics });
    },
  });

  const inquiries = inquiriesData?.items ?? [];
  const totalPages = inquiriesData?.total_pages ?? 0;
  const stats = statsData;
  const topics = topicsData?.topics ?? [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Contact Inquiries</h1>
          <p className="text-muted-foreground text-sm">
            Manage landing page contact form submissions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowTopicManager(!showTopicManager)}>
          <Tag className="mr-2 h-4 w-4" />
          Manage Topics
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Inbox className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total</p>
                <p className="text-foreground text-xl font-bold">{stats.total_inquiries}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Unread</p>
                <p className="text-xl font-bold text-blue-400">{stats.new_unread}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <MailCheck className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Emails Sent</p>
                <p className="text-xl font-bold text-green-400">{stats.emails_sent}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <MessageSquare className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Top Topic</p>
                <p className="text-foreground truncate text-sm font-bold">
                  {Object.entries(stats.topic_breakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || '—'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Topic Manager (collapsible) */}
      {showTopicManager && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact Form Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <div key={topic} className="bg-muted flex items-center gap-1 rounded-md px-3 py-1.5 text-sm">
                  <span>{topic}</span>
                  <button
                    onClick={() => removeTopicMutation.mutate(topic)}
                    className="text-muted-foreground hover:text-destructive ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New topic name..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="border-input bg-background text-foreground flex-1 rounded-md border px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTopic.trim()) {
                    addTopicMutation.mutate(newTopic.trim());
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => newTopic.trim() && addTopicMutation.mutate(newTopic.trim())}
                disabled={!newTopic.trim() || addTopicMutation.isPending}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, organization, or message..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border-input bg-background text-foreground w-full rounded-md border py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border-input bg-background text-foreground rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Inquiries Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No inquiries found
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-border border-b text-left text-xs font-medium tracking-wider">
                  <th className="text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-muted-foreground px-4 py-3">Name</th>
                  <th className="text-muted-foreground px-4 py-3">Email</th>
                  <th className="text-muted-foreground px-4 py-3">Organization</th>
                  <th className="text-muted-foreground px-4 py-3">Topic</th>
                  <th className="text-muted-foreground px-4 py-3">Date</th>
                  <th className="text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    className={cn(
                      'border-border hover:bg-muted/50 cursor-pointer border-b transition-colors',
                      inq.status === 'new' && 'bg-blue-500/5'
                    )}
                    onClick={() => { setSelectedInquiry(inq); setAdminNotes(inq.admin_notes || ''); }}
                  >
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('text-xs', STATUS_COLORS[inq.status])}>
                        {inq.status}
                      </Badge>
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm font-medium">{inq.name}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{inq.email}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{inq.organization || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{inq.topic}</Badge>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-xs">
                      {new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedInquiry(inq); setAdminNotes(inq.admin_notes || ''); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {inq.status !== 'archived' && (
                          <Button variant="ghost" size="sm" onClick={() => updateMutation.mutate({ id: inq.id, data: { status: 'archived' } })}>
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm('Delete this inquiry?')) deleteMutation.mutate(inq.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedInquiry(null)}>
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="bg-background border-border relative z-10 w-full max-w-lg border-l shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-border flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-foreground text-lg font-semibold">{selectedInquiry.name}</h2>
                  <p className="text-muted-foreground text-sm">{selectedInquiry.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedInquiry(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                {/* Meta */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">Status</p>
                    <Badge variant="outline" className={cn('text-xs', STATUS_COLORS[selectedInquiry.status])}>
                      {selectedInquiry.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">Topic</p>
                    <Badge variant="outline" className="text-xs">{selectedInquiry.topic}</Badge>
                  </div>
                  {selectedInquiry.organization && (
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">Organization</p>
                      <p className="text-foreground flex items-center gap-1 text-sm">
                        <Building2 className="h-3 w-3" /> {selectedInquiry.organization}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">Submitted</p>
                    <p className="text-foreground flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {new Date(selectedInquiry.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">Thank-you Email</p>
                    <p className="text-sm">
                      {selectedInquiry.email_sent ? (
                        <span className="flex items-center gap-1 text-green-400"><MailCheck className="h-3 w-3" /> Sent</span>
                      ) : (
                        <span className="text-muted-foreground">Not sent</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">Message</p>
                  <div className="bg-muted text-foreground rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.description}
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">Admin Notes</p>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this inquiry..."
                    rows={3}
                    className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-border flex items-center gap-2 border-t px-6 py-4">
                <Button
                  size="sm"
                  onClick={() => updateMutation.mutate({ id: selectedInquiry.id, data: { status: 'replied', admin_notes: adminNotes } })}
                  disabled={updateMutation.isPending}
                >
                  <Send className="mr-1 h-4 w-4" />
                  Mark Replied
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateMutation.mutate({ id: selectedInquiry.id, data: { admin_notes: adminNotes } })}
                  disabled={updateMutation.isPending}
                >
                  Save Notes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateMutation.mutate({ id: selectedInquiry.id, data: { status: 'archived' } })}
                  disabled={updateMutation.isPending}
                >
                  <Archive className="mr-1 h-4 w-4" />
                  Archive
                </Button>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => { if (confirm('Delete this inquiry?')) deleteMutation.mutate(selectedInquiry.id); }}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
