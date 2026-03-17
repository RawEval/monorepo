/**
 * Experts Service
 * 
 * Service for expert-related operations
 */

import { ApiService } from './api-service';
import type {
  OnboardingStatus,
  ExpertProfile,
  DomainProficiency,
  ExpertScore,
} from '@/features/interview/types';

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

export interface AutoDetectedDomain {
  domain: string;
  subdomain: string;
  display_name: string;
  confidence_score: number;
}

export interface ResumeUploadResponse {
  message: string;
  filename: string;
  file_type: string;
  extracted_text: string;
  extext_length: number;
  preview: string;
  auto_detected_domains: AutoDetectedDomain[];
  s3_key: string;
  s3_url: string;
}

export interface WorkbenchDomain {
  id: number;
  name: string;
  display_name: string;
  description?: string | null;
  parent_id?: number | null;
  subdomains?: WorkbenchDomain[];
}

export interface WorkbenchDomainsResponse {
  total: number;
  domains: WorkbenchDomain[];
}

export class ExpertsService extends ApiService {
  /**
   * Register as an expert
   */
  async registerExpert(data: ExpertRegistrationRequest): Promise<ExpertResponse> {
    const response = await this.client.post<ExpertResponse>(
      '/workbench/experts/register',
      data,
    );
    return this.handleResponse(response);
  }

  /**
   * Get expert by ID
   */
  async getExpert(expertId: number): Promise<ExpertResponse> {
    const response = await this.client.get<ExpertResponse>(
      `/workbench/experts/${expertId}`,
    );
    return this.handleResponse(response);
  }

  /**
   * Get all experts
   */
  async getExperts(skip = 0, limit = 100): Promise<ExpertResponse[]> {
    const response = await this.client.get<ExpertResponse[]>(
      `/workbench/experts?skip=${skip}&limit=${limit}`,
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
      `/workbench/experts/${expertId}/tier`,
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
      `/workbench/experts/${expertId}/certifications`,
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
      `/workbench/experts/${expertId}/certifications`,
      certification,
    );
    return this.handleResponse(response);
  }
  /**
   * Get onboarding status for the current expert
   */
  async getOnboardingStatus(): Promise<OnboardingStatus> {
    const response = await this.client.get<OnboardingStatus>(
      '/workbench/experts/me/onboarding-status',
    );
    return this.handleResponse(response);
  }

  /**
   * Get the current expert's profile
   */
  async getMyProfile(): Promise<ExpertProfile> {
    const response = await this.client.get<ExpertProfile>(
      '/workbench/experts/me/profile',
    );
    return this.handleResponse(response);
  }

  /**
   * Update the current expert's profile
   */
  async updateMyProfile(data: ExpertProfile): Promise<ExpertProfile> {
    const response = await this.client.put<ExpertProfile>(
      '/workbench/experts/me/profile',
      data,
    );
    return this.handleResponse(response);
  }

  /**
   * Get domain proficiencies for the current expert
   */
  async getMyDomains(): Promise<DomainProficiency[]> {
    const response = await this.client.get<DomainProficiency[]>(
      '/workbench/experts/me/domains',
    );
    return this.handleResponse(response);
  }

  /**
   * Set domain proficiency for the current expert
   */
  async setDomain(domain: string, proficiencyScore: number): Promise<DomainProficiency> {
    const response = await this.client.put<DomainProficiency>(
      '/workbench/experts/me/domains',
      { domain, proficiency_score: proficiencyScore },
    );
    return this.handleResponse(response);
  }

  /**
   * Get the current expert's score
   */
  async getMyScore(): Promise<ExpertScore> {
    const response = await this.client.get<ExpertScore>(
      '/workbench/experts/me/score',
    );
    return this.handleResponse(response);
  }

  /**
   * Get an expert's score by ID
   */
  async getExpertScore(expertId: number): Promise<ExpertScore> {
    const response = await this.client.get<ExpertScore>(
      `/workbench/experts/${expertId}/score`,
    );
    return this.handleResponse(response);
  }

  /**
   * Get all available domains from the workbench
   */
  async getAvailableDomains(): Promise<WorkbenchDomainsResponse> {
    const response = await this.client.get<WorkbenchDomainsResponse>(
      '/workbench/domains',
    );
    return this.handleResponse(response);
  }

  /**
   * Upload resume file
   */
  async uploadResume(file: File): Promise<ResumeUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post<ResumeUploadResponse>(
      '/users/me/resume/upload',
      formData,
    );
    return this.handleResponse(response);
  }
}

export const expertsService = new ExpertsService();
