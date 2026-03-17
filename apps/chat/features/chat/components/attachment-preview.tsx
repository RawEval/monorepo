'use client';

import { X, File, FileText } from 'lucide-react';
import { cn } from '@raweval/utils';

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  name: string;
  size?: number;
  url: string;
  file?: File;
}

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
  maxWidth?: number;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function AttachmentPreview({
  attachments,
  onRemove,
  maxWidth = 96,
}: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex max-w-full flex-wrap gap-2 overflow-hidden">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className={cn(
            'group border-border/50 bg-card relative shrink-0 overflow-hidden rounded-xl border shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg',
            attachment.type === 'image'
              ? 'h-16 w-16 sm:h-20 sm:w-20'
              : 'h-16 w-36 sm:h-20 sm:w-48'
          )}
          style={
            attachment.type === 'file'
              ? { maxWidth: `${maxWidth * 2}px` }
              : undefined
          }
        >
          {attachment.type === 'image' ? (
            <>
              <img
                src={attachment.url}
                alt={attachment.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Always visible on mobile, hover on desktop */}
              <button
                onClick={() => onRemove(attachment.id)}
                className="hover:bg-destructive hover:text-destructive-foreground absolute top-1 right-1 flex h-6 w-6 touch-manipulation items-center justify-center rounded-full bg-black/40 text-white/90 opacity-100 shadow-sm backdrop-blur-md transition-all active:scale-90 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="relative flex h-full flex-col justify-center p-2.5 sm:p-3">
              <div className="flex max-w-[85%] items-start gap-2">
                <div className="bg-muted/50 mt-0.5 shrink-0 rounded p-1">
                  {attachment.name.endsWith('.pdf') ? (
                    <File className="h-4 w-4 text-[var(--color-error)]" />
                  ) : (
                    <FileText className="h-4 w-4 text-[var(--color-signal)]" />
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-foreground truncate text-xs font-medium sm:text-[13px]">
                    {attachment.name}
                  </span>
                  {attachment.size && (
                    <span className="text-muted-foreground mt-0.5 text-[10px]">
                      {formatFileSize(attachment.size)}
                    </span>
                  )}
                </div>
              </div>
              {/* Always visible on mobile, hover on desktop */}
              <button
                onClick={() => onRemove(attachment.id)}
                className="bg-foreground/10 text-foreground/70 hover:bg-destructive hover:text-destructive-foreground absolute top-1 right-1 flex h-6 w-6 touch-manipulation items-center justify-center rounded-full opacity-100 shadow-sm backdrop-blur-sm transition-all active:scale-90 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Remove file"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
