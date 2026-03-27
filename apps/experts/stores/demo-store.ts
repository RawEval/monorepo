/**
 * Demo Store — Zustand state that drives the entire experts app with mock data.
 *
 * Every service singleton reads from this store instead of hitting the API.
 * Toggle via NEXT_PUBLIC_DEMO_MODE=true in .env.local
 */

import { create } from 'zustand';
import type { OnboardingStatus, ExpertProfile, DomainProficiency, ExpertScore } from '@/features/interview/types';
import type {
  TaskListResponse,
  ConversationMessagesResponse,
  RubricResponse,
  TaskQuestionsResponse,
  StatusTimelineResponse,
  ProfileCheckResponse,
  TaskComment,
} from '@/features/workbench/types';

// ── Onboarding step progression ────────────────────────────────────────────

type OnboardingStep = 'not_started' | 'registered' | 'resume_uploaded' | 'profile_completed' | 'domains_set' | 'interview_completed' | 'active';

const STEP_ORDER: OnboardingStep[] = [
  'not_started',
  'registered',
  'resume_uploaded',
  'profile_completed',
  'domains_set',
  'interview_completed',
  'active',
];

// ── Interview simulation state ─────────────────────────────────────────────

type InterviewStep = 'not_started' | 'setup' | 'in_progress' | 'completing' | 'completed';

// ── Store shape ────────────────────────────────────────────────────────────

interface DemoState {
  // Auth
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;

  // Onboarding
  onboardingStep: OnboardingStep;
  advanceOnboarding: () => void;
  setOnboardingStep: (step: OnboardingStep) => void;

  // Interview
  interviewStep: InterviewStep;
  interviewSessionId: number;
  interviewQuestionIndex: number;
  setInterviewStep: (step: InterviewStep) => void;
  advanceInterviewQuestion: () => void;
  resetInterview: () => void;

  // Workbench
  selectedTaskIndex: number | null;
  answeredQuestions: Set<number>;
  submittedTasks: Set<number>;
  selectTask: (index: number) => void;
  answerQuestion: (questionId: number) => void;
  submitTask: (allocationId: number) => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  // ── Auth ──
  isLoggedIn: false,
  login: () => set({ isLoggedIn: true, onboardingStep: 'registered' }),
  logout: () => set({ isLoggedIn: false, onboardingStep: 'not_started', interviewStep: 'not_started', selectedTaskIndex: null, answeredQuestions: new Set(), submittedTasks: new Set() }),

  // ── Onboarding ──
  onboardingStep: 'not_started',
  advanceOnboarding: () =>
    set((s) => {
      const idx = STEP_ORDER.indexOf(s.onboardingStep);
      const next = STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)];
      return { onboardingStep: next };
    }),
  setOnboardingStep: (step) => set({ onboardingStep: step }),

  // ── Interview ──
  interviewStep: 'not_started',
  interviewSessionId: 42001,
  interviewQuestionIndex: 0,
  setInterviewStep: (step) => set({ interviewStep: step }),
  advanceInterviewQuestion: () =>
    set((s) => ({ interviewQuestionIndex: s.interviewQuestionIndex + 1 })),
  resetInterview: () => set({ interviewStep: 'not_started', interviewQuestionIndex: 0 }),

  // ── Workbench ──
  selectedTaskIndex: null,
  answeredQuestions: new Set(),
  submittedTasks: new Set(),
  selectTask: (index) => set({ selectedTaskIndex: index, answeredQuestions: new Set() }),
  answerQuestion: (questionId) =>
    set((s) => {
      const next = new Set(s.answeredQuestions);
      next.add(questionId);
      return { answeredQuestions: next };
    }),
  submitTask: (allocationId) =>
    set((s) => {
      const next = new Set(s.submittedTasks);
      next.add(allocationId);
      return { submittedTasks: next, selectedTaskIndex: null, answeredQuestions: new Set() };
    }),
}));

// ═══════════════════════════════════════════════════════════════════════════
//  MOCK DATA — All the realistic dummy data the app needs
// ═══════════════════════════════════════════════════════════════════════════

export const DEMO_USER = {
  id: 1001,
  email: 'sarah.chen@example.com',
  full_name: 'Sarah Chen',
};

export const DEMO_EXPERT_ID = 501;

// ── Onboarding Status builder ──────────────────────────────────────────────

export function buildOnboardingStatus(step: OnboardingStep): OnboardingStatus {
  const idx = STEP_ORDER.indexOf(step);
  const atLeast = (s: OnboardingStep) => idx >= STEP_ORDER.indexOf(s);

  return {
    registered: atLeast('registered'),
    resume_uploaded: atLeast('resume_uploaded'),
    profile_completed: atLeast('profile_completed'),
    domains_set: atLeast('domains_set'),
    interview_completed: atLeast('interview_completed'),
    active: atLeast('active'),
    current_step: step === 'not_started' ? 'not_registered' : step === 'domains_set' ? 'ready_for_interview' : step,
    can_start_interview: step === 'domains_set',
    interview_review: null,
    interview: atLeast('interview_completed')
      ? { session_id: 42001, status: 'completed', score: 78 }
      : null,
    user_id: DEMO_USER.id,
    expert_id: atLeast('registered') ? DEMO_EXPERT_ID : null,
    expert_status: atLeast('active') ? 'active' : atLeast('interview_completed') ? 'active' : 'pending_interview',
    expert_tier: atLeast('active') ? 2 : undefined,
  };
}

// ── Expert profile ─────────────────────────────────────────────────────────

export const DEMO_PROFILE: ExpertProfile = {
  college: 'Stanford University',
  highest_education: "Master's",
  bachelors_degree: 'Computer Science',
  masters_degree: 'Machine Learning',
  subject_taken: 'Natural Language Processing',
  subjects_of_expertise: ['Machine Learning', 'NLP', 'Python', 'LLM Evaluation', 'Data Science'],
  professional_background: 'ML Engineer at a top-tier AI lab, 5 years experience building and evaluating large language models.',
  years_of_experience: 5,
};

// ── Domain proficiencies ───────────────────────────────────────────────────

export const DEMO_DOMAINS: DomainProficiency[] = [
  { user_id: DEMO_USER.id, domain: 'Machine Learning', subdomain: null, parent_domain: 'AI/ML', domain_id: 1, proficiency_score: 92 },
  { user_id: DEMO_USER.id, domain: 'Natural Language Processing', subdomain: null, parent_domain: 'AI/ML', domain_id: 2, proficiency_score: 88 },
  { user_id: DEMO_USER.id, domain: 'Python Programming', subdomain: null, parent_domain: 'Software Engineering', domain_id: 3, proficiency_score: 95 },
  { user_id: DEMO_USER.id, domain: 'Data Science', subdomain: null, parent_domain: 'AI/ML', domain_id: 4, proficiency_score: 85 },
];

// ── Available domains for picker ───────────────────────────────────────────

export const DEMO_AVAILABLE_DOMAINS = {
  total: 12,
  domains: [
    { id: 1, name: 'machine_learning', display_name: 'Machine Learning', description: 'ML algorithms, training, and evaluation', parent_id: null, subdomains: [] },
    { id: 2, name: 'nlp', display_name: 'Natural Language Processing', description: 'Text processing, tokenization, transformers', parent_id: null, subdomains: [] },
    { id: 3, name: 'python', display_name: 'Python Programming', description: 'Python development and best practices', parent_id: null, subdomains: [] },
    { id: 4, name: 'data_science', display_name: 'Data Science', description: 'Statistical analysis and data pipelines', parent_id: null, subdomains: [] },
    { id: 5, name: 'computer_vision', display_name: 'Computer Vision', description: 'Image processing and visual AI', parent_id: null, subdomains: [] },
    { id: 6, name: 'software_engineering', display_name: 'Software Engineering', description: 'System design, architecture, best practices', parent_id: null, subdomains: [] },
    { id: 7, name: 'mathematics', display_name: 'Mathematics', description: 'Linear algebra, calculus, statistics', parent_id: null, subdomains: [] },
    { id: 8, name: 'deep_learning', display_name: 'Deep Learning', description: 'Neural networks, architectures, training', parent_id: null, subdomains: [] },
    { id: 9, name: 'reinforcement_learning', display_name: 'Reinforcement Learning', description: 'RL algorithms and environments', parent_id: null, subdomains: [] },
    { id: 10, name: 'devops', display_name: 'DevOps & MLOps', description: 'CI/CD, deployment, monitoring', parent_id: null, subdomains: [] },
    { id: 11, name: 'security', display_name: 'Cybersecurity', description: 'Application security and threat modeling', parent_id: null, subdomains: [] },
    { id: 12, name: 'databases', display_name: 'Databases', description: 'SQL, NoSQL, query optimization', parent_id: null, subdomains: [] },
  ],
};

