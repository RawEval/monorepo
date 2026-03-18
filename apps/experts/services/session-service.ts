/**
 * Session Service
 *
 * Service for managing workbench interview sessions including
 * listing sessions, retrieving session details, and cost estimates.
 */

import { ApiService } from './api-service';
import type {
  SessionListResponse,
  SessionListItem,
  CostEstimate,
  CreateSessionRequest,
  CreateSessionResponse,
} from '@/features/interview/types';

export class SessionService extends ApiService {
  async listSessions(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<SessionListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size)
      queryParams.append('page_size', params.page_size.toString());

    const url = `/workbench/interviews/sessions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.client.get<SessionListResponse>(url);
    return this.handleResponse(response);
  }

  async getSession(sessionId: number): Promise<SessionListItem & { transcripts?: unknown[] }> {
    const response = await this.client.get<SessionListItem & { transcripts?: unknown[] }>(
      `/workbench/interviews/sessions/${sessionId}`,
    );
    return this.handleResponse(response);
  }

  async createSession(data: CreateSessionRequest): Promise<CreateSessionResponse> {
    const response = await this.client.post<CreateSessionResponse>(
      '/workbench/interviews/sessions',
      data,
    );
    return this.handleResponse(response);
  }

  async getCostEstimate(params: {
    interview_type: string;
    total_time_minutes: number;
    min_questions: number;
  }): Promise<CostEstimate> {
    const queryParams = new URLSearchParams({
      interview_type: params.interview_type,
      total_time_minutes: params.total_time_minutes.toString(),
      min_questions: params.min_questions.toString(),
    });
    const response = await this.client.get<CostEstimate>(
      `/workbench/interviews/cost-estimate?${queryParams.toString()}`,
    );
    return this.handleResponse(response);
  }
}

export const sessionService = new SessionService();
