'use client';

import { useState } from 'react';
import { XCircle, Copy, Loader2, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
                  className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32"
                  style={{ border: '1px solid var(--color-border)' }}
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
            <div
              className="msg-user px-4 py-2.5 sm:px-5 sm:py-3"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap">
                {content}
              </p>
            </div>
          )}

          <div
            className="mr-1 text-right text-[11px] opacity-50"
            style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}
          >
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
                <div className="thinking-dot h-1.5 w-1.5 rounded-full" />
                <div
                  className="thinking-dot h-1.5 w-1.5 rounded-full"
                  style={{ animationDelay: '160ms' }}
                />
                <div
                  className="thinking-dot h-1.5 w-1.5 rounded-full"
                  style={{ animationDelay: '320ms' }}
                />
              </div>
            )}

            {hasContent && (
              <div
                className={cn(
                  'prose prose-sm sm:prose-base max-w-none',
                  'prose-pre:my-3 prose-pre:p-0 prose-pre:bg-transparent',
                  'prose-code:before:content-none prose-code:after:content-none',
                  'prose-img:rounded-xl prose-img:max-h-80',
                  'prose-table:text-sm prose-table:overflow-x-auto',
                  isStreaming && 'streaming-prose'
                )}
                style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
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
                            style={{
                              background: 'var(--color-bg-muted)',
                              color: 'var(--color-text-primary)',
                              borderRadius: 'var(--radius-md)',
                              padding: '1px 6px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.85em',
                            }}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      const codeString = String(children).replace(/\n$/, '');
                      const blockId = `${language}-${codeString.slice(0, 20)}`;

                      return (
                        <div
                          className="code-block relative my-3 overflow-hidden shadow-sm sm:my-4"
                          style={{
                            background: 'var(--color-bg-inverse)',
                            border: '1px solid rgba(245,242,236,0.08)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          <div
                            className="flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2"
                            style={{ background: 'rgba(245,242,236,0.04)', borderBottom: '1px solid rgba(245,242,236,0.06)' }}
                          >
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                letterSpacing: 'var(--tracking-wide)',
                                color: 'rgba(245,242,236,0.35)',
                              }}
                            >
                              {language || 'code'}
                            </span>
                            <button
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                letterSpacing: 'var(--tracking-wide)',
                                color: codeCopied === blockId ? 'var(--color-success)' : 'rgba(245,242,236,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                transition: 'color 0.15s ease',
                              }}
                              onClick={() => handleCopyCode(codeString, blockId)}
                            >
                              {codeCopied === blockId ? (
                                <Check style={{ width: '12px', height: '12px' }} />
                              ) : (
                                <Copy style={{ width: '12px', height: '12px' }} />
                              )}
                              {codeCopied === blockId ? 'Copied' : 'Copy'}
                            </button>
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
                        style={{ color: 'var(--color-signal)', textDecoration: 'underline', textUnderlineOffset: '4px' }}
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

          {/* Action buttons */}
          {!isStreaming && hasContent && (
            <div className="flex flex-wrap items-center gap-1 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:gap-1.5">
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? 'var(--color-success-subtle)' : 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: copied ? 'var(--color-success)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: 'var(--tracking-wide)',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
                aria-label="Copy message"
              >
                {copied ? (
                  <Check style={{ width: '12px', height: '12px' }} />
                ) : (
                  <Copy style={{ width: '12px', height: '12px' }} />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={handleWrong}
                disabled={isMarkingWrong || isActuallyFailed}
                style={{
                  background: isActuallyFailed ? 'var(--color-signal-subtle)' : 'transparent',
                  border: `1px solid ${isActuallyFailed ? 'var(--color-signal-border)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: isActuallyFailed ? 'var(--color-signal)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: 'var(--tracking-wide)',
                  padding: '5px 10px',
                  cursor: isMarkingWrong || isActuallyFailed ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                  opacity: isMarkingWrong ? 0.6 : 1,
                }}
                aria-label="Mark as wrong"
              >
                {isMarkingWrong ? (
                  <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <XCircle style={{ width: '12px', height: '12px' }} />
                )}
                {isMarkingWrong ? 'Marking…' : isActuallyFailed ? 'Marked' : 'Wrong'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
