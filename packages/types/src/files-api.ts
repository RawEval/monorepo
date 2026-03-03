/**
 * Files API Types
 */

/**
 * File Input Model for LLM Calls
 */
export interface FileInput {
  url?: string | null;
  base64?: string | null;
  s3_key?: string | null;
  s3_url?: string | null;
  attachment_location?: string | null;
  file_type: 'pdf' | 'csv' | 'json' | 'image' | 'video' | 'audio' | 'text';
  filename?: string | null;
  content_type?: string | null;
  file_size_bytes?: number | null;
}

/**
 * File Upload Response
 */
export interface FileUploadResponse {
  s3_key: string;
  s3_url: string;
  filename: string;
  content_type: string;
  file_size_bytes: number;
  created_at?: string;
}

/**
 * Response from /upload-files endpoint
 */
export interface UploadFilesResponse {
  files: FileUploadResponse[];
}
