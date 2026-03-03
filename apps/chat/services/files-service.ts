/**
 * Files Service
 *
 * File upload via /api/v1/chat/sessions/{id}/upload.
 * For standalone uploads (not tied to a session), use /chat/upload.
 */

import { api } from '@/lib/api';
import type { UploadFilesResponse } from '@raweval/types';

class FilesService {
  /**
   * Upload files to the server (standalone, not tied to a session).
   * For session-specific uploads, use chatService.uploadAttachment().
   */
  async uploadFiles(files: File[]): Promise<UploadFilesResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    return api.post<UploadFilesResponse>('/chat/upload', formData);
  }

  /**
   * Delete a file (placeholder if endpoint exists)
   */
  async deleteFile(fileKey: string): Promise<void> {
    console.warn(
      'deleteFile not implemented on API side yet for key:',
      fileKey
    );
  }
}

export const filesService = new FilesService();
