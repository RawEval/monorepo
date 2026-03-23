/**
 * Files Service — standalone file uploads
 */
import { api } from '@/lib/api';
import type { FileUploadResponse } from '@raweval/types';

class FilesService {
  async uploadFiles(files: { uri: string; name: string; type: string }[]): Promise<FileUploadResponse> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as unknown as Blob);
    }
    return api.post<FileUploadResponse>('/chat/upload', formData);
  }

  async deleteFile(_fileKey: string): Promise<void> {
    // Not implemented on backend yet
  }
}

export const filesService = new FilesService();
