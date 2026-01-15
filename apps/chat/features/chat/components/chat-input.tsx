'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@raweval/utils';
import { AttachmentPreview, Attachment } from './attachment-preview';
import { VoiceRecorder } from './voice-recorder';

interface ChatInputProps {
  onSend: (message: string, images?: string[], files?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MAX_CHARACTERS = 10000;
const MAX_IMAGES = 5;
const MAX_FILES = 5;

export function ChatInput({
  onSend,
  placeholder = 'Whatever you need, just ask RawEval!',
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const characterCount = input.length;
  const canSend = (input.trim().length > 0 || attachments.length > 0) && !disabled && !isSending && characterCount <= MAX_CHARACTERS;

  const handleSend = useCallback(async () => {
    if (!canSend) return;

    setIsSending(true);
    const message = input.trim();
    const imageAttachments = attachments.filter((a) => a.type === 'image');
    const fileAttachments = attachments.filter((a) => a.type === 'file');

    const images = imageAttachments.map((a) => a.url);
    const files = fileAttachments.map((a) => a.file!).filter(Boolean);

    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await onSend(message, images.length > 0 ? images : undefined, files.length > 0 ? files : undefined);
    } finally {
      setIsSending(false);
    }
  }, [input, attachments, onSend, canSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileList = Array.from(files);
    const imageFiles = fileList.filter((file) => file.type.startsWith('image/'));
    const otherFiles = fileList.filter((file) => !file.type.startsWith('image/'));
    
    const remainingSlots = MAX_FILES - attachments.filter((a) => a.type === 'file').length;
    const imageSlots = MAX_IMAGES - attachments.filter((a) => a.type === 'image').length;

    // Process images
    const imagesToProcess = imageFiles.slice(0, imageSlots);
    imagesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const attachment: Attachment = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'image',
          name: file.name,
          size: file.size,
          url,
          file,
        };
        setAttachments((prev) => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    // Process other files
    const filesToProcess = otherFiles.slice(0, remainingSlots);
    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const attachment: Attachment = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'file',
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
          file,
        };
        setAttachments((prev) => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.url.startsWith('blob:')) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = 52; // min-h-[52px]
      const maxHeight = 200; // max-h-[200px]
      textareaRef.current.style.height = `${Math.max(minHeight, Math.min(scrollHeight, maxHeight))}px`;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleVoiceRecordingComplete = (audioBlob: Blob) => {
    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
    const attachment: Attachment = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'file',
      name: audioFile.name,
      size: audioFile.size,
      url: URL.createObjectURL(audioBlob),
      file: audioFile,
    };
    setAttachments((prev) => [...prev, attachment]);
  };

  useEffect(() => {
    if (textareaRef.current && !disabled) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [disabled]);

  const fileCount = attachments.filter((a) => a.type === 'file').length;
  const imageCount = attachments.filter((a) => a.type === 'image').length;
  const canAddFiles = (fileCount + imageCount) < (MAX_FILES + MAX_IMAGES);

  return (
    <div className="space-y-3">
      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="rounded-lg border-2 border-dashed border-primary bg-accent p-8 text-center">
            <p className="text-lg font-medium text-foreground">Drop files here to attach</p>
          </div>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="max-w-full overflow-hidden">
          <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />
        </div>
      )}

      {/* Input Container - Clean minimal design like ChatGPT */}
      <div
        className={cn(
          'rounded-2xl border transition-all',
          isFocused
            ? 'border-primary/50 bg-background shadow-sm'
            : 'border-border bg-muted/30',
          isDragOver && 'border-primary border-dashed bg-primary/5',
          disabled && 'opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Input Row - All in one line like ChatGPT */}
        <div className="flex items-end gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          {/* Left: Attach button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || !canAddFiles}
            className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 active:scale-95 touch-manipulation"
            aria-label="Attach file"
          >
            <Plus className="h-5 w-5" />
          </Button>

          {/* Center: Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARACTERS) {
                setInput(e.target.value);
                adjustTextareaHeight();
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            maxLength={MAX_CHARACTERS}
            className="flex-1 resize-none border-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-0 disabled:cursor-not-allowed leading-6 min-h-[24px] max-h-[200px] touch-manipulation"
            style={{ WebkitAppearance: 'none' }}
          />

          {/* Right: Voice & Send */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Voice Message Button */}
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecordingComplete}
              disabled={disabled}
            />

            {/* Send Button */}
            {canSend && (
              <Button
                onClick={handleSend}
                disabled={!canSend || isSending}
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all disabled:opacity-40 active:scale-95 touch-manipulation"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Input - accepts both images and files */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || !canAddFiles}
      />
    </div>
  );
}
