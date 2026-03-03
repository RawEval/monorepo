/**
 * Users API Types
 *
 * Types for user management endpoints
 */

import type { UserCreate, UserResponse } from './auth-api';

export type { UserCreate, UserResponse };

/**
 * User Metadata
 */
export interface UserMetadata {
  [key: string]: unknown;
}

/**
 * User Profile Update
 */
export interface UserProfile {
  full_name?: string;
  bio?: string | null;
  avatar_url?: string | null;
  phone_number?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  website_url?: string | null;
}

/**
 * User Domain
 */
export interface UserDomain {
  id: number;
  user_id: number;
  domain: string;
  verified: boolean;
  created_at: string;
  dns_records?: Record<string, string>;
}

/**
 * Accessible Page (RBAC)
 */
export interface AccessiblePage {
  page: string;
  accessible: boolean;
  reason?: string | null;
}

/**
 * Update Full Name Request
 */
export interface UpdateFullNameRequest {
  full_name: string;
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

/**
 * Update Email Request
 */
export interface UpdateEmailRequest {
  email: string;
  password: string; // Required for verification
}

/**
 * User Domain Request (Add Domain)
 */
export interface UserDomainRequest {
  domain: string;
}

/**
 * Update Subscription Request
 */
export interface UpdateSubscriptionRequest {
  tier: 'free' | 'pro' | 'pro_max' | string;
}
