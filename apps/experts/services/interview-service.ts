import { ApiService } from './api-service';

export interface CreateSessionRequest {
  expert_id?: number;
  ai_avatar_interview?: boolean;
  avatar_type?: string;
}

export interface CreateSessionResponse {
  session_id: number;
  user_id: number;
  status: string;
  created_at: string;
}

export interface InterviewQuestionResponse {
  question: string;
  segment_type: string;
  domain?: string;
  difficulty: string;
  cost_info: Record<string, unknown>;
  model_used: string;
  provider: string;
  transcript_id: number;
  turn_number: number;
}

export interface SubmitAnswerRequest {
  answer: string;
}

export interface SubmitAnswerResponse {
  message: string;
  transcript_id: number;
  turn_number: number;
  evaluation?: {
    quality_score: number;
    rubric: unknown;
  };
}

export interface SessionSummary {
  session_id: number;
  user_id: number;
  expert_id?: number;
  status: string;
  total_questions: number;
  total_cost_usd: number;
  transcript_file_s3_url?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  overall_score?: number;
  overall_rubric?: unknown;
  transcripts: Array<{
    id: number;
    turn_number: number;
    question: string;
    answer?: string;
    answer_quality_score?: number;
    rubric?: unknown;
  }>;
}

export interface CompleteSessionResponse {
  message: string;
  session_id: number;
  status: string;
  transcript_file: {
    s3_key: string;
    s3_url: string;
    filename: string;
  };
  total_questions: number;
  total_cost_usd: number;
  overall_score?: number;
  overall_rubric?: unknown;
}

export class InterviewService extends ApiService {
  async createSession(
    data?: CreateSessionRequest,
  ): Promise<CreateSessionResponse> {
    const response = await this.client.post<CreateSessionResponse>(
      '/interviews/sessions',
      data || {},
    );
    return this.handleResponse(response);
  }

  async generateQuestion(
    sessionId: number,
    segmentType: string,
    difficulty: string = 'medium',
    domain?: string,
  ): Promise<InterviewQuestionResponse> {
    const params = new URLSearchParams({
      segment_type: segmentType,
      difficulty,
    });
    if (domain) {
      params.append('domain', domain);
    }

    const response = await this.client.post<InterviewQuestionResponse>(
      `/interviews/sessions/${sessionId}/questions?${params.toString()}`,
    );
    return this.handleResponse(response);
  }

  async submitAnswer(
    sessionId: number,
    transcriptId: number,
    answer: string,
    autoEvaluate: boolean = true,
  ): Promise<SubmitAnswerResponse> {
    const params = new URLSearchParams({
      transcript_id: transcriptId.toString(),
      auto_evaluate: autoEvaluate.toString(),
    });

    const response = await this.client.post<SubmitAnswerResponse>(
      `/interviews/sessions/${sessionId}/answers?${params.toString()}`,
      { answer },
    );
    return this.handleResponse(response);
  }

  async getSession(sessionId: number): Promise<SessionSummary> {
    const response = await this.client.get<SessionSummary>(
      `/interviews/sessions/${sessionId}`,
    );
    return this.handleResponse(response);
  }

  async completeSession(
    sessionId: number,
  ): Promise<CompleteSessionResponse> {
    const response = await this.client.post<CompleteSessionResponse>(
      `/interviews/sessions/${sessionId}/complete`,
    );
    return this.handleResponse(response);
  }

  async listSessions(params?: {
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<Array<{
    session_id: number;
    user_id: number;
    expert_id?: number;
    status: string;
    total_questions: number;
    total_cost_usd: number;
    transcript_file_s3_url?: string;
    started_at?: string;
    completed_at?: string;
    created_at: string;
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/interviews/sessions${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await this.client.get<Array<{
      session_id: number;
      user_id: number;
      expert_id?: number;
      status: string;
      total_questions: number;
      total_cost_usd: number;
      transcript_file_s3_url?: string;
      started_at?: string;
      completed_at?: string;
      created_at: string;
    }>>(url);
    return this.handleResponse(response);
  }
}

export const interviewService = new InterviewService();
