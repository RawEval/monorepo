'use client';

import { useState } from 'react';
import { XCircle, Copy, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@raweval/ui/button';
import { cn } from '@raweval/utils';
import { format } from 'date-fns';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  verified?: boolean;
  images?: string[];
  createdAt: number | Date;
  /** Whether the failure-analysis API call is currently in flight */
  isMarkingWrong?: boolean;
  isFailed?: boolean;
  isStreaming?: boolean;
  onWrong?: () => void;
}

export function ChatMessage({
  role,
  content,
  images,
  createdAt,
  isMarkingWrong = false,
  isFailed = false,
  isStreaming = false,
  onWrong,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [wrongClicked, setWrongClicked] = useState(false);

  const isActuallyFailed = isFailed || wrongClicked;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWrong = () => {
    if (isMarkingWrong || isActuallyFailed) return;
    setWrongClicked(true);
    onWrong?.();
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[90%] flex-col gap-2 sm:max-w-[85%] md:max-w-[80%]">
          {/* User Images */}
          {images && images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group border-border relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md sm:h-32 sm:w-32"
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
            <div className="bg-muted text-foreground backdrop: rounded-2xl px-5 py-2.5 shadow-none drop-shadow sm:py-3">
              <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap">
                {content}
              </p>
            </div>
          )}

          <div className="text-muted-foreground mr-1 text-right text-[11px] font-medium opacity-50">
            {format(new Date(createdAt), 'MMM d, h:mm a')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[90%] gap-2 sm:max-w-[85%] sm:gap-3 md:max-w-full">
        {/* Message Content */}
        <div className="min-w-0 flex-1 space-y-2 pt-1 sm:space-y-2.5">
          <div className="px-1 sm:px-2">
            {/* Content with Markdown */}
            <div className="prose prose-sm sm:prose-base dark:prose-invert text-card-foreground max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    const isInline = inline || !match;

                    if (isInline) {
                      return (
                        <code
                          className="bg-muted text-foreground rounded-md px-1.5 py-0.5 font-mono text-[0.85em]"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    const codeString = String(children).replace(/\n$/, '');

                    return (
                      <div className="border-border relative my-4 overflow-hidden rounded-xl border bg-[#1E1E1E] shadow-sm">
                        <div className="flex items-center justify-between bg-[#2D2D2D] px-4 py-2">
                          <span className="text-xs font-medium text-gray-300">
                            {language || 'code'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1.5 rounded-md px-2 text-[10px] text-gray-300 hover:bg-white/10 hover:text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(codeString);
                              // Could add a small local state just for this button, but reusing top level copied is okay for simple UI
                            }}
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </Button>
                        </div>
                        <div className="overflow-x-auto p-4 text-[13px] leading-relaxed">
                          <SyntaxHighlighter
                            {...props}
                            style={vscDarkPlus}
                            language={language}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              padding: 0,
                              background: 'transparent',
                            }}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    );
                  },
                  p: ({ children }) => (
                    <p className="mb-4 text-[15px] leading-relaxed last:mb-0">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-4 list-disc pl-6 last:mb-0">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 list-decimal pl-6 last:mb-0">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="mb-1 text-[15px]">{children}</li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {content + (isStreaming ? ' \u258E' : '')}
              </ReactMarkdown>
            </div>
          </div>

          {/* Action Buttons - Clean row like ChatGPT, Wrong is priority */}
          {!isStreaming && (
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className={cn(
                  'h-8 shrink-0 touch-manipulation gap-1.5 rounded-lg px-2.5 text-xs transition-colors',
                  copied
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted active:bg-muted'
                )}
                aria-label="Copy message"
              >
                <Copy className="h-3.5 w-3.5 shrink-0" />
              </Button>
              {/* Wrong button — priority action, sends to failure analysis pipeline */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWrong}
                disabled={isMarkingWrong || isActuallyFailed}
                className={cn(
                  'h-8 shrink-0 touch-manipulation gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors',
                  isActuallyFailed
                    ? 'bg-destructive/10 text-destructive border-destructive/20 border'
                    : 'text-muted-foreground hover:bg-destructive/5 hover:text-destructive active:bg-destructive/10 active:text-destructive'
                )}
                aria-label="Mark as wrong"
              >
                {isMarkingWrong ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="xs:inline hidden">
                  {isMarkingWrong
                    ? 'Marking…'
                    : isActuallyFailed
                      ? 'Marked'
                      : 'Wrong'}
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
