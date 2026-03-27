'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils/cn';
import {
  MessageSquare,
  AlertTriangle,
  Bot,
  User,
  Settings,
  Hash,
} from 'lucide-react';
import { workbenchService } from '@/services/workbench-service';
import type { ConversationMessage } from '@/features/workbench/types';

// ── Props ──────────────────────────────────────────────────────────────────

interface ConversationViewProps {
  conversationId: number;
  failedModel?: string;
  failedProvider?: string;
  failedTurnNumber?: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function groupMessagesByTurn(messages: ConversationMessage[]) {
  const turns = new Map<number, ConversationMessage[]>();
  for (const msg of messages) {
    const group = turns.get(msg.turn_number) ?? [];
    group.push(msg);
    turns.set(msg.turn_number, group);
  }
  return Array.from(turns.entries()).sort(([a], [b]) => a - b);
}

function estimateTokenCount(text: string): number {
  // Rough approximation: ~4 chars per token
  return Math.ceil(text.length / 4);
}

function renderMarkdown(content: string): string {
  // Lightweight markdown: bold, italic, code blocks, inline code, line breaks
  return content
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="wb-code-block"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="wb-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

// ── Subcomponents ──────────────────────────────────────────────────────────

function RoleIcon({ role }: { role: ConversationMessage['role'] }) {
  switch (role) {
    case 'user':
      return <User size={14} />;
    case 'assistant':
      return <Bot size={14} />;
    case 'system':
      return <Settings size={14} />;
  }
}

function ModelChip({
  model,
  provider,
  isFailed,
}: {
  model: string | null;
  provider: string | null;
  isFailed: boolean;
}) {
  if (!model) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] tracking-[var(--tracking-wide)]',
        isFailed
          ? 'border border-[var(--color-error)] bg-[var(--color-error-subtle)] text-[var(--color-error)]'
          : 'border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]',
      )}
    >
      {model}
      {provider && (
        <span className="text-[var(--color-text-muted)]">({provider})</span>
      )}
    </span>
  );
}

