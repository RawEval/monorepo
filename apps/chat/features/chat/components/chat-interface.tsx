'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { EmptyState } from './empty-state';
import { useChat } from '../hooks/use-chat';
import { Sparkles } from 'lucide-react';

export function ChatInterface() {
  const {
    messages,
    isTyping,
    sendMessage,
    markAsWrong,
    approveMessage,
    requestHuman,
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleSend = async (message: string, images?: string[], files?: File[]) => {
    // For now, just pass images - files can be handled in the service layer
    await sendMessage(message, images);
    // TODO: Handle file attachments in the service
    if (files && files.length > 0) {
      console.log('Files to send:', files);
    }
  };

  const handleWrong = (messageId: string) => {
    markAsWrong(messageId);
  };

  return (
    <div className="relative flex h-full flex-col bg-background" role="main">
      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto safe-area-inset-top"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4 py-3 sm:py-6">
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
                  message.createdAt.getTime() - prevMessage.createdAt.getTime() >
                    300000; // 5 minutes

                return (
                  <div key={message.id}>
                    {showTimestamp && (
                      <div className="mb-4 text-center text-xs text-muted-foreground">
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
                        onWrong={() => handleWrong(message.id)}
                        onApprove={() => approveMessage(message.id)}
                        onRequestHuman={message.role === 'assistant' ? () => requestHuman(message.id) : undefined}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start" role="status" aria-label="AI is typing">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-5 py-4 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                        <div
                          className="typing-dot h-2 w-2 rounded-full bg-muted-foreground"
                          style={{ animationDelay: '0.2s' }}
                        />
                        <div
                          className="typing-dot h-2 w-2 rounded-full bg-muted-foreground"
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

      {/* Input Area - Fixed at bottom - Clean and minimal */}
      <div className="border-t border-border bg-background shrink-0 safe-area-inset-bottom">
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4 py-3">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
