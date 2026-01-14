'use client';

import { Badge } from '@raweval/ui/badge';
import {
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Sparkles,
  User,
  MessageCircle,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@raweval/utils';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  verified?: boolean;
  images?: string[];
  createdAt: Date;
  onFlag?: () => void;
  onApprove?: () => void;
  onRequestHuman?: () => void;
}

export function ChatMessage({
  role,
  content,
  verified,
  images,
  createdAt,
  onFlag,
  onApprove,
  onRequestHuman,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState(false);
  const [flagClicked, setFlagClicked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = () => {
    setHelpfulClicked(true);
    onApprove?.();
  };

  const handleFlag = () => {
    setFlagClicked(true);
    onFlag?.();
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[80%] flex-col gap-2 md:max-w-[75%]">
          {images && images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative h-32 w-32 overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-md"
                >
                  <img
                    src={img}
                    alt={`Upload ${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                </div>
              ))}
            </div>
          )}
          <div className="rounded-2xl rounded-tr-sm bg-primary px-5 py-3.5 text-primary-foreground shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[80%] gap-3 md:max-w-[75%]">
        {/* Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted shadow-sm">
          <Sparkles className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Message Content */}
        <div className="flex-1 space-y-2.5">
          <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-5 py-4 shadow-sm">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="text-xs font-semibold text-card-foreground">RawEval AI</span>
              {verified && (
                <Badge variant="secondary" className="h-5 gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-wrap break-words">
                {content}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs transition-colors',
                copied
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleApprove}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs transition-colors',
                helpfulClicked
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              {helpfulClicked ? 'Thank you!' : 'Helpful'}
            </button>
            <button
              onClick={handleFlag}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs transition-colors',
                flagClicked
                  ? 'bg-destructive/10 text-destructive'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              {flagClicked ? 'Flagged' : 'Flag'}
            </button>
            {onRequestHuman && (
              <button
                onClick={onRequestHuman}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs text-foreground transition-colors hover:bg-muted"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Talk to Human
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
