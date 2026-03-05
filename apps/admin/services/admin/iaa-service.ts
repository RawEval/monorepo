import { ApiService } from '../api-service';

export interface IAAOverview {
  total_computed: number;
  average_kappa: number;
  [key: string]: unknown;
}

export interface IAABatchResult {
  batch_id: number;
  [key: string]: unknown;
}

export interface IAAConversationResult {
  conversation_id: number;
  [key: string]: unknown;
}

export interface IAAExpertEntry {
  expert_id: number;
  [key: string]: unknown;
}

export interface ListQuestionLevelParams {
  conversation_id?: number;
  batch_id?: number;
  agreement_level?: string;
  qc_decision?: string;
  page?: number;
  page_size?: number;
}

export class AdminIAAService extends ApiService {
  async getOverview(): Promise<IAAOverview> {
    const response = await this.client.get<IAAOverview>(
      '/admin/iaa/overview'
    );
    return this.handleResponse(response);
  }

  async getBatchIAA(batchId: number): Promise<IAABatchResult> {
    const response = await this.client.get<IAABatchResult>(
      `/admin/iaa/batch/${batchId}`
    );
    return this.handleResponse(response);
  }

  async getConversationIAA(
    conversationId: number
  ): Promise<IAAConversationResult> {
    const response = await this.client.get<IAAConversationResult>(
      `/admin/iaa/conversation/${conversationId}`
    );
    return this.handleResponse(response);
  }

  async getExpertIAA(
    expertId: number,
    params: { page?: number; page_size?: number } = {}
  ): Promise<IAAExpertEntry[]> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<IAAExpertEntry[]>(
      `/admin/iaa/expert/${expertId}${query}`
    );
    return this.handleResponse(response);
  }

  async getQuestionLevel(
    params: ListQuestionLevelParams = {}
  ): Promise<unknown[]> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<unknown[]>(
      `/admin/iaa/question-level${query}`
    );
    return this.handleResponse(response);
  }

  async triggerIAA(
    conversationId: number,
    reason: string
  ): Promise<unknown> {
    const response = await this.client.post(
      `/admin/iaa/trigger/${conversationId}`,
      { reason }
    );
    return this.handleResponse(response);
  }
}

export const adminIAAService = new AdminIAAService();
