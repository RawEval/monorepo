// Centralized query keys for the app

export const chatKeys = {
  all: ['chat'] as const,
  sessions: () => [...chatKeys.all, 'sessions'] as const,
  session: (id: string | number) => [...chatKeys.all, 'session', id] as const,
  models: () => [...chatKeys.all, 'models'] as const,
  providers: () => [...chatKeys.all, 'providers'] as const,
  stats: () => [...chatKeys.all, 'stats'] as const,
};

export const walletKeys = {
  all: ['wallet'] as const,
  balance: () => [...walletKeys.all, 'balance'] as const,
  transactions: () => [...walletKeys.all, 'transactions'] as const,
};

export const payoutKeys = {
  all: ['payouts'] as const,
  list: () => [...payoutKeys.all, 'list'] as const,
};
