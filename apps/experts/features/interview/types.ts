/**
 * Interview Types
 *
 * TypeScript interfaces for the interview system including
 * orchestrator, V2 real-time, WebSocket, and expert/onboarding types.
 */

// Orchestrator types
export interface StartInterviewRequest {
  resume_text: string;
  job_description: string;
  interview_type?: 'technical' | 'behavioral' | 'coding' | 'full_stack' | 'system_design';
  seniority?: 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  total_time_minutes?: number;
  min_questions?: number;
  job_id?: number;
}

export interface PlanSummary {
  total_planned_questions: number;
  num_single: number;
  num_multipart: number;
  total_time_minutes: number;
  interview_type: string;
  seniority: string;
  skills_to_test: string[];
}

export interface QuestionRubric {
  question_id: string;
  skill_tested: string;
  segment_type: string;
  difficulty: string;
  weight_distribution: Record<string, number>;
  must_include_points: string[];
  red_flags: string[];
  bonus_signals: string[];
  grading_bands: Record<string, string>;
  max_score: number;
}

export interface InterviewQuestion {
  question_text: string;
  question_id: string;
  transcript_id: number;
  turn_number: number;
  segment_type: string;
  difficulty: string;
  is_multipart?: boolean;
  rubric?: QuestionRubric;
}

export interface StartInterviewResponse {
  session_id: number;
  plan_id: number;
  status: string;
  plan_summary: PlanSummary;
  first_question: InterviewQuestion | null;
  latency_ms: number;
}

export interface EvaluationBreakdown {
  conceptual_understanding: number;
  technical_accuracy: number;
  depth: number;
  clarity: number;
  edge_cases: number;
  real_world: number;
}

export interface Evaluation {
  score: number;
  breakdown: EvaluationBreakdown;
  why_this_score: string;
  why_not_100: string;
  missed_must_include_points: string[];
  detected_red_flags: string[];
  bonus_points_awarded: string[];
  improvement_plan: string;
  deterministic_derivation: string;
}

export interface AdaptiveDifficulty {
  current: string;
  change: 'increase' | 'decrease' | null;
  trend: 'improving' | 'declining' | 'stable' | 'inconsistent' | null;
  reasoning: string | null;
}

export interface SubmitAnswerProgress {
  questions_asked: number;
  questions_answered: number;
  total_planned: number;
  is_complete: boolean;
}

export interface SubmitAnswerResponse {
  session_id: number;
  evaluation: Evaluation;
  adaptive_difficulty: AdaptiveDifficulty;
  conversational_response: string | null;
  next_question: InterviewQuestion | null;
  progress: SubmitAnswerProgress;
  latency_ms: number;
}

export interface InterviewGrade {
  overall_score: number;
  weighted_average_logic: string;
  skill_wise_summary: Record<string, number>;
  top_strengths: string[];
  critical_weaknesses: string[];
  hire_recommendation: string;
  confidence_level: number;
  reasoning_summary: string;
  per_question_summary: Array<{
    question_id: string;
    score: number;
    skill: string;
    status: string;
  }>;
  score_distribution: Record<string, number>;
}

export interface InterviewAnalysis {
  overall_score: number;
  overall_status: string;
  overall_quality: string;
  total_questions: number;
  passed_questions: number;
  failed_questions: number;
  pass_rate: number;
  segment_performance: Record<string, number>;
  question_analysis: Array<{
    question_id: string;
    score: number;
    status: string;
    skill: string;
    segment_type: string;
  }>;
}

export interface CompleteInterviewResponse {
  session_id: number;
  status: string;
  grade: InterviewGrade;
  analysis: InterviewAnalysis;
  transcript: TranscriptResponse | null;
  latency_ms: number;
}

