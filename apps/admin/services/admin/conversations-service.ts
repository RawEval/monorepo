import { ApiService, type PaginatedResponse } from '../api-service';

export interface AdminFailedConversation {
  conversation_id: number;
  session_request_id: string;
  user_id: number;
  user_email: string;
  domain: string | null;
  failure_type: string | null;
  failure_probability: number | null;
  qc_status: string | null;
  agreement_level: number | null;
  fleiss_kappa: number | null;
  total_cost: number | null;
  total_tokens: number | null;
  model_used: string | null;
  annotator_count: number | null;
  qc_version: string | null;
  created_at: string;
  updated_at: string;
  org_id?: number | null;
  qc_flag_status?: string | null;
  annotator_tier?: number | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface ConversationRubric {
  rubric: unknown;
  conversation_id: number;
}

export interface AnnotationProgress {
  conversation_id: number;
  tiers: unknown[];
}

/** Full inspection response: conversation layer, model calls, QC runs, snapshots, annotator data, etc. */
export interface ConversationMessageMetadata {
  streaming?: boolean;
  web_search?: boolean;
  marked_failed?: boolean;
  failure_reason?: string | null;
  marked_failed_at?: string | null;
  failure_probability?: number | null;
  models_queried?: Array<{ model: string; provider: string }>;
  [key: string]: unknown;
}

export interface ConversationMessage {
  id: number;
  session_id: number;
  turn_number: number;
  role: 'user' | 'assistant';
  content: string;
  model: string | null;
  provider: string | null;
  tokens_used: number | null;
  latency_ms: number | null;
  message_metadata?: ConversationMessageMetadata | null;
  created_at: string;
  [key: string]: unknown;
}

export interface ConversationCostTurn {
  turn: number;
  model: string | null;
  provider: string | null;
  tokens: number | null;
  latency_ms: number | null;
}

export interface ConversationObj {
  session_id: number;
  request_id?: string;
  messages: ConversationMessage[];
  workflow_name?: string;
  workflow_type?: string;
  user_id?: number;
  user_email?: string;
  user_full_name?: string;
  user_role?: string;
  org_id?: number | null;
  org_name?: string | null;
  failure_type?: string | null;
  user_marked_failed?: boolean;
  qc_flagged?: boolean;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
  total_cost?: number | null;
  cost_per_model_call?: ConversationCostTurn[];
  total_latency_ms?: number | null;
  total_tokens_input?: number;
  total_tokens_output?: number;
  status?: string;
  error_message?: string | null;
  web_search_enabled?: boolean;
  [key: string]: unknown;
}

export interface FailedPromptFinalObj {
  id?: number;
  conversation_session_id?: number;
  original_prompt_text?: string;
  domain?: string;
  subdomain?: string;
  domain_id?: number;
  failure_reason?: string;
  priority?: string;
  status?: string;
  status_id?: number;
  qc_status?: string;
  qc_outcome?: string;
  failed_turn_number?: number;
  total_turns?: number;
  failed_message_id?: number;
  failed_model?: string;
  failed_provider?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface FailedConversationFullResponse {
  conversation?: ConversationObj;
  failed_prompt?: Record<string, unknown>;
  failed_prompt_final?: FailedPromptFinalObj | null;
  false_positive?: Record<string, unknown> | null;
  needs_human_review?: Record<string, unknown> | null;
  semantic_entropy?: Record<string, unknown> | null;
  judge_evaluations?: unknown[];
  majority_verdict?: Record<string, unknown> | null;
  attribution?: Record<string, unknown> | null;
  rubric?: Record<string, unknown> | null;
  status_history?: StatusHistoryEntry[];
  qc_intent_objects?: unknown[];
  [key: string]: unknown;
}

export interface StatusHistoryEntry {
  status: string;
  changed_at: string;
  changed_by: number | null;
  reason: string | null;
}

/** Per-model QC detail: one entry per model with full QC data for that task */
export interface FailedConversationQcDetailModel {
  model?: string;
  provider?: string;
  fpf_id?: number;
  fpf?: FailedPromptFinalObj & Record<string, unknown>;
  assistant_message?: ConversationMessage;
  model_name?: string;
  failed_prompt_final?: Record<string, unknown>;
  assistant_message_content?: string;
  qc_case?: Record<string, unknown> | null;
  qc_judges?: unknown[];
  qc_fraud_signals?: unknown[];
  qc_intent_object?: Record<string, unknown>;
  qc_intent_objects?: unknown[];
  qc_rubric?: Record<string, unknown> | null;
  qc_pii_maps?: unknown[];
  qc_status_history?: unknown[];
  verdict_failed_prompt?: unknown[];
  verdict_false_positive?: unknown[];
  verdict_needs_human_review?: unknown[];
  failed_prompt?: Record<string, unknown>;
  false_positive?: Record<string, unknown>;
  needs_human_review?: Record<string, unknown>;
  analysis_rubric?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/** Shared context for QC detail (user messages, attachments, semantic entropy, etc.) */
export interface FailedConversationQcDetailShared {
  user_id?: number;
  user_email?: string;
  user_full_name?: string;
  workflow_name?: string;
  workflow_type?: string;
  web_search_enabled?: boolean;
  created_at?: string;
  user_messages?: unknown[];
  attachments?: unknown[];
  model_analysis?: Record<string, unknown>;
  error_markings?: unknown[];
  conversation_questions?: unknown[];
  question_responses?: unknown[];
  qc_summary?: Record<string, unknown>;
  qc_runs?: unknown[];
  web_search_records?: unknown[];
  semantic_entropy_results?: unknown[];
  judge_evaluations?: unknown[];
  judge_majority_verdict?: Record<string, unknown>;
  failure_attribution?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FailedConversationQcDetailResponse {
  conversation_id: number;
  session_status?: string;
  user_marked_failed?: boolean;
  total_models_evaluated?: number;
  models?: FailedConversationQcDetailModel[];
  shared?: FailedConversationQcDetailShared;
}

export interface RerunQCResponse {
  new_qc_run?: Record<string, unknown>;
  old_qc_run?: Record<string, unknown>;
  diff?: Record<string, unknown>;
  snapshot_id?: number;
  admin_id?: number;
  timestamp?: string;
}

export interface ListFailedConversationsParams {
  page?: number;
  page_size?: number;
  /** ISO 8601 */
  date_from?: string;
  /** ISO 8601 */
  date_to?: string;
  user_id?: number;
  org_id?: number;
  model?: string;
  qc_flag_status?: string;
  /** user_marked | qc_flagged | both */
  failure_type?: string;
  qc_version?: string;
  /** 1 | 2 | 3 */
  annotator_tier?: number;
  min_iaa_score?: number;
  max_cost?: number;
  domain?: string;
  status?: string;
  sort_by?: string;
  /** asc | desc */
  sort_order?: string;
}

export interface TransitionStatusRequest {
  new_status_code: string;
  reason: string;
}

export interface RerunQCRequest {
  reason: string;
  config_id?: number;
  /** Custom judge panel config (e.g. test GPT-5 as judge). If omitted, uses active judge config. */
  judge_config_id?: number;
}

export interface UpdateAnnotationConfigRequest {
  tier_1_expert_count?: number;
  tier_2_expert_count?: number;
  tier_3_expert_count?: number;
  reviewer_pre_annotation_count?: number;
  reviewer_post_annotation_count?: number;
  reason: string;
}

export class AdminConversationsService extends ApiService {
  async listFailedConversations(
    params: ListFailedConversationsParams = {}
  ): Promise<PaginatedResponse<AdminFailedConversation>> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<
      PaginatedResponse<AdminFailedConversation>
    >(`/admin/failed-conversations${query}`);
    return this.handleResponse(response);
  }

