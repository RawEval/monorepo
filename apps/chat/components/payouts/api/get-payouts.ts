import { useQuery } from '@tanstack/react-query';
import { payoutKeys } from '@/lib/react-query/query-keys';
import { api } from '@/lib/api';
import { chatService } from '@/services/chat-service';
import { failureAnalysisService } from '@/services/failure-analysis-service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export interface FailedConversationItem {
  id: number;
  title: string;
  status: string;
  user_marked_failed: boolean;
  created_at: string;
  updated_at?: string;
  // Enriched from failure status
  qc_status?: string;
  current_phase?: string;
  result_type?: string;
  payout_eligible?: boolean;
}

/**
 * Fetches failed conversations + their QC status.
 *
 * Uses:
 *  - GET /chat/sessions?failed_only=true (real API)
 *  - GET /chat/failure/status/{id} per conversation (enrichment)
 *  - GET /users/me/earnings (may 404 if not deployed — graceful fallback)
 */
export function usePayoutsData() {
  return useQuery({
    queryKey: payoutKeys.all,
    queryFn: async () => {
      // 1. Get failed sessions
      let sessions: Any[] = [];
      try {
        const sessionsData = await chatService.getChatSessions({
          failed_only: true,
          page_size: 100,
        });
        const raw = sessionsData as Any;
        sessions = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.sessions)
              ? raw.sessions
              : [];
      } catch {
        // Endpoint failed — return empty
      }

      // 2. Enrich each session with QC status (parallel, tolerate failures)
      const enriched: FailedConversationItem[] = await Promise.all(
        sessions.map(async (s: Any) => {
          const item: FailedConversationItem = {
            id: s.id ?? s.session_id,
            title: s.title ?? `Conversation #${s.id ?? s.session_id}`,
            status: s.status ?? 'unknown',
            user_marked_failed: s.user_marked_failed ?? true,
            created_at: s.created_at ?? '',
            updated_at: s.updated_at,
          };

          try {
            const statusData = await failureAnalysisService.getAnalysisResults(item.id);
            const sd = statusData as Any;
            item.result_type = sd?.result_type ?? sd?.status ?? undefined;
            item.payout_eligible = sd?.payout_eligible ?? undefined;
            item.qc_status = sd?.status ?? sd?.fpf_status ?? undefined;
          } catch {
            // Analysis not available yet — that's normal for pending items
          }

          return item;
        })
      );

      // 3. Try to get earnings stats (may not exist yet)
      let earnings: Any = null;
      try {
        earnings = await api.get('/users/me/earnings');
      } catch {
        // Endpoint not deployed — fallback
      }

      // 4. Try to get bank accounts (may not exist yet)
      let bankAccounts: Any[] = [];
      try {
        const ba = await api.get('/chat/payments/bank-accounts');
        bankAccounts = Array.isArray(ba) ? ba : [];
      } catch {
        // Not deployed
      }

      return { earnings, payments: enriched, bankAccounts };
    },
    staleTime: 30 * 1000,
  });
}
