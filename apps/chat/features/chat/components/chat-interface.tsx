'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { ChatSkeleton } from './chat-skeleton';
import { EmptyState } from './empty-state';
import { MarkWrongModal } from './mark-wrong-modal';
import { useChat } from '../hooks/use-chat';
import { useProjectsStore } from '@/stores/projects-store';
import { useChatStore } from '@/stores/chat-store';
import { X, ArrowDown, Square, Check, AlertTriangle, Clock, Zap, Maximize2, Minimize2, XCircle } from 'lucide-react';
import { cn } from '@raweval/utils';
import { format } from 'date-fns';
import type { MarkMessageFailedRequest } from '@raweval/types';
import type { ChatMessage as ChatMessageType } from '../types';

/** Preview card for a single model response */
function ModelCard({
  msg,
  onClick,
  isSelected,
  onWrong,
  isMarkingWrong,
}: {
  msg: ChatMessageType;
  onClick: () => void;
  isSelected: boolean;
  onWrong: () => void;
  isMarkingWrong: boolean;
}) {
  const label = msg.model?.split('/').pop() || 'Model';
  const hasError = !!msg.modelError;
  const isDone = !msg.isStreaming && !hasError && msg.content.length > 0;
  const preview = msg.content.slice(0, 150).replace(/[#*`_>]/g, '');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group/card flex w-full flex-col rounded-xl border p-3 text-left transition-all',
        isSelected
          ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.02]'
          : hasError
            ? 'border-destructive/30 bg-destructive/5 hover:border-destructive/50'
            : 'border-border bg-card hover:border-border-strong hover:shadow-sm'
      )}
    >
      {/* Header: model name + status */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {msg.isStreaming && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          )}
          {isDone && <Check className="h-3.5 w-3.5 text-emerald-500" />}
          {hasError && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isDone && msg.latencyMs != null && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {(msg.latencyMs / 1000).toFixed(1)}s
            </span>
          )}
          {/* Mark wrong button directly on card */}
          {isDone && !msg.isFailed && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onWrong(); }}
              className={cn(
                'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all',
                isMarkingWrong
                  ? 'border-muted bg-muted text-muted-foreground'
                  : 'border-destructive/20 bg-destructive/5 text-destructive/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40'
              )}
            >
              <XCircle className={cn('h-3 w-3', isMarkingWrong && 'animate-spin')} />
              {isMarkingWrong ? 'Marking...' : 'Mark Failed'}
            </span>
          )}
          {msg.isFailed && (
            <span className="flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/20 px-2 py-0.5 text-[10px] font-medium text-destructive">
              <AlertTriangle className="h-3 w-3" />
              Flagged
            </span>
          )}
        </div>
      </div>

      {/* Preview content */}
      <div className="min-h-[40px] flex-1">
        {msg.isStreaming && !msg.content ? (
          <div className="flex items-center gap-1 py-2">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
          </div>
        ) : hasError ? (
          <p className="text-xs text-destructive">{msg.modelError}</p>
        ) : (
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {preview}{msg.content.length > 150 ? '…' : ''}
          </p>
        )}
      </div>

      {/* Footer: tokens */}
      {isDone && msg.tokensUsed?.total != null && (
        <div className="mt-2 flex items-center gap-1 border-t border-border/50 pt-1.5 text-[10px] text-muted-foreground/60">
          <Zap className="h-2.5 w-2.5" />
          {msg.tokensUsed.total.toLocaleString()} tokens
        </div>
      )}

      {/* Expand hint */}
      <div className="mt-1 flex items-center justify-center">
        <Maximize2 className="h-3 w-3 text-muted-foreground/30 transition-colors group-hover/card:text-muted-foreground/60" />
      </div>
    </button>
  );
}

