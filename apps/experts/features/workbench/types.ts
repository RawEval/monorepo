// ─────────────────────────────────────────────────────────────────────────────
// Workbench Types — Complete type definitions for the annotation workbench
// ─────────────────────────────────────────────────────────────────────────────

// ── Task Queue ──────────────────────────────────────────────────────────────

export interface TaskPrompt {
  failed_prompt_final_id: number;
  conversation_id: number;
  domain: string;
  status: string;
  failure_reason: string | null;
  total_questions: number;
  my_responses: number;
  all_answered: boolean;
  has_rubric: boolean;
  failed_model?: string;
  failed_provider?: string;
  failed_turn_number?: number;
}

export interface TaskAllocation {
  allocation_id: number;
  batch_id: number;
  batch_number: string;
  batch_domain: string;
  batch_status: string;
  tier: number;
  submission_status: string;
  session_started_at: string | null;
  prompts: TaskPrompt[];
}

export interface TaskListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  expert_id: number;
  expert_tier: number;
  items: TaskAllocation[];
}

// ── Conversation Messages ───────────────────────────────────────────────────

export interface ConversationMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: string | null;
  provider: string | null;
  turn_number: number;
  created_at: string;
}

export interface ConversationMessagesResponse {
  conversation_id: number;
  total_messages: number;
  messages: ConversationMessage[];
}

// ── Rubric & Claims ─────────────────────────────────────────────────────────

export type ClaimVerdict = 'SUPPORTED' | 'CONTRADICTED' | 'MISSING' | 'MISLEADING' | 'INSUFFICIENT';
export type ErrorSeverity = 'critical' | 'major' | 'minor' | 'negligible';

export interface RubricClaim {
  id: number;
  order: number;
  claim_text: string;
  claim_source_turn: number | null;
  claim_source_text: string | null;
  verdict: ClaimVerdict | null;
  severity: ErrorSeverity | null;
  category: string | null;
  evidence_text: string | null;
  evidence_source: string | null;
  evidence_turn_numbers: number[] | null;
  explanation: string | null;
  confidence: number | null;
}

export interface Rubric {
  id: number;
  version: number;
  overall_failure_summary: string | null;
  failure_severity: ErrorSeverity | null;
  failure_confidence: number | null;
  total_claims_analyzed: number;
  claims_supported: number;
  claims_contradicted: number;
  claims_insufficient: number;
  failure_categories: string[];
  reasoning_chain: string[];
  annotator_focus_areas: string[];
  annotator_instructions: string | null;
  evidence_turn_numbers: number[];
  primary_failure_turn: number | null;
  created_at: string;
}

export interface RubricResponse {
  conversation_id: number;
  rubric: Rubric;
  claims: RubricClaim[];
  total_claims: number;
}

// ── Questions & Responses ───────────────────────────────────────────────────

export type QuestionType = 'rating' | 'boolean' | 'multiple_choice' | 'text' | 'numeric' | 'multi_select' | 'ranking' | 'code_snippet' | 'attachment';

export interface AnnotationQuestion {
  id: number;
  question_text: string;
  question_type: QuestionType;
  question_category: string;
  question_order: number;
  rating_min?: number;
  rating_max?: number;
  rating_labels?: Record<string, string>;
  options?: string[];
  is_required: boolean;
  min_annotators_required?: number;
  total_responses: number;
  status: string;
  target_turn_number?: number;
  description?: string | null;
}

export interface TaskQuestionsResponse {
  fpf_id: number;
  conversation_id: number;
  status: string;
  total_questions: number;
  my_progress: {
    expert_id: number;
    tier: number;
    allocation_id: number;
    allocation_status: string;
    questions_answered: number;
    total_questions: number;
    progress_pct: number;
    is_complete: boolean;
  };
  questions: AnnotationQuestion[];
}

export interface SubmitResponseRequest {
  question_id: number;
  response_value?: string;
  response_text?: string;
  response_numeric?: number;
  response_json?: unknown;
  confidence_score?: number;
  response_time_seconds?: number;
  reasoning?: string;
  supporting_evidence?: string;
  allocation_id?: number;
}

export interface SubmitResponseResult {
  id: number;
  question_id: number;
  annotator_id: number;
  tier: number;
  status: string;
  qc_auto_triggered: boolean;
  qc_result: unknown | null;
  qc_error: string | null;
}

export interface EditResponseRequest {
  response_text?: string;
  response_value?: string;
  response_numeric?: number;
  confidence_score?: number;
  reasoning?: string;
}

// ── Submissions ─────────────────────────────────────────────────────────────

export interface SubmissionRequest {
  allocation_id: number;
  prompt_id: number;
  corrected_response: string;
  reasoning: string;
  correction_confidence: number;
  new_rubric?: {
    overall_quality: number;
    error_types: string[];
    severity: string;
    corrected_claims: string[];
  };
  submission_time_seconds?: number;
}

export interface SubmissionResponse {
  id: number;
  allocation_id: number;
  prompt_id: number;
  annotator_id: number;
  corrected_response: string;
  reasoning: string;
  correction_confidence: number;
  new_rubric: Record<string, unknown> | null;
  submission_time_seconds: number | null;
  ai_content_score: number | null;
  ai_content_score_reasoning: number | null;
  submitted_at: string;
  updated_at: string;
}

