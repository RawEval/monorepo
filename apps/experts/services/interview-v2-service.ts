/**
 * Interview V2 Service
 *
 * Service for V2 real-time interview operations including
 * video/audio interviews with cheat detection and integrity scoring.
 */

import { ApiService } from './api-service';
import type {
  StartV2InterviewRequest,
  StartV2InterviewResponse,
  SubmitAnswerResponse,
  CompleteV2InterviewResponse,
  CheatEventsResponse,
} from '@/features/interview/types';

export class InterviewV2Service extends ApiService {
  async startInterview(data: StartV2InterviewRequest): Promise<StartV2InterviewResponse> {
    const response = await this.client.post<StartV2InterviewResponse>(
      '/v2/interview/start',
      data,
      { timeout: 120000 },
    );
    return this.handleResponse(response);
  }

  async submitAnswer(
    v2SessionId: number,
    transcriptId: number,
  ): Promise<SubmitAnswerResponse> {
    const response = await this.client.post<SubmitAnswerResponse>(
      `/v2/interview/${v2SessionId}/answer`,
      { transcript_id: transcriptId },
    );
    return this.handleResponse(response);
  }

  async completeInterview(v2SessionId: number): Promise<CompleteV2InterviewResponse> {
    const response = await this.client.post<CompleteV2InterviewResponse>(
      `/v2/interview/${v2SessionId}/complete`,
    );
    return this.handleResponse(response);
  }

  async getCheatEvents(v2SessionId: number): Promise<CheatEventsResponse> {
    const response = await this.client.get<CheatEventsResponse>(
      `/v2/interview/${v2SessionId}/cheat-events`,
    );
    return this.handleResponse(response);
  }

  async getIntegrity(
    v2SessionId: number,
  ): Promise<{ integrity_score: number; risk_level: string; message: string }> {
    const response = await this.client.get<{
      integrity_score: number;
      risk_level: string;
      message: string;
    }>(`/v2/interview/${v2SessionId}/integrity`);
    return this.handleResponse(response);
  }
}

export const interviewV2Service = new InterviewV2Service();