  /** Deep inspection — full variable visibility for a failed conversation */
  async getFullConversation(
    conversationId: number
  ): Promise<FailedConversationFullResponse> {
    const response = await this.client.get<FailedConversationFullResponse>(
      `/admin/failed-conversations/${conversationId}/full`
    );
    return this.handleResponse(response);
  }

  /** Per-model QC detail — everything per task for each model */
  async getQcDetail(
    conversationId: number
  ): Promise<FailedConversationQcDetailResponse> {
    const response = await this.client.get<FailedConversationQcDetailResponse>(
      `/admin/failed-conversations/${conversationId}/qc-detail`
    );
    return this.handleResponse(response);
  }

  async getRubric(conversationId: number): Promise<ConversationRubric> {
    const response = await this.client.get<ConversationRubric>(
      `/admin/failed-conversations/${conversationId}/rubric`
    );
    return this.handleResponse(response);
  }

  async getAnnotationProgress(
    conversationId: number
  ): Promise<AnnotationProgress> {
    const response = await this.client.get<AnnotationProgress>(
      `/admin/failed-conversations/${conversationId}/annotation-progress`
    );
    return this.handleResponse(response);
  }

  async getStatusHistory(
    conversationId: number
  ): Promise<StatusHistoryEntry[]> {
    const response = await this.client.get<StatusHistoryEntry[]>(
      `/admin/failed-conversations/${conversationId}/status-history`
    );
    return this.handleResponse(response);
  }

  async transitionStatus(
    conversationId: number,
    data: TransitionStatusRequest
  ): Promise<unknown> {
    const response = await this.client.post(
      `/admin/failed-conversations/${conversationId}/transition-status`,
      data
    );
    return this.handleResponse(response);
  }

  /** Re-run QC pipeline; creates new QC version (SCD Type 2). Pass judge_config_id for custom judge panel. */
  async rerunQC(
    conversationId: number,
    data: RerunQCRequest
  ): Promise<RerunQCResponse> {
    const response = await this.client.post<RerunQCResponse>(
      `/admin/failed-conversations/${conversationId}/rerun-qc`,
      data
    );
    return this.handleResponse(response);
  }

  async updateAnnotationConfig(
    conversationId: number,
    data: UpdateAnnotationConfigRequest
  ): Promise<unknown> {
    const response = await this.client.patch(
      `/admin/failed-conversations/${conversationId}/annotation-config`,
      data
    );
    return this.handleResponse(response);
  }
}

export const adminConversationsService = new AdminConversationsService();
