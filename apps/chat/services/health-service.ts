/**
 * Health Check Service
 *
 * Service for checking API health status.
 * Uses lib/api.ts directly — no @raweval/api-client dependency.
 */

import { api } from '@/lib/api';

export interface ApiHealthStatus {
  mainApi: {
    healthy: boolean;
    error?: string;
  };
}

class HealthService {
  /** Check main API health */
  async checkMainApiHealth(): Promise<boolean> {
    try {
      await api.get('/health', { skipAuth: true });
      return true;
    } catch (error) {
      console.error('Main API health check failed:', error);
      return false;
    }
  }

  /** Check all API health statuses */
  async checkAllHealth(): Promise<ApiHealthStatus> {
    const [mainApiHealthy] = await Promise.all([this.checkMainApiHealth()]);

    return {
      mainApi: {
        healthy: mainApiHealthy,
        error: mainApiHealthy ? undefined : 'Main API health check failed',
      },
    };
  }
}

export const healthService = new HealthService();
