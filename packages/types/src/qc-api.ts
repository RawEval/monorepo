// ---------------------------------------------------------------------------
// QC Pipeline & Failure Marking Types
// Covers: mark-failed (all 3 endpoints), QC cases, appeals, disputes
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Shared: FailedModelSelection
// ---------------------------------------------------------------------------

export interface FailedModelSelection {
  model: string;
  provider: string;
  message_id?: number | null;
}

// ---------------------------------------------------------------------------
// Mark Message Failed — POST /sessions/{id}/messages/{mid}/mark-failed
// ---------------------------------------------------------------------------

export interface MarkMessageFailedRequest {
  failure_reason?: string | null;
  failure_probability?: number;
  dominant_failure_classes?: string[] | null;
  description?: string | null;
  domain?: string | null;
  subdomain?: string | null;
  additional_domains?: string[] | null;
  turn_number?: number | null;
}

export interface DetectedDomain {
  domain_name: string;
  subdomain_name?: string | null;
  confidence: number;
  is_primary: boolean;
  source?: string;
}

export interface MarkMessageFailedResponse {
  session_id: number;
  message_id: number;
  conversation_marked_failed: boolean;
  failed_prompt_created: boolean;
  analysis_triggered: boolean;
  domain?: string | null;
  subdomain?: string | null;
  domain_id?: number | null;
  domain_auto_detected?: boolean;
  detected_domains?: DetectedDomain[] | null;
  unknown_domains?: string[] | null;
  current_status?: string | null;
  message: string;
}

// ---------------------------------------------------------------------------
// Mark Session Failed — POST /sessions/{id}/mark-failed
// ---------------------------------------------------------------------------

export interface MarkSessionFailedRequest {
  failure_reason?: string | null;
  failure_probability?: number;
  dominant_failure_classes?: string[] | null;
  description?: string | null;
  domain?: string | null;
  subdomain?: string | null;
  additional_domains?: string[] | null;
  turn_number?: number | null;
  failed_models?: FailedModelSelection[] | null;
  failed_turn_number?: number | null;
  tier_1_expert_count?: number;
  tier_2_expert_count?: number;
  tier_3_expert_count?: number;
  reviewer_pre_annotation_count?: number;
  reviewer_post_annotation_count?: number;
}

export interface MarkSessionFailedResponse {
  session_id: number;
  id?: number | null;
  user_id?: number | null;
  title?: string | null;
  status?: string | null;
  workflow_type?: string | null;
  message_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  user_marked_failed: boolean;
  failed_prompt_created: boolean;
  analysis_triggered: boolean;
  domain?: string | null;
  subdomain?: string | null;
  domain_id?: number | null;
  domain_auto_detected?: boolean;
  detected_domains?: DetectedDomain[] | null;
  unknown_domains?: string[] | null;
  current_status?: string | null;
  message: string;
}

// ---------------------------------------------------------------------------
// QCInfo — nested in failed prompt and summary responses
// ---------------------------------------------------------------------------

export interface QCInfo {
  qc_case_id?: number | null;
  qc_status?: string | null;
  pipeline_stage?: string | null;
  verdict?: string | null;
  fp_score?: number | null;
  process_score?: number | null;
  fraud_score?: number | null;
  d_global?: number | null;
  judge_variance?: number | null;
  root_cause?: string | null;
  payout_eligible?: boolean | null;
  payout_block_reason?: string | null;
  pipeline_latency_ms?: number | null;
  pipeline_started_at?: string | null;
  pipeline_completed_at?: string | null;
  claim_score?: number | null;
  claim_count?: number | null;
  self_consistency_score?: number | null;
  difficulty_score?: number | null;
  judge_abstention_count?: number | null;
  response_length?: number | null;
  length_adjusted?: boolean | null;
  semantic_match_status?: string | null;
  holistic_score?: number | null;
  holistic_override_applied?: boolean | null;
}

// ---------------------------------------------------------------------------
// Failed Prompt With QC — GET /qc/failed-prompts items
// ---------------------------------------------------------------------------

