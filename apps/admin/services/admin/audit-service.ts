import { ApiService, type PaginatedResponse } from '../api-service';

export type { PaginatedResponse };

export interface AuditLogEntry {
  id: number;
  admin_user_id: number;
  admin_email: string | null;
  action: string;
  action_category: string;
  resource_type: string;
  resource_id: number | null;
  resource_identifier: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  diff: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  request_path: string | null;
  request_method: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
  /** Legacy shape — may or may not be present depending on API version */
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  admin_user?: {
    id: number;
    email: string;
    full_name: string | null;
  };
}

export interface ListAuditLogsParams {
  page?: number;
  page_size?: number;
  admin_user_id?: number;
  action?: string;
  resource_type?: string;
}

export class AdminAuditService extends ApiService {
  async listAuditLogs(
    params: ListAuditLogsParams = {}
  ): Promise<PaginatedResponse<AuditLogEntry>> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<PaginatedResponse<AuditLogEntry>>(
      `/admin/audit-logs${query}`
    );
    return this.handleResponse(response);
  }
}

export const adminAuditService = new AdminAuditService();
