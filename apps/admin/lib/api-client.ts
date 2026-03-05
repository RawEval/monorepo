/**
 * Admin API Client — explicit config to avoid env loading issues
 *
 * Uses NEXT_PUBLIC_* from .env and creates a client that always hits
 * https://api.raweval.com/api/v1/... directly (no proxy).
 */

import { ApiClient } from '@raweval/api-client';
import { getStoredToken } from '@/lib/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.raweval.com';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export const apiClient = new ApiClient({
  config: {
    baseUrl: BASE_URL.replace(/\/$/, ''),
    llmCallsBaseUrl: BASE_URL.replace(/\/$/, ''),
    apiVersion: API_VERSION,
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  getAuthToken: () => getStoredToken(),
});