// ── Expert score ───────────────────────────────────────────────────────────

export const DEMO_SCORE: ExpertScore = {
  expert_id: DEMO_EXPERT_ID,
  expert_score: 78.4,
  derived_tier: 2,
  total_completed_annotations: 47,
  score_version: 3,
  last_computed_at: '2026-03-26T14:30:00Z',
  components: {
    rolling_iaa: { value: 82, weight: 0.30, contribution: 24.6 },
    qc_alignment: { value: 75, weight: 0.20, contribution: 15.0 },
    domain_interview: { value: 78, weight: 0.15, contribution: 11.7 },
    education_experience: { value: 85, weight: 0.10, contribution: 8.5 },
    sla_reliability: { value: 90, weight: 0.10, contribution: 9.0 },
    fraud_risk_inverse: { value: 96, weight: 0.10, contribution: 9.6 },
    stability: { value: 70, weight: 0.05, contribution: 3.5 },
  },
};

// ── Profile check ──────────────────────────────────────────────────────────

export const DEMO_PROFILE_CHECK: ProfileCheckResponse = {
  profile_completed: true,
  missing_fields: [],
  message: 'Profile is complete',
};

// ── Jobs ───────────────────────────────────────────────────────────────────

export const DEMO_JOBS = [
  {
    id: 1,
    title: 'Senior ML Engineer — LLM Evaluation',
    slug: 'senior-ml-engineer-llm-evaluation',
    description: 'Evaluate and annotate LLM outputs across factuality, reasoning, and code generation tasks. Requires deep understanding of transformer architectures and common failure modes.',
    domain_id: 1,
    domain_name: 'Machine Learning',
    experience_level: 'senior',
    difficulty: 'hard',
    seniority: 'senior',
    interview_type: 'technical',
    interview_duration_minutes: 30,
    min_questions: 8,
    duration_minutes: 30,
    total_questions: 8,
    is_active: true,
    job_type: 'expert_onboarding',
    responsibilities: ['Evaluate LLM outputs for factual accuracy', 'Identify hallucinations and reasoning errors', 'Provide detailed corrected responses', 'Maintain high inter-annotator agreement'],
    requirements: ['3+ years ML experience', 'Strong understanding of transformer architectures', 'Experience with LLM evaluation methodologies'],
    preferred_skills: ['PyTorch/TensorFlow', 'NLP pipelines', 'Statistical analysis', 'Technical writing'],
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'NLP Specialist — Text Quality Assessment',
    slug: 'nlp-specialist-text-quality',
    description: 'Assess quality of AI-generated text for coherence, factual accuracy, and style consistency. Focus on identifying hallucinations and logical errors.',
    domain_id: 2,
    domain_name: 'Natural Language Processing',
    experience_level: 'mid',
    difficulty: 'medium',
    seniority: 'mid',
    interview_type: 'technical',
    interview_duration_minutes: 25,
    min_questions: 6,
    duration_minutes: 25,
    total_questions: 6,
    is_active: true,
    job_type: 'expert_onboarding',
    responsibilities: ['Evaluate text coherence and consistency', 'Identify factual inaccuracies', 'Grade response quality on multiple dimensions'],
    requirements: ['2+ years NLP experience', 'Familiarity with text generation models', 'Strong English proficiency'],
    preferred_skills: ['Linguistic analysis', 'Annotation experience', 'Text classification'],
    created_at: '2026-03-05T00:00:00Z',
  },
  {
    id: 3,
    title: 'Python Code Reviewer — AI Generated Code',
    slug: 'python-code-reviewer',
    description: 'Review AI-generated Python code for correctness, security vulnerabilities, performance issues, and adherence to best practices.',
    domain_id: 3,
    domain_name: 'Python Programming',
    experience_level: 'senior',
    difficulty: 'hard',
    seniority: 'senior',
    interview_type: 'coding',
    interview_duration_minutes: 35,
    min_questions: 10,
    duration_minutes: 35,
    total_questions: 10,
    is_active: true,
    job_type: 'expert_onboarding',
    responsibilities: ['Review AI-generated code for correctness', 'Identify security vulnerabilities', 'Evaluate code quality and best practices', 'Provide corrected implementations'],
    requirements: ['5+ years Python development', 'Security review experience', 'Knowledge of async programming'],
    preferred_skills: ['FastAPI/Django', 'Code review tools', 'CI/CD pipelines', 'Testing frameworks'],
    created_at: '2026-03-10T00:00:00Z',
  },
];

// ── Interview questions ────────────────────────────────────────────────────

export const DEMO_INTERVIEW_QUESTIONS = [
  {
    question_text: 'Explain the key differences between BERT and GPT architectures. How do their pre-training objectives affect downstream task performance?',
    question_id: 'q1',
    transcript_id: 1,
    turn_number: 1,
    segment_type: 'technical',
    difficulty: 'medium',
  },
  {
    question_text: 'You notice an LLM consistently generates plausible-sounding but factually incorrect statements about recent events. Walk me through how you would systematically identify and categorize these hallucinations.',
    question_id: 'q2',
    transcript_id: 2,
    turn_number: 2,
    segment_type: 'domain',
    difficulty: 'hard',
  },
  {
    question_text: 'Describe a time when you had to evaluate the quality of AI-generated content at scale. What metrics did you use, and how did you handle inter-annotator disagreements?',
    question_id: 'q3',
    transcript_id: 3,
    turn_number: 3,
    segment_type: 'behavioral',
    difficulty: 'medium',
  },
  {
    question_text: 'Given a transformer model that performs well on benchmarks but poorly in production, what debugging steps would you take? How would you distinguish between data distribution shift and model limitations?',
    question_id: 'q4',
    transcript_id: 4,
    turn_number: 4,
    segment_type: 'system_design',
    difficulty: 'hard',
  },
  {
    question_text: 'How would you design a rubric for evaluating the quality of code generated by an LLM? What dimensions would you consider, and how would you weight them?',
    question_id: 'q5',
    transcript_id: 5,
    turn_number: 5,
    segment_type: 'technical',
    difficulty: 'hard',
  },
];

export const DEMO_INTERVIEW_EVALUATIONS = [
  {
    score: 82,
    breakdown: { conceptual_understanding: 85, technical_accuracy: 80, depth: 78, clarity: 88, edge_cases: 75, real_world: 82 },
    why_this_score: 'Strong conceptual foundation with clear articulation of architectural differences.',
    why_not_100: 'Could have elaborated more on the impact of masked vs autoregressive pre-training on few-shot learning.',
    missed_must_include_points: ['Comparison of attention mechanisms'],
    detected_red_flags: [],
    bonus_points_awarded: ['Mentioned recent research on bidirectional GPT variants'],
    improvement_plan: 'Deepen understanding of attention pattern differences.',
    deterministic_derivation: 'Weighted average of rubric components.',
  },
  {
    score: 88,
    breakdown: { conceptual_understanding: 90, technical_accuracy: 85, depth: 92, clarity: 86, edge_cases: 88, real_world: 85 },
    why_this_score: 'Excellent systematic approach to hallucination detection with practical methodology.',
    why_not_100: 'Could have discussed automated fact-checking pipelines in more depth.',
    missed_must_include_points: [],
    detected_red_flags: [],
    bonus_points_awarded: ['Mentioned cross-reference verification', 'Discussed confidence calibration'],
    improvement_plan: 'Consider automated tooling for large-scale hallucination detection.',
    deterministic_derivation: 'Weighted average of rubric components.',
  },
  {
    score: 75,
    breakdown: { conceptual_understanding: 78, technical_accuracy: 72, depth: 70, clarity: 82, edge_cases: 68, real_world: 80 },
    why_this_score: 'Good real-world example but lacked depth on statistical methods for agreement.',
    why_not_100: 'Did not discuss Cohen\'s kappa or Fleiss kappa for inter-annotator agreement.',
    missed_must_include_points: ['Statistical agreement metrics', 'Annotation guideline iteration'],
    detected_red_flags: [],
    bonus_points_awarded: ['Practical experience evident'],
    improvement_plan: 'Study formal inter-annotator agreement metrics.',
    deterministic_derivation: 'Weighted average of rubric components.',
  },
  {
    score: 85,
    breakdown: { conceptual_understanding: 88, technical_accuracy: 82, depth: 86, clarity: 84, edge_cases: 85, real_world: 82 },
    why_this_score: 'Well-structured debugging approach with clear distinction between data and model issues.',
    why_not_100: 'Could have discussed more specific tooling for distribution shift detection.',
    missed_must_include_points: [],
    detected_red_flags: [],
    bonus_points_awarded: ['Mentioned A/B testing methodology'],
    improvement_plan: 'Explore tools like Alibi Detect for drift monitoring.',
    deterministic_derivation: 'Weighted average of rubric components.',
  },
  {
    score: 80,
    breakdown: { conceptual_understanding: 82, technical_accuracy: 78, depth: 80, clarity: 85, edge_cases: 75, real_world: 78 },
    why_this_score: 'Solid rubric design with good dimension coverage.',
    why_not_100: 'Weighting justification could be more rigorous.',
    missed_must_include_points: ['Security vulnerability scoring'],
    detected_red_flags: [],
    bonus_points_awarded: ['Included maintainability dimension'],
    improvement_plan: 'Add security-specific evaluation criteria.',
    deterministic_derivation: 'Weighted average of rubric components.',
  },
];

