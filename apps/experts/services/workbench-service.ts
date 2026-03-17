/**
 * Workbench Service
 *
 * Complete API integration for the expert annotation workbench.
 * Covers: tasks, conversations, rubrics, questions, responses,
 * submissions, error marking, reviews, comments, timelines, golden answers.
 */

import { ApiService } from './api-service';
import type {
  TaskListResponse,
  ConversationMessagesResponse,
  RubricResponse,
  TaskQuestionsResponse,
  SubmitResponseRequest,
  SubmitResponseResult,
  EditResponseRequest,
  SubmissionRequest,
  SubmissionResponse,
  ErrorMarkingRequest,
  ErrorMarking,
  ErrorMarkingsResponse,
  PreReviewAssignment,
  PostReviewAssignment,
  TaskComment,
  StatusTimelineResponse,
  FinalAnswersResponse,
  VerdictResponse,
  ProfileCheckResponse,
  AICorrectionRequest,
  AICorrectionResponse,
} from '@/features/workbench/types';

function buildQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) sp.append(k, String(v));
  }
  const q = sp.toString();
  return q ? `?${q}` : '';
}

export class WorkbenchService extends ApiService {
  // ─── Profile Check ──────────────────────────────────────────────────────

  async profileCheck(): Promise<ProfileCheckResponse> {
    const res = await this.client.get<ProfileCheckResponse>('/workbench/profile-check');
    return this.handleResponse(res);
  }

  // ─── Task Queue ─────────────────────────────────────────────────────────

  async getMyTasks(params?: {
    status?: string;
    batch_id?: number;
    page?: number;
    page_size?: number;
  }): Promise<TaskListResponse> {
    const res = await this.client.get<TaskListResponse>(
      `/workbench/my-tasks${buildQuery(params ?? {})}`,
    );
    return this.handleResponse(res);
  }

  // ─── Conversation ───────────────────────────────────────────────────────

  async getConversationMessages(conversationId: number): Promise<ConversationMessagesResponse> {
    const res = await this.client.get<ConversationMessagesResponse>(
      `/workbench/conversation/${conversationId}/messages`,
    );
    return this.handleResponse(res);
  }

  async getConversationFullInfo(conversationId: number): Promise<unknown> {
    const res = await this.client.get(`/workbench/conversation/${conversationId}/full-info`);
    return this.handleResponse(res);
  }

  // ─── Rubric ─────────────────────────────────────────────────────────────

  async getRubric(conversationId: number): Promise<RubricResponse> {
    const res = await this.client.get<RubricResponse>(
      `/workbench/conversation/${conversationId}/rubric`,
    );
    return this.handleResponse(res);
  }

  // ─── Questions ──────────────────────────────────────────────────────────

  async getQuestions(fpfId: number): Promise<TaskQuestionsResponse> {
    const res = await this.client.get<TaskQuestionsResponse>(
      `/workbench/tasks/${fpfId}/questions`,
    );
    return this.handleResponse(res);
  }

  async generateQuestions(conversationId: number): Promise<unknown> {
    const res = await this.client.post(`/workbench/conversation/${conversationId}/generate-questions`);
    return this.handleResponse(res);
  }

  // ─── Responses (question answers) ───────────────────────────────────────

  async submitResponse(data: SubmitResponseRequest): Promise<SubmitResponseResult> {
    const res = await this.client.post<SubmitResponseResult>(
      '/workbench/conversation/responses',
      data,
    );
    return this.handleResponse(res);
  }

  async editResponse(responseId: number, data: EditResponseRequest): Promise<unknown> {
    const res = await this.client.put(`/workbench/conversation/responses/${responseId}`, data);
    return this.handleResponse(res);
  }

  async getQuestionResponses(questionId: number): Promise<unknown> {
    const res = await this.client.get(`/workbench/conversation/questions/${questionId}/responses`);
    return this.handleResponse(res);
  }

  // ─── AI Correction ──────────────────────────────────────────────────────

  async correctText(data: AICorrectionRequest): Promise<AICorrectionResponse> {
    const res = await this.client.post<AICorrectionResponse>(
      '/workbench/conversation/responses/correct',
      data,
    );
    return this.handleResponse(res);
  }

  // ─── Submissions ────────────────────────────────────────────────────────

  async submitAnnotation(data: SubmissionRequest): Promise<SubmissionResponse> {
    const res = await this.client.post<SubmissionResponse>('/workbench/submissions', data);
    return this.handleResponse(res);
  }

  async getSubmission(submissionId: number): Promise<SubmissionResponse> {
    const res = await this.client.get<SubmissionResponse>(`/workbench/submissions/${submissionId}`);
    return this.handleResponse(res);
  }

  async listSubmissions(params?: { page?: number; page_size?: number }): Promise<unknown> {
    const res = await this.client.get(`/workbench/submissions${buildQuery(params ?? {})}`);
    return this.handleResponse(res);
  }

  // ─── Error Marking ──────────────────────────────────────────────────────

  async markError(data: ErrorMarkingRequest): Promise<ErrorMarking> {
    const res = await this.client.post<ErrorMarking>('/workbench/conversation/error-marking', data);
    return this.handleResponse(res);
  }

  async getErrorMarkings(conversationId: number): Promise<ErrorMarkingsResponse> {
    const res = await this.client.get<ErrorMarkingsResponse>(
      `/workbench/conversation/${conversationId}/error-markings`,
    );
    return this.handleResponse(res);
  }

