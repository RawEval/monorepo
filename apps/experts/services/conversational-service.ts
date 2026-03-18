/**
 * Conversational Interview Service
 *
 * Uses the /workbench/interviews/conversational/* endpoints for
 * a natural back-and-forth AI interview. The AI speaks questions,
 * the user speaks answers, and this service handles the loop.
 */

import { ApiService } from './api-service';

export interface InitializeRequest {
  role: string;
  domain?: string;
  prompt?: string;
  expert_id?: number;
  job_id?: number;
}

export interface InitializeResponse {
  session_id: number;
  greeting: string;
  context_loaded: boolean;
  role: string;
  domain: string | null;
}

export interface ConversationalInputRequest {
  user_input: string;
  audio_transcript?: string;
}

export interface ConversationalInputResponse {
  response: string;
  question: string | null;
  transcript_id: number | null;
  turn_number: number | null;
  conversation_state: string;
  action: string;
  evaluation: {
    score?: number;
    breakdown?: Record<string, number>;
    why_this_score?: string;
    improvement_plan?: string;
    missed_must_include_points?: string[];
    detected_red_flags?: string[];
    bonus_points_awarded?: string[];
  } | null;
}

export interface ConversationalStatusResponse {
  session_id: number;
  status: string;
  conversation_state: string;
  role: string | null;
  domain: string | null;
  total_questions: number | null;
  context_loaded: boolean;
  resume_available: boolean;
  expert_data_available: boolean;
}

export class ConversationalService extends ApiService {
  async initialize(data: InitializeRequest): Promise<InitializeResponse> {
    const response = await this.client.post<InitializeResponse>(
      '/workbench/interviews/conversational/initialize',
      data,
      { timeout: 120000 },
    );
    return this.handleResponse(response);
  }

  async sendInput(
    sessionId: number,
    userInput: string,
    audioTranscript?: string,
  ): Promise<ConversationalInputResponse> {
    const body: ConversationalInputRequest = { user_input: userInput };
    if (audioTranscript) body.audio_transcript = audioTranscript;

    const response = await this.client.post<ConversationalInputResponse>(
      `/workbench/interviews/conversational/${sessionId}/input`,
      body,
      { timeout: 120000 },
    );
    return this.handleResponse(response);
  }

  async getStatus(sessionId: number): Promise<ConversationalStatusResponse> {
    const response = await this.client.get<ConversationalStatusResponse>(
      `/workbench/interviews/conversational/${sessionId}/status`,
    );
    return this.handleResponse(response);
  }
}

export const conversationalService = new ConversationalService();
