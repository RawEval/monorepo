'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Send, Loader2, Plus, BrainCircuit, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@raweval/utils';
import { AttachmentPreview, Attachment } from './attachment-preview';
import { VoiceRecorder } from './voice-recorder';
import { useChatStore } from '@/stores/chat-store';
import { useModels } from '../api/get-models';
import type { Provider } from '@raweval/types';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@raweval/ui/select';

interface ChatInputProps {
  onSend: (message: string, images?: string[], files?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MAX_CHARACTERS = 10000;
const MAX_IMAGES = 5;
const MAX_FILES = 5;

const MODELS: {
  label: string;
  value: string;
  provider: Provider;
  model: string;
  max?: boolean;
  description: string;
}[] = [
  {
    label: 'GPT-4o',
    value: 'openai:gpt-4o',
    provider: 'openai',
    model: 'gpt-4o',
    max: true,
    description: 'Most advanced model',
  },
  {
    label: 'GPT-4',
    value: 'openai:gpt-4',
    provider: 'openai',
    model: 'gpt-4',
    description: 'Reliable and accurate',
  },
  {
    label: 'Claude 3.5 Sonnet',
    value: 'anthropic:claude-3-5-sonnet-20240620',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20240620',
    description: 'Great for coding tasks',
  },
  {
    label: 'GPT-4o Mini',
    value: 'openai:gpt-4o-mini',
    provider: 'openai',
    model: 'gpt-4o-mini',
    description: 'Fast and lightweight',
  },
  {
    label: 'o1 Mini',
    value: 'openai:o1-mini',
    provider: 'openai',
    model: 'o1-mini',
    description: 'Reasoning model',
  },
  {
    label: 'DeepSeek Chat',
    value: 'deepseek:deepseek-chat',
    provider: 'deepseek',
    model: 'deepseek-chat',
    description: 'High capability model',
  },
  {
    label: 'DeepSeek Coder',
    value: 'deepseek:deepseek-coder',
    provider: 'deepseek',
    model: 'deepseek-coder',
    description: 'Coding focused model',
  },
];

export function ChatInput({
  onSend,
  placeholder = 'Whatever you need, just ask RawEval!',
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const selectedModel = useChatStore((s) => s.selectedModel);
  const setSelectedModel = useChatStore((s) => s.setSelectedModel);
  const webSearchEnabled = useChatStore((s) => s.webSearchEnabled);
  const setWebSearchEnabled = useChatStore((s) => s.setWebSearchEnabled);
  const activeModelValue = `${selectedModel.provider}:${selectedModel.model}`;

  const { data: modelsResult } = useModels();

  const availableModels = useMemo(() => {
    if (Array.isArray(modelsResult) && modelsResult.length > 0) {
      return modelsResult.map((m: any) => ({
        label: m.label || m.model || 'Unknown Model',
        value: `${m.provider || 'unknown'}:${m.model}`,
        provider: m.provider || 'unknown',
        model: m.model,
        max: m.max || false,
        description: m.description || '',
      }));
    }
    return MODELS;
  }, [modelsResult]);

  useEffect(() => {
    if (availableModels.length > 0) {
      const currentProvider = selectedModel?.provider || '';
      const currentName = selectedModel?.model || '';
      const exists = availableModels.find(
        (f) => f.provider === currentProvider && f.model === currentName
      );
      if (!exists && availableModels[0]) {
        setSelectedModel({
          provider: availableModels[0].provider as Provider,
          model: availableModels[0].model,
        });
      }
    }
  }, [availableModels, selectedModel, setSelectedModel]);

  const handleModelChange = (value: string) => {
    const modelDef = availableModels.find((m) => m.value === value);
    if (modelDef) {
      setSelectedModel({ provider: modelDef.provider, model: modelDef.model });
    }
  };

  const activeModelDef =
    availableModels.find((m) => m.value === activeModelValue) ||
    availableModels[0];

  const renderMaxBadge = () => (
    <div className="border-border flex h-[14px] items-center gap-1.5 rounded border px-1 py-0">
      <span
        className="text-[9px] font-bold uppercase"
        style={{
          background:
            'linear-gradient(to right, rgb(129, 161, 193), rgb(125, 124, 155))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        MAX
      </span>
    </div>
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const characterCount = input.length;
  const canSend =
    (input.trim().length > 0 || attachments.length > 0) &&
    !disabled &&
    !isSending &&
    characterCount <= MAX_CHARACTERS;

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
      await onSend(
        message,
        images.length > 0 ? images : undefined,
        files.length > 0 ? files : undefined
      );
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
    const imageFiles = fileList.filter((file) =>
      file.type.startsWith('image/')
    );
    const otherFiles = fileList.filter(
      (file) => !file.type.startsWith('image/')
    );

    const remainingSlots =
      MAX_FILES - attachments.filter((a) => a.type === 'file').length;
    const imageSlots =
      MAX_IMAGES - attachments.filter((a) => a.type === 'image').length;

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
      const minHeight = 44;
      const maxHeight = 160;
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
    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
      type: 'audio/webm',
    });
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
  const canAddFiles = fileCount + imageCount < MAX_FILES + MAX_IMAGES;

  return (
    <div className="flex w-full flex-col gap-3 sm:gap-4">
      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="border-primary bg-accent rounded-lg border-2 border-dashed p-6 text-center sm:p-8">
            <p className="text-foreground text-base font-medium sm:text-lg">
              Drop files here to attach
            </p>
          </div>
        </div>
      )}

      {/* Input Container */}
      <div
        className={cn(
          'bg-muted/40 focus-within:bg-background border-border flex cursor-text flex-col rounded-2xl border shadow-sm transition-all duration-200 focus-within:shadow-md sm:rounded-[26px]',
          isDragOver && 'border-primary bg-primary/5 border-dashed',
          disabled && 'pointer-events-none opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="max-w-full overflow-hidden px-3 pt-3">
            <AttachmentPreview
              attachments={attachments}
              onRemove={removeAttachment}
            />
          </div>
        )}

        <div className="flex w-full items-end gap-1.5 p-2 sm:gap-2 sm:p-3">
          {/* Attach button */}
          <div className="flex pb-0.5 sm:pb-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || !canAddFiles}
              className="text-muted-foreground hover:bg-muted hover:text-foreground bg-background h-8 w-8 shrink-0 rounded-full border border-transparent shadow-xs transition-colors duration-200"
              title="Attach files"
              aria-label="Attach files"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Text Area */}
          <div className="relative max-h-[160px] flex-1 overflow-y-auto sm:max-h-[200px]">
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
              placeholder={placeholder}
              rows={1}
              disabled={disabled}
              maxLength={MAX_CHARACTERS}
              className="text-foreground placeholder:text-muted-foreground min-h-[36px] w-full resize-none border-0 bg-transparent py-2 text-[15px] wrap-break-word whitespace-pre-wrap shadow-none transition-[padding] duration-200 ease-in-out outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed sm:min-h-[44px]"
              style={{ WebkitAppearance: 'none' }}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 pb-0.5 sm:gap-2 sm:pr-1 sm:pb-1">
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecordingComplete}
              disabled={disabled}
            />

            <Button
              onClick={handleSend}
              disabled={!canSend || isSending}
              size="icon"
              className={cn(
                'h-8 w-8 shrink-0 rounded-full transition-all duration-200',
                canSend
                  ? 'bg-foreground text-background hover:bg-foreground/90 hover:scale-105'
                  : 'bg-muted-foreground/20 text-muted-foreground/50'
              )}
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Bottom Bar - Model Selection and Web Search */}
        <div className="flex items-center gap-2 px-3 pb-2 sm:gap-4 sm:px-4">
          <Select value={activeModelValue} onValueChange={handleModelChange}>
            <SelectTrigger className="text-muted-foreground hover:text-foreground h-auto w-fit max-w-[60%] gap-1 border-none bg-transparent! p-0 text-[11px] font-medium shadow-none focus:ring-0 sm:max-w-none sm:gap-1.5 sm:text-xs [&>svg]:ml-0 [&>svg]:h-3 [&>svg]:w-3 sm:[&>svg]:h-3.5 sm:[&>svg]:w-3.5">
              <BrainCircuit className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
              <SelectValue>
                {activeModelDef?.max ? (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="truncate">{activeModelDef.label}</span>
                    <span className="hidden sm:inline-flex">
                      {renderMaxBadge()}
                    </span>
                  </div>
                ) : (
                  <span className="truncate">{activeModelDef?.label}</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  <div className="flex flex-col gap-0.5">
                    {model.max ? (
                      <div className="flex items-center gap-1.5">
                        <span>{model.label}</span>
                        {renderMaxBadge()}
                      </div>
                    ) : (
                      <span>{model.label}</span>
                    )}
                    <span className="text-muted-foreground text-[10px] font-normal">
                      {model.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium transition-all duration-200 outline-none sm:gap-1.5 sm:px-2.5 sm:text-xs',
              webSearchEnabled
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={
              webSearchEnabled ? 'Web Search enabled' : 'Enable Web Search'
            }
            aria-label="Toggle Web Search"
          >
            <Globe
              className={cn(
                'h-3 w-3 sm:h-3.5 sm:w-3.5',
                webSearchEnabled && 'opacity-90'
              )}
            />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,.pdf,.csv,.txt,.doc,.docx"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || !canAddFiles}
      />
    </div>
  );
}
