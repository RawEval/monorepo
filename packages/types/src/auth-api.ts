/**
 * Authentication API Types
 *
 * Types for authentication endpoints from the backend API
 */

/**
 * Token Response from login/refresh endpoint
 *
 * According to OpenAPI spec: https://api.raweval.com/openapi.json
 * OAuth2-compliant with access_token and refresh_token
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string; // Optional for backward compatibility
}

/**
 * User Registration Request
 */
export interface UserCreate {
  email: string;
  full_name: string;
  password: string;
}

/**
 * User Response from API
 */
export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}
