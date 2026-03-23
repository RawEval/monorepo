/**
 * Health Service — API health status checks
 */
import { api } from '@/lib/api';
import type { HealthResponse } from '@raweval/types';

interface HealthStatus {
  service: string;
  healthy: boolean;
  message?: string;
}

class HealthService {
  async checkMainApiHealth(): Promise<HealthResponse> {
    return api.get<HealthResponse>('/health');
  }

  async checkAllHealth(): Promise<HealthStatus[]> {
    const results: HealthStatus[] = [];
    try {
      await this.checkMainApiHealth();
      results.push({ service: 'main-api', healthy: true });
    } catch (error) {
      results.push({
        service: 'main-api',
        healthy: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    return results;
  }
}

export const healthService = new HealthService();