// ── Error Marking ───────────────────────────────────────────────────────────

export type ErrorType = 'hallucination' | 'factual_error' | 'reasoning_error' | 'omission' | 'inconsistency' | 'safety';

export interface ErrorMarkingRequest {
  conversation_id: number;
  failed_prompt_final_id: number;
  turn_number: number;
  error_type: ErrorType;
  start_char_offset: number;
  end_char_offset: number;
  marked_text: string;
  error_severity: ErrorSeverity;
  error_description?: string;
  correct_information?: string;
}

export interface ErrorMarking {
  id: number;
  conversation_id: number;
  turn_number: number;
  error_type: ErrorType;
  error_severity: ErrorSeverity;
  error_description: string | null;
  marked_text: string;
  correct_information: string | null;
  marked_by_expert: number;
  annotator_tier: number;
  start_offset: number;
  end_offset: number;
}

export interface ErrorMarkingsResponse {
  conversation_id: number;
  total: number;
  markings: ErrorMarking[];
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export interface PreReviewAssignment {
  assignment_id: number;
  failed_prompt_final_id: number;
  status: string;
  decision: string | null;
  reason: string | null;
  match_score: number;
  assigned_at: string;
  started_at: string | null;
  completed_at: string | null;
  task: {
    conversation_id: number;
    domain: string;
    subdomain: string | null;
    failure_reason: string | null;
    task_status: string;
    priority: number;
  };
  vote_tally: {
    genuine: number;
    not_genuine: number;
    total_reviewers: number;
    pending: number;
  };
}

export interface PostReviewAssignment {
  assignment_id: number;
  failed_prompt_final_id: number;
  batch_id: number;
  status: string;
  decision: string | null;
  reason: string | null;
  match_score: number;
  source: string;
  assigned_at: string;
  task: {
    conversation_id: number;
    domain: string;
    failure_reason: string | null;
    task_status: string;
  };
  qc_outcome_snapshot: {
    final_iaa: number;
    agreement_level: string;
    qc_decision: string;
  } | null;
  vote_tally: {
    approved: number;
    rejected: number;
    total_reviewers: number;
    pending: number;
  };
}

// ── Comments ────────────────────────────────────────────────────────────────

export interface TaskComment {
  id: number;
  failed_prompt_final_id: number;
  question_id: number | null;
  author_id: number;
  author_name: string;
  author_role: string;
  comment_text: string;
  comment_type: 'general' | 'rejection_reason' | 'revision_request' | 'quality_note';
  parent_comment_id: number | null;
  task_status_at_comment: string | null;
  is_resolved: boolean;
  created_at: string;
}

// ── Status Timeline ─────────────────────────────────────────────────────────

export interface StatusTimelineEntry {
  id: number;
  status: string;
  previous_status: string | null;
  triggered_by: string;
  triggered_by_user_id: number | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  duration_in_previous_ms: number | null;
  created_at: string;
}

export interface StatusTimelineResponse {
  failed_prompt_final_id: number;
  current_status: string;
  task_status_history: StatusTimelineEntry[];
  qc_pipeline_history: StatusTimelineEntry[];
}

// ── Golden Answers ──────────────────────────────────────────────────────────

export interface FinalAnswer {
  id: number;
  question_text: string;
  question_type: QuestionType;
  final_answer_value?: string;
  final_answer_numeric?: number;
  final_answer_text?: string;
  agreement_level: string;
  fleiss_kappa: number | null;
  percentage_agreement: number | null;
  weighted_iaa: number | null;
  annotator_count: number;
  majority_percentage: number | null;
  contributing_annotator_tiers: number[];
  qc_decision: string;
  finalized_at: string;
}

export interface FinalAnswersResponse {
  conversation_id: number;
  failed_prompt_final_id: number;
  task_status: string;
  domain: string;
  failure_reason: string | null;
  total_final_answers: number;
  contributing_experts: Array<{ expert_id: number; name: string; tier: number }>;
  answers: FinalAnswer[];
}

// ── Verdict ─────────────────────────────────────────────────────────────────

export interface VerdictResponse {
  failed_prompt_final_id: number;
  conversation_id: number;
  current_status: string;
  qc_outcome: string;
  qc_status: string;
  domain: string;
  reviewer_pre_annotation_count: number;
  reviewer_post_annotation_count: number;
  pre_review_result: string | null;
  qc_case: {
    id: number;
    verdict: string;
    verdict_reason: string | null;
    fp_score: number | null;
    process_score: number | null;
    fraud_score: number | null;
    judge_variance: number | null;
    payout_eligible: boolean | null;
    payout_block_reason: string | null;
    root_cause: string | null;
    pipeline_stage: string | null;
    pipeline_latency_ms: number | null;
    status: string;
  } | null;
}

// ── Profile Check ───────────────────────────────────────────────────────────

export interface ProfileCheckResponse {
  profile_completed: boolean;
  missing_fields: string[];
  message: string;
}

// ── AI Correction ───────────────────────────────────────────────────────────

export interface AICorrectionRequest {
  text: string;
  correction_mode: 'grammar' | 'clarity' | 'full';
  context_question?: string;
}

export interface AICorrectionResponse {
  original_text: string;
  corrected_text: string;
  changes_made: string;
  is_changed: boolean;
  correction_mode: string;
  model_used: string;
}