export interface InterviewStatusResponse {
  session_id: number;
  session_status: string;
  plan_status: string;
  progress: {
    questions_asked: number;
    questions_answered: number;
    total_planned: number;
    current_difficulty: string;
    elapsed_seconds: number | null;
  };
  scores: number[];
  average_score: number;
  skill_scores: Record<string, number[]>;
  // Async first question — poll until first_question_ready is true
  first_question_ready?: boolean;
  first_question?: InterviewQuestion | null;
}

export interface TranscriptEntry {
  transcript_id: number;
  turn_number: number | null;
  segment_type: string | null;
  question_text: string | null;
  answer_text: string | null;
  answer_quality_score: number | null;
  model_used: string | null;
  provider: string | null;
  rubric: Record<string, unknown>;
  cost_info: Record<string, unknown>;
  is_multipart: boolean;
  is_sub_question: boolean;
  part_label: string | null;
  skill: string | null;
  created_at: string | null;
}

export interface TranscriptResponse {
  session_id: number;
  total_entries: number;
  entries: TranscriptEntry[];
}

// V2 types
export interface StartV2InterviewRequest extends StartInterviewRequest {
  stt_provider?: 'whisper' | 'deepgram' | 'google';
  noise_suppression?: boolean;
  cheat_detection?: boolean;
  mode?: 'video' | 'audio_only' | 'text_fallback';
  avatar_enabled?: boolean;
  avatar_preset?: string;
  tts_provider?: 'elevenlabs' | 'openai';
  job_id?: number;
}

export interface V2PipelineInfo {
  q1_type: string | null;
  q2_prefetched: boolean | null;
}

export interface StartV2InterviewResponse {
  v2_session_id: number;
  v1_session_id: number;
  status: string;
  mode: string;
  stt_provider: string;
  cheat_detection_enabled: boolean;
  noise_suppression_enabled: boolean;
  plan_summary: PlanSummary;
  first_question: InterviewQuestion | null;
  ws_url: string;
  auto_submit_seconds: number | null;
  latency_ms: number;
  pipeline_info: V2PipelineInfo | null;
  avatar_enabled?: boolean;
  avatar_preset?: string;
  tts_provider?: string;
}

export interface V2Grade {
  overall_score: number;
  integrity_score: number;
  hire_recommendation: string;
  flagged_events_summary: Array<{
    event_type: string;
    count: number;
    avg_severity: number;
  }>;
  explanation: string;
}

export interface IntegrityInfo {
  integrity_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  cheat_events_total: number;
  critical_events_count: number;
  gaze_consistency_score: number;
  face_presence_score: number;
  voice_consistency_score: number;
}

export interface CompleteV2InterviewResponse {
  v2_session_id: number;
  v1_session_id: number;
  status: string;
  grade: V2Grade;
  v1_grade: InterviewGrade;
  integrity: IntegrityInfo;
  analysis: InterviewAnalysis | null;
  transcript: TranscriptResponse | null;
  latency_ms: number;
}

export interface CheatEvent {
  id: number;
  timestamp: number;
  event_type: string;
  severity: number;
  description: string;
  duration_seconds: number;
  question_id: string;
}

export interface CheatEventsResponse {
  events: CheatEvent[];
  summary: {
    total_events: number;
    critical_events: number;
    by_type: Record<string, number>;
  };
  message: string | null;
}

// WebSocket message types
export type WSClientMessageType =
  | 'start'
  | 'audio'
  | 'video_frame'
  | 'tts_complete'
  | 'barge_in'
  | 'force_submit'
  | 'avatar_ready'
  | 'client_transcript'
  | 'speech_activity'
  | 'tab_visibility'
  | 'heartbeat'
  | 'get_debug';

export interface WSClientMessage {
  type: WSClientMessageType;
  data?: string;
  energy?: number;
  tts_progress?: number;
  speech_duration_ms?: number;
  hidden?: boolean;
}

