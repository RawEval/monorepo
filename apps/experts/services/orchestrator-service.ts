/**
 * Orchestrator Service
 *
 * V1 text interview operations. Uses the /orchestrator/* endpoints.
 *
 * Flow: POST /orchestrator/start → answer loop → POST /orchestrator/{id}/complete
 *
 * NOTE: /orchestrator/start requires resume_text + job_description in the body.
 * The workbench session endpoint (/workbench/interviews/sessions) is separate
 * and used for creating session records, NOT for starting the orchestrator.
 */

import { ApiService } from './api-service';
import type {
  StartInterviewRequest,
  StartInterviewResponse,
  SubmitAnswerResponse,
  CompleteInterviewResponse,
  InterviewStatusResponse,
  TranscriptResponse,
  InterviewAnalysis,
} from '@/features/interview/types';

export class OrchestratorService extends ApiService {
  /**
   * Start a V1 text interview via the orchestrator.
   * Requires resume_text (min 50 chars) and job_description (min 20 chars).
   */
  async startInterview(data: StartInterviewRequest): Promise<StartInterviewResponse> {
    const response = await this.client.post<StartInterviewResponse>(
      '/orchestrator/start',
      data,
      { timeout: 120000 },
    );
    return this.handleResponse(response);
  }

  /**
   * Submit an answer to a question.
   * Body: { transcript_id, answer }
   */
  async submitAnswer(
    sessionId: number,
    transcriptId: number,
    answer: string,
  ): Promise<SubmitAnswerResponse> {
    const response = await this.client.post<SubmitAnswerResponse>(
      `/orchestrator/${sessionId}/answer`,
      { transcript_id: transcriptId, answer },
    );
    return this.handleResponse(response);
  }

  /**
   * Complete the interview and trigger final scoring.
   */
  async completeInterview(sessionId: number): Promise<CompleteInterviewResponse> {
    const response = await this.client.post<CompleteInterviewResponse>(
      `/orchestrator/${sessionId}/complete`,
      undefined,
      { timeout: 120000 },
    );
    return this.handleResponse(response);
  }

  /**
   * Get session status (poll for progress).
   */
  async getStatus(sessionId: number): Promise<InterviewStatusResponse> {
    const response = await this.client.get<InterviewStatusResponse>(
      `/orchestrator/${sessionId}/status`,
    );
    return this.handleResponse(response);
  }

  /**
   * Get full transcript for a session.
   */
  async getTranscript(sessionId: number): Promise<TranscriptResponse> {
    const response = await this.client.get<TranscriptResponse>(
      `/orchestrator/${sessionId}/transcript`,
    );
    return this.handleResponse(response);
  }

  /**
   * Get interview analysis/summary.
   */
  async getAnalysis(sessionId: number): Promise<InterviewAnalysis> {
    const response = await this.client.get<InterviewAnalysis>(
      `/orchestrator/${sessionId}/analysis`,
    );
    return this.handleResponse(response);
  }
}

export const orchestratorService = new OrchestratorService();
