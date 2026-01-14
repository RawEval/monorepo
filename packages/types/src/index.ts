// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Expert types
export type ExpertTier = 1 | 2 | 3;

export interface Expert {
  id: string;
  userId: string;
  tier: ExpertTier;
  name: string;
  email: string;
  specializations: string[];
  woeScore: number; // Weight of Evidence score
  totalTasksCompleted: number;
  accuracyRate: number;
  createdAt: Date;
  verifiedAt: Date | null;
}

// Prompt types
export type PromptStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'locked';

export interface Prompt {
  id: string;
  userId: string;
  workspaceId?: string; // Multi-tenant support
  content: string;
  originalResponse: string;
  correctedResponse: string | null;
  status: PromptStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt: Date | null;
}

// Task types
export interface Task {
  id: string;
  promptId: string;
  expertId: string;
  assignedTier: ExpertTier;
  status: PromptStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  submittedResponse: string | null;
  qualityScore: number | null;
}

// Batch types
export interface Batch {
  id: string;
  promptIds: string[];
  status: 'pending' | 'active' | 'completed';
  createdAt: Date;
  completedAt: Date | null;
}

// Evaluation types
export interface Evaluation {
  id: string;
  taskId: string;
  tier1Response: string;
  tier2Responses: string[];
  tier3Responses: string[];
  deltaImprovement: number; // Percentage improvement
  consensusScore: number;
  createdAt: Date;
}

// Security types
export interface BiometricCheck {
  id: string;
  expertId: string;
  taskId: string;
  timestamp: Date;
  faceDetected: boolean;
  identityVerified: boolean;
  deviceInfo: string;
}

export interface HeartbeatCheck {
  id: string;
  expertId: string;
  taskId: string;
  timestamp: Date;
  status: 'pass' | 'fail' | 'warning';
  anomalyDetected: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Dashboard types
export interface DashboardStats {
  totalPrompts: number;
  totalExperts: number;
  totalTasks: number;
  averageQualityScore: number;
  promptsPerDay: number[];
  expertsPerTier: Record<ExpertTier, number>;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  type: 'research_lab' | 'enterprise' | 'university';
  tier: 'research' | 'professional' | 'enterprise';
  contractedPromptsPerMonth: number;
  apiKey: string;
  createdAt: Date;
}

// Delivery types
export interface DataDelivery {
  id: string;
  organizationId: string;
  promptIds: string[];
  format: 'json' | 'jsonl' | 'parquet' | 'csv';
  deliveredAt: Date;
  batchId: string;
}

// Re-export auth types
export * from './auth';
