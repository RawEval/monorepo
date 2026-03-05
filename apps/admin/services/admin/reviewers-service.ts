import { ApiService } from '../api-service';

export interface ReviewerAssignment {
  id: number;
  failed_prompt_final_id: number;
  reviewer_expert_id: number;
  batch_id?: number;
  status: string;
  decision: string | null;
  reason: string | null;
  assigned_at: string;
  completed_at: string | null;
}

export interface ListReviewerParams {
  fpf_id?: number;
  batch_id?: number;
  reviewer_expert_id?: number;
  status?: string;
  page?: number;
  page_size?: number;
}

export interface AssignReviewerRequest {
  failed_prompt_final_id: number;
  reviewer_expert_id: number;
  reason: string;
}

export interface UpdateReviewerRequest {
  status?: string;
  decision?: string;
  reason?: string;
}

export class AdminReviewersService extends ApiService {
  async listPreAnnotationReviews(
    params: ListReviewerParams = {}
  ): Promise<ReviewerAssignment[]> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<ReviewerAssignment[]>(
      `/admin/reviewers/pre-annotation${query}`
    );
    return this.handleResponse(response);
  }

  async listPostAnnotationReviews(
    params: ListReviewerParams = {}
  ): Promise<ReviewerAssignment[]> {
    const query = this.buildQuery(params as Record<string, unknown>);
    const response = await this.client.get<ReviewerAssignment[]>(
      `/admin/reviewers/post-annotation${query}`
    );
    return this.handleResponse(response);
  }

  async assignPreAnnotationReviewer(
    data: AssignReviewerRequest
  ): Promise<unknown> {
    const response = await this.client.post(
      '/admin/reviewers/pre-annotation/assign',
      data
    );
    return this.handleResponse(response);
  }

  async assignPostAnnotationReviewer(
    data: AssignReviewerRequest
  ): Promise<unknown> {
    const response = await this.client.post(
      '/admin/reviewers/post-annotation/assign',
      data
    );
    return this.handleResponse(response);
  }

  async updateReviewer(
    reviewType: string,
    reviewId: number,
    data: UpdateReviewerRequest
  ): Promise<unknown> {
    const response = await this.client.patch(
      `/admin/reviewers/${reviewType}/${reviewId}`,
      data
    );
    return this.handleResponse(response);
  }
}

export const adminReviewersService = new AdminReviewersService();
