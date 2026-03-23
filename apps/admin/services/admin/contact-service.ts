import { ApiService } from '../api-service';

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  organization: string | null;
  topic: string;
  description: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  admin_notes: string | null;
  email_sent: boolean;
  ip_address: string | null;
  user_agent?: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactInquiriesListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: ContactInquiry[];
}

export interface ContactStats {
  total_inquiries: number;
  new_unread: number;
  emails_sent: number;
  status_breakdown: Record<string, number>;
  topic_breakdown: Record<string, number>;
  recent: Array<{
    id: number;
    name: string;
    email: string;
    organization: string | null;
    topic: string;
    status: string;
    created_at: string;
  }>;
}

export interface UpdateInquiryRequest {
  status?: string;
  admin_notes?: string;
}

export interface CreateTopicRequest {
  topic: string;
}

class AdminContactService extends ApiService {
  async listInquiries(params: {
    page?: number;
    page_size?: number;
    status?: string;
    topic?: string;
    email?: string;
    search?: string;
  } = {}): Promise<ContactInquiriesListResponse> {
    const query = this.buildQuery(params);
    const response = await this.client.get<ContactInquiriesListResponse>(
      `/admin/contact/inquiries${query}`
    );
    return this.handleResponse(response);
  }

  async getInquiry(id: number): Promise<ContactInquiry> {
    const response = await this.client.get<ContactInquiry>(
      `/admin/contact/inquiries/${id}`
    );
    return this.handleResponse(response);
  }

  async updateInquiry(id: number, data: UpdateInquiryRequest): Promise<ContactInquiry> {
    const response = await this.client.patch<ContactInquiry>(
      `/admin/contact/inquiries/${id}`,
      data
    );
    return this.handleResponse(response);
  }

  async deleteInquiry(id: number): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(
      `/admin/contact/inquiries/${id}`
    );
    return this.handleResponse(response);
  }

  async getStats(): Promise<ContactStats> {
    const response = await this.client.get<ContactStats>(
      '/admin/contact/stats'
    );
    return this.handleResponse(response);
  }

  async getTopics(): Promise<{ topics: string[] }> {
    const response = await this.client.get<{ topics: string[] }>(
      '/admin/contact/topics'
    );
    return this.handleResponse(response);
  }

  async createTopic(topic: string): Promise<{ topics: string[]; message: string }> {
    const response = await this.client.post<{ topics: string[]; message: string }>(
      '/admin/contact/topics',
      { topic }
    );
    return this.handleResponse(response);
  }

  async deleteTopic(topic: string): Promise<{ topics: string[]; message: string }> {
    const response = await this.client.delete<{ topics: string[]; message: string }>(
      `/admin/contact/topics/${encodeURIComponent(topic)}`
    );
    return this.handleResponse(response);
  }
}

export const adminContactService = new AdminContactService();
