import { ApiService } from '../api-service';

// ─────────────────────────────────────────────────────────────────────────────
// QC Summary (Section 3)
// ─────────────────────────────────────────────────────────────────────────────

export interface QCSummaryQCInfo {
  qc_case_id: number | null;
  qc_status: string | null;
  pipeline_stage: string | null;
  verdict: string | null;
  fp_score: number | null;
  process_score: number | null;
  fraud_score: number | null;
  d_global: number | null;
  judge_variance: number | null;
  holistic_score: number | null;
  holistic_override_applied: boolean | null;
  root_cause: string | null;
  payout_eligible: boolean | null;
  payout_block_reason: string | null;
  pipeline_latency_ms: number | null;
  pipeline_started_at: string | null;
  pipeline_completed_at: string | null;
  semantic_match_status: string | null;
}

export interface QCSummaryDisputeInfo {
  qc_dispute_id: number | null;
  status: string | null;
  reason: string | null;
  original_verdict: string | null;
  pre_review_result: boolean | null;
  created_at: string | null;
}

export interface QCSummaryCriterion {
  step_id: string | null;
  name: string | null;
  type: string | null;
  weight: number | null;
  status: string | null;
  d_i: number | null;
  step_score: number | null;
  evidence_expected: string | null;
  evidence_actual: string | null;
  judge_1_score: number | null;
  judge_2_score: number | null;
  judge_3_defensibility: number | null;
  merged_score: number | null;
  calibrated_score: number | null;
}

export interface QCSummaryJudge {
  judge_role: string | null;
  model_id: string | null;
  process_score: number | null;
  criterion_scores: Record<string, unknown> | null;
  reasoning: Record<string, unknown> | null;
  status: string | null;
  latency_ms: number | null;
  tokens_used: number | null;
  cost_usd: number | null;
}

export interface QCSummaryFraudSignal {
  signal_type: string | null;
  score: number | null;
  description: string | null;
  evidence: Record<string, unknown> | null;
}

export interface QCSummarySemanticMatch {
  criterion_step_id: string | null;
  criterion_name: string | null;
  evidence_expected: string | null;
  matched_text: string | null;
  match_confidence: number | null;
  match_reasoning: string | null;
  addressed: boolean | null;
}

export interface QCSummaryHolisticEvaluation {
  holistic_score: number | null;
  completeness_score: number | null;
  accuracy_score: number | null;
  usefulness_score: number | null;
  holistic_reasoning: string | null;
  key_strengths: string[] | null;
  key_weaknesses: string[] | null;
  would_user_be_satisfied: boolean | null;
  confidence_level: string | null;
  mismatch_detected: boolean | null;
  process_score_at_eval: number | null;
  model_used: string | null;
}

export interface QCSummaryIntentObject {
  task_type: string | null;
  primary_goal: string | null;
  ambiguity_score: number | null;
  domain: string | null;
  success_criteria: string[] | null;
  failure_modes: string[] | null;
  extraction_confidence: number | null;
  global_summary: string | null;
}

