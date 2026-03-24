export const queryKeys = {
  me: ['me'] as const,

  users: {
    all: ['users'] as const,
    list: (params: Record<string, unknown>) =>
      ['users', 'list', params] as const,
    roles: (userId: number) => ['users', 'roles', userId] as const,
    profileCompletion: ['users', 'profile-completion'] as const,
    status: ['users', 'status'] as const,
  },

  conversations: {
    all: ['conversations'] as const,
    list: (params: Record<string, unknown>) =>
      ['conversations', 'list', params] as const,
    detail: (id: number) => ['conversations', 'detail', id] as const,
    full: (id: number) => ['conversations', 'full', id] as const,
    qcDetail: (id: number) => ['conversations', 'qc-detail', id] as const,
    rubric: (id: number) => ['conversations', 'rubric', id] as const,
    statusHistory: (id: number) =>
      ['conversations', 'status-history', id] as const,
    annotationProgress: (id: number) =>
      ['conversations', 'annotation-progress', id] as const,
  },

  experts: {
    all: ['experts'] as const,
    list: (params: Record<string, unknown>) =>
      ['experts', 'list', params] as const,
    detail: (id: number) => ['experts', 'detail', id] as const,
    scoreHistory: (id: number) => ['experts', 'score-history', id] as const,
    trajectory: (id: number) => ['experts', 'trajectory', id] as const,
  },

  batches: {
    all: ['batches'] as const,
    list: (params: Record<string, unknown>) =>
      ['batches', 'list', params] as const,
    detail: (id: number) => ['batches', 'detail', id] as const,
    quality: (id: number) => ['batches', 'quality', id] as const,
    qualityHistory: (id: number) => ['batches', 'quality-history', id] as const,
  },

  pipeline: {
    all: ['pipeline'] as const,
    overview: ['pipeline', 'overview'] as const,
    domainSummary: ['pipeline', 'domain-summary'] as const,
    taskStatusSummary: ['pipeline', 'task-status-summary'] as const,
    taskStatusDefinitions: ['pipeline', 'task-status-definitions'] as const,
    tasksByStatus: (status: string) =>
      ['pipeline', 'tasks-by-status', status] as const,
  },

  domains: {
    all: ['domains'] as const,
    list: (includeInactive: boolean) =>
      ['domains', 'list', { includeInactive }] as const,
  },

  allocations: {
    all: ['allocations'] as const,
    list: (params: Record<string, unknown>) =>
      ['allocations', 'list', params] as const,
  },

  wallets: {
    all: ['wallets'] as const,
    list: ['wallets', 'list'] as const,
    user: (userId: number) => ['wallets', 'user', userId] as const,
    transactions: (userId: number) =>
      ['wallets', 'transactions', userId] as const,
  },

  payments: {
    all: ['payments'] as const,
    payouts: (params: Record<string, unknown>) =>
      ['payments', 'payouts', params] as const,
    payoutConfig: ['payments', 'payout-config'] as const,
    payoutConfigHistory: ['payments', 'payout-config-history'] as const,
    byUser: (userId: number) => ['payments', 'by-user', userId] as const,
    byBatch: (batchId: number) => ['payments', 'by-batch', batchId] as const,
  },

  qcConfig: {
    all: ['qc-config'] as const,
    list: ['qc-config', 'list'] as const,
    active: ['qc-config', 'active'] as const,
  },

  judgeConfig: {
    all: ['judge-config'] as const,
    list: ['judge-config', 'list'] as const,
    active: ['judge-config', 'active'] as const,
    defaults: ['judge-config', 'defaults'] as const,
  },

  modelAnalytics: {
    all: ['model-analytics'] as const,
    failureSummary: (params: Record<string, unknown>) =>
      ['model-analytics', 'failure-summary', params] as const,
    failureTrend: (params: Record<string, unknown>) =>
      ['model-analytics', 'failure-trend', params] as const,
    qcBreakdown: (params: Record<string, unknown>) =>
      ['model-analytics', 'qc-breakdown', params] as const,
    comparison: (params: Record<string, unknown>) =>
      ['model-analytics', 'comparison', params] as const,
  },

  config: {
    all: ['config'] as const,
    platform: (category?: string) => ['config', 'platform', category] as const,
  },

  audit: {
    all: ['audit'] as const,
    list: (params: Record<string, unknown>) =>
      ['audit', 'list', params] as const,
  },

  analytics: {
    all: ['analytics'] as const,
    leaderboard: (tier?: number) => ['analytics', 'leaderboard', tier] as const,
    qualityTrends: (domain?: string) =>
      ['analytics', 'quality-trends', domain] as const,
    tierChanges: ['analytics', 'tier-changes'] as const,
  },

  iaa: {
    all: ['iaa'] as const,
    overview: ['iaa', 'overview'] as const,
    batch: (batchId: number) => ['iaa', 'batch', batchId] as const,
    conversation: (id: number) => ['iaa', 'conversation', id] as const,
    expert: (expertId: number) => ['iaa', 'expert', expertId] as const,
  },

  reviewers: {
    all: ['reviewers'] as const,
    preAnnotation: (params: Record<string, unknown>) =>
      ['reviewers', 'pre-annotation', params] as const,
    postAnnotation: (params: Record<string, unknown>) =>
      ['reviewers', 'post-annotation', params] as const,
  },

  contact: {
    all: ['contact'] as const,
    list: (params: Record<string, unknown>) =>
      ['contact', 'list', params] as const,
    detail: (id: number) => ['contact', 'detail', id] as const,
    stats: ['contact', 'stats'] as const,
    topics: ['contact', 'topics'] as const,
  },

  llmConfig: {
    all: ['llm-config'] as const,
    providers: ['llm-config', 'providers'] as const,
    models: ['llm-config', 'models'] as const,
    qcStageDefaults: ['llm-config', 'qc-stage-defaults'] as const,
    qcStageModels: ['llm-config', 'qc-stage-models'] as const,
  },
} as const;
