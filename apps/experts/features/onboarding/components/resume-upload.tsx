'use client';

import { useState, useRef, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@raweval/ui/button';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { expertsService } from '@/services/experts-service';
import { apiClient } from '@raweval/api-client';
import type { ResumeUploadResponse } from '@/services/experts-service';

interface ResumeUploadProps {
  onComplete: () => void;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type UploadState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

function getFileExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
}

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  const ext = getFileExtension(file.name);
  return ACCEPTED_EXTENSIONS.includes(ext);
}

export function ResumeUpload({ onComplete }: ResumeUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeUploadResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if resume was already uploaded — load existing data on mount
  // NOTE: /users/me/metadata has a backend routing bug, so we fetch user ID first
  const { data: existingMeta } = useQuery({
    queryKey: ['user-metadata-resume'],
    queryFn: async () => {
      const me = await apiClient.get<{ id: number }>('/users/me');
      return apiClient.get<{
        professional_background?: string;
        resume_filename?: string;
        resume_s3_url?: string;
        auto_detected_domains?: Array<{ domain: string; subdomain: string; display_name: string; confidence_score: number }>;
      }>(`/users/${me.id}/metadata`);
    },
  });

  // Track whether user wants to re-upload (to bypass showing existing)
  const [forceReupload, setForceReupload] = useState(false);

  // Determine if we should show existing resume
  const showExisting = !forceReupload && uploadState === 'idle' && !result &&
    !!existingMeta?.professional_background && existingMeta.professional_background.length > 20;

  const uploadMutation = useMutation({
    mutationFn: (file: File) => expertsService.uploadResume(file),
    onMutate: () => {
      setUploadState('uploading');
      setErrorMessage(null);
      // Simulate transition to processing after a short delay
      setTimeout(() => {
        setUploadState((prev) => (prev === 'uploading' ? 'processing' : prev));
      }, 1500);
    },
    onSuccess: (data) => {
      setResult(data);
      setUploadState('done');
      onComplete();
    },
    onError: (error: unknown) => {
      setUploadState('error');
      const message =
        error instanceof Error ? error.message : 'Resume extraction failed. Please try again.';
      setErrorMessage(message);
    },
  });

  const handleFile = useCallback(
    (file: File) => {
      setErrorMessage(null);

      if (!isAcceptedFile(file)) {
        setUploadState('error');
        setErrorMessage('Invalid file format. Please upload a PDF, DOCX, DOC, or TXT file.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setUploadState('error');
        setErrorMessage('File is too large. Maximum size is 10MB.');
        return;
      }

      setSelectedFile(file);
      uploadMutation.mutate(file);
    },
    [uploadMutation],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    setErrorMessage('Please upload a file instead.');
    setUploadState('error');
  }, []);

  const handleReset = useCallback(() => {
    setUploadState('idle');
    setErrorMessage(null);
    setResult(null);
    setSelectedFile(null);
    setPreviewExpanded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Existing resume state (persisted from previous upload)
  if (showExisting && existingMeta) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'var(--color-success-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-success-border)' }}>
          <CheckCircle2 size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>
              Resume already uploaded
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
              {existingMeta.resume_filename ?? `${existingMeta.professional_background!.length} characters extracted`}
            </p>
          </div>
        </div>

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <button type="button" onClick={() => setPreviewExpanded(!previewExpanded)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-bg-surface)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
            <span>Extracted Resume Text</span>
            {previewExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {previewExpanded && (
            <div style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 240, overflowY: 'auto', background: 'var(--color-bg-base)', borderTop: '1px solid var(--color-border)' }}>
              {existingMeta.professional_background}
            </div>
          )}
        </div>

        {existingMeta.auto_detected_domains && existingMeta.auto_detected_domains.length > 0 && (
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', margin: '0 0 var(--space-3)' }}>Auto-detected domains</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {existingMeta.auto_detected_domains.map((d) => (
                <span key={`${d.domain}-${d.subdomain}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', padding: 'var(--space-1) var(--space-3)', background: 'var(--color-signal-subtle)', border: '1px solid var(--color-signal-border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)' }}>
                  <CheckCircle2 size={12} /> {d.display_name}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={() => setForceReupload(true)}>
          Upload new resume
        </Button>
      </div>
    );
  }

  // Success state (just uploaded)
  if (uploadState === 'done' && result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Success header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            background: 'var(--color-success-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <CheckCircle2 size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                fontWeight: 500,
                margin: 0,
              }}
            >
              Resume uploaded successfully
            </p>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {result.filename}
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-1)',
              color: 'var(--color-text-muted)',
              flexShrink: 0,
            }}
            aria-label="Remove and re-upload"
          >
            <X size={16} />
          </button>
        </div>

        {/* Extracted text preview */}
        {result.extracted_text && (
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewExpanded(!previewExpanded)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-bg-surface)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                textAlign: 'left',
              }}
            >
              <span>Extracted Text Preview</span>
              {previewExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {previewExpanded && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--leading-relaxed)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: 240,
                  overflowY: 'auto',
                  background: 'var(--color-bg-base)',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                {result.extracted_text.length > 300 && !previewExpanded
                  ? result.extracted_text.slice(0, 300) + '...'
                  : result.extracted_text}
              </div>
            )}
          </div>
        )}

        {/* Auto-detected domains */}
        {result.auto_detected_domains && result.auto_detected_domains.length > 0 && (
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-faint)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wide)',
                margin: '0 0 var(--space-3)',
              }}
            >
              Auto-detected domains
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {result.auto_detected_domains.map((d) => (
                <span
                  key={`${d.domain}-${d.subdomain}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    padding: 'var(--space-1) var(--space-3)',
                    background: 'var(--color-signal-subtle)',
                    border: '1px solid var(--color-signal-border)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-signal)',
                  }}
                >
                  <CheckCircle2 size={12} />
                  {d.display_name} ({Math.round(d.confidence_score * 100)}%)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (uploadState === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            background: 'var(--color-error-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <AlertCircle size={20} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-error)',
              margin: 0,
              flex: 1,
            }}
          >
            {errorMessage}
          </p>
        </div>
        <Button variant="outline" onClick={handleReset}>
          Try again
        </Button>
      </div>
    );
  }

  // Uploading / processing state
  if (uploadState === 'uploading' || uploadState === 'processing') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-4)',
          padding: 'var(--space-10)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-base)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '2px solid var(--color-border)',
            borderTopColor: 'var(--color-signal)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              fontWeight: 500,
              margin: '0 0 var(--space-1)',
            }}
          >
            {uploadState === 'uploading' ? 'Uploading resume...' : 'Processing and extracting text...'}
          </p>
          {selectedFile && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-faint)',
                margin: 0,
              }}
            >
              {selectedFile.name}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Idle state - drag and drop zone
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
      role="button"
      aria-label="Upload resume by dragging a file here or clicking Choose file"
      onClick={() => fileInputRef.current?.click()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-10) var(--space-6)',
        border: `2px dashed ${isDragOver ? 'var(--color-signal)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        background: isDragOver ? 'var(--color-signal-subtle)' : 'var(--color-bg-base)',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, background 0.2s ease',
        outline: 'none',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-md)',
          background: isDragOver ? 'var(--color-signal-subtle)' : 'var(--color-bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isDragOver ? (
          <FileText size={24} style={{ color: 'var(--color-signal)' }} />
        ) : (
          <Upload size={24} style={{ color: 'var(--color-text-faint)' }} />
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: isDragOver ? 'var(--color-signal)' : 'var(--color-text-primary)',
            fontWeight: 500,
            margin: '0 0 var(--space-1)',
          }}
        >
          {isDragOver ? 'Drop your resume here' : 'Drag and drop your resume here'}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)',
            margin: 0,
          }}
        >
          or click to browse
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
      >
        Choose file
      </Button>

      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-faint)',
          margin: 0,
        }}
      >
        PDF, DOCX, DOC, TXT &middot; Max 10MB
      </p>
    </div>
  );
}