export type WSServerMessageType =
  | 'question'
  | 'transcript_segment'
  | 'evaluation'
  | 'question_repeat'
  | 'reprompt'
  | 'auto_submit_countdown'
  | 'barge_in_ack'
  | 'cancel_tts'
  | 'tts_start'
  | 'tts_audio'
  | 'tts_end'
  | 'avatar_ready_ack'
  | 'state_update'
  | 'speech_state'
  | 'cheating_alert'
  | 'detection_result'
  | 'heartbeat_ack'
  | 'debug_update'
  | 'error';

export interface WSServerMessage {
  type: WSServerMessageType;
  data?: unknown;
  speak?: boolean;
  question_number?: number;
  pipeline?: string;
  tts_server?: boolean;
  tts_fallback?: boolean;
  text?: string;
  is_final?: boolean;
  is_last?: boolean;
  confidence?: number;
  start_time?: number;
  end_time?: number;
  message?: string;
  attempt?: number;
  max_attempts?: number;
  original_question?: string;
  rephrased_question?: string;
  cue_type?: string;
  cue_text?: string;
  seconds_left?: number;
  total?: number;
  barge_in_count?: number;
  tts_progress?: number;
  content_heard_pct?: number;
  timestamp?: number;
  state?: string;
  previous_state?: string;
  progress?: SubmitAnswerProgress;
  alerts?: string[];
  details?: Record<string, unknown>;
  reason?: string;
  background?: boolean;
  answer_text?: string;
  adaptive_difficulty?: AdaptiveDifficulty;
  conversational_response?: string;
  session_duration?: number;
  speech_active?: boolean;
  silence_duration?: number;
  phase?: string;
  user_energy?: number;
  // TTS fields
  question_id?: string;
  estimated_duration_ms?: number;
  actual_duration_ms?: number;
  chunk_index?: number;
  cache_hit?: boolean;
  fallback_to_client_tts?: boolean;
  word_timestamps?: unknown;
  // Avatar fields
  tts_enabled?: boolean;
  voice_id?: string;
  error?: string;
}

// Expert/Onboarding types
export interface OnboardingStatus {
  // Flat fields (direct from API or nested under checklist)
  registered: boolean;
  resume_uploaded: boolean;
  profile_completed: boolean;
  domains_set: boolean;
  interview_completed: boolean;
  active: boolean;
  current_step:
    | 'not_registered'
    | 'registered'
    | 'resume_uploaded'
    | 'profile_completed'
    | 'ready_for_interview'
    | 'interview_completed'
    | 'active';
  can_start_interview: boolean;
  interview_review: unknown | null;
  // Nested format (some API responses wrap fields)
  checklist?: {
    registered: boolean;
    resume_uploaded: boolean;
    profile_completed: boolean;
    domains_set: boolean;
    interview_completed: boolean;
    active: boolean;
  };
  interview?: {
    session_id: number | null;
    status: string | null;
    score: number | null;
  } | null;
  user_id?: number;
  expert_id?: number | null;
  expert_status?: string;
  expert_tier?: number;
}

export interface ExpertProfile {
  college: string;
  highest_education: string;
  bachelors_degree: string;
  masters_degree?: string;
  subject_taken: string;
  subjects_of_expertise: string[];
  professional_background: string;
  years_of_experience: number;
}

export interface DomainProficiency {
  user_id: number;
  domain: string;
  subdomain: string | null;
  parent_domain: string;
  domain_id: number;
  proficiency_score: number;
}

export interface ExpertScoreComponent {
  value: number;
  weight: number;
  contribution: number;
}

export interface ExpertScore {
  expert_id: number;
  expert_score: number;
  derived_tier: 1 | 2 | 3;
  total_completed_annotations: number;
  score_version: number;
  last_computed_at: string;
  components: {
    rolling_iaa: ExpertScoreComponent;
    qc_alignment: ExpertScoreComponent;
    domain_interview: ExpertScoreComponent;
    education_experience: ExpertScoreComponent;
    sla_reliability: ExpertScoreComponent;
    fraud_risk_inverse: ExpertScoreComponent;
    stability: ExpertScoreComponent;
  };
}

