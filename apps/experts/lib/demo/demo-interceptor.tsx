'use client';

/**
 * Demo Interceptor
 *
 * When NEXT_PUBLIC_DEMO_MODE=true, this component patches the global apiClient
 * to intercept all HTTP calls and return mock data based on URL patterns.
 *
 * Zero changes needed in any page or service file.
 */

import { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { apiClient } from '@raweval/api-client';
import {
  useDemoStore,
  buildOnboardingStatus,
  DEMO_PROFILE,
  DEMO_DOMAINS,
  DEMO_SCORE,
  DEMO_TASKS,
  DEMO_PROFILE_CHECK,
  DEMO_AVAILABLE_DOMAINS,
  DEMO_JOBS,
  DEMO_INTERVIEW_QUESTIONS,
  DEMO_INTERVIEW_EVALUATIONS,
  DEMO_SESSIONS,
  DEMO_RESUME_UPLOAD_RESPONSE,
  DEMO_COST_ESTIMATE,
  DEMO_USER_METADATA,
  DEMO_USER,
  DEMO_EXPERT_ID,
  getDemoConversation,
  getDemoRubric,
  getDemoQuestions,
  getDemoTimeline,
  getDemoComments,
} from '@/stores/demo-store';

// ── URL matcher helpers ────────────────────────────────────────────────────

function matchUrl(url: string, pattern: string): boolean {
  // Convert pattern like '/workbench/experts/:id/score' to regex
  const regex = new RegExp(
    '^' + pattern.replace(/:[^/]+/g, '[^/]+').replace(/\?.*/, '') + '(\\?.*)?$'
  );
  return regex.test(url);
}

function extractId(url: string, position: number): number {
  const parts = url.split('?')[0]!.split('/').filter(Boolean);
  return parseInt(parts[position] ?? '0', 10);
}

// ── Route handler ──────────────────────────────────────────────────────────

type RouteHandler = (url: string, body?: unknown) => unknown;

function createGetRoutes(): Array<[string, RouteHandler]> {
  return [
    // ── Auth / User ──
    ['/users/me', () => DEMO_USER],
    ['/users/me/metadata', () => DEMO_USER_METADATA],
    ['/users/:id/metadata', () => ({
      professional_background: DEMO_PROFILE.professional_background,
      resume_filename: 'Sarah_Chen_Resume.pdf',
      resume_s3_url: 'https://demo.raweval.com/resumes/sarah_chen.pdf',
      auto_detected_domains: DEMO_RESUME_UPLOAD_RESPONSE.auto_detected_domains,
    })],

    // ── Expert Onboarding ──
    ['/workbench/experts/me/onboarding-status', () => {
      const step = useDemoStore.getState().onboardingStep;
      return buildOnboardingStatus(step);
    }],
    ['/workbench/experts/me/profile', () => DEMO_PROFILE],
    ['/workbench/experts/me/domains', () => DEMO_DOMAINS],
    ['/workbench/experts/me/score', () => DEMO_SCORE],
    ['/workbench/experts/:id/score', () => DEMO_SCORE],
    ['/workbench/experts/:id', () => ({
      id: DEMO_EXPERT_ID,
      user_id: DEMO_USER.id,
      tier: 2,
      specializations: ['Machine Learning', 'NLP'],
      woe_score: 78.4,
      total_tasks_completed: 47,
      accuracy_rate: 0.82,
      created_at: '2026-01-15T00:00:00Z',
      verified_at: '2026-01-20T00:00:00Z',
    })],
    ['/workbench/experts', () => []],
    ['/workbench/domains', () => DEMO_AVAILABLE_DOMAINS],
    ['/workbench/profile-check', () => DEMO_PROFILE_CHECK],

    // ── Workbench Tasks ──
    ['/workbench/my-tasks', () => {
      const store = useDemoStore.getState();
      // Filter out submitted tasks
      const filtered = {
        ...DEMO_TASKS,
        items: DEMO_TASKS.items.filter(t => !store.submittedTasks.has(t.allocation_id)),
      };
      filtered.total = filtered.items.length;
      return filtered;
    }],

    // ── Conversation & Rubric ──
    ['/workbench/conversation/:id/messages', (url) => {
      const id = extractId(url, 2);
      return getDemoConversation(id);
    }],
    ['/workbench/conversation/:id/rubric', (url) => {
      const id = extractId(url, 2);
      return getDemoRubric(id);
    }],
    ['/workbench/conversation/:id/full-info', (url) => {
      const id = extractId(url, 2);
      return { ...getDemoConversation(id), rubric: getDemoRubric(id) };
    }],
    ['/workbench/conversation/:id/error-markings', (url) => {
      const id = extractId(url, 2);
      return { conversation_id: id, total: 0, markings: [] };
    }],
    ['/workbench/conversation/:id/status-timeline', (url) => {
      const id = extractId(url, 2);
      return getDemoTimeline(id);
    }],
    ['/workbench/conversation/:id/final-answers', (url) => {
      const id = extractId(url, 2);
      return { conversation_id: id, failed_prompt_final_id: 0, task_status: 'pending', domain: 'ML', failure_reason: null, total_final_answers: 0, contributing_experts: [], answers: [] };
    }],

    // ── Questions ──
    ['/workbench/tasks/:id/questions', (url) => {
      const fpfId = extractId(url, 2);
      const store = useDemoStore.getState();
      const base = getDemoQuestions(fpfId);
      // Update progress based on answered questions
      const answered = base.questions.filter(q => store.answeredQuestions.has(q.id)).length;
      return {
        ...base,
        my_progress: {
          ...base.my_progress,
          questions_answered: answered,
          progress_pct: Math.round((answered / base.total_questions) * 100),
          is_complete: answered >= base.total_questions,
        },
      };
    }],

    // ── Comments ──
    ['/workbench/task-comments/:id', (url) => {
      const fpfId = extractId(url, 2);
      return getDemoComments(fpfId);
    }],

    // ── Reviews ──
    ['/workbench/my-reviews', () => ({ total: 0, reviews: [] })],
    ['/workbench/my-post-reviews', () => ({ total: 0, reviews: [] })],
    ['/workbench/conversation/:id/verdict', (url) => {
      const fpfId = extractId(url, 2);
      return {
        failed_prompt_final_id: fpfId,
        conversation_id: 8001,
        current_status: 'pending_annotation',
        qc_outcome: 'pending',
        qc_status: 'pending',
        domain: 'Machine Learning',
        reviewer_pre_annotation_count: 0,
        reviewer_post_annotation_count: 0,
        pre_review_result: null,
        qc_case: null,
      };
    }],

    // ── QC ──
    ['/workbench/conversation/qc/question/:id', () => ({ status: 'pending', result: null })],
    ['/workbench/conversation/:id/weighted-iaa', () => ({ weighted_iaa: null, annotator_count: 1 })],

    // ── Submissions ──
    ['/workbench/submissions/:id', () => ({ id: 1, allocation_id: 0, prompt_id: 0, annotator_id: DEMO_EXPERT_ID, corrected_response: '', reasoning: '', correction_confidence: 0.9, new_rubric: null, submission_time_seconds: 300, ai_content_score: null, ai_content_score_reasoning: null, submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() })],
    ['/workbench/submissions', () => ({ total: 0, items: [] })],

    // ── Question Responses ──
    ['/workbench/conversation/questions/:id/responses', () => ({ total: 0, responses: [] })],

    // ── Batch Final Answers ──
    ['/workbench/batches/:id/final-answers', () => ({ total: 0, answers: [] })],

    // ── V2 Transcript ──
    ['/v2/interview/:id/transcript', () => ({ v2_session_id: 0, total_segments: 0, segments: [] })],

    // ── Conversational Status ──
    ['/workbench/interviews/conversational/:id/status', () => ({
      session_id: useDemoStore.getState().interviewSessionId,
      status: 'active',
      conversation_state: 'in_progress',
      role: 'Senior ML Engineer',
      domain: 'Machine Learning',
      total_questions: 5,
      context_loaded: true,
      resume_available: true,
      expert_data_available: true,
    })],

    // ── Interview ──
    ['/orchestrator/:id/status', () => {
      const store = useDemoStore.getState();
      const qi = store.interviewQuestionIndex;
      const questions = DEMO_INTERVIEW_QUESTIONS;
      return {
        session_id: store.interviewSessionId,
        session_status: store.interviewStep === 'completed' ? 'completed' : 'in_progress',
        plan_status: 'active',
        progress: {
          questions_asked: Math.min(qi + 1, questions.length),
          questions_answered: qi,
          total_planned: questions.length,
          current_difficulty: questions[Math.min(qi, questions.length - 1)]?.difficulty ?? 'medium',
          elapsed_seconds: qi * 180,
        },
        scores: DEMO_INTERVIEW_EVALUATIONS.slice(0, qi).map(e => e.score),
        average_score: qi > 0
          ? DEMO_INTERVIEW_EVALUATIONS.slice(0, qi).reduce((s, e) => s + e.score, 0) / qi
          : 0,
        skill_scores: {},
        first_question_ready: true,
        first_question: questions[0],
      };
    }],
    ['/orchestrator/:id/transcript', () => ({
      session_id: useDemoStore.getState().interviewSessionId,
      total_entries: DEMO_INTERVIEW_QUESTIONS.length,
      entries: DEMO_INTERVIEW_QUESTIONS.map((q, i) => ({
        transcript_id: q.transcript_id,
        turn_number: q.turn_number,
        segment_type: q.segment_type,
        question_text: q.question_text,
        answer_text: i < useDemoStore.getState().interviewQuestionIndex ? 'Expert provided a detailed answer...' : null,
        answer_quality_score: DEMO_INTERVIEW_EVALUATIONS[i]?.score ?? null,
        model_used: 'gpt-4o',
        provider: 'openai',
        rubric: {},
        cost_info: {},
        is_multipart: false,
        is_sub_question: false,
        part_label: null,
        skill: q.segment_type,
        created_at: '2026-03-25T14:00:00Z',
      })),
    })],
    ['/orchestrator/:id/analysis', () => ({
      overall_score: 78,
      overall_status: 'passed',
      overall_quality: 'good',
      total_questions: 5,
      passed_questions: 4,
      failed_questions: 1,
      pass_rate: 80,
      segment_performance: { technical: 81, domain: 88, behavioral: 75, system_design: 85 },
      question_analysis: DEMO_INTERVIEW_QUESTIONS.map((q, i) => ({
        question_id: String(q.question_id),
        score: DEMO_INTERVIEW_EVALUATIONS[i]?.score ?? 70,
        status: (DEMO_INTERVIEW_EVALUATIONS[i]?.score ?? 70) >= 60 ? 'passed' : 'failed',
        skill: q.segment_type,
        segment_type: q.segment_type,
      })),
    })],

    // ── Sessions / History ──
    ['/workbench/interviews/sessions', () => DEMO_SESSIONS],
    ['/workbench/interviews/sessions/:id', () => ({
      ...DEMO_SESSIONS.items[0],
      transcripts: [],
    })],
    ['/workbench/interviews/cost-estimate', () => DEMO_COST_ESTIMATE],
    ['/workbench/interviews/jobs', () => ({ total: DEMO_JOBS.length, items: DEMO_JOBS })],
    ['/workbench/interviews/jobs/:id', (url) => {
      const id = extractId(url, 3);
      return DEMO_JOBS.find(j => j.id === id) ?? DEMO_JOBS[0];
    }],

    // ── V2 Interview ──
    ['/v2/interview/:id/integrity', () => ({
      integrity_score: 95,
      risk_level: 'low',
      cheat_events_total: 0,
      critical_events_count: 0,
      gaze_consistency_score: 96,
      face_presence_score: 98,
      voice_consistency_score: 94,
    })],
    ['/v2/interview/:id/cheat-events', () => ({
      events: [],
      summary: { total_events: 0, critical_events: 0, by_type: {} },
      message: null,
    })],
    ['/v2/interview/:id/status', () => ({
      v2_session_id: 0,
      v1_session_id: useDemoStore.getState().interviewSessionId,
      v2: {
        transcript_segments: 0,
        current_question_id: null,
        session_duration_seconds: 0,
        cheat_events: { total: 0, critical: 0, by_type: {} },
        stt_stats: { total_segments: 0, final_segments: 0 },
        conversation_analytics: null,
        tts_analytics: null,
      },
    })],
    ['/v2/interview/avatar/presets', () => ({
      presets: [
        { preset_id: 'aria', name: 'Aria', description: 'Professional female interviewer', voice_name: 'Aria', thumbnail_url: '' },
        { preset_id: 'marcus', name: 'Marcus', description: 'Friendly male interviewer', voice_name: 'Marcus', thumbnail_url: '' },
        { preset_id: 'nova', name: 'Nova', description: 'Neutral, calm demeanor', voice_name: 'Nova', thumbnail_url: '' },
      ],
    })],
    ['/v2/interview/avatar/config', () => ({
      preset_id: 'aria',
      name: 'Aria',
      vrm_model_url: '',
      voice_id: 'aria-v1',
      voice_name: 'Aria',
      lip_sync_config: { morph_targets: [], smoothing: 0.5, frequency_bands: 8, amplitude_threshold: 0.05, update_rate_hz: 30 },
      preload_assets: [],
    })],
  ];
}

function createPostRoutes(): Array<[string, RouteHandler]> {
  return [
    // ── Auth ──
    ['/auth/login', () => {
      useDemoStore.getState().login();
      return {
        access_token: 'demo_token_' + Date.now(),
        refresh_token: 'demo_refresh_' + Date.now(),
        expires_in: 86400,
        token_type: 'bearer',
      };
    }],
    ['/auth/register', () => {
      useDemoStore.getState().login();
      return {
        id: DEMO_USER.id,
        email: 'sarah.chen@example.com',
        full_name: 'Sarah Chen',
        is_active: true,
        created_at: new Date().toISOString(),
      };
    }],
    ['/auth/send-verification', () => ({ message: 'Verification code sent' })],
    ['/auth/verify-email', () => {
      useDemoStore.getState().login();
      return {
        access_token: 'demo_token_' + Date.now(),
        refresh_token: 'demo_refresh_' + Date.now(),
        expires_in: 86400,
        token_type: 'bearer',
      };
    }],
    ['/auth/forgot-password', () => ({ message: 'Reset code sent' })],
    ['/auth/reset-password', () => ({ message: 'Password reset successful' })],
    ['/auth/refresh', () => ({
      access_token: 'demo_token_' + Date.now(),
      refresh_token: 'demo_refresh_' + Date.now(),
      expires_in: 86400,
      token_type: 'bearer',
    })],
    ['/auth/google', () => {
      useDemoStore.getState().login();
      return {
        access_token: 'demo_token_' + Date.now(),
        refresh_token: 'demo_refresh_' + Date.now(),
        expires_in: 86400,
        token_type: 'bearer',
        is_new_user: false,
      };
    }],

    // ── Expert Registration ──
    ['/workbench/experts/register', () => {
      useDemoStore.getState().setOnboardingStep('registered');
      return { id: DEMO_EXPERT_ID, user_id: DEMO_USER.id, tier: 3, specializations: [], woe_score: 0, total_tasks_completed: 0, accuracy_rate: 0, created_at: new Date().toISOString(), verified_at: null };
    }],

    // ── Resume Upload ──
    ['/users/me/resume/upload', () => {
      useDemoStore.getState().setOnboardingStep('resume_uploaded');
      return DEMO_RESUME_UPLOAD_RESPONSE;
    }],

    // ── Interview Start ──
    ['/orchestrator/start', () => {
      const store = useDemoStore.getState();
      store.setInterviewStep('in_progress');
      return {
        session_id: store.interviewSessionId,
        plan_id: 1,
        status: 'in_progress',
        plan_summary: {
          total_planned_questions: 5,
          num_single: 5,
          num_multipart: 0,
          total_time_minutes: 30,
          interview_type: 'technical',
          seniority: 'senior',
          skills_to_test: ['ML', 'NLP', 'LLM Evaluation'],
        },
        first_question: DEMO_INTERVIEW_QUESTIONS[0],
        latency_ms: 250,
      };
    }],

    // ── Interview Answer ──
    ['/orchestrator/:id/answer', () => {
      const store = useDemoStore.getState();
      const qi = store.interviewQuestionIndex;
      store.advanceInterviewQuestion();
      const nextQi = qi + 1;
      const isComplete = nextQi >= DEMO_INTERVIEW_QUESTIONS.length;
      return {
        session_id: store.interviewSessionId,
        evaluation: DEMO_INTERVIEW_EVALUATIONS[qi] ?? DEMO_INTERVIEW_EVALUATIONS[0],
        adaptive_difficulty: {
          current: DEMO_INTERVIEW_QUESTIONS[nextQi]?.difficulty ?? 'hard',
          change: null,
          trend: 'stable',
          reasoning: null,
        },
        conversational_response: null,
        next_question: isComplete ? null : DEMO_INTERVIEW_QUESTIONS[nextQi],
        progress: {
          questions_asked: nextQi + (isComplete ? 0 : 1),
          questions_answered: nextQi,
          total_planned: DEMO_INTERVIEW_QUESTIONS.length,
          is_complete: isComplete,
        },
        latency_ms: 180,
      };
    }],

    // ── Interview Complete ──
    ['/orchestrator/:id/complete', () => {
      const store = useDemoStore.getState();
      store.setInterviewStep('completed');
      store.setOnboardingStep('active');
      return {
        session_id: store.interviewSessionId,
        status: 'completed',
        grade: {
          overall_score: 78,
          weighted_average_logic: 'Weighted by question difficulty and segment importance.',
          skill_wise_summary: { technical: 81, domain: 88, behavioral: 75, system_design: 85, coding: 80 },
          top_strengths: ['Strong domain knowledge in ML/NLP', 'Clear communication', 'Practical experience evident'],
          critical_weaknesses: ['Could improve depth on statistical methods'],
          hire_recommendation: 'Hire',
          confidence_level: 85,
          reasoning_summary: 'Candidate demonstrates strong expertise in ML and NLP with practical experience in LLM evaluation. Recommended for Tier 2 expert status.',
          per_question_summary: DEMO_INTERVIEW_QUESTIONS.map((q, i) => ({
            question_id: String(q.question_id),
            score: DEMO_INTERVIEW_EVALUATIONS[i]?.score ?? 70,
            skill: q.segment_type,
            status: (DEMO_INTERVIEW_EVALUATIONS[i]?.score ?? 70) >= 60 ? 'passed' : 'failed',
          })),
          score_distribution: { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 2, '81-100': 3 },
        },
        analysis: {
          overall_score: 78,
          overall_status: 'passed',
          overall_quality: 'good',
          total_questions: 5,
          passed_questions: 4,
          failed_questions: 1,
          pass_rate: 80,
          segment_performance: { technical: 81, domain: 88, behavioral: 75, system_design: 85 },
          question_analysis: DEMO_INTERVIEW_QUESTIONS.map((q, i) => ({
            question_id: String(q.question_id),
            score: DEMO_INTERVIEW_EVALUATIONS[i]?.score ?? 70,
            status: (DEMO_INTERVIEW_EVALUATIONS[i]?.score ?? 70) >= 60 ? 'passed' : 'failed',
            skill: q.segment_type,
            segment_type: q.segment_type,
          })),
        },
        transcript: null,
        latency_ms: 300,
      };
    }],

    // ── Workbench Responses ──
    ['/workbench/conversation/responses', (_url, body) => {
      const data = body as { question_id?: number } | undefined;
      if (data?.question_id) {
        useDemoStore.getState().answerQuestion(data.question_id);
      }
      return {
        id: Math.floor(Math.random() * 10000),
        question_id: data?.question_id ?? 0,
        annotator_id: DEMO_EXPERT_ID,
        tier: 2,
        status: 'accepted',
        qc_auto_triggered: false,
        qc_result: null,
        qc_error: null,
      };
    }],

    // ── Workbench Submissions ──
    ['/workbench/submissions', (_url, body) => {
      const data = body as { allocation_id?: number } | undefined;
      if (data?.allocation_id) {
        useDemoStore.getState().submitTask(data.allocation_id);
      }
      return {
        id: Math.floor(Math.random() * 10000),
        allocation_id: data?.allocation_id ?? 0,
        prompt_id: 0,
        annotator_id: DEMO_EXPERT_ID,
        corrected_response: '',
        reasoning: '',
        correction_confidence: 0.9,
        new_rubric: null,
        submission_time_seconds: 300,
        ai_content_score: null,
        ai_content_score_reasoning: null,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }],

    // ── Task Comments ──
    ['/workbench/task-comments', (_url, body) => {
      const data = body as { comment_text?: string; failed_prompt_final_id?: number } | undefined;
      return {
        id: Math.floor(Math.random() * 10000),
        failed_prompt_final_id: data?.failed_prompt_final_id ?? 0,
        question_id: null,
        author_id: DEMO_EXPERT_ID,
        author_name: DEMO_USER.full_name,
        author_role: 'expert',
        comment_text: data?.comment_text ?? '',
        comment_type: 'general',
        parent_comment_id: null,
        task_status_at_comment: 'pending_annotation',
        is_resolved: false,
        created_at: new Date().toISOString(),
      };
    }],

    // ── Workbench: Error Marking ──
    ['/workbench/conversation/error-marking', () => ({
      id: Math.floor(Math.random() * 10000),
      conversation_id: 0,
      turn_number: 0,
      error_type: 'factual_error',
      error_severity: 'major',
      error_description: null,
      marked_text: '',
      correct_information: null,
      marked_by_expert: DEMO_EXPERT_ID,
      annotator_tier: 2,
      start_offset: 0,
      end_offset: 0,
    })],

    // ── Generate Questions (no-op) ──
    ['/workbench/conversation/:id/generate-questions', () => ({ status: 'ok' })],

    // ── Session creation ──
    ['/workbench/interviews/sessions', () => ({
      session_id: useDemoStore.getState().interviewSessionId,
      user_id: DEMO_USER.id,
      title: 'Demo Interview Session',
      status: 'pending',
      created_at: new Date().toISOString(),
    })],

    // ── V2 Interview Complete ──
    ['/v2/interview/:id/complete', () => {
      useDemoStore.getState().setInterviewStep('completed');
      useDemoStore.getState().setOnboardingStep('active');
      return {
        v2_session_id: 0,
        v1_session_id: useDemoStore.getState().interviewSessionId,
        status: 'completed',
        grade: {
          overall_score: 78,
          integrity_score: 95,
          hire_recommendation: 'Hire',
          flagged_events_summary: [],
          explanation: 'Strong performance across all areas. Candidate showed deep understanding of ML concepts, clear communication, and practical experience in LLM evaluation workflows.',
        },
        v1_grade: {
          overall_score: 78,
          weighted_average_logic: 'Weighted by question difficulty and segment importance.',
          skill_wise_summary: { technical: 81, domain: 88, behavioral: 75, system_design: 85, coding: 80 },
          top_strengths: ['Strong domain knowledge in ML/NLP', 'Clear communication', 'Practical experience evident'],
          critical_weaknesses: ['Could improve depth on statistical methods'],
          hire_recommendation: 'Hire',
          confidence_level: 85,
          reasoning_summary: 'Candidate demonstrates strong expertise in ML and NLP with practical experience in LLM evaluation. Recommended for Tier 2 expert status.',
          per_question_summary: DEMO_INTERVIEW_QUESTIONS.map((q, i) => ({
            question_id: String(q.question_id),
            score: DEMO_INTERVIEW_EVALUATIONS[i]?.score ?? 70,
            skill: q.segment_type,
            status: (DEMO_INTERVIEW_EVALUATIONS[i]?.score ?? 70) >= 60 ? 'passed' : 'failed',
          })),
          score_distribution: { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 2, '81-100': 3 },
        },
        integrity: {
          integrity_score: 95,
          risk_level: 'low',
          cheat_events_total: 0,
          critical_events_count: 0,
          gaze_consistency_score: 96,
          face_presence_score: 98,
          voice_consistency_score: 94,
        },
        analysis: {
          overall_score: 78,
          overall_status: 'passed',
          overall_quality: 'good',
          total_questions: 5,
          passed_questions: 4,
          failed_questions: 1,
          pass_rate: 80,
          segment_performance: { technical: 81, domain: 88, behavioral: 75, system_design: 85 },
          question_analysis: DEMO_INTERVIEW_QUESTIONS.map((q, i) => ({
            question_id: String(q.question_id),
            score: DEMO_INTERVIEW_EVALUATIONS[i]?.score ?? 70,
            status: (DEMO_INTERVIEW_EVALUATIONS[i]?.score ?? 70) >= 60 ? 'passed' : 'failed',
            skill: q.segment_type,
            segment_type: q.segment_type,
          })),
        },
        transcript: null,
        latency_ms: 200,
      };
    }],

    // ── Conversational Interview (V2 spoken) ──
    ['/workbench/interviews/conversational/initialize', () => {
      const store = useDemoStore.getState();
      store.setInterviewStep('in_progress');
      return {
        session_id: store.interviewSessionId,
        greeting: 'Hello! I\'m your AI interviewer today. Let\'s start with your background in machine learning.',
        context_loaded: true,
        role: 'Senior ML Engineer',
        domain: 'Machine Learning',
      };
    }],

    // ── AI Text Correction ──
    ['/workbench/conversation/responses/correct', (_url, body) => {
      const data = body as { text?: string } | undefined;
      return {
        original_text: data?.text ?? '',
        corrected_text: data?.text ?? '',
        changes_made: 'No changes needed',
        is_changed: false,
        correction_mode: 'full',
        model_used: 'gpt-4o',
      };
    }],

    // ── Workbench skip / QC / completion ──
    ['/workbench/conversation/skip', () => ({ status: 'ok' })],
    ['/workbench/conversation/qc/run-question/:id', () => ({ status: 'ok' })],
    ['/workbench/conversation/:id/record-completion', () => ({ status: 'ok' })],
    ['/workbench/conversation/:id/pre-review/start', () => ({ status: 'ok' })],
    ['/workbench/conversation/:id/pre-review/complete', () => ({ status: 'ok' })],
    ['/workbench/conversation/:id/post-review/start', () => ({ status: 'ok' })],
    ['/workbench/conversation/:id/post-review/complete', () => ({ status: 'ok' })],
    ['/workbench/conversation/:id/resolve-human-review', () => ({ status: 'ok' })],

    // ── V2 Interview Start ──
    ['/v2/interview/start', () => {
      const store = useDemoStore.getState();
      store.setInterviewStep('in_progress');
      return {
        v2_session_id: 99001,
        v1_session_id: store.interviewSessionId,
        status: 'in_progress',
        mode: 'video',
        stt_provider: 'whisper',
        cheat_detection_enabled: true,
        noise_suppression_enabled: true,
        plan_summary: { total_planned_questions: 5, num_single: 5, num_multipart: 0, total_time_minutes: 30, interview_type: 'technical', seniority: 'senior', skills_to_test: ['ML', 'NLP'] },
        first_question: null,
        ws_url: 'wss://demo.raweval.com/ws/interview/99001',
        auto_submit_seconds: null,
        latency_ms: 200,
        pipeline_info: null,
        avatar_enabled: true,
        avatar_preset: 'aria',
        tts_provider: 'elevenlabs',
      };
    }],

    // ── Conversational Input ──
    ['/workbench/interviews/conversational/:id/input', () => ({
      response: 'That\'s a great answer. Let me follow up with another question about your experience.',
      question: 'Can you describe a specific project where you evaluated LLM outputs at scale?',
      transcript_id: 100,
      turn_number: 2,
      conversation_state: 'in_progress',
      action: 'continue',
      evaluation: { score: 82, breakdown: { conceptual_understanding: 85, technical_accuracy: 80 } },
    })],

    // ── Retry Analysis ──
    ['/workbench/conversation/:id/retry-analysis', () => ({ status: 'ok' })],

    // ── Cheating Detection ──
    ['/workbench/interviews/:id/cheating-detection', () => ({
      events: [],
      summary: { total_events: 0, critical_events: 0, by_type: {} },
      message: null,
    })],
  ];
}

function createPutRoutes(): Array<[string, RouteHandler]> {
  return [
    ['/workbench/experts/me/profile', () => {
      useDemoStore.getState().setOnboardingStep('profile_completed');
      return DEMO_PROFILE;
    }],
    ['/workbench/experts/me/domains', () => {
      const store = useDemoStore.getState();
      // Only advance if we're at profile_completed
      if (store.onboardingStep === 'profile_completed') {
        store.setOnboardingStep('domains_set');
      }
      return DEMO_DOMAINS[0];
    }],
    ['/workbench/experts/:id/tier', () => ({ status: 'ok' })],
    ['/workbench/conversation/responses/:id', () => ({ status: 'ok' })],
    ['/workbench/experts/:id/certifications', () => ({ status: 'ok' })],
  ];
}

// ── The interceptor component ──────────────────────────────────────────────

function findRoute(routes: Array<[string, RouteHandler]>, url: string): RouteHandler | null {
  for (const [pattern, handler] of routes) {
    if (matchUrl(url, pattern)) return handler;
  }
  return null;
}

export function DemoInterceptor({ children }: { children: React.ReactNode }) {
  const patched = useRef(false);

  useEffect(() => {
    if (patched.current) return;
    patched.current = true;

    const getRoutes = createGetRoutes();
    const postRoutes = createPostRoutes();
    const putRoutes = createPutRoutes();

    const client = apiClient as unknown as Record<string, unknown>;

    // Patch GET
    client.get = async function <T>(url: string): Promise<T> {
      const handler = findRoute(getRoutes, url);
      if (handler) {
        await delay(randomDelay());
        return handler(url) as T;
      }
      console.warn('[DEMO] Unhandled GET:', url);
      return {} as T;
    };

    // Patch POST
    client.post = async function <T>(url: string, data?: unknown): Promise<T> {
      const handler = findRoute(postRoutes, url);
      if (handler) {
        await delay(randomDelay());
        return handler(url, data) as T;
      }
      console.warn('[DEMO] Unhandled POST:', url);
      return {} as T;
    };

    // Patch PUT
    client.put = async function <T>(url: string, data?: unknown): Promise<T> {
      const handler = findRoute(putRoutes, url);
      if (handler) {
        await delay(randomDelay());
        return handler(url, data) as T;
      }
      console.warn('[DEMO] Unhandled PUT:', url);
      return {} as T;
    };

    // Patch PATCH and DELETE to no-op
    client.patch = async function <T>(): Promise<T> {
      await delay(100);
      return { status: 'ok' } as T;
    };
    client.delete = async function <T>(): Promise<T> {
      await delay(100);
      return { status: 'ok' } as T;
    };

    // Set auth cookie so middleware doesn't redirect to /login on navigation
    if (!Cookies.get('raweval_access_token')) {
      Cookies.set('raweval_access_token', 'demo_token_persistent', {
        expires: 7, // 7 days
        sameSite: 'strict',
      });
    }

    console.log('[DEMO] API interceptor active — all calls return mock data');
  }, []);

  return <>{children}</>;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): number {
  return 100 + Math.random() * 200; // 100-300ms to feel realistic
}
