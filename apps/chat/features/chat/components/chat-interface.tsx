'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { ChatSkeleton } from './chat-skeleton';
import { EmptyState } from './empty-state';
import { useChat } from '../hooks/use-chat';
import { useProjectsStore } from '@/stores/projects-store';
import { useChatStore } from '@/stores/chat-store';
import { X } from 'lucide-react';
import { cn } from '@raweval/utils';
import { format } from 'date-fns';

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
    const threshold = 120;
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
    markAsWrong(messageId);
  };

  const isSuccess = error?.startsWith('✓');

  return (
    <div className="bg-background relative flex h-full flex-col" role="main">
      {/* Status Banner */}
      {bannerVisible && error && (
        <div
          className={cn(
            'animate-in fade-in slide-in-from-top-1 border-b px-3 py-2 text-sm font-medium duration-200 sm:px-4 sm:py-2.5',
            isSuccess
              ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'
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
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {messages.map((message, idx) => {
                const prevMessage = idx > 0 ? messages[idx - 1] : null;
                const showTimestamp =
                  !prevMessage ||
                  new Date(message.createdAt).getTime() -
                    new Date(prevMessage.createdAt).getTime() >
                    300_000;

                return (
                  <div key={message.id}>
                    {showTimestamp && (
                      <div className="text-muted-foreground mb-3 text-center text-[11px] font-medium tracking-wide uppercase sm:mb-4">
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

      {/* Input Area */}
      <div className="bg-background/80 safe-area-inset-bottom shrink-0 backdrop-blur-md">
        <div className="mx-auto w-full max-w-4xl px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
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