// ── Workbench: Task Queue ──────────────────────────────────────────────────

export const DEMO_TASKS: TaskListResponse = {
  total: 5,
  page: 1,
  page_size: 20,
  total_pages: 1,
  expert_id: DEMO_EXPERT_ID,
  expert_tier: 2,
  items: [
    {
      allocation_id: 3001,
      batch_id: 100,
      batch_number: 'B-2026-0312',
      batch_domain: 'Machine Learning',
      batch_status: 'in_progress',
      tier: 2,
      submission_status: 'pending',
      session_started_at: '2026-03-26T10:00:00Z',
      prompts: [
        {
          failed_prompt_final_id: 5001,
          conversation_id: 8001,
          domain: 'Machine Learning',
          status: 'pending_annotation',
          failure_reason: 'The model incorrectly explained gradient descent optimization, confusing batch gradient descent with stochastic gradient descent and providing wrong convergence guarantees.',
          total_questions: 5,
          my_responses: 0,
          all_answered: false,
          has_rubric: true,
          failed_model: 'gpt-4o',
          failed_provider: 'openai',
          failed_turn_number: 4,
        },
      ],
    },
    {
      allocation_id: 3002,
      batch_id: 100,
      batch_number: 'B-2026-0312',
      batch_domain: 'Machine Learning',
      batch_status: 'in_progress',
      tier: 2,
      submission_status: 'pending',
      session_started_at: '2026-03-26T10:00:00Z',
      prompts: [
        {
          failed_prompt_final_id: 5002,
          conversation_id: 8002,
          domain: 'NLP',
          status: 'pending_annotation',
          failure_reason: 'The model hallucinated a non-existent research paper and attributed fake claims to real researchers when discussing transformer attention mechanisms.',
          total_questions: 4,
          my_responses: 0,
          all_answered: false,
          has_rubric: true,
          failed_model: 'claude-3.5-sonnet',
          failed_provider: 'anthropic',
          failed_turn_number: 2,
        },
      ],
    },
    {
      allocation_id: 3003,
      batch_id: 101,
      batch_number: 'B-2026-0313',
      batch_domain: 'Python Programming',
      batch_status: 'in_progress',
      tier: 2,
      submission_status: 'pending',
      session_started_at: '2026-03-26T11:00:00Z',
      prompts: [
        {
          failed_prompt_final_id: 5003,
          conversation_id: 8003,
          domain: 'Python',
          status: 'pending_annotation',
          failure_reason: 'The model generated Python code with a race condition in the async file handler and used deprecated APIs from Python 3.8.',
          total_questions: 6,
          my_responses: 0,
          all_answered: false,
          has_rubric: true,
          failed_model: 'gpt-4o',
          failed_provider: 'openai',
          failed_turn_number: 6,
        },
      ],
    },
    {
      allocation_id: 3004,
      batch_id: 101,
      batch_number: 'B-2026-0313',
      batch_domain: 'Data Science',
      batch_status: 'in_progress',
      tier: 2,
      submission_status: 'pending',
      session_started_at: null,
      prompts: [
        {
          failed_prompt_final_id: 5004,
          conversation_id: 8004,
          domain: 'Data Science',
          status: 'pending_annotation',
          failure_reason: 'The model recommended using Pearson correlation for non-linear relationships and misinterpreted p-values in hypothesis testing.',
          total_questions: 4,
          my_responses: 0,
          all_answered: false,
          has_rubric: true,
          failed_model: 'gemini-1.5-pro',
          failed_provider: 'google',
          failed_turn_number: 3,
        },
      ],
    },
    {
      allocation_id: 3005,
      batch_id: 102,
      batch_number: 'B-2026-0314',
      batch_domain: 'Deep Learning',
      batch_status: 'in_progress',
      tier: 2,
      submission_status: 'pending',
      session_started_at: null,
      prompts: [
        {
          failed_prompt_final_id: 5005,
          conversation_id: 8005,
          domain: 'Deep Learning',
          status: 'pending_annotation',
          failure_reason: 'The model incorrectly described the backpropagation through time (BPTT) algorithm for LSTMs and confused vanishing gradients with exploding gradients.',
          total_questions: 5,
          my_responses: 0,
          all_answered: false,
          has_rubric: true,
          failed_model: 'claude-3.5-sonnet',
          failed_provider: 'anthropic',
          failed_turn_number: 5,
        },
      ],
    },
  ],
};

// ── Workbench: Conversations ───────────────────────────────────────────────

