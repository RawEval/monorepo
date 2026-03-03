import { useQuery } from '@tanstack/react-query';
import { paymentsService } from '@/services/payments-service';
import { payoutKeys } from '@/lib/react-query/query-keys';
import type {
  PaymentResponse,
  BankAccountResponse,
  UserEarnings,
} from '@raweval/types';

export function usePayoutsData() {
  return useQuery({
    queryKey: payoutKeys.all,
    queryFn: async () => {
      const [earningsResult, trackingResult, accountsResult] =
        await Promise.allSettled([
          paymentsService.getUserEarnings(),
          paymentsService.getPaymentsByUser({
            payment_reason: 'failed_prompt',
            limit: 200,
          }),
          paymentsService.getBankAccounts(),
        ]);

      let earnings: UserEarnings | null = null;
      if (earningsResult.status === 'fulfilled') {
        earnings = earningsResult.value;
      }

      let payments: PaymentResponse[] = [];
      if (trackingResult.status === 'fulfilled') {
        const raw = trackingResult.value as any;
        payments = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.payments)
            ? raw.payments
            : [];
      }

      let bankAccounts: BankAccountResponse[] = [];
      if (accountsResult.status === 'fulfilled') {
        bankAccounts = accountsResult.value;
      }

      return { earnings, payments, bankAccounts };
    },
  });
}
