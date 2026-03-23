import { useQuery } from '@tanstack/react-query';
import { payoutKeys } from '@/lib/react-query/query-keys';
import { chatService } from '@/services/chat-service';
import { qcService } from '@/services/qc-service';
import { paymentsService } from '@/services/payments-service';
import type { UserEarnings, BankAccountResponse } from '@raweval/types';

interface PayoutsPayment {
  id: number;
  title: string;
  status: string;
  qcStatus?: string;
  verdict?: string;
  payoutEligible?: boolean;
  createdAt: string;
}

export interface PayoutsData {
  earnings: UserEarnings | null;
  payments: PayoutsPayment[];
  bankAccounts: BankAccountResponse[];
}

export function usePayoutsData() {
  return useQuery<PayoutsData>({
    queryKey: payoutKeys.list(),
    queryFn: async (): Promise<PayoutsData> => {
      let earnings: UserEarnings | null = null;
      let bankAccounts: BankAccountResponse[] = [];

      try {
        earnings = await paymentsService.getUserEarnings();
      } catch {
        // Endpoint may not exist yet
      }

      try {
        bankAccounts = await paymentsService.getBankAccounts();
      } catch {
        // Endpoint may not exist yet
      }

      const payments: PayoutsPayment[] = [];
      try {
        const sessionsResponse = await chatService.getChatSessions({
          page: 1,
          page_size: 50,
          failed_only: true,
        });

        if (sessionsResponse?.items) {
          for (const session of sessionsResponse.items) {
            let qcStatus: string | undefined;
            let verdict: string | undefined;
            let payoutEligible: boolean | undefined;

            if (session.id != null) {
              try {
                const analysis = await qcService.getAnalysis(session.id);
                qcStatus = analysis.fpf_status ?? undefined;
                verdict = analysis.qc_outcome ?? undefined;
                payoutEligible = analysis.qc?.payout_eligible ?? undefined;
              } catch {
                // QC data may not exist yet
              }
            }

            payments.push({
              id: session.id ?? session.session_id,
              title: session.title || `Session ${session.id ?? session.session_id}`,
              status: session.status,
              qcStatus,
              verdict,
              payoutEligible,
              createdAt: session.created_at ?? new Date().toISOString(),
            });
          }
        }
      } catch {
        // Sessions endpoint may fail
      }

      return { earnings, payments, bankAccounts };
    },
    staleTime: 1000 * 30,
  });
}