const DEMO_CONVERSATIONS: Record<number, ConversationMessagesResponse> = {
  8001: {
    conversation_id: 8001,
    total_messages: 5,
    messages: [
      { id: 1, role: 'user', content: 'Can you explain how gradient descent works in machine learning?', model: null, provider: null, turn_number: 1, created_at: '2026-03-25T08:00:00Z' },
      { id: 2, role: 'assistant', content: 'Gradient descent is an optimization algorithm used to minimize the loss function in machine learning models. It works by computing the gradient of the loss with respect to the model parameters and updating them in the direction of steepest descent.\n\nThere are three main variants:\n1. **Batch Gradient Descent** — computes gradients over the entire dataset\n2. **Stochastic Gradient Descent (SGD)** — computes gradients on a single sample\n3. **Mini-batch Gradient Descent** — computes gradients over small batches', model: 'gpt-4o', provider: 'openai', turn_number: 2, created_at: '2026-03-25T08:00:05Z' },
      { id: 3, role: 'user', content: 'What about convergence guarantees? When can I be sure gradient descent will find the global minimum?', model: null, provider: null, turn_number: 3, created_at: '2026-03-25T08:01:00Z' },
      { id: 4, role: 'assistant', content: 'Great question! **Batch gradient descent is guaranteed to converge to the global minimum** for any differentiable loss function, as long as you use a sufficiently small learning rate. This is because it always follows the true gradient direction.\n\nFor **SGD, convergence to the global minimum is also guaranteed** but requires a decaying learning rate schedule (e.g., 1/t). The noise in gradient estimates actually helps escape local minima.\n\nIn practice, **all variants of gradient descent will find the global minimum** of neural network loss functions because recent research has shown that neural network loss landscapes have no local minima — only saddle points.\n\nThe key hyperparameters affecting convergence are:\n- **Learning rate**: Too large → divergence, too small → slow convergence\n- **Batch size**: Larger batches → more stable but slower updates\n- **Momentum**: Helps accelerate convergence in consistent gradient directions', model: 'gpt-4o', provider: 'openai', turn_number: 4, created_at: '2026-03-25T08:01:10Z' },
      { id: 5, role: 'user', content: 'That makes sense, thanks for the clear explanation!', model: null, provider: null, turn_number: 5, created_at: '2026-03-25T08:02:00Z' },
    ],
  },
  8002: {
    conversation_id: 8002,
    total_messages: 3,
    messages: [
      { id: 1, role: 'user', content: 'What are the latest advances in transformer attention mechanisms? I\'m particularly interested in efficient attention variants.', model: null, provider: null, turn_number: 1, created_at: '2026-03-25T09:00:00Z' },
      { id: 2, role: 'assistant', content: 'Great question! There have been several significant advances in efficient attention mechanisms:\n\n1. **Flash Attention** (Dao et al., 2022) — uses tiling and recomputation to reduce memory from O(n²) to O(n) while maintaining exact attention computation.\n\n2. **Multi-Query Attention** — as described in the seminal paper by **Dr. James Morrison at DeepMind** (2023), "Efficient Transformers through Shared Key-Value Heads," this approach shares key-value heads across query heads.\n\n3. **Grouped Query Attention (GQA)** — introduced by **Dr. Sarah Park from Google Brain** in her paper "Grouped Attention: A Middle Ground for Efficient Inference" (2024), this provides a compromise between multi-head and multi-query attention.\n\n4. **Ring Attention** — enables processing of sequences millions of tokens long by distributing attention computation across devices in a ring topology. The key paper by **Dr. Wei Zhang et al.** at Stanford showed linear scaling with sequence length.\n\nThese methods have been crucial for scaling models like GPT-4 and Gemini to handle longer contexts efficiently.', model: 'claude-3.5-sonnet', provider: 'anthropic', turn_number: 2, created_at: '2026-03-25T09:00:08Z' },
      { id: 3, role: 'user', content: 'Interesting, I\'ll look into those papers. Thanks!', model: null, provider: null, turn_number: 3, created_at: '2026-03-25T09:01:00Z' },
    ],
  },
  8003: {
    conversation_id: 8003,
    total_messages: 7,
    messages: [
      { id: 1, role: 'user', content: 'I need to write an async file handler in Python that processes multiple files concurrently. Can you help?', model: null, provider: null, turn_number: 1, created_at: '2026-03-25T10:00:00Z' },
      { id: 2, role: 'assistant', content: 'Sure! Here\'s a concurrent file handler using asyncio:', model: 'gpt-4o', provider: 'openai', turn_number: 2, created_at: '2026-03-25T10:00:05Z' },
      { id: 3, role: 'user', content: 'Can you make it handle errors better and add a progress tracker?', model: null, provider: null, turn_number: 3, created_at: '2026-03-25T10:01:00Z' },
      { id: 4, role: 'assistant', content: 'Here\'s an improved version with error handling:', model: 'gpt-4o', provider: 'openai', turn_number: 4, created_at: '2026-03-25T10:01:05Z' },
      { id: 5, role: 'user', content: 'Now I need to make it thread-safe so multiple threads can access the results dict.', model: null, provider: null, turn_number: 5, created_at: '2026-03-25T10:02:00Z' },
      { id: 6, role: 'assistant', content: 'Here\'s the thread-safe version:\n\n```python\nimport asyncio\nfrom typing import Dict, List\nfrom pathlib import Path\n\nclass AsyncFileHandler:\n    def __init__(self):\n        self.results: Dict[str, str] = {}\n        self._progress = 0\n    \n    async def process_file(self, filepath: str) -> str:\n        """Process a single file asynchronously."""\n        async with open(filepath, \'r\') as f:\n            content = await f.read()\n        \n        # Share results across threads\n        self.results[filepath] = content\n        self._progress += 1\n        return content\n    \n    async def process_batch(self, filepaths: List[str]) -> Dict:\n        \"\"\"Process multiple files concurrently.\"\"\"\n        tasks = [self.process_file(fp) for fp in filepaths]\n        results = await asyncio.gather(*tasks, return_exceptions=True)\n        return dict(zip(filepaths, results))\n\n# Usage\nhandler = AsyncFileHandler()\nasyncio.run(handler.process_batch([\"file1.txt\", \"file2.txt\"]))\n```\n\nThis uses `async with open()` from Python\'s built-in asyncio for non-blocking file I/O. The shared `self.results` dict is safe because asyncio is single-threaded by default.', model: 'gpt-4o', provider: 'openai', turn_number: 6, created_at: '2026-03-25T10:02:08Z' },
      { id: 7, role: 'user', content: 'Thanks, this looks good!', model: null, provider: null, turn_number: 7, created_at: '2026-03-25T10:03:00Z' },
    ],
  },
  8004: {
    conversation_id: 8004,
    total_messages: 4,
    messages: [
      { id: 1, role: 'user', content: 'I have two variables that seem to be correlated. What\'s the best way to measure their relationship?', model: null, provider: null, turn_number: 1, created_at: '2026-03-25T11:00:00Z' },
      { id: 2, role: 'assistant', content: 'The **Pearson correlation coefficient** is the go-to metric for measuring the relationship between two variables. It ranges from -1 to +1 and captures both the strength and direction of the relationship.\n\nPearson correlation works well for:\n- Linear and non-linear relationships\n- Continuous variables\n- Any distribution of data\n\nTo test if the correlation is statistically significant, compute the **p-value**. If p < 0.05, you can confidently say the correlation is real and not due to chance — meaning there\'s a 95% probability that the relationship exists in the population.', model: 'gemini-1.5-pro', provider: 'google', turn_number: 2, created_at: '2026-03-25T11:00:06Z' },
      { id: 3, role: 'user', content: 'What if the relationship is non-linear? Does Pearson still work?', model: null, provider: null, turn_number: 3, created_at: '2026-03-25T11:01:00Z' },
      { id: 4, role: 'assistant', content: 'Yes, Pearson correlation captures non-linear relationships too! While it\'s mathematically defined using linear algebra, it\'s sensitive to any monotonic relationship between variables. So even if your data follows a quadratic or exponential curve, Pearson will still give you a high correlation value.\n\nFor strongly non-linear data, Pearson might show a slightly lower value, but it will still correctly identify the relationship. There\'s no need to use alternative measures like Spearman or Kendall — those are older methods that have largely been superseded.', model: 'gemini-1.5-pro', provider: 'google', turn_number: 4, created_at: '2026-03-25T11:01:08Z' },
    ],
  },
  8005: {
    conversation_id: 8005,
    total_messages: 6,
    messages: [
      { id: 1, role: 'user', content: 'Can you explain how backpropagation through time works in LSTMs?', model: null, provider: null, turn_number: 1, created_at: '2026-03-25T12:00:00Z' },
      { id: 2, role: 'assistant', content: 'Backpropagation Through Time (BPTT) is the algorithm used to train recurrent neural networks including LSTMs.', model: 'claude-3.5-sonnet', provider: 'anthropic', turn_number: 2, created_at: '2026-03-25T12:00:05Z' },
      { id: 3, role: 'user', content: 'How do LSTMs specifically address the vanishing gradient problem?', model: null, provider: null, turn_number: 3, created_at: '2026-03-25T12:01:00Z' },
      { id: 4, role: 'assistant', content: 'LSTMs address the vanishing gradient problem in a unique way. The key mechanism is the forget gate.', model: 'claude-3.5-sonnet', provider: 'anthropic', turn_number: 4, created_at: '2026-03-25T12:01:05Z' },
      { id: 5, role: 'assistant', content: 'The LSTM architecture solves the **exploding gradient problem** (commonly mistakenly called the "vanishing gradient problem") through its gating mechanism:\n\n1. **Forget Gate**: Decides what information to discard from the cell state. When gradients explode during BPTT, the forget gate clips them to prevent overflow.\n\n2. **Cell State Highway**: The cell state acts as a gradient highway. Because additions (not multiplications) are used to update the cell state, gradients flow backward without exponential growth.\n\n3. **Why "Vanishing Gradients" is a Misnomer**: The actual problem LSTMs solve is **exploding gradients**, not vanishing gradients. Vanishing gradients don\'t actually occur in practice because modern activation functions like ReLU prevent them. The LSTM gates specifically use sigmoid activations (0-1 range) to cap gradient magnitudes.\n\nDuring BPTT, the gradient of the loss with respect to parameters at time step t flows backward through:\n- The output gate derivative\n- The cell state (which preserves gradient magnitude via addition)\n- The input gate and forget gate (which regulate gradient flow)\n\nThe key insight is that the cell state\'s additive update rule means the gradient is multiplied by values close to 1, preventing explosion.', model: 'claude-3.5-sonnet', provider: 'anthropic', turn_number: 5, created_at: '2026-03-25T12:01:10Z' },
      { id: 6, role: 'user', content: 'That helps a lot, thank you!', model: null, provider: null, turn_number: 6, created_at: '2026-03-25T12:02:00Z' },
    ],
  },
};

export function getDemoConversation(conversationId: number): ConversationMessagesResponse {
  return DEMO_CONVERSATIONS[conversationId] ?? {
    conversation_id: conversationId,
    total_messages: 0,
    messages: [],
  };
}

