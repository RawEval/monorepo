/**
 * Admin Audit Service
 *
 * Access platform-wide audit trail for compliance and security monitoring.
 */

import { ApiService } from '../api-service';

export interface AuditLogEntry {
  id: number;
  actor_id: number;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  status: 'success' | 'failure';
  error_message: string | null;
  created_at: string;
}

export interface ListAuditLogsParams {
  skip?: number;
  limit?: number;
  actor_id?: number;
  action?: string;
  resource_type?: string;
  status?: 'success' | 'failure';
  start_date?: string;
  end_date?: string;
}

export class AdminAuditService extends ApiService {
  /**
   * List audit logs with comprehensive filtering
   */
  async listAuditLogs(
    params: ListAuditLogsParams = {}
  ): Promise<AuditLogEntry[]> {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.client.get<AuditLogEntry[]>(
      `/admin/audit-logs?${query}`
    );
    return this.handleResponse(response);
  }

  /**
   * Get specific audit log entry
   */
  async getAuditLog(id: number): Promise<AuditLogEntry> {
    const response = await this.client.get<AuditLogEntry>(
      `/admin/audit-logs/${id}`
    );
    return this.handleResponse(response);
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(
    userId: number,
    params: { skip?: number; limit?: number } = {}
  ): Promise<AuditLogEntry[]> {
    return this.listAuditLogs({ ...params, actor_id: userId });
  }
}

export const adminAuditService = new AdminAuditService();
