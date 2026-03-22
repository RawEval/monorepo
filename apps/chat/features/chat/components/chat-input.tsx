'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Loader2, Plus, BrainCircuit, Globe, ArrowUp } from 'lucide-react';
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
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@raweval/ui/select';

interface ChatInputProps {
  onSend: (message: string, images?: string[], files?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MAX_CHARACTERS = 10000;
const MAX_IMAGES = 5;
const MAX_FILES = 5;
const CHAR_WARNING_THRESHOLD = 9000;

interface ModelOption {
  label: string;
  value: string;
  provider: string;
  model: string;
  max?: boolean;
  description: string;
  supportsVision?: boolean;
  supportsWebSearch?: boolean;
  supportsTools?: boolean;
}

/** Fallback model list — only used when /chat/models API is unreachable. */
const FALLBACK_MODELS: ModelOption[] = [
  { label: 'GPT-4.1', value: 'openai:gpt-4.1', provider: 'openai', model: 'gpt-4.1', description: 'Latest flagship — 1M context', supportsVision: true, supportsWebSearch: true, supportsTools: true },
  { label: 'GPT-4o Mini', value: 'openai:gpt-4o-mini', provider: 'openai', model: 'gpt-4o-mini', description: 'Fast, affordable', supportsVision: true, supportsWebSearch: true, supportsTools: true },
  { label: 'Claude Sonnet 4', value: 'anthropic:anthropic/claude-sonnet-4-20250514', provider: 'anthropic', model: 'anthropic/claude-sonnet-4-20250514', description: 'Best for coding', supportsVision: true, supportsWebSearch: false, supportsTools: true },
  { label: 'Gemini 2.5 Flash', value: 'google:gemini/gemini-2.5-flash', provider: 'google', model: 'gemini/gemini-2.5-flash', description: 'Fast reasoning, 1M context', supportsVision: true, supportsWebSearch: true, supportsTools: true },
  { label: 'DeepSeek V3', value: 'deepseek:deepseek/deepseek-chat', provider: 'deepseek', model: 'deepseek/deepseek-chat', description: 'Ultra cheap open model', supportsVision: false, supportsWebSearch: false, supportsTools: true },
];

/** Provider display names and order for the model selector */
const PROVIDER_META: Record<string, { label: string; order: number }> = {
  openai: { label: 'OpenAI', order: 1 },
  anthropic: { label: 'Anthropic', order: 2 },
  google: { label: 'Google', order: 3 },
  deepseek: { label: 'DeepSeek', order: 4 },
  mistral: { label: 'Mistral', order: 5 },
  groq: { label: 'Groq', order: 6 },
  perplexity: { label: 'Perplexity', order: 7 },
  cohere: { label: 'Cohere', order: 8 },
  openrouter: { label: 'OpenRouter', order: 9 },
};

/** Group models by provider, sorted by provider order */
function groupModelsByProvider(models: ModelOption[]): { provider: string; label: string; models: ModelOption[] }[] {
  const groups: Record<string, ModelOption[]> = {};
  for (const m of models) {
    const key = m.provider;
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  return Object.entries(groups)
    .map(([provider, models]) => ({
      provider,
      label: PROVIDER_META[provider]?.label || provider,
      models,
    }))
    .sort((a, b) => (PROVIDER_META[a.provider]?.order ?? 99) - (PROVIDER_META[b.provider]?.order ?? 99));
}

/**
 * Parse the backend /chat/models response into a flat model list.
 * Backend returns: { models_by_provider: {...}, models: [{model, display_name, provider, capabilities}] }
 */
function parseModelsResponse(data: unknown): ModelOption[] | null {
  if (!data || typeof data !== 'object') return null;

  // Format 1: Array of model objects (pre-parsed by subscription endpoint)
  if (Array.isArray(data) && data.length > 0) {
    return data.map((m: Record<string, unknown>) => ({
      label: (m.display_name || m.label || m.model || 'Unknown') as string,
      value: `${m.provider || 'unknown'}:${m.model}`,
      provider: (m.provider || 'unknown') as string,
      model: (m.model || '') as string,
      max: Boolean(m.max),
      description: (m.description || '') as string,
      supportsVision: Boolean((m.capabilities as Record<string, unknown>)?.supports_vision ?? m.supports_vision),
      supportsWebSearch: Boolean((m.capabilities as Record<string, unknown>)?.supports_web_search ?? m.supports_web_search),
      supportsTools: Boolean((m.capabilities as Record<string, unknown>)?.supports_tools ?? m.supports_tools),
    }));
  }

  const resp = data as Record<string, unknown>;

  // Format 2 (preferred): { models: [{model, display_name, provider, description, capabilities}] }
  const modelsArray = resp.models as Record<string, unknown>[] | undefined;
  if (Array.isArray(modelsArray) && modelsArray.length > 0) {
    return modelsArray.map((m) => {
      const caps = (m.capabilities || {}) as Record<string, unknown>;
      return {
        label: (m.display_name || m.model || 'Unknown') as string,
        value: `${m.provider || 'unknown'}:${m.model}`,
        provider: (m.provider || 'unknown') as string,
        model: (m.model || '') as string,
        description: (m.description || '') as string,
        supportsVision: Boolean(caps.supports_vision),
        supportsWebSearch: Boolean(caps.supports_web_search),
        supportsTools: Boolean(caps.supports_tools),
      };
    });
  }

  // Format 3 (legacy): { models_by_provider: { openai: ["gpt-4o", ...] } }
  const byProvider = resp.models_by_provider as Record<string, string[]> | undefined;
  if (byProvider && typeof byProvider === 'object') {
    const result: ModelOption[] = [];
    for (const [provider, models] of Object.entries(byProvider)) {
      if (!Array.isArray(models)) continue;
      for (const model of models) {
        result.push({
          label: model,
          value: `${provider}:${model}`,
          provider,
          model,
          description: provider,
        });
      }
    }
    return result.length > 0 ? result : null;
  }

  return null;
}

export function ChatInput({
  onSend,
  placeholder = 'Message RawEval...',
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
    const parsed = parseModelsResponse(modelsResult);
    return parsed ?? FALLBACK_MODELS;
  }, [modelsResult]);

  const groupedModels = useMemo(() => groupModelsByProvider(availableModels), [availableModels]);

  // Current model's capabilities
  const currentModelOption = useMemo(() => {
    return availableModels.find(
      (m) => m.provider === selectedModel?.provider && m.model === selectedModel?.model
    );
  }, [availableModels, selectedModel]);

  const modelSupportsSearch = currentModelOption?.supportsWebSearch ?? false;

  // Auto-disable web search when switching to a model that doesn't support it
  useEffect(() => {
    if (webSearchEnabled && !modelSupportsSearch) {
      setWebSearchEnabled(false);
    }
  }, [modelSupportsSearch, webSearchEnabled, setWebSearchEnabled]);

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
      setSelectedModel({ provider: modelDef.provider as Provider, model: modelDef.model });
    }
  };