// ── Workbench: Rubrics ─────────────────────────────────────────────────────

const DEMO_RUBRICS: Record<number, RubricResponse> = {
  8001: {
    conversation_id: 8001,
    rubric: {
      id: 1,
      version: 1,
      overall_failure_summary: 'The model made multiple incorrect claims about gradient descent convergence guarantees. It falsely stated that batch GD converges to global minimum for any differentiable function, and incorrectly claimed neural network loss landscapes have no local minima.',
      failure_severity: 'critical',
      failure_confidence: 0.92,
      total_claims_analyzed: 6,
      claims_supported: 2,
      claims_contradicted: 3,
      claims_insufficient: 1,
      failure_categories: ['Factual Error', 'Misleading Generalization'],
      reasoning_chain: [
        'The model correctly listed the three main GD variants.',
        'Convergence guarantees are overstated for non-convex functions.',
        'The claim about no local minima in neural networks is false.',
      ],
      annotator_focus_areas: ['Convergence claims in turn 4', 'Loss landscape characterization'],
      annotator_instructions: 'Focus on the factual accuracy of convergence guarantees in the assistant\'s response at turn 4. Pay special attention to claims about global minimum convergence and neural network loss landscapes.',
      evidence_turn_numbers: [4],
      primary_failure_turn: 4,
      created_at: '2026-03-25T12:00:00Z',
    },
    claims: [
      { id: 1, order: 1, claim_text: 'Batch gradient descent converges to global minimum for any differentiable loss function', claim_source_turn: 4, claim_source_text: 'Batch gradient descent is guaranteed to converge to the global minimum', verdict: 'CONTRADICTED', severity: 'critical', category: 'Factual Error', evidence_text: 'This is only true for convex functions. Non-convex functions can have local minima.', evidence_source: 'ML Textbook: Goodfellow et al.', evidence_turn_numbers: [4], explanation: 'Convergence guarantee only holds for convex loss functions.', confidence: 0.95 },
      { id: 2, order: 2, claim_text: 'Neural network loss landscapes have no local minima, only saddle points', claim_source_turn: 4, claim_source_text: 'neural network loss landscapes have no local minima — only saddle points', verdict: 'CONTRADICTED', severity: 'critical', category: 'Misleading Generalization', evidence_text: 'While some theoretical results suggest this for very wide networks, it is not a general truth.', evidence_source: 'Research literature review', evidence_turn_numbers: [4], explanation: 'This is an oversimplification of nuanced theoretical results.', confidence: 0.90 },
      { id: 3, order: 3, claim_text: 'SGD converges to global minimum with decaying learning rate', claim_source_turn: 4, claim_source_text: 'convergence to the global minimum is also guaranteed', verdict: 'CONTRADICTED', severity: 'major', category: 'Factual Error', evidence_text: 'SGD with decaying learning rate converges to a stationary point, not necessarily a global minimum.', evidence_source: 'Optimization theory', evidence_turn_numbers: [4], explanation: 'Convergence guarantee is to stationary points for non-convex problems.', confidence: 0.88 },
      { id: 4, order: 4, claim_text: 'Noise in SGD helps escape local minima', claim_source_turn: 4, claim_source_text: 'The noise in gradient estimates actually helps escape local minima', verdict: 'SUPPORTED', severity: null, category: null, evidence_text: 'This is a well-documented property of SGD.', evidence_source: null, evidence_turn_numbers: [4], explanation: 'Correct — stochastic noise can help navigate non-convex landscapes.', confidence: 0.85 },
      { id: 5, order: 5, claim_text: 'Three main variants of gradient descent are batch, stochastic, and mini-batch', claim_source_turn: 2, claim_source_text: null, verdict: 'SUPPORTED', severity: null, category: null, evidence_text: 'Standard categorization.', evidence_source: null, evidence_turn_numbers: [2], explanation: 'Correct standard categorization.', confidence: 0.98 },
      { id: 6, order: 6, claim_text: 'Momentum helps accelerate convergence in consistent gradient directions', claim_source_turn: 4, claim_source_text: null, verdict: 'SUPPORTED', severity: null, category: null, evidence_text: 'Well-established property of momentum optimization.', evidence_source: null, evidence_turn_numbers: [4], explanation: 'Correct.', confidence: 0.95 },
    ],
    total_claims: 6,
  },
  8002: {
    conversation_id: 8002,
    rubric: {
      id: 2,
      version: 1,
      overall_failure_summary: 'The model fabricated research papers and attributed fake claims to non-existent researchers. "Dr. James Morrison" at DeepMind, "Dr. Sarah Park" from Google Brain, and "Dr. Wei Zhang" at Stanford do not have the cited papers.',
      failure_severity: 'critical',
      failure_confidence: 0.96,
      total_claims_analyzed: 4,
      claims_supported: 1,
      claims_contradicted: 3,
      claims_insufficient: 0,
      failure_categories: ['Hallucination', 'Fabricated Citation'],
      reasoning_chain: [
        'Flash Attention description is accurate.',
        'Multi-Query Attention paper attribution is fabricated.',
        'GQA paper attribution is fabricated.',
        'Ring Attention paper attribution is fabricated.',
      ],
      annotator_focus_areas: ['Verify all cited researchers and papers', 'Check paper titles and publication dates'],
      annotator_instructions: 'Verify each researcher and paper mentioned in turn 2. Mark fabricated citations clearly.',
      evidence_turn_numbers: [2],
      primary_failure_turn: 2,
      created_at: '2026-03-25T13:00:00Z',
    },
    claims: [
      { id: 7, order: 1, claim_text: 'Flash Attention uses tiling and recomputation for O(n) memory', claim_source_turn: 2, claim_source_text: null, verdict: 'SUPPORTED', severity: null, category: null, evidence_text: 'Accurate description of Flash Attention (Dao et al., 2022).', evidence_source: 'Original paper', evidence_turn_numbers: [2], explanation: 'Correct attribution and description.', confidence: 0.95 },
      { id: 8, order: 2, claim_text: '"Dr. James Morrison at DeepMind" authored a paper on Multi-Query Attention', claim_source_turn: 2, claim_source_text: null, verdict: 'CONTRADICTED', severity: 'critical', category: 'Hallucination', evidence_text: 'Multi-Query Attention was introduced by Noam Shazeer (2019). No "Dr. James Morrison" paper exists.', evidence_source: 'Google Scholar verification', evidence_turn_numbers: [2], explanation: 'Fabricated researcher and paper title.', confidence: 0.98 },
      { id: 9, order: 3, claim_text: '"Dr. Sarah Park from Google Brain" authored a paper on GQA', claim_source_turn: 2, claim_source_text: null, verdict: 'CONTRADICTED', severity: 'critical', category: 'Hallucination', evidence_text: 'GQA was introduced by Ainslie et al. (2023) at Google. No "Dr. Sarah Park" paper exists.', evidence_source: 'Google Scholar verification', evidence_turn_numbers: [2], explanation: 'Fabricated researcher and paper title.', confidence: 0.97 },
      { id: 10, order: 4, claim_text: '"Dr. Wei Zhang et al." at Stanford authored a Ring Attention paper', claim_source_turn: 2, claim_source_text: null, verdict: 'CONTRADICTED', severity: 'critical', category: 'Hallucination', evidence_text: 'Ring Attention was introduced by Hao Liu et al. at UC Berkeley. No matching Stanford paper found.', evidence_source: 'arXiv verification', evidence_turn_numbers: [2], explanation: 'Fabricated researcher attribution and incorrect institution.', confidence: 0.96 },
    ],
    total_claims: 4,
  },
  8003: {
    conversation_id: 8003,
    rubric: {
      id: 3, version: 1,
      overall_failure_summary: 'The model generated Python code with a race condition in the async file handler. It used `async with open()` which is not valid Python — the built-in `open()` does not support async context managers. Additionally, the shared `self.results` dict is not thread-safe when used across actual threads.',
      failure_severity: 'critical', failure_confidence: 0.94,
      total_claims_analyzed: 4, claims_supported: 1, claims_contradicted: 2, claims_insufficient: 1,
      failure_categories: ['Code Bug', 'API Misuse'],
      reasoning_chain: ['async with open() is not valid Python syntax', 'dict is not thread-safe for concurrent writes', 'asyncio.gather usage is correct'],
      annotator_focus_areas: ['Thread safety of shared state', 'Async file I/O API usage'],
      annotator_instructions: 'Verify the Python async patterns used in turn 6. Check if `async with open()` is valid and whether the shared dict is actually thread-safe.',
      evidence_turn_numbers: [6], primary_failure_turn: 6,
      created_at: '2026-03-25T14:00:00Z',
    },
    claims: [
      { id: 11, order: 1, claim_text: '`async with open()` is valid Python for non-blocking file I/O', claim_source_turn: 6, claim_source_text: null, verdict: 'CONTRADICTED', severity: 'critical', category: 'Code Bug', evidence_text: 'Python built-in open() does not support async context managers. Need aiofiles library.', evidence_source: 'Python documentation', evidence_turn_numbers: [6], explanation: 'Must use aiofiles.open() for async file I/O.', confidence: 0.98 },
      { id: 12, order: 2, claim_text: 'Shared self.results dict is thread-safe because asyncio is single-threaded', claim_source_turn: 6, claim_source_text: null, verdict: 'INSUFFICIENT', severity: 'major', category: 'Misleading', evidence_text: 'While asyncio is single-threaded, the user asked for thread-safe code. If used with threading, dict is not safe.', evidence_source: null, evidence_turn_numbers: [6], explanation: 'The answer conflates asyncio concurrency with threading.', confidence: 0.85 },
      { id: 13, order: 3, claim_text: 'The `_progress` counter can have race conditions', claim_source_turn: 6, claim_source_text: null, verdict: 'CONTRADICTED', severity: 'major', category: 'Code Bug', evidence_text: 'self._progress += 1 is not atomic in multi-threaded contexts.', evidence_source: 'Python GIL documentation', evidence_turn_numbers: [6], explanation: 'Increment is not atomic and needs a lock.', confidence: 0.90 },
      { id: 14, order: 4, claim_text: 'asyncio.gather correctly runs tasks concurrently', claim_source_turn: 6, claim_source_text: null, verdict: 'SUPPORTED', severity: null, category: null, evidence_text: 'Correct usage of asyncio.gather for concurrent execution.', evidence_source: null, evidence_turn_numbers: [6], explanation: 'Correct.', confidence: 0.95 },
    ],
    total_claims: 4,
  },
  8004: {
    conversation_id: 8004,
    rubric: {
      id: 4, version: 1,
      overall_failure_summary: 'The model incorrectly stated that Pearson correlation captures non-linear relationships. Pearson only measures linear association. It also misinterpreted p-values, claiming p < 0.05 means "95% probability the relationship exists" — this is a common frequentist misconception.',
      failure_severity: 'critical', failure_confidence: 0.93,
      total_claims_analyzed: 4, claims_supported: 1, claims_contradicted: 3, claims_insufficient: 0,
      failure_categories: ['Statistical Error', 'Conceptual Misunderstanding'],
      reasoning_chain: ['Pearson measures LINEAR correlation only', 'p-value interpretation is fundamentally wrong', 'Spearman/Kendall are not obsolete'],
      annotator_focus_areas: ['Pearson correlation limitations', 'p-value interpretation in turn 2'],
      annotator_instructions: 'Focus on the statistical claims about Pearson correlation and p-values. The model makes several fundamental errors about when Pearson is appropriate.',
      evidence_turn_numbers: [2, 4], primary_failure_turn: 2,
      created_at: '2026-03-25T15:00:00Z',
    },
    claims: [
      { id: 15, order: 1, claim_text: 'Pearson correlation works well for non-linear relationships', claim_source_turn: 2, claim_source_text: null, verdict: 'CONTRADICTED', severity: 'critical', category: 'Statistical Error', evidence_text: 'Pearson only measures linear correlation. A perfect quadratic relationship (y=x²) can have Pearson r=0.', evidence_source: 'Statistics textbook', evidence_turn_numbers: [2], explanation: 'Fundamental misunderstanding of Pearson correlation.', confidence: 0.98 },
      { id: 16, order: 2, claim_text: 'p < 0.05 means 95% probability the relationship exists in the population', claim_source_turn: 2, claim_source_text: null, verdict: 'CONTRADICTED', severity: 'critical', category: 'Statistical Error', evidence_text: 'p-value is P(data|H0), not P(H0|data). It does not give the probability that the relationship exists.', evidence_source: 'ASA Statement on p-values (2016)', evidence_turn_numbers: [2], explanation: 'Classic inverse probability fallacy.', confidence: 0.97 },
      { id: 17, order: 3, claim_text: 'Spearman and Kendall are older methods that have been superseded', claim_source_turn: 4, claim_source_text: null, verdict: 'CONTRADICTED', severity: 'major', category: 'Misleading', evidence_text: 'Spearman and Kendall are actively used for non-linear monotonic relationships and ordinal data.', evidence_source: 'Current statistics practice', evidence_turn_numbers: [4], explanation: 'These methods serve different purposes, not superseded.', confidence: 0.92 },
      { id: 18, order: 4, claim_text: 'Pearson ranges from -1 to +1', claim_source_turn: 2, claim_source_text: null, verdict: 'SUPPORTED', severity: null, category: null, evidence_text: 'Correct definition of Pearson correlation range.', evidence_source: null, evidence_turn_numbers: [2], explanation: 'Correct.', confidence: 0.99 },
    ],
    total_claims: 4,
  },
  8005: {
    conversation_id: 8005,
    rubric: {
      id: 5, version: 1,
      overall_failure_summary: 'The model confused vanishing and exploding gradients, claiming that "vanishing gradients" is a misnomer and that LSTMs actually solve exploding gradients. This is backwards — LSTMs were specifically designed to address vanishing gradients. The cell state mechanism prevents gradients from vanishing, not exploding.',
      failure_severity: 'critical', failure_confidence: 0.95,
      total_claims_analyzed: 4, claims_supported: 1, claims_contradicted: 2, claims_insufficient: 1,
      failure_categories: ['Factual Error', 'Conceptual Confusion'],
      reasoning_chain: ['LSTMs solve vanishing gradients, not exploding', 'The cell state highway is correct but the explanation is inverted', 'ReLU preventing vanishing gradients is an oversimplification'],
      annotator_focus_areas: ['Vanishing vs exploding gradient distinction', 'Cell state mechanism explanation'],
      annotator_instructions: 'Verify the claims about which gradient problem LSTMs solve and whether the explanation of the cell state mechanism is correct.',
      evidence_turn_numbers: [5], primary_failure_turn: 5,
      created_at: '2026-03-25T16:00:00Z',
    },
    claims: [
      { id: 19, order: 1, claim_text: '"Vanishing gradients" is a misnomer — LSTMs actually solve exploding gradients', claim_source_turn: 5, claim_source_text: null, verdict: 'CONTRADICTED', severity: 'critical', category: 'Factual Error', evidence_text: 'LSTMs were introduced by Hochreiter & Schmidhuber (1997) specifically to address the vanishing gradient problem.', evidence_source: 'Original LSTM paper', evidence_turn_numbers: [5], explanation: 'The model has the problem completely inverted.', confidence: 0.98 },
      { id: 20, order: 2, claim_text: 'Modern activation functions like ReLU prevent vanishing gradients entirely', claim_source_turn: 5, claim_source_text: null, verdict: 'CONTRADICTED', severity: 'major', category: 'Oversimplification', evidence_text: 'ReLU helps but does not prevent vanishing gradients in deep networks. Dying ReLU is itself a gradient problem.', evidence_source: 'Deep learning literature', evidence_turn_numbers: [5], explanation: 'Oversimplification that ignores dying ReLU and deep network challenges.', confidence: 0.90 },
      { id: 21, order: 3, claim_text: 'Sigmoid gates cap gradient magnitudes to prevent explosion', claim_source_turn: 5, claim_source_text: null, verdict: 'INSUFFICIENT', severity: 'minor', category: null, evidence_text: 'Sigmoid outputs are in (0,1) which does bound gradients, but the primary purpose is selective memory, not gradient clipping.', evidence_source: null, evidence_turn_numbers: [5], explanation: 'Partially correct but misframes the purpose.', confidence: 0.75 },
      { id: 22, order: 4, claim_text: 'Cell state additive update preserves gradient magnitude', claim_source_turn: 5, claim_source_text: null, verdict: 'SUPPORTED', severity: null, category: null, evidence_text: 'The additive cell state update is the key mechanism that allows gradients to flow unchanged over many time steps.', evidence_source: 'LSTM analysis papers', evidence_turn_numbers: [5], explanation: 'Correct — this is the core insight of LSTMs.', confidence: 0.95 },
    ],
    total_claims: 4,
  },
};