function MessageBubble({
  message,
  isFailed,
}: {
  message: ConversationMessage;
  isFailed: boolean;
}) {
  const tokens = estimateTokenCount(message.content);
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border',
        isFailed
          ? 'border-2 border-[var(--color-error)] bg-[var(--color-error-subtle)]'
          : message.role === 'user'
            ? 'border-[var(--color-border)] bg-[var(--color-bg-inverse)] text-[var(--color-text-inverse)]'
            : message.role === 'system'
              ? 'border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-muted)]'
              : 'border-[var(--color-border)] bg-[var(--color-bg-surface)]',
      )}
      style={{ padding: 'var(--space-4) var(--space-5)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <RoleIcon role={message.role} />
          <span
            className={cn(
              'font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wider)]',
              message.role === 'user'
                ? 'text-[var(--color-text-inverse-muted)]'
                : 'text-[var(--color-text-muted)]',
            )}
          >
            {message.role}
          </span>
          {isAssistant && (
            <ModelChip
              model={message.model}
              provider={message.provider}
              isFailed={isFailed}
            />
          )}
          {isFailed && (
            <Badge
              className="border-[var(--color-error)] bg-[var(--color-error)] text-white"
            >
              FAILED
            </Badge>
          )}
        </div>
        <span
          className={cn(
            'font-[family-name:var(--font-mono)] text-[length:var(--text-xs)]',
            message.role === 'user'
              ? 'text-[var(--color-text-inverse-faint)]'
              : 'text-[var(--color-text-faint)]',
          )}
        >
          Turn {message.turn_number}
        </span>
      </div>

      {/* Content */}
      <div
        className="text-[length:var(--text-sm)] leading-[var(--leading-relaxed)]"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
      />

      {/* Token count */}
      {isAssistant && (
        <div
          className={cn(
            'flex items-center gap-1 pt-[var(--space-1)]',
            'font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]',
          )}
        >
          <Hash size={10} />
          ~{tokens.toLocaleString()} tokens
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function ConversationView({
  conversationId,
  failedModel,
  failedProvider,
  failedTurnNumber,
}: ConversationViewProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: () => workbenchService.getConversationMessages(conversationId),
    enabled: conversationId > 0,
  });

  const grouped = useMemo(() => {
    if (!data?.messages) return [];
    return groupMessagesByTurn(data.messages);
  }, [data?.messages]);

  // Find the original prompt (first user message)
  const originalPrompt = useMemo(() => {
    return data?.messages?.find((m) => m.role === 'user');
  }, [data?.messages]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-[var(--space-4)] py-[var(--space-16)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-signal)]" />
        <p className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] text-[var(--color-text-muted)]">
          LOADING CONVERSATION...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-subtle)] p-[var(--space-6)]">
        <AlertTriangle size={20} className="text-[var(--color-error)]" />
        <p className="text-[length:var(--text-sm)] text-[var(--color-error)]">
          Failed to load conversation messages.
        </p>
      </div>
    );
  }

  if (!data?.messages?.length) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-3)] py-[var(--space-16)] text-[var(--color-text-muted)]">
        <MessageSquare size={24} />
        <p className="text-[length:var(--text-sm)]">No messages found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-8)]" style={{ paddingBottom: 'var(--space-12)' }}>
      {/* Sticky original prompt */}
      {originalPrompt && (
        <div
          className="sticky top-0 z-10 rounded-[var(--radius-lg)] border border-[var(--color-signal-border)] bg-[var(--color-bg-base)] shadow-[var(--shadow-sm)]"
          style={{ padding: 'var(--space-4) var(--space-5)' }}
        >
          <div className="mb-[var(--space-2)] flex items-center gap-2">
            <div className="h-[2px] w-4 bg-[var(--color-signal)]" />
            <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-signal)]">
              Original Prompt
            </span>
          </div>
          <p className="text-[length:var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-primary)]" style={{ margin: 0 }}>
            {originalPrompt.content}
          </p>
        </div>
      )}

      {/* Grouped turns */}
      {grouped.map(([turnNumber, messages]) => {
        const userMessages = messages.filter((m) => m.role === 'user');
        const assistantMessages = messages.filter((m) => m.role === 'assistant');
        const systemMessages = messages.filter((m) => m.role === 'system');
        const isMultiModel = assistantMessages.length > 1;

        return (
          <div
            key={turnNumber}
            className="flex flex-col gap-[var(--space-4)]"
          >
            {/* Turn label */}
            <div className="flex items-center gap-3 text-[var(--color-text-faint)]" style={{ padding: '0 var(--space-1)' }}>
              <div className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[var(--tracking-wider)]" style={{ whiteSpace: 'nowrap' }}>
                TURN {turnNumber}
              </span>
              <div className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            {/* System messages */}
            {systemMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isFailed={false}
              />
            ))}

            {/* User messages — skip original prompt as it's shown sticky */}
            {userMessages
              .filter((m) => m.id !== originalPrompt?.id)
              .map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isFailed={false}
                />
              ))}

            {/* Assistant messages — side-by-side if multi-model */}
            {isMultiModel ? (
              <div
                className="grid gap-[var(--space-3)]"
                style={{
                  gridTemplateColumns: `repeat(${assistantMessages.length}, 1fr)`,
                }}
              >
                {assistantMessages.map((msg) => {
                  const isFailed =
                    turnNumber === failedTurnNumber &&
                    msg.model === failedModel &&
                    msg.provider === failedProvider;
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isFailed={isFailed}
                    />
                  );
                })}
              </div>
            ) : (
              assistantMessages.map((msg) => {
                const isFailed =
                  turnNumber === failedTurnNumber &&
                  msg.model === failedModel &&
                  msg.provider === failedProvider;
                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isFailed={isFailed}
                  />
                );
              })
            )}
          </div>
        );
      })}

      {/* Failure summary bar */}
      {failedModel && (
        <div
          className="flex items-center gap-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-subtle)]"
          style={{ padding: 'var(--space-4) var(--space-5)' }}
        >
          <AlertTriangle size={18} className="shrink-0 text-[var(--color-error)]" />
          <div className="flex flex-col gap-0.5">
            <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-error)]">
              Failure Detected
            </span>
            <span className="text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--color-text-secondary)]">
              Model <strong>{failedModel}</strong>
              {failedProvider && ` (${failedProvider})`}
              {failedTurnNumber !== undefined && ` at turn ${failedTurnNumber}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