  const activeModelDef =
    availableModels.find((m) => m.value === activeModelValue) ||
    availableModels[0];

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const characterCount = input.length;
  const isNearLimit = characterCount >= CHAR_WARNING_THRESHOLD;
  const isOverLimit = characterCount > MAX_CHARACTERS;
  const canSend =
    (input.trim().length > 0 || attachments.length > 0) &&
    !disabled &&
    !isSending &&
    !isOverLimit;

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
    resetTextareaHeight();

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

  /** Smart paste: auto-wrap pasted code in fences if it looks like code */
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text/plain');
    if (!pastedText) return;

    // Heuristics: detect if pasted text is likely code
    const lines = pastedText.split('\n');
    const isMultiline = lines.length >= 3;
    const alreadyHasFences = /^```/.test(pastedText.trim());
    if (alreadyHasFences) return; // user is pasting markdown code block, leave it alone

    if (!isMultiline) return; // short text, no wrapping needed

    const codeIndicators = [
      // Indentation patterns
      /^[ \t]{2,}/m,
      // Common syntax: braces, semicolons, arrows, imports
      /[{};]$/m,
      /^(import|export|from|const|let|var|function|class|def|fn|pub|use|package|#include)\s/m,
      /=>/,
      // HTML/JSX tags
      /<\/?[a-zA-Z][a-zA-Z0-9]*[\s>]/,
      // Common operators that rarely appear in prose
      /[!=]==?/,
      /\|\|/,
      /&&/,
      // Python-ish
      /:\s*$/m,
      // Shell
      /^\s*\$/m,
    ];

    const matchCount = codeIndicators.filter((r) => r.test(pastedText)).length;
    if (matchCount < 2) return; // not confident it's code

    // Try to detect the language
    const langHints: [RegExp, string][] = [
      [/^(import|export|const|let|var|function)\s/m, 'javascript'],
      [/^(import|from)\s.*\nimport/m, 'python'],
      [/^def\s\w+\(.*\):/m, 'python'],
      [/^(package|func)\s/m, 'go'],
      [/^(use|fn|pub|mod|impl)\s/m, 'rust'],
      [/^#include\s/m, 'cpp'],
      [/<\/?[A-Z][a-zA-Z]*[\s/>]/m, 'tsx'],
      [/className=/m, 'tsx'],
      [/^\s*SELECT\s|^\s*CREATE\s|^\s*INSERT\s/im, 'sql'],
      [/^\s*\$/m, 'bash'],
    ];

    let detectedLang = '';
    for (const [re, lang] of langHints) {
      if (re.test(pastedText)) {
        detectedLang = lang;
        break;
      }
    }

    // Prevent default and insert wrapped content
    e.preventDefault();
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = input.slice(0, start);
    const after = input.slice(end);

    // Only add newline before fence if there's content before cursor
    const prefix = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
    const suffix = after.length > 0 && !after.startsWith('\n') ? '\n' : '';
    const wrapped = `${prefix}\`\`\`${detectedLang}\n${pastedText}\n\`\`\`${suffix}`;