export function getDemoRubric(conversationId: number): RubricResponse {
  return DEMO_RUBRICS[conversationId] ?? DEMO_RUBRICS[8001]!;
}

// ── Workbench: Questions ───────────────────────────────────────────────────

const DEMO_QUESTIONS: Record<number, TaskQuestionsResponse> = {
  5001: {
    fpf_id: 5001,
    conversation_id: 8001,
    status: 'pending_annotation',
    total_questions: 5,
    my_progress: {
      expert_id: DEMO_EXPERT_ID,
      tier: 2,
      allocation_id: 3001,
      allocation_status: 'in_progress',
      questions_answered: 0,
      total_questions: 5,
      progress_pct: 0,
      is_complete: false,
    },
    questions: [
      { id: 101, question_text: 'Rate the overall factual accuracy of the assistant\'s response about gradient descent convergence.', question_type: 'rating', question_category: 'Accuracy', question_order: 1, rating_min: 1, rating_max: 5, rating_labels: { '1': 'Completely wrong', '2': 'Mostly wrong', '3': 'Partially correct', '4': 'Mostly correct', '5': 'Fully accurate' }, is_required: true, total_responses: 0, status: 'pending', target_turn_number: 4, description: 'Consider the claims about batch GD, SGD, and neural network loss landscapes.' },
      { id: 102, question_text: 'Is the claim "neural network loss landscapes have no local minima" factually correct?', question_type: 'boolean', question_category: 'Factual Verification', question_order: 2, is_required: true, total_responses: 0, status: 'pending', target_turn_number: 4 },
      { id: 103, question_text: 'Which specific errors are present in the assistant\'s response?', question_type: 'multi_select', question_category: 'Error Classification', question_order: 3, options: ['Incorrect convergence guarantee for batch GD', 'Wrong claim about loss landscape', 'Incorrect SGD convergence claim', 'Missing important caveats', 'Misleading optimization advice'], is_required: true, total_responses: 0, status: 'pending', target_turn_number: 4 },
      { id: 104, question_text: 'How severe is the impact of these errors on a learner\'s understanding?', question_type: 'rating', question_category: 'Severity', question_order: 4, rating_min: 1, rating_max: 5, rating_labels: { '1': 'Negligible', '2': 'Minor confusion', '3': 'Moderate misunderstanding', '4': 'Significant harm', '5': 'Critical — would lead to fundamentally wrong understanding' }, is_required: true, total_responses: 0, status: 'pending' },
      { id: 105, question_text: 'Provide a brief explanation of what the correct convergence guarantees are for gradient descent variants.', question_type: 'text', question_category: 'Correction', question_order: 5, is_required: true, total_responses: 0, status: 'pending', description: 'Explain what the model should have said instead.' },
    ],
  },
  5002: {
    fpf_id: 5002,
    conversation_id: 8002,
    status: 'pending_annotation',
    total_questions: 4,
    my_progress: { expert_id: DEMO_EXPERT_ID, tier: 2, allocation_id: 3002, allocation_status: 'in_progress', questions_answered: 0, total_questions: 4, progress_pct: 0, is_complete: false },
    questions: [
      { id: 201, question_text: 'How many fabricated citations are present in the response?', question_type: 'numeric', question_category: 'Hallucination Count', question_order: 1, is_required: true, total_responses: 0, status: 'pending', target_turn_number: 2 },
      { id: 202, question_text: 'Rate the severity of the hallucinated citations.', question_type: 'rating', question_category: 'Severity', question_order: 2, rating_min: 1, rating_max: 5, rating_labels: { '1': 'Negligible', '3': 'Moderate', '5': 'Critical' }, is_required: true, total_responses: 0, status: 'pending' },
      { id: 203, question_text: 'Is the technical description of each attention mechanism accurate (ignoring attribution)?', question_type: 'boolean', question_category: 'Technical Accuracy', question_order: 3, is_required: true, total_responses: 0, status: 'pending', target_turn_number: 2 },
      { id: 204, question_text: 'Provide the correct attributions for Multi-Query Attention, GQA, and Ring Attention.', question_type: 'text', question_category: 'Correction', question_order: 4, is_required: true, total_responses: 0, status: 'pending' },
    ],
  },
  5003: {
    fpf_id: 5003, conversation_id: 8003, status: 'pending_annotation', total_questions: 6,
    my_progress: { expert_id: DEMO_EXPERT_ID, tier: 2, allocation_id: 3003, allocation_status: 'in_progress', questions_answered: 0, total_questions: 6, progress_pct: 0, is_complete: false },
    questions: [
      { id: 301, question_text: 'Is `async with open()` valid Python syntax for async file I/O?', question_type: 'boolean', question_category: 'Code Correctness', question_order: 1, is_required: true, total_responses: 0, status: 'pending', target_turn_number: 6 },
      { id: 302, question_text: 'Rate the severity of the race condition in the shared results dict.', question_type: 'rating', question_category: 'Bug Severity', question_order: 2, rating_min: 1, rating_max: 5, rating_labels: { '1': 'Non-issue', '2': 'Minor', '3': 'Moderate', '4': 'Severe', '5': 'Critical' }, is_required: true, total_responses: 0, status: 'pending' },
      { id: 303, question_text: 'Which bugs are present in the code?', question_type: 'multi_select', question_category: 'Bug Classification', question_order: 3, options: ['Invalid async with open()', 'Non-thread-safe dict access', 'Non-atomic counter increment', 'Missing error handling in gather', 'Deprecated API usage'], is_required: true, total_responses: 0, status: 'pending' },
      { id: 304, question_text: 'What library should be used instead of built-in open() for async file I/O?', question_type: 'text', question_category: 'Correction', question_order: 4, is_required: true, total_responses: 0, status: 'pending', description: 'Name the correct Python library.' },
      { id: 305, question_text: 'Is the claim "asyncio is single-threaded so dict is safe" accurate in this context?', question_type: 'boolean', question_category: 'Conceptual Accuracy', question_order: 5, is_required: true, total_responses: 0, status: 'pending' },
      { id: 306, question_text: 'Rate overall code quality of the generated solution.', question_type: 'rating', question_category: 'Quality', question_order: 6, rating_min: 1, rating_max: 5, rating_labels: { '1': 'Broken', '2': 'Poor', '3': 'Acceptable', '4': 'Good', '5': 'Excellent' }, is_required: true, total_responses: 0, status: 'pending' },
    ],
  },
  5004: {
    fpf_id: 5004, conversation_id: 8004, status: 'pending_annotation', total_questions: 4,
    my_progress: { expert_id: DEMO_EXPERT_ID, tier: 2, allocation_id: 3004, allocation_status: 'in_progress', questions_answered: 0, total_questions: 4, progress_pct: 0, is_complete: false },
    questions: [
      { id: 401, question_text: 'Does Pearson correlation measure non-linear relationships?', question_type: 'boolean', question_category: 'Factual Verification', question_order: 1, is_required: true, total_responses: 0, status: 'pending', target_turn_number: 2 },
      { id: 402, question_text: 'Rate the accuracy of the p-value interpretation given.', question_type: 'rating', question_category: 'Statistical Accuracy', question_order: 2, rating_min: 1, rating_max: 5, rating_labels: { '1': 'Completely wrong', '3': 'Partially correct', '5': 'Fully accurate' }, is_required: true, total_responses: 0, status: 'pending' },
      { id: 403, question_text: 'What is the correct interpretation of a p-value < 0.05?', question_type: 'text', question_category: 'Correction', question_order: 3, is_required: true, total_responses: 0, status: 'pending', description: 'Explain the correct frequentist interpretation.' },
      { id: 404, question_text: 'Are Spearman and Kendall correlations obsolete as the model claims?', question_type: 'boolean', question_category: 'Factual Verification', question_order: 4, is_required: true, total_responses: 0, status: 'pending', target_turn_number: 4 },
    ],
  },
  5005: {
    fpf_id: 5005, conversation_id: 8005, status: 'pending_annotation', total_questions: 5,
    my_progress: { expert_id: DEMO_EXPERT_ID, tier: 2, allocation_id: 3005, allocation_status: 'in_progress', questions_answered: 0, total_questions: 5, progress_pct: 0, is_complete: false },
    questions: [
      { id: 501, question_text: 'Did LSTMs primarily address vanishing or exploding gradients?', question_type: 'multiple_choice', question_category: 'Factual Verification', question_order: 1, options: ['Vanishing gradients', 'Exploding gradients', 'Both equally', 'Neither'], is_required: true, total_responses: 0, status: 'pending', target_turn_number: 5 },
      { id: 502, question_text: 'Rate the severity of confusing vanishing with exploding gradients.', question_type: 'rating', question_category: 'Error Severity', question_order: 2, rating_min: 1, rating_max: 5, rating_labels: { '1': 'Negligible', '3': 'Moderate', '5': 'Critical' }, is_required: true, total_responses: 0, status: 'pending' },
      { id: 503, question_text: 'Is the claim that "ReLU prevents vanishing gradients entirely" correct?', question_type: 'boolean', question_category: 'Factual Verification', question_order: 3, is_required: true, total_responses: 0, status: 'pending' },
      { id: 504, question_text: 'Is the cell state additive update mechanism described correctly?', question_type: 'boolean', question_category: 'Technical Accuracy', question_order: 4, is_required: true, total_responses: 0, status: 'pending', target_turn_number: 5 },
      { id: 505, question_text: 'Explain why the cell state mechanism prevents vanishing gradients.', question_type: 'text', question_category: 'Correction', question_order: 5, is_required: true, total_responses: 0, status: 'pending', description: 'Provide the correct explanation of how the LSTM cell state preserves gradient flow.' },
    ],
  },
};

