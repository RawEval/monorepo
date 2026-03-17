'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
} from 'lucide-react';
import { sessionService } from '@/services/session-service';
import type { SessionListItem, SessionListResponse } from '@/features/interview/types';
import { SessionCard } from '@/features/history/components/session-card';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'created', label: 'Created' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAGE_SIZE = 12;

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const result: SessionListResponse = await sessionService.listSessions({
        status: statusFilter || undefined,
        page,
        page_size: PAGE_SIZE,
      });
      setSessions(result.items);
      setTotalPages(result.total_pages);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const filteredSessions = search
    ? sessions.filter(
        (s) =>
          s.title?.toLowerCase().includes(search.toLowerCase()) ||
          String(s.session_id).includes(search),
      )
    : sessions;

  return (
    <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="eyebrow">
          <span className="eyebrow-text">History</span>
        </div>
        <h1 className="section-heading" style={{ color: 'var(--color-text-primary)' }}>
          Interview History
        </h1>
        <p
          className="mono-label mt-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {total} total sessions
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className="mono-label"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '6px 12px',
                fontSize: 'var(--text-xs)',
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === f.value
                  ? 'var(--color-bg-inverse)'
                  : 'var(--color-bg-surface)',
                color: statusFilter === f.value
                  ? 'var(--color-text-inverse)'
                  : 'var(--color-text-muted)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative sm:ml-auto">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '8px 12px 8px 36px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              width: '100%',
              maxWidth: '256px',
            }}
          />
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--color-signal)' }} />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <Inbox className="h-12 w-12" style={{ color: 'var(--color-text-faint)' }} />
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-muted)',
              fontWeight: 400,
            }}
          >
            No sessions found
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>
            {statusFilter
              ? 'Try changing the status filter.'
              : 'Complete an interview to see it here.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.session_id}
              session={session}
              onClick={() => {
                if (session.status === 'completed') {
                  router.push(`/results/${session.session_id}${session.is_v2_session ? '?v2=true' : ''}`);
                } else if (session.status === 'in_progress') {
                  router.push(`/interview/${session.session_id}${session.is_v2_session ? '/v2' : ''}`);
                } else {
                  router.push(`/results/${session.session_id}`);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              opacity: page <= 1 ? 0.5 : 1,
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span
            className="mono-label"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              opacity: page >= totalPages ? 0.5 : 1,
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
