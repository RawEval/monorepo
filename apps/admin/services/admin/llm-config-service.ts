/**
 * Admin LLM Configuration Service
 *
 * Full CRUD for providers, models, QC stage assignments.
 * Analytics: call logs, cost summary, model performance, web searches, attachments.
 * Maps to backend: /api/v1/admin/llm/*
 */
import { ApiService } from '../api-service';

// ─────────────────────────────────────────────────────────────────────────────
// Provider Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LLMProvider {
  id: number;
  provider_name: string;
  display_name: string | null;
  base_url: string | null;
  org_id: string | null;
  rpm_limit: number | null;
  tpm_limit: number | null;
  priority: number;
  is_active: boolean;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateProviderRequest {
  provider_name: string;
  display_name?: string;
  api_key: string;
  base_url?: string;
  org_id?: string;
  rpm_limit?: number;
  tpm_limit?: number;
  priority?: number;
  notes?: string;
}

export interface UpdateProviderRequest {
  display_name?: string;
  api_key?: string;
  base_url?: string;
  org_id?: string;
  rpm_limit?: number;
  tpm_limit?: number;
  priority?: number;
  is_active?: boolean;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Model Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LLMModel {
  id: number;
  model_id: string;
  provider_name: string;
  display_name: string;
  description: string | null;
  supports_vision: boolean;
  supports_tools: boolean;
  supports_streaming: boolean;
  supports_json_mode: boolean;
  supports_web_search: boolean;
  max_context_tokens: number | null;
  max_output_tokens: number | null;
  cost_per_1m_input: number | null;
  cost_per_1m_output: number | null;
  category: string | null;
  quality_tier: string | null;
  is_active: boolean;
  is_deprecated?: boolean;
  deprecation_reason?: string | null;
  deprecated_at?: string | null;
  created_at: string | null;
}

export interface CreateModelRequest {
  model_id: string;
  provider_name: string;
  display_name: string;
  description?: string;
  supports_vision?: boolean;
  supports_tools?: boolean;
  supports_streaming?: boolean;
  supports_json_mode?: boolean;
  supports_web_search?: boolean;
  max_context_tokens?: number;
  max_output_tokens?: number;
  cost_per_1m_input?: number;
  cost_per_1m_output?: number;
  category?: string;
  quality_tier?: string;
  model_metadata?: Record<string, unknown>;
}

export interface UpdateModelRequest {
  display_name?: string;
  description?: string;
  supports_vision?: boolean;
  supports_tools?: boolean;
  supports_streaming?: boolean;
  supports_json_mode?: boolean;
  supports_web_search?: boolean;
  max_context_tokens?: number;
  max_output_tokens?: number;
  cost_per_1m_input?: number;
  cost_per_1m_output?: number;
  category?: string;
  quality_tier?: string;
  is_active?: boolean;
  model_metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// QC Stage Model Types
// ─────────────────────────────────────────────────────────────────────────────

export interface QCStageModel {
  id: number;
  stage_name: string;
  display_name: string | null;
  model: string;
  fallback_model: string | null;
  temperature: number;
  max_tokens: number | null;
  timeout_seconds: number;
  is_active: boolean;
  updated_at: string | null;
}

export interface CreateQCStageModelRequest {
  stage_name: string;
  display_name?: string;
  model: string;
  fallback_model?: string;
  temperature?: number;
  max_tokens?: number;
  timeout_seconds?: number;
}

export interface UpdateQCStageModelRequest {
  model?: string;
  fallback_model?: string;
  temperature?: number;
  max_tokens?: number;
  timeout_seconds?: number;
  is_active?: boolean;
}

export interface QCStageDefault {
  stage: string;
  default_model: string;
  db_override: string | null;
  active_model: string;
  is_overridden: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Call Log Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LLMCallLog {
  id: number;
  model_requested: string;
  model_resolved: string | null;
  provider: string | null;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  latency_ms: number;
  status: 'success' | 'error' | 'timeout';
  error_message: string | null;
  stage: string | null;
  pipeline_id: number | null;
  session_id: number | null;
  user_id: number | null;
  prompt_name: string | null;
  // Only present when include_content=true or detail endpoint
  input_text?: string | null;
  output_text?: string | null;
  system_prompt_text?: string | null;
  created_at: string | null;
}

export interface CallLogListResponse {
  total: number;
  page: number;
  page_size: number;
  items: LLMCallLog[];
}

export interface CallLogFilters {
  model?: string;
  provider?: string;
  stage?: string;
  status?: string;
  pipeline_id?: number;
  session_id?: number;
  user_id?: number;
  date_from?: string;
  date_to?: string;
  include_content?: boolean;
  page?: number;
  page_size?: number;
}

export interface PipelineCallsResponse {
  pipeline_id: number;
  qc_case: {
    id: number;
    verdict: string | null;
    verdict_reason: string | null;
    pipeline_stage: string | null;
    domain: string | null;
    process_score: number | null;
    fraud_score: number | null;
    total_llm_cost_usd: number | null;
    langfuse_trace_id: string | null;
    created_at: string | null;
  } | null;
  summary: {
    total_calls: number;
    total_cost_usd: number;
    total_tokens: number;
    total_latency_ms: number;
    stages_count: number;
  };
  stages: {
    stage: string;
    model: string;
    call_count: number;
    total_cost_usd: number;
    total_tokens: number;
    total_latency_ms: number;
    calls: LLMCallLog[];
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Cost & Performance Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CostSummaryItem {
  [key: string]: unknown;
  call_count: number;
  total_tokens: number;
  total_cost_usd: number;
  avg_latency_ms: number;
  error_count: number;
}

export interface CostSummaryResponse {
  period_days: number;
  group_by: string;
  items: CostSummaryItem[];
}

export interface ModelPerformanceEntry {
  model: string;
  provider: string;
  call_count: number;
  success_count: number;
  error_count: number;
  error_rate_pct: number;
  avg_latency_ms: number;
  min_latency_ms: number;
  max_latency_ms: number;
  total_tokens: number;
  total_cost_usd: number;
  avg_cost_per_call: number;
}

export interface ModelPerformanceResponse {
  period_days: number;
  models: ModelPerformanceEntry[];
}

export interface DashboardResponse {
  config: {
    active_providers: number;
    registered_models: number;
    qc_stage_configs: number;
  };
  last_24h: { calls: number; tokens: number; cost_usd: number; avg_latency_ms: number; errors: number };
  last_7d: { calls: number; tokens: number; cost_usd: number; avg_latency_ms: number; errors: number };
  last_30d: { calls: number; tokens: number; cost_usd: number; avg_latency_ms: number; errors: number };
  top_models_30d: { model: string; calls: number; cost_usd: number }[];
}

export interface StagesSummaryResponse {
  period_days: number;
  stages: {
    stage: string;
    configured_model: string | null;
    fallback_model: string | null;
    temperature: number | null;
    models_used: {
      model: string;
      call_count: number;
      total_cost_usd: number;
      avg_cost_usd: number;
      avg_latency_ms: number;
      avg_input_tokens: number;
      avg_output_tokens: number;
      error_count: number;
    }[];
    total_calls: number;
    total_cost_usd: number;
    total_errors: number;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// System Prompt Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SystemPrompt {
  id: number;
  purpose: string;
  display_name: string | null;
  category: string | null;
  prompt_text: string;
  description: string | null;
  variables: string[] | null;
  model_hint: string | null;
  is_active: boolean;
  version: number;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateSystemPromptRequest {
  purpose: string;
  display_name?: string;
  category?: string;
  prompt_text: string;
  description?: string;
  variables?: string[];
  model_hint?: string;
}

export interface UpdateSystemPromptRequest {
  display_name?: string;
  category?: string;
  prompt_text?: string;
  description?: string;
  variables?: string[];
  model_hint?: string;
  is_active?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Web Search & Attachment Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WebSearchRecord {
  id: number;
  session_id: number;
  request_id: string | null;
  turn_number: number | null;
  search_query: string;
  results_count: number;
  search_results?: { title: string; url: string; snippet: string }[] | null;
  original_prompt?: string | null;
  enhanced_prompt?: string | null;
  status: string;
  error_message: string | null;
  search_provider: string;
  latency_ms: number | null;
  failed_prompt_id: number | null;
  search_timestamp: string | null;
  created_at: string | null;
}

export interface WebSearchListResponse {
  total: number;
  page: number;
  page_size: number;
  items: WebSearchRecord[];
}

export interface WebSearchSummaryResponse {
  period_days: number;
  total_searches: number;
  success_count: number;
  no_results_count: number;
  failed_count: number;
  avg_results_per_search: number;
  avg_latency_ms: number;
}

export interface FileAttachment {
  id: number;
  session_id: number;
  filename: string;
  file_type: string;
  content_type: string | null;
  file_size_bytes: number | null;
  s3_key: string | null;
  s3_url: string | null;
  attachment_location: string | null;
  created_at: string | null;
}

export interface AttachmentListResponse {
  total: number;
  page: number;
  page_size: number;
  items: FileAttachment[];
}

export interface AttachmentSummaryResponse {
  period_days: number;
  total_files: number;
  total_size_bytes: number;
  total_size_mb: number;
  by_file_type: { file_type: string; count: number; total_bytes: number }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Trace Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionWithUsage {
  id: number;
  user_id: number | null;
  title: string | null;
  model: string | null;
  provider: string | null;
  llm_calls: number;
  total_cost_usd: number;
  total_tokens: number;
  web_search_count: number;
  attachment_count: number;
  created_at: string | null;
}

export interface SessionFullTrace {
  session: {
    id: number;
    user_id: number | null;
    title: string | null;
    model: string | null;
    created_at: string | null;
  };
  summary: {
    total_llm_calls: number;
    total_cost_usd: number;
    total_tokens: number;
    web_searches: number;
    attachments: number;
  };
  llm_calls: LLMCallLog[];
  web_searches: WebSearchRecord[];
  attachments: FileAttachment[];
}

// ─────────────────────────────────────────────────────────────────────────────
// QC Cost Analytics Types
// ─────────────────────────────────────────────────────────────────────────────

export interface QCCostAnalyticsResponse {
  total_pipeline_runs: number;
  total_llm_cost_usd: number;
  avg_cost_per_pipeline: number;
  avg_tokens_per_pipeline: number;
  per_stage_avg_cost: Record<string, number>;
  per_verdict_cost: Record<string, { total_cost: number; count: number; avg_cost: number }>;
  per_domain_cost: Record<string, { total_cost: number; count: number; avg_cost: number }>;
  date_range: { from: string; to: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Model
// ─────────────────────────────────────────────────────────────────────────────

export interface TestModelRequest {
  model: string;
  prompt?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface TestModelResponse {
  model: string;
  provider: string;
  content: string;
  tokens_used: { input: number; output: number; total: number } | null;
  latency_ms: number;
  cost_usd: number;
  error: string | null;
}


// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export class AdminLLMConfigService extends ApiService {
  // ── Providers ────────────────────────────────────────────────────────────

  async listProviders(): Promise<LLMProvider[]> {
    const response = await this.client.get<LLMProvider[]>('/admin/llm/providers');
    return this.handleResponse(response);
  }

  async createProvider(data: CreateProviderRequest): Promise<LLMProvider> {
    const response = await this.client.post<LLMProvider>('/admin/llm/providers', data);
    return this.handleResponse(response);
  }

  async updateProvider(id: number, data: UpdateProviderRequest): Promise<LLMProvider> {
    const response = await this.client.put<LLMProvider>(`/admin/llm/providers/${id}`, data);
    return this.handleResponse(response);
  }

  async deleteProvider(id: number): Promise<void> {
    await this.client.delete(`/admin/llm/providers/${id}`);
  }

  // ── Models ───────────────────────────────────────────────────────────────

  async listModels(params: { provider?: string; category?: string; active_only?: boolean } = {}): Promise<LLMModel[]> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<LLMModel[]>(`/admin/llm/models${query}`);
    return this.handleResponse(response);
  }

  async createModel(data: CreateModelRequest): Promise<LLMModel> {
    const response = await this.client.post<LLMModel>('/admin/llm/models', data);
    return this.handleResponse(response);
  }

  async updateModel(id: number, data: UpdateModelRequest): Promise<LLMModel> {
    const response = await this.client.put<LLMModel>(`/admin/llm/models/${id}`, data);
    return this.handleResponse(response);
  }

  async deleteModel(id: number): Promise<void> {
    await this.client.delete(`/admin/llm/models/${id}`);
  }

  async deprecateModel(id: number, reason: string): Promise<LLMModel> {
    const response = await this.client.post<LLMModel>(`/admin/llm/models/${id}/deprecate`, { reason });
    return this.handleResponse(response);
  }

  async undeprecateModel(id: number): Promise<LLMModel> {
    const response = await this.client.post<LLMModel>(`/admin/llm/models/${id}/undeprecate`, {});
    return this.handleResponse(response);
  }

  async listAvailableForChat(params: { category?: string; provider?: string } = {}): Promise<LLMModel[]> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<LLMModel[]>(`/admin/llm/models/available-for-chat${query}`);
    return this.handleResponse(response);
  }

  // ── QC Stage Models ──────────────────────────────────────────────────────

  async listQCStageModels(): Promise<QCStageModel[]> {
    const response = await this.client.get<QCStageModel[]>('/admin/llm/qc-stages');
    return this.handleResponse(response);
  }

  async createQCStageModel(data: CreateQCStageModelRequest): Promise<QCStageModel> {
    const response = await this.client.post<QCStageModel>('/admin/llm/qc-stages', data);
    return this.handleResponse(response);
  }

  async updateQCStageModel(id: number, data: UpdateQCStageModelRequest): Promise<QCStageModel> {
    const response = await this.client.put<QCStageModel>(`/admin/llm/qc-stages/${id}`, data);
    return this.handleResponse(response);
  }

  async deleteQCStageModel(id: number): Promise<void> {
    await this.client.delete(`/admin/llm/qc-stages/${id}`);
  }

  async listQCStageDefaults(): Promise<{ stages: QCStageDefault[]; total: number; overridden_count: number }> {
    const response = await this.client.get<{ stages: QCStageDefault[]; total: number; overridden_count: number }>(
      '/admin/llm/qc-stages/defaults'
    );
    return this.handleResponse(response);
  }

  // ── Call Logs ────────────────────────────────────────────────────────────

  async listCallLogs(filters: CallLogFilters = {}): Promise<CallLogListResponse> {
    const query = this.buildQuery(filters as Record<string, unknown>);
    const response = await this.client.get<CallLogListResponse>(`/admin/llm/call-logs${query}`);
    return this.handleResponse(response);
  }

  async getCallLogDetail(logId: number): Promise<LLMCallLog> {
    const response = await this.client.get<LLMCallLog>(`/admin/llm/call-logs/${logId}`);
    return this.handleResponse(response);
  }

  async getCallLogsByPipeline(pipelineId: number): Promise<PipelineCallsResponse> {
    const response = await this.client.get<PipelineCallsResponse>(`/admin/llm/call-logs/by-pipeline/${pipelineId}`);
    return this.handleResponse(response);
  }

  async getCallLogsBySession(
    sessionId: number,
    params: { stage?: string; include_content?: boolean; page?: number; page_size?: number } = {}
  ): Promise<CallLogListResponse & { session_id: number; total_cost_usd: number; total_tokens: number }> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get(`/admin/llm/call-logs/by-session/${sessionId}${query}`);
    return this.handleResponse(response);
  }

  async getStagesSummary(days = 7): Promise<StagesSummaryResponse> {
    const response = await this.client.get<StagesSummaryResponse>(`/admin/llm/call-logs/stages-summary?days=${days}`);
    return this.handleResponse(response);
  }

  // ── Cost & Performance Analytics ─────────────────────────────────────────

  async getCostSummary(params: { days?: number; group_by?: 'model' | 'provider' | 'stage' | 'day' } = {}): Promise<CostSummaryResponse> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<CostSummaryResponse>(`/admin/llm/cost-summary${query}`);
    return this.handleResponse(response);
  }

  async getModelPerformance(days = 7): Promise<ModelPerformanceResponse> {
    const response = await this.client.get<ModelPerformanceResponse>(`/admin/llm/model-performance?days=${days}`);
    return this.handleResponse(response);
  }

  async getDashboard(): Promise<DashboardResponse> {
    const response = await this.client.get<DashboardResponse>('/admin/llm/dashboard');
    return this.handleResponse(response);
  }

  async getQCCostAnalytics(params: { days?: number; domain?: string; verdict?: string } = {}): Promise<QCCostAnalyticsResponse> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<QCCostAnalyticsResponse>(`/admin/llm/qc-cost-analytics${query}`);
    return this.handleResponse(response);
  }

  // ── Test Model ───────────────────────────────────────────────────────────

  async testModel(data: TestModelRequest): Promise<TestModelResponse> {
    const response = await this.client.post<TestModelResponse>('/admin/llm/test-model', data);
    return this.handleResponse(response);
  }

  // ── System Prompts ───────────────────────────────────────────────────────

  async listSystemPrompts(category?: string): Promise<SystemPrompt[]> {
    const query = category ? `?category=${category}` : '';
    const response = await this.client.get<SystemPrompt[]>(`/admin/llm/system-prompts${query}`);
    return this.handleResponse(response);
  }

  async upsertSystemPrompt(data: CreateSystemPromptRequest): Promise<SystemPrompt> {
    const response = await this.client.post<SystemPrompt>('/admin/llm/system-prompts', data);
    return this.handleResponse(response);
  }

  async updateSystemPrompt(id: number, data: UpdateSystemPromptRequest): Promise<SystemPrompt> {
    const response = await this.client.put<SystemPrompt>(`/admin/llm/system-prompts/${id}`, data);
    return this.handleResponse(response);
  }

  async deleteSystemPrompt(id: number): Promise<void> {
    await this.client.delete(`/admin/llm/system-prompts/${id}`);
  }

  async listSystemPromptRegistry(): Promise<Record<string, unknown>[]> {
    const response = await this.client.get<Record<string, unknown>[]>('/admin/llm/system-prompts/registry');
    return this.handleResponse(response);
  }

  // ── Web Searches ─────────────────────────────────────────────────────────

  async listWebSearches(params: {
    session_id?: number;
    status?: string;
    search_provider?: string;
    date_from?: string;
    date_to?: string;
    include_content?: boolean;
    page?: number;
    page_size?: number;
  } = {}): Promise<WebSearchListResponse> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<WebSearchListResponse>(`/admin/llm/web-searches${query}`);
    return this.handleResponse(response);
  }

  async getWebSearchDetail(id: number): Promise<WebSearchRecord> {
    const response = await this.client.get<WebSearchRecord>(`/admin/llm/web-searches/${id}`);
    return this.handleResponse(response);
  }

  async getWebSearchSummary(days = 30): Promise<WebSearchSummaryResponse> {
    const response = await this.client.get<WebSearchSummaryResponse>(`/admin/llm/web-searches/summary?days=${days}`);
    return this.handleResponse(response);
  }

  // ── File Attachments ─────────────────────────────────────────────────────

  async listAttachments(params: {
    session_id?: number;
    file_type?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<AttachmentListResponse> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<AttachmentListResponse>(`/admin/llm/attachments${query}`);
    return this.handleResponse(response);
  }

  async getAttachmentSummary(days = 30): Promise<AttachmentSummaryResponse> {
    const response = await this.client.get<AttachmentSummaryResponse>(`/admin/llm/attachments/summary?days=${days}`);
    return this.handleResponse(response);
  }

  // ── Sessions (admin view with usage) ─────────────────────────────────────

  async listSessionsWithUsage(params: {
    user_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<{ total: number; page: number; page_size: number; items: SessionWithUsage[] }> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get(`/admin/llm/sessions${query}`);
    return this.handleResponse(response);
  }

  async getSessionFullTrace(sessionId: number): Promise<SessionFullTrace> {
    const response = await this.client.get<SessionFullTrace>(`/admin/llm/sessions/${sessionId}/full-trace`);
    return this.handleResponse(response);
  }
}

export const adminLLMConfigService = new AdminLLMConfigService();