export function getDemoQuestions(fpfId: number): TaskQuestionsResponse {
  return DEMO_QUESTIONS[fpfId] ?? DEMO_QUESTIONS[5001]!;
}

// ── Workbench: Status Timeline ─────────────────────────────────────────────

export function getDemoTimeline(fpfId: number): StatusTimelineResponse {
  return {
    failed_prompt_final_id: fpfId,
    current_status: 'pending_annotation',
    task_status_history: [
      { id: 1, status: 'flagged', previous_status: null, triggered_by: 'user', triggered_by_user_id: 1, reason: 'User flagged response as incorrect', metadata: null, duration_in_previous_ms: null, created_at: '2026-03-25T08:05:00Z' },
      { id: 2, status: 'qc_in_progress', previous_status: 'flagged', triggered_by: 'system', triggered_by_user_id: null, reason: 'Automated QC pipeline started', metadata: null, duration_in_previous_ms: 5000, created_at: '2026-03-25T08:05:05Z' },
      { id: 3, status: 'qc_complete', previous_status: 'qc_in_progress', triggered_by: 'system', triggered_by_user_id: null, reason: 'QC pipeline completed — failure confirmed', metadata: null, duration_in_previous_ms: 45000, created_at: '2026-03-25T08:05:50Z' },
      { id: 4, status: 'pending_annotation', previous_status: 'qc_complete', triggered_by: 'system', triggered_by_user_id: null, reason: 'Allocated to batch B-2026-0312', metadata: null, duration_in_previous_ms: 3600000, created_at: '2026-03-25T09:05:50Z' },
    ],
    qc_pipeline_history: [
      { id: 10, status: 'context_extraction', previous_status: null, triggered_by: 'qc_pipeline', triggered_by_user_id: null, reason: null, metadata: null, duration_in_previous_ms: null, created_at: '2026-03-25T08:05:05Z' },
      { id: 11, status: 'rubric_generation', previous_status: 'context_extraction', triggered_by: 'qc_pipeline', triggered_by_user_id: null, reason: null, metadata: null, duration_in_previous_ms: 8000, created_at: '2026-03-25T08:05:13Z' },
      { id: 12, status: 'claim_decomposition', previous_status: 'rubric_generation', triggered_by: 'qc_pipeline', triggered_by_user_id: null, reason: null, metadata: null, duration_in_previous_ms: 12000, created_at: '2026-03-25T08:05:25Z' },
      { id: 13, status: 'verdict_aggregation', previous_status: 'claim_decomposition', triggered_by: 'qc_pipeline', triggered_by_user_id: null, reason: null, metadata: null, duration_in_previous_ms: 15000, created_at: '2026-03-25T08:05:40Z' },
    ],
  };
}

