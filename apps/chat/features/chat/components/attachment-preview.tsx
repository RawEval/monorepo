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
    <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className={cn(
            'group relative overflow-hidden rounded-lg border border-border bg-muted/50 shrink-0',
            attachment.type === 'image' ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-20 min-w-[100px] sm:min-w-[120px]'
          )}
          style={attachment.type === 'file' ? { maxWidth: `${maxWidth * 2}px` } : undefined}
        >
          {attachment.type === 'image' ? (
            <>
              <img
                src={attachment.url}
                alt={attachment.name}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => onRemove(attachment.id)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 shadow-sm transition-opacity hover:bg-background hover:text-foreground group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="flex h-full flex-col p-2">
              <div className="mb-1 flex items-center gap-1.5">
                {attachment.name.endsWith('.pdf') ? (
                  <File className="h-4 w-4 text-red-500" />
                ) : (
                  <FileText className="h-4 w-4 text-blue-500" />
                )}
                <span className="truncate text-xs font-medium text-foreground">
                  {attachment.name}
                </span>
              </div>
              {attachment.size && (
                <p className="text-[10px] text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </p>
              )}
              <button
                onClick={() => onRemove(attachment.id)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 shadow-sm transition-opacity hover:bg-background hover:text-foreground group-hover:opacity-100"
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
