import { useQuery } from '@tanstack/react-query';
import { walletKeys } from '@/lib/react-query/query-keys';
import { subscriptionsService } from '@/services/subscriptions-service';
import type { WalletBalance, Transaction } from '@raweval/types';

export function useWalletBalance() {
  return useQuery<WalletBalance>({
    queryKey: walletKeys.balance(),
    queryFn: () => subscriptionsService.getWallet(),
  });
}

export function useWalletTransactions() {
  return useQuery<Transaction[]>({
    queryKey: walletKeys.transactions(),
    queryFn: () => subscriptionsService.getTransactions(),
  });
}