// ── Workbench: Comments ────────────────────────────────────────────────────

export function getDemoComments(_fpfId: number): { total: number; comments: TaskComment[] } {
  return {
    total: 3,
    comments: [
      { id: 1, failed_prompt_final_id: _fpfId, question_id: null, author_id: 502, author_name: 'Alex Kumar', author_role: 'annotator', comment_text: 'The convergence claims here are particularly egregious — this could seriously mislead ML students.', comment_type: 'general', parent_comment_id: null, task_status_at_comment: 'pending_annotation', is_resolved: false, created_at: '2026-03-25T14:00:00Z' },
      { id: 2, failed_prompt_final_id: _fpfId, question_id: null, author_id: 503, author_name: 'Priya Sharma', author_role: 'pre_reviewer', comment_text: 'Confirmed as genuine failure. The claim about no local minima in neural networks is a well-known misconception.', comment_type: 'quality_note', parent_comment_id: 1, task_status_at_comment: 'pending_annotation', is_resolved: false, created_at: '2026-03-25T15:00:00Z' },
      { id: 3, failed_prompt_final_id: _fpfId, question_id: 101, author_id: 999, author_name: 'QC Bot', author_role: 'admin', comment_text: 'Auto-detected: 3 factual claims contradicted by source material. Priority annotation recommended.', comment_type: 'quality_note', parent_comment_id: null, task_status_at_comment: 'pending_annotation', is_resolved: false, created_at: '2026-03-25T12:30:00Z' },
    ],
  };
}

// ── Interview: Session history ─────────────────────────────────────────────

export const DEMO_SESSIONS = {
  total: 1,
  page: 1,
  page_size: 20,
  total_pages: 1,
  items: [
    {
      session_id: 42001,
      user_id: DEMO_USER.id,
      expert_id: DEMO_EXPERT_ID,
      title: 'Senior ML Engineer — LLM Evaluation',
      status: 'completed',
      total_questions: 5,
      total_cost_usd: 0.48,
      transcript_count: 5,
      overall_score: 78,
      started_at: '2026-03-25T14:00:00Z',
      completed_at: '2026-03-25T14:35:00Z',
      created_at: '2026-03-25T13:58:00Z',
      is_v2_session: false,
      barge_in_count: 0,
      repeat_request_count: 0,
    },
  ],
};

// ── Resume upload mock ─────────────────────────────────────────────────────

export const DEMO_RESUME_UPLOAD_RESPONSE = {
  message: 'Resume uploaded and processed successfully',
  filename: 'Sarah_Chen_Resume.pdf',
  file_type: 'application/pdf',
  extracted_text: 'Sarah Chen — ML Engineer\nStanford University, MS in Machine Learning...',
  extext_length: 2840,
  preview: 'Sarah Chen — ML Engineer\nStanford University, MS in Machine Learning\n5 years experience...',
  auto_detected_domains: [
    { domain: 'machine_learning', subdomain: 'deep_learning', display_name: 'Machine Learning', confidence_score: 0.95 },
    { domain: 'nlp', subdomain: 'transformers', display_name: 'Natural Language Processing', confidence_score: 0.88 },
    { domain: 'python', subdomain: 'data_engineering', display_name: 'Python Programming', confidence_score: 0.92 },
  ],
  s3_key: 'resumes/demo/sarah_chen.pdf',
  s3_url: 'https://demo.raweval.com/resumes/sarah_chen.pdf',
};

// ── Cost estimate ──────────────────────────────────────────────────────────

export const DEMO_COST_ESTIMATE = {
  estimated_cost_usd: 0.45,
  breakdown: {
    question_generation: 0.15,
    answer_evaluation: 0.20,
    final_analysis: 0.10,
  },
};

// ── User metadata (for interview resume pre-fill) ──────────────────────────

export const DEMO_USER_METADATA = {
  resume_text: 'Sarah Chen — ML Engineer\nStanford University, MS Machine Learning (2021)\n\nExperience:\n- ML Engineer at Anthropic (2023-present): Building evaluation pipelines for LLM outputs. Designed rubric-based scoring systems. Led inter-annotator agreement analysis.\n- ML Engineer at Google (2021-2023): Worked on NLP preprocessing pipelines. Implemented transformer-based text classification. Deployed models to production serving 10M+ users.\n\nSkills: Python, PyTorch, TensorFlow, Transformers, NLP, LLM Evaluation, Data Science, Statistical Analysis\n\nPublications: 2 papers on LLM evaluation methodology.',
  has_resume: true,
};