  // ─── Pre-Annotation Review ──────────────────────────────────────────────

  async getMyReviews(status?: string): Promise<{ total: number; reviews: PreReviewAssignment[] }> {
    const res = await this.client.get<{ total: number; reviews: PreReviewAssignment[] }>(
      `/workbench/my-reviews${buildQuery({ status: status ?? undefined })}`,
    );
    return this.handleResponse(res);
  }

  async startPreReview(fpfId: number): Promise<unknown> {
    const res = await this.client.post(`/workbench/conversation/${fpfId}/pre-review/start`);
    return this.handleResponse(res);
  }

  async completePreReview(fpfId: number, data: { is_genuine_failure: boolean; reason?: string }): Promise<unknown> {
    const res = await this.client.post(`/workbench/conversation/${fpfId}/pre-review/complete`, data);
    return this.handleResponse(res);
  }

  // ─── Post-Annotation Review ─────────────────────────────────────────────

  async getMyPostReviews(status?: string): Promise<{ total: number; reviews: PostReviewAssignment[] }> {
    const res = await this.client.get<{ total: number; reviews: PostReviewAssignment[] }>(
      `/workbench/my-post-reviews${buildQuery({ status: status ?? undefined })}`,
    );
    return this.handleResponse(res);
  }

  async startPostReview(fpfId: number): Promise<unknown> {
    const res = await this.client.post(`/workbench/conversation/${fpfId}/post-review/start`);
    return this.handleResponse(res);
  }

  async completePostReview(fpfId: number, data: { approved: boolean; reason?: string }): Promise<unknown> {
    const res = await this.client.post(`/workbench/conversation/${fpfId}/post-review/complete`, data);
    return this.handleResponse(res);
  }

  // ─── Human Review Resolution ────────────────────────────────────────────

  async getVerdict(fpfId: number): Promise<VerdictResponse> {
    const res = await this.client.get<VerdictResponse>(`/workbench/conversation/${fpfId}/verdict`);
    return this.handleResponse(res);
  }

  async resolveHumanReview(fpfId: number, data: { decision: string; reason?: string }): Promise<unknown> {
    const res = await this.client.post(`/workbench/conversation/${fpfId}/resolve-human-review`, data);
    return this.handleResponse(res);
  }

  // ─── Skip ───────────────────────────────────────────────────────────────

  async skipConversation(conversationId: number, reason?: string): Promise<unknown> {
    const res = await this.client.post('/workbench/conversation/skip', {
      conversation_id: conversationId,
      reason,
    });
    return this.handleResponse(res);
  }

  // ─── QC ─────────────────────────────────────────────────────────────────

  async runQuestionQC(questionId: number): Promise<unknown> {
    const res = await this.client.post(`/workbench/conversation/qc/run-question/${questionId}`);
    return this.handleResponse(res);
  }

  async getQuestionQC(questionId: number): Promise<unknown> {
    const res = await this.client.get(`/workbench/conversation/qc/question/${questionId}`);
    return this.handleResponse(res);
  }

  async getWeightedIAA(fpfId: number): Promise<unknown> {
    const res = await this.client.get(`/workbench/conversation/${fpfId}/weighted-iaa`);
    return this.handleResponse(res);
  }

  async recordCompletion(fpfId: number): Promise<unknown> {
    const res = await this.client.post(`/workbench/conversation/${fpfId}/record-completion`);
    return this.handleResponse(res);
  }

  // ─── Comments ───────────────────────────────────────────────────────────

  async createComment(data: {
    failed_prompt_final_id: number;
    question_id?: number;
    comment_type: string;
    comment_text: string;
    parent_comment_id?: number;
  }): Promise<TaskComment> {
    const res = await this.client.post<TaskComment>('/workbench/task-comments', data);
    return this.handleResponse(res);
  }

  async getComments(fpfId: number, params?: { page?: number; page_size?: number }): Promise<{ total: number; comments: TaskComment[] }> {
    const res = await this.client.get<{ total: number; comments: TaskComment[] }>(
      `/workbench/task-comments/${fpfId}${buildQuery(params ?? {})}`,
    );
    return this.handleResponse(res);
  }

  // ─── Status Timeline ───────────────────────────────────────────────────

  async getStatusTimeline(fpfId: number): Promise<StatusTimelineResponse> {
    const res = await this.client.get<StatusTimelineResponse>(
      `/workbench/conversation/${fpfId}/status-timeline`,
    );
    return this.handleResponse(res);
  }

  // ─── Golden Answers ─────────────────────────────────────────────────────

  async getFinalAnswers(conversationId: number): Promise<FinalAnswersResponse> {
    const res = await this.client.get<FinalAnswersResponse>(
      `/workbench/conversation/${conversationId}/final-answers`,
    );
    return this.handleResponse(res);
  }

  async getBatchFinalAnswers(batchId: number, includeConversations = true): Promise<unknown> {
    const res = await this.client.get(
      `/workbench/batches/${batchId}/final-answers${buildQuery({ include_conversations: includeConversations })}`,
    );
    return this.handleResponse(res);
  }

  // ─── Retry ──────────────────────────────────────────────────────────────

  async retryAnalysis(fpfId: number): Promise<unknown> {
    const res = await this.client.post(`/workbench/conversation/${fpfId}/retry-analysis`);
    return this.handleResponse(res);
  }
}

export const workbenchService = new WorkbenchService();
