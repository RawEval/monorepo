'use client';

import { useState, memo, useCallback, useMemo } from 'react';
import { XCircle, Copy, Loader2, Check, Sparkles, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@raweval/utils';
import { format } from 'date-fns';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Detect if content has any markdown features worth rendering */
function hasMarkdownContent(text: string): boolean {
  // Code fences
  if (/```[\s\S]*?```/.test(text)) return true;
  if (/`[^`\n]+`/.test(text)) return true;
  // Headers
  if (/^#{1,6}\s/m.test(text)) return true;
  // Bold/italic
  if (/\*\*[^*]+\*\*/.test(text)) return true;
  if (/\*[^*]+\*/.test(text)) return true;
  // Links
  if (/\[.+?\]\(.+?\)/.test(text)) return true;
  // Lists
  if (/^[\s]*[-*+]\s/m.test(text)) return true;
  if (/^[\s]*\d+\.\s/m.test(text)) return true;
  // Tables
  if (/\|.*\|/.test(text) && /---/.test(text)) return true;
  // Math
  if (/\$\$.+?\$\$/s.test(text)) return true;
  if (/\$[^$\n]+\$/.test(text)) return true;
  return false;
}

/** Detect if text has incomplete code fence at end (streaming) */
function hasIncompleteFence(text: string): boolean {
  const fences = text.match(/```/g);
  return fences !== null && fences.length % 2 !== 0;
}

