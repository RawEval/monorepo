import { ApiService } from '../api-service';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** The 3 specialist judge roles */
export type JudgeRole =
  | 'process_verifier'
  | 'tool_strategy'
  | 'devils_advocate';

export interface JudgeSpec {
  role: JudgeRole;
  /** Model string e.g. "openai/gpt-5", "anthropic/claude-4-sonnet" */
  model: string;
  system_prompt: string | null;
  /** Criteria types this judge evaluates */
  types: string[] | null;
  /** Timeout in seconds (5–300) */
  timeout: number | null;
}

export interface JudgeConfig {
  id: number;
  version: number;
  version_label: string | null;
  description: string | null;
  judges: JudgeSpec[];
  judge_count: number;
  /** Default timeout for all judges (seconds) */
  default_timeout: number;
  merge_strategy: string;
  calibration_enabled: boolean;
  is_active: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface JudgeConfigListResponse {
  configs: JudgeConfig[];
  total: number;
  active_config_id: number | null;
}

export interface JudgeConfigCreateRequest {
  version_label?: string;
  description?: string;
  judges: JudgeSpec[];
  default_timeout?: number;
  merge_strategy?: string;
  calibration_enabled?: boolean;
  is_active?: boolean;
}

export type JudgeConfigUpdateRequest = Partial<JudgeConfigCreateRequest>;

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export class AdminJudgeConfigService extends ApiService {
  /** List all judge panel configs (historic + active). */
  async listJudgeConfigs(): Promise<JudgeConfigListResponse> {
    const response = await this.client.get<
      JudgeConfigListResponse | JudgeConfig[]
    >('/admin/judge-config');
    const data = this.handleResponse(response);
    // Backward compat: if API returns array, wrap it
    if (Array.isArray(data)) {
      return {
        configs: data as JudgeConfig[],
        total: (data as JudgeConfig[]).length,
        active_config_id:
          (data as JudgeConfig[]).find((c) => c.is_active)?.id ?? null,
      };
    }
    return data as JudgeConfigListResponse;
  }

  /** Get the currently active judge panel config. */
  async getActiveJudgeConfig(): Promise<JudgeConfig> {
    const response = await this.client.get<JudgeConfig>(
      '/admin/judge-config/active'
    );
    return this.handleResponse(response);
  }

  /**
   * Get default judge panel.
   * Default: process_verifier=gpt-4o, tool_strategy=claude-3.5-sonnet, devils_advocate=gemini-pro-1.5
   */
  async getDefaultJudgeConfig(): Promise<JudgeConfig> {
    const response = await this.client.get<JudgeConfig>(
      '/admin/judge-config/defaults'
    );
    return this.handleResponse(response);
  }

  /** Create a new versioned judge panel config. If is_active=true, all others deactivated. */
  async createJudgeConfig(
    data: JudgeConfigCreateRequest
  ): Promise<JudgeConfig> {
    const response = await this.client.post<JudgeConfig>(
      '/admin/judge-config',
      data
    );
    return this.handleResponse(response);
  }

  /** Update an existing judge panel config. */
  async updateJudgeConfig(
    configId: number,
    data: JudgeConfigUpdateRequest
  ): Promise<JudgeConfig> {
    const response = await this.client.put<JudgeConfig>(
      `/admin/judge-config/${configId}`,
      data
    );
    return this.handleResponse(response);
  }
}

export const adminJudgeConfigService = new AdminJudgeConfigService();
