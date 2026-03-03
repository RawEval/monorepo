'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { EmptyState } from './empty-state';
import { useChat } from '../hooks/use-chat';
import { useProjectsStore } from '@/stores/projects-store';
import { Sparkle, X } from 'lucide-react';
import { cn } from '@raweval/utils';

function ChatInterfaceContent() {
  const searchParams = useSearchParams();
  const selectProject = useProjectsStore((s) => s.selectProject);
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const { messages, isTyping, sendMessage, markAsWrong, error, markingWrong } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if the URL has an ?id= parameter and sync it to the global store on mount
    const idParam = searchParams.get('id');
    if (idParam && idParam !== selectedProjectId) {
      selectProject(idParam);
    }
  }, [searchParams, selectProject, selectedProjectId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  // Show banner whenever error message changes (includes success messages)
  useEffect(() => {
    if (error) {
      setBannerVisible(true);
    } else {
      setBannerVisible(false);
    }
  }, [error]);

  const formatTimestamp = (date: Date): string =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  const handleSend = async (message: string, images?: string[]) => {
    await sendMessage(message, images);
  };

  const handleWrong = (messageId: string) => {
    markAsWrong(messageId);
  };

  const isSuccess = error?.startsWith('✓');

  return (
    <div className="bg-background relative flex h-full flex-col" role="main">
      {/* Status Banner (success or error from markAsWrong / sendMessage) */}
      {bannerVisible && error && (
        <div
          className={cn(
            'border-b px-4 py-2.5 text-sm font-medium transition-all',
            isSuccess
              ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          )}
          role="alert"
        >
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
            <span>{error}</span>
            <button
              onClick={() => setBannerVisible(false)}
              className="shrink-0 opacity-70 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        className="safe-area-inset-top flex-1 overflow-y-auto"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <div className="mx-auto w-full max-w-4xl px-3 py-3 sm:px-4 sm:py-6">
          {messages.length === 0 ? (
            <EmptyState
              onSuggestionClick={(prompt) => handleSend(prompt)}
              mounted={mounted}
            />
          ) : (
            <div className="space-y-6">
              {messages.map((message, idx) => {
                const prevMessage = idx > 0 ? messages[idx - 1] : null;
                const showTimestamp =
                  !prevMessage ||
                  message.createdAt.getTime() -
                    prevMessage.createdAt.getTime() >
                    300_000; // 5 minutes

                return (
                  <div key={message.id}>
                    {showTimestamp && (
                      <div className="text-muted-foreground mb-4 text-center text-xs">
                        {formatTimestamp(message.createdAt)}
                      </div>
                    )}
                    <div
                      className={`chat-message-enter ${mounted ? '' : 'opacity-0'}`}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <ChatMessage
                        id={message.id}
                        role={message.role}
                        content={message.content}
                        images={message.images}
                        verified={message.verified}
                        createdAt={message.createdAt}
                        isMarkingWrong={markingWrong.has(message.id)}
                        onWrong={() => handleWrong(message.id)}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div
                  className="flex justify-start"
                  role="status"
                  aria-label="AI is typing"
                >
                  <div className="flex gap-3">
                    <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      <Sparkle
                        className="text-muted-foreground h-4 w-4"
                        fill="currentColor"
                      />
                    </div>
                    <div className="border-border bg-card rounded-2xl rounded-tl-sm border px-5 py-4 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="typing-dot bg-muted-foreground h-2 w-2 rounded-full" />
                        <div
                          className="typing-dot bg-muted-foreground h-2 w-2 rounded-full"
                          style={{ animationDelay: '0.2s' }}
                        />
                        <div
                          className="typing-dot bg-muted-foreground h-2 w-2 rounded-full"
                          style={{ animationDelay: '0.4s' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-background/80 safe-area-inset-bottom shrink-0 backdrop-blur-md">
        <div className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-6">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}

export function ChatInterface() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-full items-center justify-center p-8">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      }
    >
      <ChatInterfaceContent />
    </React.Suspense>
  );
}
