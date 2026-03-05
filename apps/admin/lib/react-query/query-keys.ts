/**
 * React Query Keys
 *
 * Centralized query keys for all admin services.
 */

export const queryKeys = {
  // Auth
  me: ['me'] as const,

  // Users
  usersList: (skip: number, limit: number, role?: string, status?: string) =>
    ['users', 'list', { skip, limit, role, status }] as const,
  userDetails: (userId: number) => ['users', 'details', userId] as const,
  userAuditLogs: (userId: number) => ['users', 'audit', userId] as const,

  // Conversations
  failedConversations: (
    skip: number,
    limit: number,
    status?: string,
    domain?: string,
    priority?: string
  ) =>
    [
      'conversations',
      'failed',
      { skip, limit, status, domain, priority },
    ] as const,
  conversationDetail: (id: string) => ['conversations', 'detail', id] as const,
  conversationRubric: (id: string) => ['conversations', 'rubric', id] as const,

  // Pipeline
  pipelineStatus: () => ['pipeline', 'status'] as const,
  pipelineOverview: () => ['pipeline', 'overview'] as const,
  pipelineDomains: () => ['pipeline', 'domains'] as const,
  domainDetails: (domain: string) => ['pipeline', 'domain', domain] as const,

  // QC Config
  qcConfigs: () => ['qc', 'configs'] as const,
  qcConfigDetail: (id: number) => ['qc', 'config', id] as const,

  // Roles
  rolesList: () => ['roles', 'list'] as const,
  roleDetails: (id: number) => ['roles', 'detail', id] as const,

  // Wallets
  walletsList: (
    skip: number,
    limit: number,
    status?: string,
    search?: string
  ) => ['wallets', 'list', { skip, limit, status, search }] as const,
  walletDetails: (userId: number) => ['wallets', 'user', userId] as const,
  walletTransactions: (walletId: string, skip: number, limit: number) =>
    ['wallets', 'transactions', walletId, { skip, limit }] as const,

  // Payments
  paymentsList: (params: any) => ['payments', 'list', params] as const,
  paymentDetails: (id: number) => ['payments', 'detail', id] as const,
  paymentStats: (startDate?: string, endDate?: string) =>
    ['payments', 'stats', { startDate, endDate }] as const,

  // Audit
  auditLogs: (params: any) => ['audit', 'logs', params] as const,
  auditLogDetail: (id: number) => ['audit', 'log', id] as const,

  // Platform
  platformConfig: () => ['platform', 'config'] as const,
  subscriptionPlans: () => ['platform', 'plans'] as const,

  // Experts (Legacy linked)
  expertsList: (skip: number, limit: number) =>
    ['experts', 'list', { skip, limit }] as const,
  expertDetails: (id: number) => ['experts', 'detail', id] as const,

  // Prompts (Legacy linked)
  promptsList: (skip: number, limit: number) =>
    ['prompts', 'list', { skip, limit }] as const,
  failedPrompts: () => ['prompts', 'failed'] as const,

  // Workbench (Legacy linked)
  taskBatches: (skip: number, limit: number) =>
    ['workbench', 'batches', { skip, limit }] as const,
  availableTasks: () => ['workbench', 'tasks', 'available'] as const,

  // Compatibility Aliases
  adminPipelineStatus: ['pipeline', 'status'] as const,
  adminUsers: (params: any) => ['users', 'list', params] as const,
  adminWallets: (params: any) => ['wallets', 'list', params] as const,
};
