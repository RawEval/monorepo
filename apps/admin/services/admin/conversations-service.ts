import { ApiService, type PaginatedResponse } from '../api-service';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Failed conversations list
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminFailedConversation {
  conversation_id: number;
  session_request_id: string | null;
  user_id: number | null;
  user_email: string | null;
  user_full_name: string | null;
  domain: string | null;
  domain_display_name: string | null;
  subdomain: string | null;
  domain_id: number | null;
  failed_model: string | null;
  failed_provider: string | null;
  status: string | null;
  qc_outcome: string | null;
  /** "user_marked" | "qc_flagged" | "both" */
  failure_type: string | null;
  failure_reason: string | null;
  failure_probability: number | null;
  qc_status: string | null;
  agreement_level: string | null;
  fleiss_kappa: number | null;
  total_cost: number | null;
  total_tokens: number | null;
  model_used: string | null;
  user_message_preview: string | null;
  assistant_response_preview: string | null;
  annotator_count: number | null;
  qc_version: number | null;
  priority: string | null;
  fpf_id: number | null;
  current_status: string | null;
  current_status_display: string | null;
  current_status_phase: string | null;
  tier_1_expert_count: number | null;
  tier_2_expert_count: number | null;
  tier_3_expert_count: number | null;
  reviewer_pre_annotation_count: number | null;
  reviewer_post_annotation_count: number | null;
  total_annotators_needed: number | null;
  tier_1_completed_count: number | null;
  tier_2_completed_count: number | null;
  tier_3_completed_count: number | null;
  reviewer_pre_completed_count: number | null;
  reviewer_post_completed_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Full conversation detail (deep inspection)
// ─────────────────────────────────────────────────────────────────────────────

export interface ConversationMessageMetadata {
  streaming?: boolean;
  web_search_enabled?: boolean;
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
  role: string;
  content: string;
  model: string | null;
  provider: string | null;
  tokens_used: number | null;
  latency_ms: number | null;
  message_metadata: ConversationMessageMetadata | null;
  created_at: string;
}

export interface ConversationCostPerModelCall {
  turn: number;
  model: string;
  provider: string;
  tokens: number;
  latency_ms: number;
}

export interface ConversationObject {
  session_id: number;
  request_id: string;
  messages: ConversationMessage[];
  workflow_name: string;
  workflow_type: string;
  request_metadata: Record<string, unknown> | null;
  response_metadata: Record<string, unknown> | null;
  attachments: Array<Record<string, unknown>>;
  user_id: number | null;
  user_email: string | null;
  user_full_name: string | null;
  user_role: string | null;
  org_id: number | null;
  org_name: string | null;
  failure_type: string | null;
  user_marked_failed: boolean;
  qc_flagged: boolean;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  deleted_at: string | null;
  total_cost: number | null;
  cost_per_model_call: ConversationCostPerModelCall[];
  total_latency_ms: number;
  total_tokens_input: number;
  total_tokens_output: number;
  status: string;
  error_message: string | null;
  web_search_enabled: boolean;
}

export interface ModelCall {
  message_id: number;
  turn_number: number;
  role: string;
  content: string;
  provider: string;
  model: string;
  request_payload: Record<string, unknown> | null;
  response_payload: Record<string, unknown> | null;
  message_metadata: Record<string, unknown>;
  tokens_used: number;
  latency_ms: number;
  status_code: number | null;
  error_message: string | null;
  retry_count: number | null;
  timeout_flag: boolean | null;
  fallback_model: string | null;
  cache_hit: boolean | null;
  optimization_strategy: string | null;
  cost_breakdown: Record<string, unknown> | null;
  created_at: string;
}

export interface QcRunRecord {
  id: number;
  run_id: string;
  qc_version: number;
  engine_version: string | null;
  is_latest: boolean;
  previous_run_id: number | null;
  qc_config_id: number | null;
  qc_config_version: number | null;
  fleiss_kappa: number | null;
  krippendorff_alpha: number | null;
  cohen_kappa_mean: number | null;
  percentage_agreement: number | null;
  shannon_entropy: number | null;
  tier_1_fleiss_kappa: number | null;
  tier_2_fleiss_kappa: number | null;
  tier_3_fleiss_kappa: number | null;
  cross_tier_divergence: number | null;
  agreement_thresholds: Record<string, unknown> | null;
  majority_label: string | null;
  weighted_consensus_score: number | null;
  consistency_score: number | null;
  annotator_count: number | null;
  expected_annotator_count: number | null;
  tier_1_count: number | null;
  tier_2_count: number | null;
  tier_3_count: number | null;
  expert_tier_distribution: Record<string, unknown> | null;
  agreement_level: string | null;
  qc_action: string | null;
  qc_status: string | null;
  flag_reasons: unknown[] | null;
  boolean_flags: Record<string, unknown> | null;
  anomalies_detected: unknown[] | null;
  anomaly_count: number | null;
  self_test_passed: boolean | null;
  self_test_variance: number | null;
  raw_annotations: unknown[] | null;
  pairwise_cohen_kappa_matrix: Record<string, unknown> | null;
  raw_annotator_scoring_arrays: unknown[] | null;
  iaa_matrix: unknown;
  normalization_applied: Record<string, unknown> | null;
  weighting_logic: Record<string, unknown> | null;
  randomization_seed: number | null;
  execution_time_ms: number | null;
  memory_usage_bytes: number | null;
  python_version: string | null;
  triggered_by_admin_id: number | null;
  trigger_reason: string | null;
  diff_from_previous: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
}

export interface QcRuntimeSnapshot {
  id: number;
  qc_run_id: number;
  run_id: string;
  full_runtime_state: Record<string, unknown>;
  engine_version: string | null;
  snapshot_version: string | null;
  compressed: boolean;
  size_bytes: number | null;
  created_at: string;
}

export interface AnnotatorSubmission {
  annotator_id: number;
  expert_id: number;
  tier: number;
  domain: string | null;
  submission_id: number;
  submission_payload: Record<string, unknown>;
  corrected_response: string | null;
  reasoning: string | null;
  new_rubric: Record<string, unknown> | null;
  correction_confidence: number | null;
  confidence_score: number | null;
  submission_time_seconds: number;
  submitted_at: string;
  historical_performance: Record<string, unknown> | null;
  payment_record_id: number | null;
}

export interface AgentExecution {
  agent_id: number;
  agent_name: string;
  execution_id: string;
  trajectory_id: string | null;
  config_json: Record<string, unknown>;
  result_json: Record<string, unknown>;
  status: string;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  latency_ms: number;
  created_at: string;
}

export interface CostSummary {
  total_cost_usd: number | null;
  cost_by_model: Record<string, number>;
  cost_by_provider: Record<string, number>;
  total_tokens_input: number;
  total_tokens_output: number;
  total_tokens: number;
  total_latency_ms: number;
  num_model_calls: number;
}

export interface TimelineEvent {
  timestamp: string;
  event_type: string;
  description: string;
  actor: string;
  data: Record<string, unknown>;
}

export interface AnalysisRubricItem {
  id: number;
  item_order: number;
  claim_text: string;
  claim_source_turn: number | null;
  claim_source_text: string | null;
  verdict: string;
  severity: string | null;
  category: string | null;
  evidence_text: string | null;
  evidence_source: string | null;
  evidence_turn_numbers: number[] | null;
  explanation: string | null;
  confidence: number | null;
  annotator_agrees: boolean | null;
  annotator_override_verdict: string | null;
  annotator_notes: string | null;
}

export interface AnalysisRubric {
  id: number;
  failed_prompt_final_id: number;
  conversation_id: number;
  rubric_version: number;
  is_latest: boolean;
  overall_failure_summary: string | null;
  failure_severity: string | null;
  failure_confidence: number | null;
  total_claims_analyzed: number;
  claims_supported: number;
  claims_contradicted: number;
  claims_insufficient: number;
  failure_categories: Record<string, unknown> | null;
  reasoning_chain: Array<Record<string, unknown>> | null;
  annotator_focus_areas: string[] | null;
  annotator_instructions: string | null;
  evidence_turn_numbers: number[] | null;
  primary_failure_turn: number | null;
  behavioral_score: number | null;
  semantic_entropy_score: number | null;
  judge_failure_score: number | null;
  judge_majority_verdict: string | null;
  primary_attribution: string | null;
  attribution_confidence: number | null;
  payout_eligible: boolean | null;
  payout_block_reason: string | null;
  items: AnalysisRubricItem[];
  model_used: string | null;
  generation_latency_ms: number | null;
  created_at: string;
}

export interface AnnotationConfig {
  tier_1_expert_count: number;
  tier_2_expert_count: number;
  tier_3_expert_count: number;
  reviewer_pre_annotation_count: number;
  reviewer_post_annotation_count: number;
  total_annotators_needed: number;
  tier_1_completed_count: number;
  tier_2_completed_count: number;
  tier_3_completed_count: number;
  reviewer_pre_completed_count: number;
  reviewer_post_completed_count: number;
}

export interface StatusInfo {
  current_status_code: string | null;
  current_status_display: string | null;
  current_status_phase: string | null;
  status_history: Array<Record<string, unknown>>;
  total_transitions: number;
}

export interface FailedConversationFullResponse {
  conversation: ConversationObject;
  model_calls: ModelCall[];
  qc_runs: QcRunRecord[];
  qc_runtime_snapshots: QcRuntimeSnapshot[];
  annotator_data: AnnotatorSubmission[];
  agent_executions: AgentExecution[];
  attachments: Array<Record<string, unknown>>;
  cost_summary: CostSummary;
  timeline: TimelineEvent[];
  failed_prompt: Record<string, unknown> | null;
  failed_prompt_final: FailedPromptFinalObj | null;
  failed_prompt_final_final: Record<string, unknown> | null;
  model_analysis: Record<string, unknown> | null;
  error_markings: Array<Record<string, unknown>>;
  conversation_questions: Array<Record<string, unknown>>;
  question_responses: Array<Record<string, unknown>>;
  iaa_calculations: Array<Record<string, unknown>>;
  question_level_iaa: Array<Record<string, unknown>>;
  qc_summary: Record<string, unknown> | null;
  semantic_entropy_results: Array<Record<string, unknown>>;
  judge_evaluations: Array<Record<string, unknown>>;
  judge_majority_verdict: Record<string, unknown> | null;
  failure_attribution: Record<string, unknown> | null;
  web_search_records: Array<Record<string, unknown>>;
  analysis_rubric: AnalysisRubric | null;
  annotation_config: AnnotationConfig;
  status_info: StatusInfo;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Per-model QC detail
// ─────────────────────────────────────────────────────────────────────────────

export interface FailedPromptFinalObj {
  id: number | null;
  conversation_session_id: number | null;
  prompt_id: number | null;
  original_prompt_text: string | null;
  domain: string | null;
  subdomain: string | null;
  domain_id: number | null;
  status: string | null;
  priority: string | null;
  failure_reason: string | null;
  failed_model: string | null;
  failed_provider: string | null;
  failed_message_id: number | null;
  failed_turn_number: number | null;
  qc_status: string | null;
  qc_outcome: string | null;
  qc_case_id?: number | null;
  analysis_rubric_id: number | null;
  model_analysis_status?: string | null;
  tier_1_expert_count: number | null;
  tier_2_expert_count: number | null;
  tier_3_expert_count: number | null;
  reviewer_pre_annotation_count: number | null;
  reviewer_post_annotation_count: number | null;
  payout_eligible: boolean | null;
  payout_amount: number | null;
  payout_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  [key: string]: unknown;
}

export interface AssistantMessageSummary {
  id: number | null;
  session_id: number | null;
  role: string | null;
  content: string | null;
  model: string | null;
  provider: string | null;
  turn_number: number | null;
  multi_model_index: number | null;
  token_count: number | null;
  created_at: string | null;
}

export interface QcCase {
  id: number | null;
  conversation_id: number | null;
  turn_index: number | null;
  user_id: number | null;
  failed_prompt_final_id: number | null;
  status: string | null;
  pipeline_stage: string | null;
  pipeline_started_at: string | null;
  pipeline_completed_at: string | null;
  pipeline_latency_ms: number | null;
  pipeline_error: string | null;
  pii_status: string | null;
  pii_map_id: number | null;
  residual_privacy_risk: number | null;
  intent_object_id: number | null;
  context_extraction_status: string | null;
  d_global: number | null;
  entropy_status: string | null;
  cross_model_samples: number | null;
  trace_id: number | null;
  reference_trace_id: number | null;
  rubric_id: number | null;
  rubric_status: string | null;
  judge_status: string | null;
  judge_variance: number | null;
  fraud_score: number | null;
  fraud_status: string | null;
  fraud_flags: Record<string, unknown> | null;
  fp_score: number | null;
  process_score: number | null;
  verdict: string | null;
  root_cause: string | null;
  verdict_reason: string | null;
  payout_eligible: boolean | null;
  payout_block_reason: string | null;
  domain: string | null;
  subdomain: string | null;
  model_id: string | null;
  failed_model: string | null;
  failed_provider: string | null;
  failed_message_id: number | null;
  judge_config_id: string | number | null;
  judge_config_version: number | null;
  resolved_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  pipeline_type?: string | null;
  correctness_checks?: any[];
  semantic_match_status?: string | null;
  holistic_score?: number | null;
  holistic_evaluation_id?: number | null;
  holistic_override_applied?: boolean | null;
}

export interface QcJudgeOutput {
  id: number | null;
  qc_case_id: number | null;
  rubric_id: number | null;
  judge_role: string | null;
  model_id: string | null;
  process_score: number | null;
  criterion_scores: Record<string, unknown> | null;
  reasoning: Record<string, unknown> | null;
  raw_response: string | null;
  defensibility_scores: Record<string, unknown> | null;
  defense_arguments: Record<string, unknown> | null;
  partial_credit_recommendations: Record<string, unknown> | null;
  latency_ms: number | null;
  tokens_used: number | null;
  cost_usd: number | null;
  status: string | null;
  created_at: string | null;
}

export interface QcFraudSignal {
  id: number | null;
  qc_case_id: number | null;
  user_id: number | null;
  signal_type: string | null;
  score: number | null;
  evidence: Record<string, unknown> | null;
  description: string | null;
  triggered_at: string | null;
  created_at: string | null;
}

export interface QcIntentObject {
  id: number | null;
  qc_case_id: number | null;
  conversation_id: number | null;
  turn_index: number | null;
  primary_goal: string | null;
  implicit_constraints: Record<string, unknown> | null;
  context_dependencies: Record<string, unknown> | null;
  open_commitments: Record<string, unknown> | null;
  task_type: string | null;
  domain: string | null;
  ambiguity_score: number | null;
  success_criteria: Record<string, unknown> | null;
  failure_modes: Record<string, unknown> | null;
  extraction_confidence: number | null;
  global_summary: string | null;
  task_window_start: number | null;
  task_window_end: number | null;
  commitment_log: Record<string, unknown> | null;
  instruction_log: Record<string, unknown> | null;
  model_used: string | null;
  latency_ms: number | null;
  created_at: string | null;
}

export interface QcRubricCriterion {
  id: number | null;
  rubric_id: number | null;
  step_id: string | null;
  name: string | null;
  weight: number | null;
  type: string | null;
  reasoning_pattern: string | null;
  description: string | null;
  evidence_expected: string | null;
  evidence_actual: string | null;
  d_i: number | null;
  step_score: number | null;
  status: string | null;
  failure_impact: string | null;
  annotator_override: boolean | null;
  judge_1_score: number | null;
  judge_2_score: number | null;
  judge_3_defensibility: number | null;
  merged_score: number | null;
  calibrated_score: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface QcRubric {
  id: number | null;
  qc_case_id: number | null;
  conversation_id: number | null;
  domain: string | null;
  d_global: number | null;
  criteria_count: number | null;
  total_weight: number | null;
  process_score: number | null;
  fp_score: number | null;
  version: number | null;
  is_latest: boolean | null;
  previous_version_id: number | null;
  is_golden: boolean | null;
  golden_validated_at: string | null;
  golden_validator_id: number | null;
  annotator_id: number | null;
  model_used: string | null;
  generation_latency_ms: number | null;
  created_at: string | null;
  updated_at: string | null;
  criteria: QcRubricCriterion[];
}

export interface QcPiiMap {
  id: number | null;
  qc_case_id: number | null;
  conversation_id: number | null;
  entity_count: number | null;
  entity_types: Record<string, unknown> | null;
  placeholder_map: Record<string, unknown> | null;
  residual_privacy_risk: number | null;
  detection_methods: Record<string, unknown> | null;
  processing_latency_ms: number | null;
  created_at: string | null;
}

export interface QcStatusHistoryEntry {
  id: number | null;
  qc_case_id: number | null;
  failed_prompt_final_id: number | null;
  status: string | null;
  previous_status: string | null;
  pipeline_stage: string | null;
  triggered_by: string | null;
  triggered_by_user_id: number | null;
  reason: string | null;
  metadata_json: Record<string, unknown> | null;
  effective_from: string | null;
  effective_to: string | null;
  is_current: boolean | null;
  version: number | null;
  duration_in_previous_ms: number | null;
  created_at: string | null;
}

export interface VerdictFailedPrompt {
  id: number | null;
  conversation_id: number | null;
  failure_probability: number | null;
  signal_scores: Record<string, unknown> | null;
  behavioral_score: number | null;
  judge_majority_verdict: string | null;
  decision_path: string | null;
  layers_executed: number | null;
  dominant_failure_classes: Record<string, unknown> | null;
  failed_model: string | null;
  failed_provider: string | null;
  failed_message_id: number | null;
  payout_eligible: boolean | null;
  payout_amount: number | null;
  payout_status: string | null;
  created_at: string | null;
}

export interface VerdictFalsePositive {
  id: number | null;
  conversation_id: number | null;
  failure_probability: number | null;
  signal_scores: Record<string, unknown> | null;
  reason_for_disagreement: string | null;
  dominant_negative_signals_missing: Record<string, unknown> | null;
  failed_model: string | null;
  failed_provider: string | null;
  failed_message_id: number | null;
  created_at: string | null;
}

export interface VerdictNeedsHumanReview {
  id: number | null;
  conversation_id: number | null;
  failure_probability: number | null;
  escalation_reason: string | null;
  judge_verdicts: Record<string, unknown> | null;
  human_verdict: string | null;
  review_notes: string | null;
  failed_model: string | null;
  failed_provider: string | null;
  failed_message_id: number | null;
  resolved_at: string | null;
  created_at: string | null;
}

export interface AnalysisRubricItemV2 {
  id: number | null;
  rubric_id: number | null;
  item_order: number | null;
  claim_text: string | null;
  claim_source_turn: number | null;
  claim_source_text: string | null;
  verdict: string | null;
  severity: string | null;
  category: string | null;
  evidence_text: string | null;
  evidence_source: string | null;
  evidence_turn_numbers: number[] | null;
  explanation: string | null;
  confidence: number | null;
  annotator_agrees: boolean | null;
  annotator_override_verdict: string | null;
  annotator_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AnalysisRubricV2 {
  id: number | null;
  failed_prompt_final_id: number | null;
  conversation_id: number | null;
  failed_prompt_id: number | null;
  rubric_version: number | null;
  is_latest: boolean | null;
  previous_rubric_id: number | null;
  overall_failure_summary: string | null;
  failure_severity: string | null;
  failure_confidence: number | null;
  total_claims_analyzed: number | null;
  claims_supported: number | null;
  claims_contradicted: number | null;
  claims_insufficient: number | null;
  failure_categories: Record<string, number> | null;
  reasoning_chain: Array<Record<string, unknown>> | null;
  annotator_focus_areas: string[] | null;
  annotator_instructions: string | null;
  evidence_turn_numbers: number[] | null;
  primary_failure_turn: number | null;
  source_layers: number[] | null;
  behavioral_score: number | null;
  semantic_entropy_score: number | null;
  judge_failure_score: number | null;
  judge_majority_verdict: string | null;
  primary_attribution: string | null;
  attribution_confidence: number | null;
  payout_eligible: boolean | null;
  payout_block_reason: string | null;
  model_used: string | null;
  generation_latency_ms: number | null;
  tokens_used: number | null;
  created_at: string | null;
  updated_at: string | null;
  items: AnalysisRubricItemV2[];
}

export interface FailedConversationQcDetailModel {
  model: string | null;
  provider: string | null;
  fpf_id: number | null;
  fpf: FailedPromptFinalObj | null;
  assistant_message: AssistantMessageSummary | null;
  qc_case: QcCase | null;
  qc_judges?: QcJudgeOutput[];
  qc_fraud_signals?: QcFraudSignal[];
  qc_intent_objects?: QcIntentObject[] | null;
  qc_rubric?: any;
  qc_rubric_criteria?: QcRubricCriterion[];
  verdict_tables?: {
    failed_prompt: VerdictFailedPrompt | null;
    false_positive: VerdictFalsePositive | null;
    needs_human_review: VerdictNeedsHumanReview | null;
  } | null;
  semantic_matches?: any[];
  holistic_evaluation?: any;
  qc_status_history?: any[];
  verdict_failed_prompt?: any[];
  verdict_false_positive?: any[];
  verdict_needs_human_review?: any[];
  analysis_rubric?: any;
}

export interface FailedConversationQcDetailSharedUserMessage {
  id: number | null;
  session_id: number | null;
  role: string | null;
  content: string | null;
  model: string | null;
  provider: string | null;
  turn_number: number | null;
  multi_model_index: number | null;
  token_count: number | null;
  created_at: string | null;
}

export interface FailedConversationQcDetailShared {
  user: {
    id: number | null;
    email: string | null;
    full_name?: string | null;
  } | null;
  user_messages: FailedConversationQcDetailSharedUserMessage[];
  attachments: Array<Record<string, unknown>>;
  semantic_entropy: {
    normalized_entropy: number | null;
    num_samples: number | null;
  } | null;
  // Retaining some old fields for compatibility if needed
  workflow_name?: string | null;
}

export interface FailedConversationQcDetailResponse {
  conversation_id: number;
  session_status: string | null;
  user_marked_failed: boolean;
  total_models_evaluated: number;
  models: FailedConversationQcDetailModel[];
  shared: FailedConversationQcDetailShared;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Rubric (FActScore atomic claims)
// ─────────────────────────────────────────────────────────────────────────────

export interface RubricItem {
  id: number;
  rubric_id: number | null;
  item_order: number | null;
  claim_text: string | null;
  claim_source_turn: number | null;
  claim_source_text: string | null;
  verdict: string | null;
  severity: string | null;
  category: string | null;
  evidence_text: string | null;
  evidence_source: string | null;
  evidence_turn_numbers: number[] | null;
  explanation: string | null;
  confidence: number | null;
  annotator_agrees: boolean | null;
  annotator_override_verdict: string | null;
  annotator_notes: string | null;
  claim_verdict: string | null;
  claim_severity: string | null;
  claim_category: string | null;
  supporting_evidence: string | null;
  annotator_instruction: string | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface RubricSummary {
  id: number | null;
  failed_prompt_final_id: number | null;
  conversation_id: number | null;
  rubric_version: number | null;
  is_latest: boolean | null;
  previous_rubric_id: number | null;
  overall_failure_summary: string | null;
  failure_severity: string | null;
  failure_confidence: number | null;
  total_claims_analyzed: number | null;
  claims_supported: number | null;
  claims_contradicted: number | null;
  claims_insufficient: number | null;
  failure_categories: Record<string, number> | null;
  reasoning_chain: Array<Record<string, unknown>> | null;
  annotator_focus_areas: string[] | null;
  annotator_instructions: string | null;
  evidence_turn_numbers: number[] | null;
  primary_failure_turn: number | null;
  source_layers: number[] | null;
  behavioral_score: number | null;
  semantic_entropy_score: number | null;
  judge_failure_score: number | null;
  judge_majority_verdict: string | null;
  primary_attribution: string | null;
  attribution_confidence: number | null;
  payout_eligible: boolean | null;
  payout_block_reason: string | null;
  model_used: string | null;
  generation_latency_ms: number | null;
  tokens_used: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ConversationRubricResponse {
  conversation_id: number;
  failed_prompt_final_id: number;
  rubric: RubricSummary;
  items: RubricItem[];
  total_items: number;
  annotator_focus_areas: string[] | null;
  annotation_config: Record<string, unknown> | null;
  current_status: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Status history
// ─────────────────────────────────────────────────────────────────────────────

export interface StatusHistoryEntry {
  id: number;
  status_code: string | null;
  display_name: string | null;
  phase: string | null;
  triggered_by: string | null;
  triggered_by_user_id: number | null;
  reason: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string | null;
}

export interface StatusHistoryResponse {
  conversation_id: number;
  failed_prompt_final_id: number;
  current_status: string | null;
  tier_config: Record<string, unknown>;
  history: StatusHistoryEntry[];
  total_transitions: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Annotation progress
// ─────────────────────────────────────────────────────────────────────────────

export interface AnnotationProgressResponse {
  conversation_id: number;
  failed_prompt_final_id: number;
  current_status: string | null;
  tiers: Record<string, unknown>;
  pre_annotation_reviews: Record<string, unknown>;
  post_annotation_reviews: Record<string, unknown>;
  overall_progress: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Actions
// ─────────────────────────────────────────────────────────────────────────────

export interface RerunQCResponse {
  new_qc_run?: Record<string, unknown>;
  old_qc_run?: Record<string, unknown> | null;
  diff?: {
    changes: Array<{ field: string; old: unknown; new: unknown }>;
    total_changes: number;
    note?: string;
  };
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
  qc_version?: number;
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

  async getRubric(
    conversationId: number
  ): Promise<ConversationRubricResponse> {
    const response = await this.client.get<ConversationRubricResponse>(
      `/admin/failed-conversations/${conversationId}/rubric`
    );
    return this.handleResponse(response);
  }

  async getAnnotationProgress(
    conversationId: number
  ): Promise<AnnotationProgressResponse> {
    const response = await this.client.get<AnnotationProgressResponse>(
      `/admin/failed-conversations/${conversationId}/annotation-progress`
    );
    return this.handleResponse(response);
  }

  async getStatusHistory(
    conversationId: number
  ): Promise<StatusHistoryResponse> {
    const response = await this.client.get<StatusHistoryResponse>(
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

  // ── Chat Analysis Summary & Specific Endpoints ────────────────────────────

  async getQcSummary(conversationId: number, failedModel?: string): Promise<any> {
    const query = failedModel ? `?failed_model=${encodeURIComponent(failedModel)}` : '';
    const response = await this.client.get(`/chat/qc/summary/${conversationId}${query}`);
    return this.handleResponse(response);
  }

  async getEntropyDetails(conversationId: number): Promise<any> {
    const response = await this.client.get(`/chat/failure/analysis/${conversationId}/entropy`);
    return this.handleResponse(response);
  }

  async getJudgeDetails(conversationId: number, model?: string): Promise<any> {
    const query = model ? `?model=${encodeURIComponent(model)}` : '';
    const response = await this.client.get(`/chat/failure/analysis/${conversationId}/judges${query}`);
    return this.handleResponse(response);
  }

  async getAnalysisRubric(conversationId: number, model?: string): Promise<any> {
    const query = model ? `?model=${encodeURIComponent(model)}` : '';
    const response = await this.client.get(`/chat/failure/analysis/${conversationId}/rubric${query}`);
    return this.handleResponse(response);
  }

  async getFailureAttribution(conversationId: number): Promise<any> {
    const response = await this.client.get(`/chat/failure/analysis/${conversationId}/attribution`);
    return this.handleResponse(response);
  }

  async getPipelineStatus(conversationId: number, model?: string): Promise<any> {
    const query = model ? `?model=${encodeURIComponent(model)}` : '';
    const response = await this.client.get(`/chat/failure/status/${conversationId}${query}`);
    return this.handleResponse(response);
  }
}

export const adminConversationsService = new AdminConversationsService();
