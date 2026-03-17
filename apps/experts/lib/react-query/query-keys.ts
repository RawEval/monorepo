export const interviewKeys = {
  all: ['interview'] as const,
  sessions: () => [...interviewKeys.all, 'sessions'] as const,
  session: (id: string | number) => [...interviewKeys.all, 'session', id] as const,
  status: (id: string | number) => [...interviewKeys.all, 'status', id] as const,
  transcript: (id: string | number) => [...interviewKeys.all, 'transcript', id] as const,
  analysis: (id: string | number) => [...interviewKeys.all, 'analysis', id] as const,
  plan: (id: string | number) => [...interviewKeys.all, 'plan', id] as const,
};

export const expertKeys = {
  all: ['expert'] as const,
  profile: () => [...expertKeys.all, 'profile'] as const,
  domains: () => [...expertKeys.all, 'domains'] as const,
  score: () => [...expertKeys.all, 'score'] as const,
  onboarding: () => [...expertKeys.all, 'onboarding'] as const,
  certifications: (id?: string | number) => [...expertKeys.all, 'certifications', id] as const,
};

export const historyKeys = {
  all: ['history'] as const,
  list: (filters?: Record<string, unknown>) => [...historyKeys.all, 'list', filters] as const,
  detail: (id: string | number) => [...historyKeys.all, 'detail', id] as const,
};
