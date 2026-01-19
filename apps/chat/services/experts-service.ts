/**
 * Experts Service
 * 
 * Service for expert-related operations
 */

import { ApiService } from './api-service';

export interface ExpertRegistrationRequest {
  user_id: number;
  specializations: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date_issued: string;
    expiry_date?: string | null;
  }>;
}

export interface ExpertResponse {
  id: number;
  user_id: number;
  tier: 1 | 2 | 3;
  specializations: string[];
  woe_score: number;
  total_tasks_completed: number;
  accuracy_rate: number;
  created_at: string;
  verified_at: string | null;
}

export interface ExpertCertification {
  id: number;
  expert_id: number;
  name: string;
  issuer: string;
  date_issued: string;
  expiry_date: string | null;
  verified: boolean;
}

export interface UpdateTierRequest {
  tier: 1 | 2 | 3;
  reason?: string;
}

export class ExpertsService extends ApiService {
  /**
   * Register as an expert
   */
  async registerExpert(data: ExpertRegistrationRequest): Promise<ExpertResponse> {
    const response = await this.client.post<ExpertResponse>(
      '/experts/register',
      data,
    );
    return this.handleResponse(response);
  }

  /**
   * Get expert by ID
   */
  async getExpert(expertId: number): Promise<ExpertResponse> {
    const response = await this.client.get<ExpertResponse>(
      `/experts/${expertId}`,
    );
    return this.handleResponse(response);
  }

  /**
   * Get all experts
   */
  async getExperts(skip = 0, limit = 100): Promise<ExpertResponse[]> {
    const response = await this.client.get<ExpertResponse[]>(
      `/experts?skip=${skip}&limit=${limit}`,
    );
    return this.handleResponse(response);
  }

  /**
   * Update expert tier
   */
  async updateExpertTier(
    expertId: number,
    data: UpdateTierRequest,
  ): Promise<ExpertResponse> {
    const response = await this.client.put<ExpertResponse>(
      `/experts/${expertId}/tier`,
      data,
    );
    return this.handleResponse(response);
  }

  /**
   * Get expert certifications
   */
  async getExpertCertifications(
    expertId: number,
  ): Promise<ExpertCertification[]> {
    const response = await this.client.get<ExpertCertification[]>(
      `/experts/${expertId}/certifications`,
    );
    return this.handleResponse(response);
  }

  /**
   * Add certification to expert
   */
  async addCertification(
    expertId: number,
    certification: {
      name: string;
      issuer: string;
      date_issued: string;
      expiry_date?: string | null;
    },
  ): Promise<ExpertCertification> {
    const response = await this.client.post<ExpertCertification>(
      `/experts/${expertId}/certifications`,
      certification,
    );
    return this.handleResponse(response);
  }
}

export const expertsService = new ExpertsService();
