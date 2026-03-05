/**
 * Admin Query Keys
 *
 * Centralized query key definitions for React Query caching.
 */

export const queryKeys = {
  // Auth / User
  currentUser: ['currentUser'] as const,

  // Experts
  experts: ['experts'] as const,
  expertsList: (skip?: number, limit?: number) =>
    ['experts', 'list', { skip, limit }] as const,
  expertDetail: (id: number) => ['experts', 'detail', id] as const,
  expertCertifications: (id: number) =>
    ['experts', 'certifications', id] as const,

  // Prompts
  prompts: ['prompts'] as const,
  promptsList: (skip?: number, limit?: number) =>
    ['prompts', 'list', { skip, limit }] as const,
  promptDetail: (id: number) => ['prompts', 'detail', id] as const,
  failedPrompts: (status?: string, priority?: string) =>
    ['prompts', 'failed', { status, priority }] as const,

  // Tasks / Workbench
  tasks: ['tasks'] as const,
  taskBatches: (skip?: number, limit?: number) =>
    ['tasks', 'batches', { skip, limit }] as const,
  taskBatchDetail: (id: number) => ['tasks', 'batch', id] as const,
  availableTasks: (expertId?: number) =>
    ['tasks', 'available', { expertId }] as const,

  // Payments
  payments: ['payments'] as const,
  paymentsList: (skip?: number, limit?: number) =>
    ['payments', 'list', { skip, limit }] as const,
  paymentStats: (startDate?: string, endDate?: string) =>
    ['payments', 'stats', { startDate, endDate }] as const,
  paymentMethods: ['payments', 'methods'] as const,

  // Users
  users: ['users'] as const,
  userDetail: (id: number) => ['users', 'detail', id] as const,
} as const;