// Session list types
export interface SessionListItem {
  session_id: number;
  user_id: number;
  expert_id: number | null;
  title: string;
  status: string;
  total_questions: number;
  total_cost_usd: number;
  transcript_count: number;
  overall_score: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  is_v2_session: boolean;
  barge_in_count: number;
  repeat_request_count: number;
}

export interface SessionListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: SessionListItem[];
}

// Cost estimate
export interface CostEstimate {
  estimated_cost_usd: number;
  breakdown: Record<string, number>;
}

// Avatar types
export interface AvatarPreset {
  preset_id: string;
  name: string;
  description: string;
  voice_name: string;
  thumbnail_url: string;
}

export interface AvatarConfig {
  preset_id: string;
  name: string;
  vrm_model_url: string;
  voice_id: string;
  voice_name: string;
  lip_sync_config: {
    morph_targets: string[];
    smoothing: number;
    frequency_bands: number;
    amplitude_threshold: number;
    update_rate_hz: number;
  };
  preload_assets: string[];
}

// V2 Status types
export interface V2ConversationAnalytics {
  barge_in_count: number;
  repeat_request_count: number;
  interruption_events: Array<{
    type: string;
    timestamp: number;
    energy: number;
    tts_progress: number;
    content_heard_pct: number;
    speech_duration_ms: number;
    question_id: string;
    count: number;
  }>;
}

export interface V2TTSAnalytics {
  tts_provider: string | null;
  avatar_enabled: boolean;
  avatar_preset: string | null;
  tts_voice_id: string | null;
  tts_total_duration_ms: number | null;
  tts_total_chunks: number;
  tts_cache_hit_count: number;
  tts_failure_count: number;
}

export interface V2StatusResponse {
  v2_session_id: number;
  v1_session_id: number;
  v2: {
    transcript_segments: number;
    current_question_id: string | null;
    session_duration_seconds: number;
    cheat_events: {
      total: number;
      critical: number;
      by_type: Record<string, number>;
    };
    stt_stats: {
      total_segments: number;
      final_segments: number;
    };
    conversation_analytics: V2ConversationAnalytics | null;
    tts_analytics: V2TTSAnalytics | null;
  };
}

export interface V2TranscriptSegment {
  id: number;
  text: string;
  start_time: number;
  end_time: number;
  confidence: number | null;
  is_final: boolean;
  speaker: 'AI' | 'User';
  event_type: string | null;
  question_id: string;
  segment_index: number;
}

export interface V2TranscriptResponse {
  v2_session_id: number;
  total_segments: number;
  segments: V2TranscriptSegment[];
}

// Session creation
export interface CreateSessionRequest {
  job_id?: number;
  ai_avatar_interview?: boolean;
  avatar_type?: string;
  title?: string;
}

export interface CreateSessionResponse {
  session_id: number;
  user_id: number;
  title: string;
  status: string;
  created_at: string;
}

// Interview phase states
export type InterviewPhase =
  | 'idle'
  | 'connected'
  | 'ai_speaking'
  | 'listening'
  | 'user_speaking'
  | 'processing'
  | 'countdown'
  | 'evaluating'
  | 'complete';

// Hire recommendation bands
export type HireRecommendation =
  | 'Strong No Hire'
  | 'No Hire'
  | 'Borderline'
  | 'Hire'
  | 'Strong Hire';

export function getHireRecommendation(score: number): HireRecommendation {
  if (score >= 80) return 'Strong Hire';
  if (score >= 65) return 'Hire';
  if (score >= 50) return 'Borderline';
  if (score >= 30) return 'No Hire';
  return 'Strong No Hire';
}

export function getScoreBand(score: number): string {
  if (score >= 81) return 'excellent';
  if (score >= 61) return 'good';
  if (score >= 41) return 'meets_minimum';
  if (score >= 21) return 'below_expectations';
  return 'deficient';
}
