import { ApiService, type PaginatedResponse } from '../api-service';

export interface AuditLogEntry {
  id: number;
  admin_user_id: number;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
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
