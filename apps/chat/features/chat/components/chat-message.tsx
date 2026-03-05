'use client';

import { useState } from 'react';
import { XCircle, Copy, Loader2, Check } from 'lucide-react';
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
  const [codeCopied, setCodeCopied] = useState<string | null>(null);

  const isActuallyFailed = isFailed || wrongClicked;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(id);
    setTimeout(() => setCodeCopied(null), 2000);
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
          {images && images.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group border-border relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32"
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

          {content && (
            <div className="bg-muted text-foreground rounded-2xl px-4 py-2.5 shadow-none drop-shadow sm:px-5 sm:py-3">
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

  const hasContent = content.length > 0;

  return (
    <div className="flex justify-start">
      <div className="flex w-full max-w-full gap-2 sm:gap-3">
        <div className="min-w-0 flex-1 space-y-2 pt-1 sm:space-y-2.5">
          <div className="px-0 sm:px-1">
            {/* Thinking indicator */}
            {isStreaming && !hasContent && (
              <div className="flex items-center gap-1.5 py-2">
                <div className="thinking-dot bg-foreground/40 h-1.5 w-1.5 rounded-full" />
                <div
                  className="thinking-dot bg-foreground/40 h-1.5 w-1.5 rounded-full"
                  style={{ animationDelay: '160ms' }}
                />
                <div
                  className="thinking-dot bg-foreground/40 h-1.5 w-1.5 rounded-full"
                  style={{ animationDelay: '320ms' }}
                />
              </div>
            )}

            {hasContent && (
              <div
                className={cn(
                  'prose prose-sm sm:prose-base dark:prose-invert text-card-foreground max-w-none',
                  'prose-pre:my-3 prose-pre:p-0 prose-pre:bg-transparent',
                  'prose-code:before:content-none prose-code:after:content-none',
                  'prose-img:rounded-xl prose-img:max-h-80',
                  'prose-table:text-sm prose-table:overflow-x-auto',
                  isStreaming && 'streaming-prose'
                )}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }: any) {
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
                      const blockId = `${language}-${codeString.slice(0, 20)}`;

                      return (
                        <div className="code-block border-border relative my-3 overflow-hidden rounded-xl border bg-[#1E1E1E] shadow-sm sm:my-4">
                          <div className="flex items-center justify-between bg-[#2D2D2D] px-3 py-1.5 sm:px-4 sm:py-2">
                            <span className="text-[11px] font-medium text-gray-400 sm:text-xs">
                              {language || 'code'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 gap-1 rounded-md px-2 text-[10px] text-gray-300 hover:bg-white/10 hover:text-white sm:gap-1.5"
                              onClick={() =>
                                handleCopyCode(codeString, blockId)
                              }
                            >
                              {codeCopied === blockId ? (
                                <Check className="h-3 w-3 text-green-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span className="hidden xs:inline">
                                {codeCopied === blockId ? 'Copied' : 'Copy'}
                              </span>
                            </Button>
                          </div>
                          <div className="overflow-x-auto p-3 text-[12px] leading-relaxed sm:p-4 sm:text-[13px]">
                            <SyntaxHighlighter
                              {...props}
                              style={vscDarkPlus}
                              language={language}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                padding: 0,
                                background: 'transparent',
                                fontSize: 'inherit',
                              }}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      );
                    },
                    p: ({ children }) => (
                      <p className="mb-3 text-[15px] leading-relaxed last:mb-0 sm:mb-4">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-3 list-disc pl-5 last:mb-0 sm:mb-4 sm:pl-6">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-3 list-decimal pl-5 last:mb-0 sm:mb-4 sm:pl-6">
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
                    table: ({ children }) => (
                      <div className="-mx-1 overflow-x-auto sm:mx-0">
                        <table className="min-w-full">{children}</table>
                      </div>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action buttons — always visible on mobile, hover on desktop */}
          {!isStreaming && hasContent && (
            <div className="flex flex-wrap items-center gap-1 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:gap-1.5">
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
                {copied ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="text-[11px]">
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </Button>
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
                <span className="text-[11px]">
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
