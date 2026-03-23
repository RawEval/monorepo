/**
 * Centralized React Query key factory — matches web chat app.
 */

export const chatKeys = {
  all: ['chat'] as const,
  sessions: () => [...chatKeys.all, 'sessions'] as const,
  session: (id: number | string) => [...chatKeys.all, 'session', id] as const,
  models: () => [...chatKeys.all, 'models'] as const,
  providers: () => [...chatKeys.all, 'providers'] as const,
  stats: () => [...chatKeys.all, 'stats'] as const,
} as const;

export const walletKeys = {
  all: ['wallet'] as const,
  balance: () => [...walletKeys.all, 'balance'] as const,
  transactions: () => [...walletKeys.all, 'transactions'] as const,
} as const;

export const payoutKeys = {
  all: ['payouts'] as const,
  list: () => [...payoutKeys.all, 'list'] as const,
} as const;

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  mine: () => [...subscriptionKeys.all, 'mine'] as const,
  usage: () => [...subscriptionKeys.all, 'usage'] as const,
} as const;

export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  earnings: () => [...userKeys.all, 'earnings'] as const,
} as const;
