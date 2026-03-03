import { useQuery } from '@tanstack/react-query';
import { walletService } from '@/services/wallet-service';
import { walletKeys } from '@/lib/react-query/query-keys';

export function useWalletBalance(userId?: number) {
  return useQuery({
    queryKey: walletKeys.balance(),
    queryFn: () => walletService.getBalance(),
    // Only fetch if a user is presumably logged in
    enabled: !!userId,
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: walletKeys.transactions(),
    queryFn: () => walletService.getTransactions(),
  });
}
