'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Send, Loader2, Plus, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@raweval/ui/select';
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

  // Hook up Model Selection
  const selectedModel = useChatStore((s) => s.selectedModel);
  const setSelectedModel = useChatStore((s) => s.setSelectedModel);
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
    // Ensure selected model is in the list, else default to first
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
    <div className="flex w-full flex-col gap-4">
      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="border-primary bg-accent rounded-lg border-2 border-dashed p-8 text-center">
            <p className="text-foreground text-lg font-medium">
              Drop files here to attach
            </p>
          </div>
        </div>
      )}

      {/* Input Container - ChatGPT inspired design */}
      <div
        className={cn(
          'bg-muted/40 focus-within:bg-background border-border flex cursor-text flex-col rounded-[26px] border shadow-sm transition-all duration-200 focus-within:shadow-md',
          isDragOver && 'border-primary bg-primary/5 border-dashed',
          disabled && 'pointer-events-none opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Attachment Previews (Inside the container like ChatGPT) */}
        {attachments.length > 0 && (
          <div className="max-w-full overflow-hidden px-3 pt-3">
            <AttachmentPreview
              attachments={attachments}
              onRemove={removeAttachment}
            />
          </div>
        )}

        <div className="flex w-full items-end gap-2 p-2 sm:p-3">
          {/* Left Actions */}
          <div className="flex pb-1">
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
          <div className="relative max-h-[200px] flex-1 overflow-y-auto">
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
              className="text-foreground placeholder:text-muted-foreground min-h-[36px] w-full resize-none border-0 bg-transparent py-2 text-[15px] wrap-break-word whitespace-pre-wrap shadow-none transition-[padding] duration-200 ease-in-out outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed"
              style={{ WebkitAppearance: 'none' }}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 pr-1 pb-1">
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

        {/* Bottom Bar for Model Selection */}
        <div className="flex items-center px-4 pb-2">
          <Select value={activeModelValue} onValueChange={handleModelChange}>
            <SelectTrigger className="text-muted-foreground hover:text-foreground h-auto w-fit gap-1.5 border-none bg-transparent! p-0 text-xs font-medium shadow-none focus:ring-0 [&>svg]:ml-0">
              <BrainCircuit className="h-3.5 w-3.5" />
              <SelectValue>
                {activeModelDef?.max ? (
                  <div className="flex items-center gap-1.5">
                    <span>{activeModelDef.label}</span>
                    {renderMaxBadge()}
                  </div>
                ) : (
                  <span>{activeModelDef?.label}</span>
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
        </div>
      </div>

      {/* Hidden File Input */}
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
