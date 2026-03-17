'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { ChatSkeleton } from './chat-skeleton';
import { EmptyState } from './empty-state';
import { MarkWrongModal } from './mark-wrong-modal';
import { useChat } from '../hooks/use-chat';
import { useProjectsStore } from '@/stores/projects-store';
import { useChatStore } from '@/stores/chat-store';
import { X, ArrowDown, Square } from 'lucide-react';
import { cn } from '@raweval/utils';
import { format } from 'date-fns';
import type { MarkMessageFailedRequest } from '@raweval/types';

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
              {messages.map((message, idx) => {
                const prevMessage = idx > 0 ? messages[idx - 1] : null;
                const showTimestamp =
                  !prevMessage ||
                  new Date(message.createdAt).getTime() -
                    new Date(prevMessage.createdAt).getTime() >
                    300_000;

                const isLastMessage = idx === messages.length - 1;

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