export interface QCSummaryResponse {
  conversation_id: number;
  session_status: string | null;
  user_marked_failed: boolean;
  fpf_status: string | null;
  fpf_status_display: string | null;
  fpf_phase: string | null;
  qc_outcome: string | null;
  domain: string | null;
  subdomain: string | null;
  failed_turn_number: number | null;
  total_turns: number | null;
  failed_model: string | null;
  failed_provider: string | null;
  qc: QCSummaryQCInfo | null;
  dispute: QCSummaryDisputeInfo | null;
  intent_summary: QCSummaryIntentObject | null;
  status_history: Array<Record<string, unknown>>;
  rubric: Record<string, unknown> | null;
  criteria: QCSummaryCriterion[];
  judges: QCSummaryJudge[];
  fraud_signals: QCSummaryFraudSignal[];
  semantic_matches: QCSummarySemanticMatch[];
  holistic_evaluation: QCSummaryHolisticEvaluation | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Semantic Entropy (Section 4)
// ─────────────────────────────────────────────────────────────────────────────

export interface EntropyResult {
  num_samples: number | null;
  generation_model: string | null;
  generation_temperature: number | null;
  embedding_model: string | null;
  similarity_threshold: number | null;
  num_clusters: number | null;
  cluster_sizes: Record<string, number> | null;
  cluster_labels: string[] | null;
  raw_entropy: number | null;
  normalized_entropy: number | null;
  stability_level: string | null;
  dominant_cluster_fraction: number | null;
  total_latency_ms: number | null;
  total_tokens_used: number | null;
  status: string | null;
}

export interface EntropyResponse {
  conversation_id: number;
  latest: EntropyResult | null;
  history: EntropyResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Judge Details (Section 5)
// ─────────────────────────────────────────────────────────────────────────────

export interface JudgeEvaluation {
  judge_run: number | null;
  judge_model: string | null;
  verdict: string | null;
  failure_score: number | null;
  claims_supported: number | null;
  claims_contradicted: number | null;
  claims_insufficient_evidence: number | null;
  total_claims: number | null;
  claim_analysis: Record<string, unknown> | null;
  missing_points: string[] | null;
  contradictions: string[] | null;
  intent_issues: string[] | null;
  reasoning_full: string | null;
  status: string | null;
  latency_ms: number | null;
  tokens_used: number | null;
}

export interface JudgeMajorityVerdictInfo {
  majority_verdict: string | null;
  fail_count: number | null;
  pass_count: number | null;
  mean_failure_score: number | null;
  verdict_confidence: number | null;
  claim_agreement_rate: number | null;
  reasoning_similarity: number | null;
  entropy_boosted: boolean | null;
}

export interface JudgeDetailsResponse {
  conversation_id: number;
  evaluations: JudgeEvaluation[];
  majority_verdict: JudgeMajorityVerdictInfo | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Failure Attribution (Section 6)
// ─────────────────────────────────────────────────────────────────────────────

export interface AttributionProbabilities {
  ambiguous_prompt: number | null;
  underspecified_input: number | null;
  model_hallucination: number | null;
  model_reasoning_error: number | null;
  missing_external_knowledge: number | null;
  adversarial_prompt: number | null;
}

export interface AttributionResponse {
  conversation_id: number;
  primary_cause: string | null;
  primary_cause_probability: number | null;
  secondary_cause: string | null;
  secondary_cause_probability: number | null;
  attribution_probabilities: AttributionProbabilities | null;
  payout_eligible: boolean | null;
  payout_block_reason: string | null;
  adversarial_score: number | null;
  adversarial_patterns: string[] | null;
  reasoning: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rubric (Section 7)
// ─────────────────────────────────────────────────────────────────────────────

export interface FailureRubricItem {
  id: number;
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
}

export interface FailureRubricResponse {
  rubric_id: number | null;
  conversation_id: number;
  failed_prompt_final_id: number | null;
  rubric_version: number | null;
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
  primary_attribution: string | null;
  payout_eligible: boolean | null;
  payout_block_reason: string | null;
  items: FailureRubricItem[];
  created_at: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline Status (Section 8)
// ─────────────────────────────────────────────────────────────────────────────

export interface PipelineStatusHistoryEntry {
  status: string | null;
  entered_at: string | null;
  triggered_by: string | null;
  reason: string | null;
  duration_ms: number | null;
}

export interface PipelineStatusResponse {
  conversation_id: number;
  failed_prompt_final_id: number | null;
  current_status: string | null;
  current_phase: string | null;
  next_action: string | null;
  failed_model: string | null;
  failed_provider: string | null;
  domain: string | null;
  subdomain: string | null;
  tier_config: {
    tier_1: number | null;
    tier_2: number | null;
    tier_3: number | null;
    tier_1_completed: number | null;
    tier_2_completed: number | null;
    tier_3_completed: number | null;
  } | null;
  status_history: PipelineStatusHistoryEntry[];
  created_at: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export class FailureAnalysisService extends ApiService {
  /** QC Summary — pipeline data + rubric + judges + fraud + semantic matches + holistic */
  async getQCSummary(
    conversationId: number,
    failedModel?: string
  ): Promise<QCSummaryResponse> {
    const params: Record<string, unknown> = {};
    if (failedModel) params.failed_model = failedModel;
    const query = this.buildQuery(params);
    const response = await this.client.get<QCSummaryResponse>(
      `/chat/qc/summary/${conversationId}${query}`
    );
    return this.handleResponse(response);
  }

  /** Semantic entropy details */
  async getEntropy(conversationId: number): Promise<EntropyResponse> {
    const response = await this.client.get<EntropyResponse>(
      `/chat/failure/analysis/${conversationId}/entropy`
    );
    return this.handleResponse(response);
  }

  /** Judge evaluations and majority verdict */
  async getJudges(conversationId: number): Promise<JudgeDetailsResponse> {
    const response = await this.client.get<JudgeDetailsResponse>(
      `/chat/failure/analysis/${conversationId}/judges`
    );
    return this.handleResponse(response);
  }

  /** Failure attribution (root cause analysis) */
  async getAttribution(conversationId: number): Promise<AttributionResponse> {
    const response = await this.client.get<AttributionResponse>(
      `/chat/failure/analysis/${conversationId}/attribution`
    );
    return this.handleResponse(response);
  }

  /** Failure rubric (FActScore atomic claims) */
  async getRubric(
    conversationId: number,
    model?: string
  ): Promise<FailureRubricResponse> {
    const params: Record<string, unknown> = {};
    if (model) params.model = model;
    const query = this.buildQuery(params);
    const response = await this.client.get<FailureRubricResponse>(
      `/chat/failure/analysis/${conversationId}/rubric${query}`
    );
    return this.handleResponse(response);
  }

  /** Pipeline status (for real-time polling) */
  async getPipelineStatus(
    conversationId: number,
    model?: string
  ): Promise<PipelineStatusResponse> {
    const params: Record<string, unknown> = {};
    if (model) params.model = model;
    const query = this.buildQuery(params);
    const response = await this.client.get<PipelineStatusResponse>(
      `/chat/failure/status/${conversationId}${query}`
    );
    return this.handleResponse(response);
  }
}

export const failureAnalysisService = new FailureAnalysisService();
