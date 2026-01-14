'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, X, Paperclip, Mic, Search, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MAX_CHARACTERS = 3000;

export function ChatInput({
  onSend,
  placeholder,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterCount = input.length;
  const remainingChars = MAX_CHARACTERS - characterCount;

  const handleSend = useCallback(async () => {
    if ((!input.trim() && images.length === 0) || disabled || isSending) return;

    setIsSending(true);
    const message = input.trim();
    const imageList = images.length > 0 ? images : undefined;

    setInput('');
    setImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await onSend(message, imageList);
    } finally {
      setIsSending(false);
    }
  }, [input, images, onSend, disabled, isSending]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    const remainingSlots = 5 - images.length;
    const filesToProcess = imageFiles.slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current && !disabled) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [disabled]);

  const hasContent = input.trim().length > 0 || images.length > 0;
  const canSend =
    hasContent && !disabled && !isSending && characterCount <= MAX_CHARACTERS;

  return (
    <div className="space-y-3">
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="border-border relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border"
            >
              <img
                src={img}
                alt={`Preview ${idx + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <button
                onClick={() => removeImage(idx)}
                className="bg-background hover:bg-muted absolute top-1 right-1 rounded-full p-1 shadow-sm transition-colors"
                type="button"
              >
                <X className="text-muted-foreground h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Large Input Container */}
      <div
        className={`relative flex items-center gap-3 rounded-xl border-2 transition-all ${
          isFocused
            ? 'border-primary bg-background shadow-sm'
            : 'border-input bg-background'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        {/* Text Input */}
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
          placeholder={placeholder || 'Summarize the latest...'}
          rows={1}
          disabled={disabled}
          maxLength={MAX_CHARACTERS}
          className="text-foreground placeholder:text-muted-foreground flex-1 resize-none border-0 bg-transparent px-4 py-3 text-base outline-none focus:ring-0 disabled:cursor-not-allowed"
          style={{ height: 'auto', minHeight: '56px' }}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Action Buttons and Character Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || images.length >= 5}
            className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Attach image"
          >
            <Paperclip className="h-4 w-4" />
            Attach
          </button>
          <button
            type="button"
            disabled={disabled}
            className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Voice message (coming soon)"
          >
            <Mic className="h-4 w-4" />
            Voice Message
          </button>
          <button
            type="button"
            disabled={disabled}
            className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Browse prompts"
          >
            <Search className="h-4 w-4" />
            Browse Prompts
          </button>
        </div>

        {/* Character Count */}
        <div
          className={`text-sm ${remainingChars < 100 ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          {characterCount} / {MAX_CHARACTERS.toLocaleString()}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        className="hidden"
        disabled={disabled || images.length >= 5}
      />

      {/* Disclaimer */}
      <p className="text-muted-foreground text-xs">
        RawEval may generate inaccurate information about people, places, or
        facts. Model: RawEval AI v1.0
      </p>
    </div>
  );
}