function CompareGroup({
  messages,
  onWrong,
  markingWrong,
}: {
  messages: ChatMessageType[];
  onWrong: (id: string) => void;
  markingWrong: Set<string>;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {/* Preview cards grid — all models visible */}
      <div className={cn(
        'grid gap-2',
        messages.length === 2 && 'grid-cols-2',
        messages.length === 3 && 'grid-cols-2 sm:grid-cols-3',
        messages.length >= 4 && 'grid-cols-2',
      )}>
        {messages.map((msg, i) => (
          <ModelCard
            key={msg.id}
            msg={msg}
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
            isSelected={expandedIdx === i}
            onWrong={() => onWrong(msg.id)}
            isMarkingWrong={markingWrong.has(msg.id)}
          />
        ))}
      </div>

      {/* Expanded view — full response */}
      {expandedIdx != null && messages[expandedIdx] && (() => {
        const msg = messages[expandedIdx];
        return (
          <div
            className={cn(
              'animate-in fade-in slide-in-from-top-1 rounded-xl border duration-200',
              msg.modelError
                ? 'border-destructive/30 bg-destructive/5'
                : 'border-border bg-card'
            )}
          >
            {/* Expanded header with model switcher */}
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
              <div className="flex items-center gap-2 overflow-x-auto">
                {messages.map((m, i) => {
                  const mLabel = m.model?.split('/').pop() || `Model ${i + 1}`;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setExpandedIdx(i)}
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                        expandedIdx === i
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {mLabel}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setExpandedIdx(null)}
                className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Stats + Mark Failed */}
            {!msg.isStreaming && msg.content.length > 0 && (
              <div className="flex items-center justify-between border-b border-border/30 px-4 py-1.5">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider">
                    {msg.provider}
                  </span>
                  {msg.latencyMs != null && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {(msg.latencyMs / 1000).toFixed(1)}s
                    </span>
                  )}
                  {msg.tokensUsed?.total != null && (
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {msg.tokensUsed.total.toLocaleString()} tokens
                    </span>
                  )}
                </div>
                {!msg.isFailed ? (
                  <button
                    type="button"
                    onClick={() => onWrong(msg.id)}
                    disabled={markingWrong.has(msg.id)}
                    className="flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/5 px-2.5 py-1 text-[10px] font-medium text-destructive/70 transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 disabled:opacity-50"
                  >
                    <XCircle className={cn('h-3 w-3', markingWrong.has(msg.id) && 'animate-spin')} />
                    {markingWrong.has(msg.id) ? 'Marking...' : 'Mark Failed'}
                  </button>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-[10px] font-medium text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    Flagged
                  </span>
                )}
              </div>
            )}

            {/* Full content */}
            <div className="p-4">
              <ChatMessage
                id={msg.id}
                role={msg.role}
                content={msg.content}
                verified={msg.verified}
                createdAt={new Date(msg.createdAt)}
                isMarkingWrong={markingWrong.has(msg.id)}
                isFailed={msg.isFailed}
                isStreaming={msg.isStreaming}
                isLast={false}
                onWrong={() => onWrong(msg.id)}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function ChatInterfaceContent({ id: pathId }: { id?: string }) {
  const selectProject = useProjectsStore((s) => s.selectProject);
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const clearProject = useChatStore((s) => s.clearProject);
  const {
    messages,
    isSessionLoading,
    sendMessage,
    markAsWrong,
    error,
    markingWrong,
  } = useChat(pathId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [markWrongModalOpen, setMarkWrongModalOpen] = useState(false);
  const [markWrongMessageId, setMarkWrongMessageId] = useState<string | null>(null);

  const isStreaming = messages.some((m) => m.isStreaming);

  // Group messages by groupId for multi-model comparison
  const groupedMessages = useMemo(() => {
    const result: (
      | (typeof messages)[0]
      | { isGroup: true; groupId: string; messages: typeof messages }
    )[] = [];
    const seenGroups = new Set<string>();

    for (const msg of messages) {
      if (msg.groupId && !seenGroups.has(msg.groupId)) {
        seenGroups.add(msg.groupId);
        const groupMsgs = messages.filter((m) => m.groupId === msg.groupId);
        result.push({ isGroup: true, groupId: msg.groupId, messages: groupMsgs });
      } else if (!msg.groupId) {
        result.push(msg);
      }
    }
    return result;
  }, [messages]);

  useEffect(() => {
    setMounted(true);

    if (pathId) {
      if (pathId !== selectedProjectId) {
        selectProject(pathId);
      }
    } else {
      if (selectedProjectId !== 'p1') {
        selectProject('p1');
      }
      clearProject('p1');
    }
  }, [pathId, selectProject, selectedProjectId, clearProject]);

  const scrollToBottom = useCallback((instant = false) => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({
      behavior: instant ? 'instant' : 'smooth',
    });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 150;
    setIsNearBottom(
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    );
  }, []);

  useEffect(() => {
    if (isNearBottom) {
      const raf = requestAnimationFrame(() => scrollToBottom());
      return () => cancelAnimationFrame(raf);
    }
  }, [messages, isNearBottom, scrollToBottom]);

  useEffect(() => {
    if (error) {
      setBannerVisible(true);
      // Auto-dismiss after 8s
      const timer = setTimeout(() => setBannerVisible(false), 8000);
      return () => clearTimeout(timer);
    } else {
      setBannerVisible(false);
    }
  }, [error]);

  const formatTimestamp = (date: Date): string =>
    format(date, 'MMM d, h:mm a');

  const handleSend = async (
    message: string,
    images?: string[],
    files?: File[]
  ) => {
    scrollToBottom();
    await sendMessage(message, images, files);
  };

  const handleWrong = (messageId: string) => {
    setMarkWrongMessageId(messageId);
    setMarkWrongModalOpen(true);
  };

  const handleMarkWrongSubmit = useCallback(
    (request: MarkMessageFailedRequest) => {
      if (markWrongMessageId) {
        markAsWrong(markWrongMessageId, request);
        setMarkWrongModalOpen(false);
        setMarkWrongMessageId(null);
      }
    },
    [markWrongMessageId, markAsWrong]
  );

  const markWrongMessage = markWrongMessageId
    ? messages.find((m) => m.id === markWrongMessageId)
    : null;

  // Derive the backend session ID for domain lookup
  const currentProject = useProjectsStore((s) => s.projects).find(
    (p) => p.id === (pathId ?? selectedProjectId)
  );
  const backendSessionIdForModal =
    currentProject?.backendId ??
    (pathId && !isNaN(Number(pathId)) ? Number(pathId) : undefined);

  const handleStopGenerating = useCallback(() => {
    // AbortController would be needed for true cancellation.
    // For now, we mark streaming as done on the last message.
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.isStreaming) {
      const projectId = pathId ?? 'p1';
      useChatStore.getState().setIsStreaming(projectId, lastMsg.id, false);
    }
  }, [messages, pathId]);

  const isSuccess = error?.startsWith('✓');

  return (
    <div className="bg-background relative flex h-full flex-col" role="main">
      {/* Status Banner */}
      {bannerVisible && error && (
        <div
          className={cn(
            'animate-in fade-in slide-in-from-top-1 border-b px-3 py-2 text-sm font-medium duration-200 sm:px-4 sm:py-2.5',
            isSuccess
              ? 'border-[var(--color-success-border)] bg-[var(--color-success-subtle)] text-[var(--color-success)]'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          )}
          role="alert"
        >
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
            <span className="min-w-0 flex-1 truncate">{error}</span>
            <button
              onClick={() => setBannerVisible(false)}
              className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 active:scale-95"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="safe-area-inset-top flex-1 scroll-smooth overflow-y-auto overscroll-contain"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <div className="mx-auto w-full max-w-4xl px-3 py-3 sm:px-4 md:px-6 sm:py-6">
          {messages.length === 0 ? (
            isSessionLoading ? (
              <ChatSkeleton />
            ) : (
              <EmptyState
                onSuggestionClick={(prompt) => handleSend(prompt)}
                mounted={mounted}
              />
            )
          ) : (
            <div className="space-y-5 sm:space-y-6">
              {groupedMessages.map((item, idx) => {
                if ('isGroup' in item) {
                  // Multi-model comparison group
                  return (
                    <CompareGroup
                      key={item.groupId}
                      messages={item.messages.map((m) => ({
                        ...m,
                        createdAt: typeof m.createdAt === 'object'
                          ? (m.createdAt as Date).getTime()
                          : m.createdAt,
                      }))}
                      onWrong={handleWrong}
                      markingWrong={markingWrong}
                    />
                  );
                }

                // Regular single message (existing code)
                const message = item;
                const prevItem = idx > 0 ? groupedMessages[idx - 1] : null;
                const prevMessage =
                  prevItem && !('isGroup' in prevItem) ? prevItem : null;
                const showTimestamp =
                  !prevMessage ||
                  new Date(message.createdAt).getTime() -
                    new Date(prevMessage.createdAt).getTime() >
                    300_000;

                const isLastMessage = idx === groupedMessages.length - 1;

                return (
                  <div key={message.id}>
                    {showTimestamp && (
                      <div className="text-muted-foreground mb-4 text-center text-[11px] font-medium tracking-wide uppercase select-none">
                        {formatTimestamp(message.createdAt)}
                      </div>
                    )}
                    <div
                      className={cn(
                        'group chat-message-enter',
                        !mounted && 'opacity-0'
                      )}
                      style={{
                        animationDelay: `${Math.min(idx * 30, 300)}ms`,
                      }}
                    >
                      <ChatMessage
                        id={message.id}
                        role={message.role}
                        content={message.content}
                        images={message.images}
                        verified={message.verified}
                        createdAt={new Date(message.createdAt)}
                        isMarkingWrong={markingWrong.has(message.id)}
                        isFailed={message.isFailed}
                        isStreaming={message.isStreaming}
                        isLast={isLastMessage && message.role === 'assistant'}
                        onWrong={() => handleWrong(message.id)}
                      />
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
        </div>
      </div>

      {/* Scroll-to-bottom button */}
      {!isNearBottom && messages.length > 0 && (
        <div className="pointer-events-none absolute right-0 bottom-[140px] left-0 flex justify-center sm:bottom-[160px]">
          <button
            onClick={() => scrollToBottom()}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-background/80 safe-area-inset-bottom shrink-0 backdrop-blur-md">
        <div className="mx-auto w-full max-w-4xl px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
          {/* Stop Generating button */}
          {isStreaming && (
            <div className="mb-2 flex justify-center">
              <button
                onClick={handleStopGenerating}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground hover:shadow-md active:scale-95"
              >
                <Square className="h-3 w-3 fill-current" />
                Stop generating
              </button>
            </div>
          )}
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </div>
      </div>

      {/* Mark Wrong Modal */}
      <MarkWrongModal
        open={markWrongModalOpen}
        onClose={() => {
          setMarkWrongModalOpen(false);
          setMarkWrongMessageId(null);
        }}
        onSubmit={handleMarkWrongSubmit}
        isSubmitting={markWrongMessageId !== null && markingWrong.has(markWrongMessageId)}
        sessionId={backendSessionIdForModal}
        messageContent={markWrongMessage?.content}
      />
    </div>
  );
}

export function ChatInterface({ id }: { id?: string }) {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-full items-center justify-center p-8">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      }
    >
      <ChatInterfaceContent id={id} />
    </React.Suspense>
  );
}