// ─── Types ───────────────────────────────────────────────────────────────────

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
  isLast?: boolean;
  onWrong?: () => void;
  onRegenerate?: () => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const ChatMessage = memo(function ChatMessage({
  role,
  content,
  images,
  createdAt,
  isMarkingWrong = false,
  isFailed = false,
  isStreaming = false,
  isLast = false,
  onWrong,
  onRegenerate,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [wrongClicked, setWrongClicked] = useState(false);
  const [codeCopied, setCodeCopied] = useState<string | null>(null);

  const isActuallyFailed = isFailed || wrongClicked;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  const handleCopyCode = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(id);
    setTimeout(() => setCodeCopied(null), 2000);
  }, []);

  const handleWrong = useCallback(() => {
    if (isMarkingWrong || isActuallyFailed) return;
    setWrongClicked(true);
    onWrong?.();
  }, [isMarkingWrong, isActuallyFailed, onWrong]);

  const formattedTime = useMemo(
    () => format(new Date(createdAt), 'MMM d, h:mm a'),
    [createdAt]
  );

  // For user messages, detect if content has markdown features
  const userHasRichContent = useMemo(
    () => role === 'user' && hasMarkdownContent(content),
    [role, content]
  );

  // For streaming, if there's an incomplete code fence, close it for rendering
  const renderContent = useMemo(() => {
    if (!isStreaming) return content;
    if (hasIncompleteFence(content)) {
      return content + '\n```';
    }
    return content;
  }, [content, isStreaming]);

  // ── Shared markdown components ─────────────────────────────────────────────
  // We create these once so both user & assistant renderers share the same config
  const codeRenderer = useCallback(
    ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const isInline = inline || !match;

      if (isInline) {
        return (
          <code
            className={cn(
              'rounded-[4px] px-1.5 py-0.5 text-[0.85em]',
              role === 'user'
                ? 'bg-white/10 text-white/90'
                : ''
            )}
            style={role === 'assistant' ? {
              background: 'var(--color-bg-muted)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
            } : {
              fontFamily: 'var(--font-mono)',
            }}
            {...props}
          >
            {children}
          </code>
        );
      }

      const codeString = String(children).replace(/\n$/, '');
      const blockId = `${language}-${codeString.slice(0, 30)}-${codeString.length}`;
      const isCopied = codeCopied === blockId;
      const lineCount = codeString.split('\n').length;

      return (
        <div
          className={cn(
            'code-block group/code relative my-3 overflow-hidden rounded-lg sm:my-4',
            role === 'user'
              ? 'ring-1 ring-white/10'
              : 'shadow-sm ring-1 ring-white/[0.06]'
          )}
          style={{ background: role === 'user' ? 'rgba(0,0,0,0.4)' : 'var(--color-bg-inverse)' }}
        >
          {/* Code header */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{
              background: role === 'user' ? 'rgba(255,255,255,0.04)' : 'rgba(245,242,236,0.04)',
              borderBottom: `1px solid ${role === 'user' ? 'rgba(255,255,255,0.06)' : 'rgba(245,242,236,0.06)'}`,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{
                  color: role === 'user' ? 'rgba(255,255,255,0.4)' : 'rgba(245,242,236,0.4)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {language || 'code'}
              </span>
              {lineCount > 1 && (
                <span
                  className="text-[9px] tabular-nums"
                  style={{ color: role === 'user' ? 'rgba(255,255,255,0.25)' : 'rgba(245,242,236,0.25)' }}
                >
                  {lineCount} lines
                </span>
              )}
            </div>
            <button
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium tracking-wide transition-all duration-150',
                isCopied
                  ? 'text-[var(--color-success)]'
                  : role === 'user'
                    ? 'text-white/40 hover:text-white/70 hover:bg-white/[0.08]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
              )}
              style={{ fontFamily: 'var(--font-mono)' }}
              onClick={(e) => {
                e.stopPropagation();
                handleCopyCode(codeString, blockId);
              }}
            >
              {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          {/* Code body */}
          <div className="overflow-x-auto p-4 text-[12.5px] leading-[1.6] sm:text-[13px]">
            <SyntaxHighlighter
              {...props}
              style={vscDarkPlus}
              language={language || 'text'}
              PreTag="div"
              showLineNumbers={lineCount > 5}
              lineNumberStyle={{
                color: role === 'user' ? 'rgba(255,255,255,0.15)' : 'rgba(245,242,236,0.15)',
                fontSize: '11px',
                paddingRight: '12px',
                userSelect: 'none',
                minWidth: '2em',
              }}
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
    [codeCopied, handleCopyCode, role]
  );

  // ── User message ──────────────────────────────────────────────────────────
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[90%] flex-col gap-1.5 sm:max-w-[85%] md:max-w-[75%]">
          {/* Image attachments */}
          {images && images.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/50 shadow-sm transition-shadow hover:shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32"
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
              {userHasRichContent ? (
                /* ── Rich user message: render markdown with code highlighting ── */
                <div
                  className={cn(
                    'user-rich-content prose prose-sm max-w-none',
                    'prose-invert',
                    'prose-pre:my-2 prose-pre:p-0 prose-pre:bg-transparent',
                    'prose-code:before:content-none prose-code:after:content-none',
                    'prose-headings:text-white/90 prose-headings:font-semibold',
                    'prose-strong:text-white/90',
                    'prose-p:text-[15px] prose-p:leading-[1.65]',
                  )}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code: codeRenderer,
                      p: ({ children }) => (
                        <p className="mb-2 text-[15px] leading-[1.65] last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 list-decimal pl-5 last:mb-0">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-[15px] leading-[1.6]">{children}</li>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:opacity-80"
                        >
                          {children}
                        </a>
                      ),
                      h1: ({ children }) => <h1 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{children}</h1>,
                      h2: ({ children }) => <h2 className="mb-2 mt-3 text-base font-semibold first:mt-0">{children}</h2>,
                      h3: ({ children }) => <h3 className="mb-1.5 mt-2 text-sm font-semibold first:mt-0">{children}</h3>,
                      blockquote: ({ children }) => (
                        <blockquote className="my-2 border-l-2 border-white/20 pl-3 italic text-white/70">
                          {children}
                        </blockquote>
                      ),
                      hr: () => <hr className="my-4 border-white/10" />,
                      table: ({ children }) => (
                        <div className="my-2 overflow-x-auto rounded-md ring-1 ring-white/10">
                          <table className="min-w-full text-sm">{children}</table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="bg-white/5 px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-wider text-white/60">{children}</th>
                      ),
                      td: ({ children }) => (
                        <td className="border-t border-white/10 px-3 py-1.5 text-sm text-white/80">{children}</td>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                /* ── Plain user message ── */
                <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap">
                  {content}
                </p>
              )}
            </div>
          )}

          <div
            className="mr-1 text-right text-[11px] opacity-40 select-none"
            style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}
          >
            {formattedTime}
          </div>
        </div>
      </div>
    );
  }

  // ── Assistant message ─────────────────────────────────────────────────────
  const hasContent = content.length > 0;

  return (
    <div className="flex justify-start">
      <div className="flex w-full max-w-full gap-3 sm:gap-3.5">
        {/* Avatar */}
        <div className="mt-1 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10 sm:h-8 sm:w-8">
            <Sparkles className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2 pt-0.5">
          <div className="px-0">
            {/* Thinking indicator */}
            {isStreaming && !hasContent && (
              <div className="flex items-center gap-1.5 py-3">
                <div className="thinking-dot h-1.5 w-1.5 rounded-full" />
                <div className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ animationDelay: '160ms' }} />
                <div className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ animationDelay: '320ms' }} />
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
                  'prose-headings:text-foreground prose-headings:font-semibold',
                  'prose-strong:text-foreground prose-strong:font-semibold',
                  isStreaming && 'streaming-prose'
                )}
                style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    code: codeRenderer,
                    p: ({ children }) => (
                      <p className="mb-3 text-[15px] leading-[1.7] last:mb-0 sm:mb-4">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0 sm:mb-4 sm:pl-6">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0 sm:mb-4 sm:pl-6">
                        {children}
                      </ol>
                    ),
                    li: ({ children, ...props }: any) => {
                      // GFM task list items
                      const isCheckbox = props.className === 'task-list-item';
                      return (
                        <li className={cn(
                          'text-[15px] leading-[1.65]',
                          isCheckbox && 'list-none -ml-5 flex items-start gap-2'
                        )}>
                          {children}
                        </li>
                      );
                    },
                    input: ({ checked, ...props }: any) => {
                      // GFM checkbox
                      if (props.type === 'checkbox') {
                        return (
                          <span className={cn(
                            'mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                            checked
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border bg-muted'
                          )}>
                            {checked && <Check className="h-3 w-3" />}
                          </span>
                        );
                      }
                      return <input {...props} />;
                    },
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-primary/30 underline-offset-[3px] transition-colors hover:decoration-primary/60"
                        style={{ color: 'var(--color-signal)' }}
                      >
                        {children}
                      </a>
                    ),
                    h1: ({ children }) => <h1 className="mb-3 mt-6 text-xl font-semibold first:mt-0 sm:text-2xl">{children}</h1>,
                    h2: ({ children }) => <h2 className="mb-2.5 mt-5 text-lg font-semibold first:mt-0 sm:text-xl">{children}</h2>,
                    h3: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0 sm:text-lg">{children}</h3>,
                    h4: ({ children }) => <h4 className="mb-1.5 mt-3 text-sm font-semibold first:mt-0">{children}</h4>,
                    blockquote: ({ children }) => (
                      <blockquote className="my-3 border-l-2 border-primary/30 pl-4 italic text-muted-foreground sm:my-4">
                        {children}
                      </blockquote>
                    ),
                    hr: () => <hr className="my-6 border-border" />,
                    table: ({ children }) => (
                      <div className="-mx-1 my-3 overflow-x-auto rounded-lg border border-border sm:mx-0 sm:my-4">
                        <table className="min-w-full text-sm">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-muted/40">{children}</thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="border-t border-border px-3 py-2 text-sm">{children}</td>
                    ),
                    img: ({ src, alt }) => (
                      <img src={src} alt={alt || ''} className="my-3 max-h-80 rounded-xl shadow-sm sm:my-4" loading="lazy" />
                    ),
                    // Details/summary for collapsible sections
                    details: ({ children }) => (
                      <details className="my-3 rounded-lg border border-border sm:my-4">
                        {children}
                      </details>
                    ),
                    summary: ({ children }) => (
                      <summary className="cursor-pointer select-none px-4 py-2 text-sm font-medium hover:bg-muted/50">
                        {children}
                      </summary>
                    ),
                    // Footnote section
                    section: ({ children, ...props }: any) => {
                      if (props.className?.includes('footnotes')) {
                        return (
                          <section className="mt-8 border-t border-border pt-4 text-sm text-muted-foreground">
                            {children}
                          </section>
                        );
                      }
                      return <section>{children}</section>;
                    },
                    // Sup for footnote refs
                    sup: ({ children }) => (
                      <sup className="text-primary text-[10px] font-medium">{children}</sup>
                    ),
                  }}
                >
                  {renderContent}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action buttons — visible on mobile, hover on desktop */}
          {!isStreaming && hasContent && (
            <div className="flex flex-wrap items-center gap-1.5 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
              <ActionButton
                onClick={handleCopy}
                active={copied}
                activeColor="text-[var(--color-success)]"
                icon={copied ? Check : Copy}
                label={copied ? 'Copied!' : 'Copy'}
              />

              <ActionButton
                onClick={handleWrong}
                disabled={isMarkingWrong || isActuallyFailed}
                active={isActuallyFailed}
                activeColor="text-[var(--color-signal)]"
                activeBg="bg-[var(--color-signal-subtle)]"
                activeBorder="border-[var(--color-signal-border)]"
                icon={isMarkingWrong ? Loader2 : XCircle}
                iconClassName={isMarkingWrong ? 'animate-spin' : ''}
                label={isMarkingWrong ? 'Marking...' : isActuallyFailed ? 'Marked' : 'Wrong'}
              />

              {isLast && onRegenerate && !isActuallyFailed && (
                <ActionButton
                  onClick={onRegenerate}
                  icon={RotateCcw}
                  label="Regenerate"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ─── Reusable action button ─────────────────────────────────────────────────

function ActionButton({
  onClick,
  disabled,
  active,
  activeColor = '',
  activeBg = '',
  activeBorder = '',
  icon: Icon,
  iconClassName = '',
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  activeColor?: string;
  activeBg?: string;
  activeBorder?: string;
  icon: any;
  iconClassName?: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-medium tracking-wide transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-default',
        active
          ? cn(activeBg || 'bg-[var(--color-success-subtle)]', activeBorder || 'border-[var(--color-success-border)]', activeColor)
          : 'border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
      style={{ fontFamily: 'var(--font-mono)', letterSpacing: 'var(--tracking-wide)' }}
      aria-label={label}
    >
      <Icon className={cn('h-3 w-3', iconClassName)} />
      {label}
    </button>
  );
}
