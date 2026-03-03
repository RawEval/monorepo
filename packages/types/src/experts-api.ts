/**
 * Experts API Types
 *
 * Types for expert-related endpoints
 */

/**
 * Expert Registration Request
 */
export interface ExpertRegistrationRequest {
  specializations: string[];
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  github_url?: string;
  years_of_experience?: number;
}

/**
 * Expert Tier Update Request
 */
export interface ExpertTierUpdateRequest {
  tier: 1 | 2 | 3;
  reason?: string;
}

/**
 * Certification Response
 */
export interface CertificationResponse {
  id: number;
  expert_id: number;
  name: string;
  issuer: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}