export interface FailedPromptWithQC {
  id: number;
  conversation_session_id?: number | null;
  domain?: string | null;
  subdomain?: string | null;
  status?: string | null;
  status_display_name?: string | null;
  status_phase?: string | null;
  model_analysis_status?: string | null;
  qc_status?: string | null;
  qc_outcome?: string | null;
  qc_dispute_id?: number | null;
  pre_review_result?: boolean | null;
  failure_reason?: string | null;
  failed_turn_number?: number | null;
  total_turns?: number | null;
  failed_message_id?: number | null;
  failed_model?: string | null;
  failed_provider?: string | null;
  tier_1_expert_count?: number;
  tier_2_expert_count?: number;
  tier_3_expert_count?: number;
  reviewer_pre_annotation_count?: number;
  reviewer_post_annotation_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
  qc?: QCInfo | null;
}

export interface PaginatedFailedPromptsWithQC {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: FailedPromptWithQC[];
}

// ---------------------------------------------------------------------------
// QC Summary — GET /qc/summary/{conversation_id}
// ---------------------------------------------------------------------------

export interface DisputeInfo {
  qc_dispute_id?: number | null;
  status?: string | null;
  reason?: string | null;
  original_verdict?: string | null;
  pre_review_result?: boolean | null;
  pre_reviewer_id?: number | null;
  created_at?: string | null;
}

export interface QCSummaryResponse {
  conversation_id: number;
  session_status?: string | null;
  user_marked_failed?: boolean;
  fpf_status?: string | null;
  fpf_status_display?: string | null;
  fpf_phase?: string | null;
  qc_outcome?: string | null;
  domain?: string | null;
  subdomain?: string | null;
  failed_turn_number?: number | null;
  total_turns?: number | null;
  failed_message_id?: number | null;
  failed_model?: string | null;
  failed_provider?: string | null;
  qc?: QCInfo | null;
  dispute?: DisputeInfo | null;
  intent_summary?: string | null;
  status_history?: Array<Record<string, unknown>>;
  rubric?: Record<string, unknown> | null;
  criteria?: Array<Record<string, unknown>>;
  judges?: Array<Record<string, unknown>>;
  fraud_signals?: Array<Record<string, unknown>> | null;
  semantic_matches?: Array<Record<string, unknown>>;
  holistic_evaluation?: Record<string, unknown> | null;
  claim_decompositions?: Array<Record<string, unknown>>;
  error_locations?: Array<Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// QC Appeals — POST /qc/appeals, GET /qc/appeals
// ---------------------------------------------------------------------------

export interface CreateAppealRequest {
  qc_case_id: number;
  justification: string;
}

export interface AppealCreateResponse {
  appeal_id: number;
  qc_case_id: number;
  status: string;
  message: string;
}

export interface AppealListItem {
  id: number;
  qc_case_id?: number | null;
  justification?: string | null;
  status?: string | null;
  outcome?: string | null;
  outcome_reason?: string | null;
  created_at?: string | null;
  resolved_at?: string | null;
}

export interface AppealListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: AppealListItem[];
}

// ---------------------------------------------------------------------------
// QC Disputes — POST /qc/dispute
// ---------------------------------------------------------------------------

export interface MarkQCWrongRequest {
  conversation_id: number;
  reason: string;
}

export interface QCDisputeResponse {
  conversation_id: number;
  qc_case_id: number;
  qc_dispute_id: number;
  original_verdict?: string | null;
  qc_outcome?: string;
  new_fpf_status?: string | null;
  reviewer_pre_annotation_count?: number | null;
  message: string;
}

// ---------------------------------------------------------------------------
// Failed Prompt Payouts — GET /payments/failed-prompt-payouts
// ---------------------------------------------------------------------------

export interface FailedPromptPayoutItem {
  conversation_id: number;
  conversation_title?: string | null;
  model?: string | null;
  failed_turn_number?: number | null;
  total_turns?: number | null;
  failed_message_id?: number | null;
  failed_message_content?: string | null;
  failure_reason?: string | null;
  qc_status?: string | null;
  qc_outcome?: string | null;
  payout_eligible?: boolean;
  payout_block_reason?: string | null;
  payout_status?: string | null;
  payout_amount?: number | null;
  payout_currency?: string | null;
  marked_at?: string | null;
}

export interface FailedPromptPayoutListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  pending_count: number;
  paid_count: number;
  blocked_count: number;
  total_earned: number;
  currency: string;
  items: FailedPromptPayoutItem[];
}
