'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { useChat } from '../hooks/use-chat';
import {
  Plus,
  Wand2,
  PenLine,
  ImageIcon,
  UserRound,
  Code2,
  Sparkles,
} from 'lucide-react';
import { Card } from '@raweval/ui/card';

export function ChatInterface() {
  const {
    messages,
    isTyping,
    sendMessage,
    flagMessage,
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

  const suggestions = [
    {
      title: 'Draft copy',
      prompt: 'Write copy for a landing page hero section for RawEval.',
      description: 'Clear, conversion-focused messaging',
      Icon: PenLine,
    },
    {
      title: 'Analyze an image',
      prompt: 'Analyze this image and summarize what you see.',
      description: 'Vision + structured output',
      Icon: ImageIcon,
    },
    {
      title: 'Create an outline',
      prompt:
        'Create a structured outline for a technical blog post about evaluation infra.',
      description: 'Fast planning with sections',
      Icon: UserRound,
    },
    {
      title: 'Debug code',
      prompt: 'Help me debug a Next.js App Router routing issue.',
      description: 'Step-by-step diagnosis',
      Icon: Code2,
    },
  ];

  return (
    <div className="bg-background flex h-full flex-col" role="main">
      {/* Messages Container */}
      <div
        className="bg-background flex-1 overflow-y-auto"
        role="log"
        aria-live="polite"
      >
        <div className="mx-auto w-full max-w-4xl px-6 py-12">
          {messages.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            >
              {/* Welcome Message */}
              <div className="mb-12 text-center">
                <div className="bg-primary/10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
                  <Wand2 className="text-primary h-8 w-8" />
                </div>
                <h2 className="text-foreground mb-3 text-4xl font-bold tracking-tight">
                  Welcome to RawEval
                </h2>
                <p className="text-muted-foreground mx-auto max-w-lg text-lg">
                  Get started by typing a task and Chat can do the rest. Not
                  sure where to start?
                </p>
              </div>

              {/* Large Suggestion Cards */}
              <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestions.map((suggestion, idx) => (
                  <Card
                    key={idx}
                    onClick={() => sendMessage(suggestion.prompt)}
                    className="card-hover group border-border bg-card hover:bg-muted/40 relative cursor-pointer border transition-colors"
                  >
                    <div className="flex items-center gap-4 p-6">
                      <div className="bg-muted text-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm">
                        <suggestion.Icon className="text-muted-foreground h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-foreground mb-1 text-base font-semibold">
                          {suggestion.title}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {suggestion.description}
                        </div>
                      </div>
                      <Plus className="text-muted-foreground h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-8">
              {messages.map((message, idx) => {
                const prevMessage = idx > 0 ? messages[idx - 1] : null;
                const showTimestamp =
                  !prevMessage ||
                  message.createdAt.getTime() -
                    prevMessage.createdAt.getTime() >
                    300000;

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
                        onFlag={() => flagMessage(message.id)}
                        onApprove={() => approveMessage(message.id)}
                        onRequestHuman={() => requestHuman(message.id)}
                      />
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start" role="status">
                  <div className="flex gap-3">
                    <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                      <Sparkles className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-5 py-4">
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
      <div className="border-border bg-background border-t">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <ChatInput onSend={sendMessage} />
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(date: Date): string {
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
}
