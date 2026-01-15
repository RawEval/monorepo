'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  ThumbsUp,
  XCircle,
  Copy,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import { cn } from '@raweval/utils';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  verified?: boolean;
  images?: string[];
  createdAt: Date;
  onWrong?: () => void;
  onApprove?: () => void;
  onRequestHuman?: () => void;
}

export function ChatMessage({
  role,
  content,
  verified,
  images,
  onWrong,
  onApprove,
  onRequestHuman,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState(false);
  const [wrongClicked, setWrongClicked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = () => {
    setHelpfulClicked(true);
    onApprove?.();
  };

  const handleWrong = () => {
    setWrongClicked(true);
    onWrong?.();
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[90%] sm:max-w-[85%] md:max-w-[80%] flex-col gap-2">
          {/* User Images */}
          {images && images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative h-24 w-24 sm:h-32 sm:w-32 overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-md shrink-0"
                >
                  <img
                    src={img}
                    alt={`Upload ${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}

          {/* User Message */}
          {content && (
            <div className="rounded-2xl rounded-tr-sm bg-primary px-3 sm:px-4 py-2.5 sm:py-3 text-primary-foreground shadow-sm">
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {content}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[90%] sm:max-w-[85%] md:max-w-[80%] gap-2 sm:gap-3">
        {/* Assistant Avatar */}
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-muted shadow-sm">
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </div>

        {/* Message Content */}
        <div className="flex-1 space-y-2 sm:space-y-2.5 min-w-0">
          <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-3 sm:px-5 py-3 sm:py-4 shadow-sm">
            {/* Header */}
            <div className="mb-2.5 flex items-center gap-2">
              <span className="text-xs font-semibold text-card-foreground">
                RawEval AI
              </span>
              {verified && (
                <Badge variant="secondary" className="h-5 gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-card-foreground">
                {content}
              </p>
            </div>
          </div>

          {/* Action Buttons - Clean row like ChatGPT, Wrong is priority */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={cn(
                'h-8 gap-1.5 rounded-lg px-2.5 text-xs transition-colors shrink-0 touch-manipulation',
                copied
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted active:bg-muted'
              )}
              aria-label="Copy message"
            >
              <Copy className="h-3.5 w-3.5 shrink-0" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleApprove}
              className={cn(
                'h-8 gap-1.5 rounded-lg px-2.5 text-xs transition-colors shrink-0 touch-manipulation',
                helpfulClicked
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted active:bg-muted'
              )}
              aria-label="Mark as helpful"
            >
              <ThumbsUp className="h-3.5 w-3.5 shrink-0" />
            </Button>
            {/* Wrong button - Priority, more prominent */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWrong}
              className={cn(
                'h-8 gap-1.5 rounded-lg px-2.5 text-xs transition-colors shrink-0 touch-manipulation font-medium',
                wrongClicked
                  ? 'bg-destructive/10 text-destructive border border-destructive/20'
                  : 'text-muted-foreground hover:bg-destructive/5 hover:text-destructive active:bg-destructive/10 active:text-destructive'
              )}
              aria-label="Mark as wrong"
            >
              <XCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline">{wrongClicked ? 'Marked' : 'Wrong'}</span>
            </Button>
            {onRequestHuman && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRequestHuman}
                className="h-8 gap-1.5 rounded-lg px-2.5 text-xs text-foreground transition-colors hover:bg-muted active:bg-muted shrink-0 touch-manipulation hidden sm:flex"
                aria-label="Talk to human"
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Human</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