    const newValue = before + wrapped + after;
    if (newValue.length <= MAX_CHARACTERS) {
      setInput(newValue);
      // Set cursor after the closing fence
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          const cursorPos = (before + wrapped).length;
          textareaRef.current.selectionStart = cursorPos;
          textareaRef.current.selectionEnd = cursorPos;
          adjustTextareaHeight();
        }
      });
    }
  }, [input]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileList = Array.from(files);
    const imageFiles = fileList.filter((file) => file.type.startsWith('image/'));
    const otherFiles = fileList.filter((file) => !file.type.startsWith('image/'));

    const remainingSlots = MAX_FILES - attachments.filter((a) => a.type === 'file').length;
    const imageSlots = MAX_IMAGES - attachments.filter((a) => a.type === 'image').length;

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

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const scrollHeight = el.scrollHeight;
    const minH = 44;
    const maxH = 200;
    el.style.height = `${Math.max(minH, Math.min(scrollHeight, maxH))}px`;
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
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [disabled]);

  const fileCount = attachments.filter((a) => a.type === 'file').length;
  const imageCount = attachments.filter((a) => a.type === 'image').length;
  const canAddFiles = fileCount + imageCount < MAX_FILES + MAX_IMAGES;



  return (
    <div className="flex w-full flex-col gap-2">
      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="border-primary bg-accent rounded-2xl border-2 border-dashed p-8 text-center">
            <p className="text-foreground text-lg font-medium">
              Drop files here to attach
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Images, PDFs, CSVs, and documents
            </p>
          </div>
        </div>
      )}

      {/* Input Container */}
      <div
        className={cn(
          'bg-muted/30 focus-within:bg-background border-border/80 flex cursor-text flex-col rounded-2xl border transition-all duration-200 focus-within:border-border focus-within:shadow-lg sm:rounded-[24px]',
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

        {/* Textarea Row */}
        <div className="flex w-full items-end gap-1.5 p-2 sm:gap-2 sm:p-3">
          {/* Attach button */}
          <div className="flex pb-0.5 sm:pb-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || !canAddFiles}
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 disabled:opacity-40"
              title="Attach files (images, PDFs, documents)"
              aria-label="Attach files"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Text Area */}
          <div className="relative max-h-[200px] flex-1 overflow-y-auto">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={placeholder}
              rows={1}
              disabled={disabled}
              className="text-foreground placeholder:text-muted-foreground/60 min-h-[44px] w-full resize-none border-0 bg-transparent py-2.5 text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap shadow-none outline-none transition-[padding] duration-200 ease-in-out focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed"
              style={{ WebkitAppearance: 'none' }}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 pb-0.5 sm:gap-1.5 sm:pb-1">
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecordingComplete}
              disabled={disabled}
            />

            <button
              onClick={handleSend}
              disabled={!canSend || isSending}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200',
                canSend
                  ? 'bg-foreground text-background hover:bg-foreground/90 active:scale-95 shadow-sm'
                  : 'bg-muted-foreground/15 text-muted-foreground/40 cursor-default'
              )}
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom Bar - Model Selection, Web Search, Character Count */}
        <div className="flex items-center justify-between px-3 pb-2 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Select value={activeModelValue} onValueChange={handleModelChange}>
              <SelectTrigger className="text-muted-foreground hover:text-foreground h-auto w-fit max-w-[55%] gap-1 border-none bg-transparent! p-0 text-[11px] font-medium shadow-none focus:ring-0 sm:max-w-none sm:gap-1.5 sm:text-xs [&>svg]:ml-0 [&>svg]:h-3 [&>svg]:w-3 sm:[&>svg]:h-3.5 sm:[&>svg]:w-3.5">
                <BrainCircuit className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                <SelectValue>
                  <span className="truncate">{activeModelDef?.label}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                {groupedModels.map((group, gi) => (
                  <SelectGroup key={group.provider}>
                    {gi > 0 && <SelectSeparator />}
                    <SelectLabel className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
                      {group.label}
                    </SelectLabel>
                    {group.models.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-0">
                            <span className="text-[13px]">{model.label}</span>
                            <span className="text-muted-foreground text-[10px] font-normal leading-tight">
                              {model.description}
                            </span>
                          </div>
                          <div className="ml-auto flex shrink-0 items-center gap-0.5">
                            {model.supportsWebSearch && (
                              <span className="text-[8px] rounded bg-blue-500/10 px-1 py-px text-blue-600 dark:text-blue-400">search</span>
                            )}
                            {model.supportsVision && (
                              <span className="text-[8px] rounded bg-purple-500/10 px-1 py-px text-purple-600 dark:text-purple-400">vision</span>
                            )}
                            {model.supportsTools && !model.supportsVision && !model.supportsWebSearch && (
                              <span className="text-[8px] rounded bg-green-500/10 px-1 py-px text-green-600 dark:text-green-400">tools</span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            <button
              type="button"
              onClick={() => modelSupportsSearch && setWebSearchEnabled(!webSearchEnabled)}
              disabled={!modelSupportsSearch}
              className={cn(
                'flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium transition-all duration-150 outline-none sm:gap-1.5 sm:px-2.5 sm:text-xs',
                !modelSupportsSearch
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : webSearchEnabled
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={!modelSupportsSearch ? 'This model does not support web search' : webSearchEnabled ? 'Web Search enabled' : 'Enable Web Search'}
              aria-label="Toggle Web Search"
            >
              <Globe className={cn('h-3 w-3 sm:h-3.5 sm:w-3.5', webSearchEnabled && 'opacity-90')} />
              <span>Search</span>
            </button>
          </div>

          {/* Character count + keyboard hint */}
          <div className="flex items-center gap-2">
            {isNearLimit && (
              <span className={cn(
                'text-[10px] font-mono tabular-nums',
                isOverLimit ? 'text-destructive font-semibold' : 'text-muted-foreground'
              )}>
                {characterCount.toLocaleString()}/{MAX_CHARACTERS.toLocaleString()}
              </span>
            )}
            <span className="hidden text-[10px] text-muted-foreground/50 sm:block">
              <kbd className="rounded border border-border/50 bg-muted/50 px-1 py-0.5 font-mono text-[9px]">Enter</kbd> to send
            </span>
          </div>
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
