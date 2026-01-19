/**
 * Health Check Service
 * 
 * Service for checking API health status
 */

import { ApiService } from './api-service';
import { llmCallsService } from './llm-calls-service';
import type { HealthResponse } from './llm-calls-service';

export interface ApiHealthStatus {
  mainApi: {
    healthy: boolean;
    error?: string;
  };
  llmCallHost: {
    healthy: boolean;
    status?: string;
    version?: string;
    providers?: Record<string, string>;
    error?: string;
  };
}

export class HealthService extends ApiService {
  /**
   * Check LLM Call Host health
   */
  async checkLlmCallHostHealth(): Promise<HealthResponse | null> {
    try {
      return await llmCallsService.checkHealth();
    } catch (error) {
      console.error('LLM Call Host health check failed:', error);
      return null;
    }
  }

  /**
   * Check main API health (if endpoint exists)
   */
  async checkMainApiHealth(): Promise<boolean> {
    try {
      // Try to hit a simple endpoint that doesn't require auth
      await this.client.get('/health', { skipAuth: true });
      return true;
    } catch (error) {
      console.error('Main API health check failed:', error);
      return false;
    }
  }

  /**
   * Check all API health statuses
   */
  async checkAllHealth(): Promise<ApiHealthStatus> {
    const [llmHealth, mainApiHealthy] = await Promise.all([
      this.checkLlmCallHostHealth(),
      this.checkMainApiHealth(),
    ]);

    return {
      mainApi: {
        healthy: mainApiHealthy,
        error: mainApiHealthy ? undefined : 'Main API health check failed',
      },
      llmCallHost: {
        healthy: llmHealth !== null,
        status: llmHealth?.status,
        version: llmHealth?.version,
        providers: llmHealth?.providers,
        error: llmHealth === null ? 'LLM Call Host health check failed' : undefined,
      },
    };
  }
}

export const healthService = new HealthService();
