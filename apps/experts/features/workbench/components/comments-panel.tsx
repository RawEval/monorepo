'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@raweval/ui/button';

import {
  MessageSquare,
  Reply,
  Send,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { workbenchService } from '@/services/workbench-service';
import type { TaskComment } from '@/features/workbench/types';

interface CommentsPanelProps {
  fpfId: number;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  annotator: {
    bg: 'var(--color-info-subtle)',
    text: 'var(--color-info)',
    border: 'var(--color-info-border)',
    label: 'Annotator',
  },
  pre_reviewer: {
    bg: 'var(--color-warning-subtle)',
    text: 'var(--color-warning)',
    border: 'rgba(138, 106, 0, 0.2)',
    label: 'Pre-Reviewer',
  },
  post_reviewer: {
    bg: 'var(--color-signal-subtle)',
    text: 'var(--color-signal)',
    border: 'var(--color-signal-border)',
    label: 'Post-Reviewer',
  },
  admin: {
    bg: 'var(--color-error-subtle)',
    text: 'var(--color-error)',
    border: 'rgba(192, 57, 43, 0.2)',
    label: 'Admin',
  },
};

function getRoleStyle(role: string) {
  return ROLE_COLORS[role] ?? {
    bg: 'var(--color-bg-muted)',
    text: 'var(--color-text-muted)',
    border: 'var(--color-border)',
    label: role,
  };
}

const COMMENT_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'rejection_reason', label: 'Rejection Reason' },
  { value: 'revision_request', label: 'Revision Request' },
  { value: 'quality_note', label: 'Quality Note' },
] as const;

function formatCommentTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface CommentThreadProps {
  comment: TaskComment;
  replies: TaskComment[];
  allComments: TaskComment[];
  onReply: (commentId: number) => void;
  depth: number;
}

function CommentThread({ comment, replies, allComments, onReply, depth }: CommentThreadProps) {
  const [collapsed, setCollapsed] = useState(false);
  const roleStyle = getRoleStyle(comment.author_role);

  return (
    <div
      style={{
        marginLeft: depth > 0 ? 'var(--space-5)' : '0',
        borderLeft: depth > 0 ? `2px solid ${roleStyle.border}` : 'none',
        paddingLeft: depth > 0 ? 'var(--space-4)' : '0',
      }}
    >
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          background: depth > 0 ? 'transparent' : 'var(--color-bg-base)',
          borderRadius: depth > 0 ? '0' : 'var(--radius-md)',
          border: depth > 0 ? 'none' : '1px solid var(--color-border)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {/* Comment header */}
        <div className="mb-2 flex items-center gap-2">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              background: roleStyle.bg,
              color: roleStyle.text,
              border: `1px solid ${roleStyle.border}`,
            }}
          >
            {roleStyle.label}
          </span>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
            }}
          >
            {comment.author_name}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            {formatCommentTime(comment.created_at)}
          </span>
          {comment.comment_type !== 'general' && (
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                padding: '1px 5px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg-muted)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              {comment.comment_type.replace(/_/g, ' ')}
            </span>
          )}
          {comment.is_resolved && (
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                padding: '1px 5px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-success-subtle)',
                color: 'var(--color-success)',
                border: '1px solid var(--color-success-border)',
              }}
            >
              Resolved
            </span>
          )}
        </div>

        {/* Comment body */}
        <p
          style={{
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-normal)',
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}
        >
          {comment.comment_text}
        </p>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center gap-1"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              padding: 0,
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            <Reply className="h-3 w-3" />
            Reply
          </button>
          {replies.length > 0 && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-1"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-faint)',
                padding: 0,
                letterSpacing: 'var(--tracking-wide)',
              }}
            >
              {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {!collapsed &&
        replies.map((reply) => {
          const childReplies = allComments.filter((c) => c.parent_comment_id === reply.id);
          return (
            <CommentThread
              key={reply.id}
              comment={reply}
              replies={childReplies}
              allComments={allComments}
              onReply={onReply}
              depth={depth + 1}
            />
          );
        })}
    </div>
  );
}

export function CommentsPanel({ fpfId }: CommentsPanelProps) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState<string>('general');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['task-comments', fpfId],
    queryFn: () => workbenchService.getComments(fpfId),
    staleTime: 15_000,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      workbenchService.createComment({
        failed_prompt_final_id: fpfId,
        comment_type: commentType,
        comment_text: commentText.trim(),
        parent_comment_id: replyingTo ?? undefined,
      }),
    onSuccess: () => {
      setCommentText('');
      setReplyingTo(null);
      setCommentType('general');
      queryClient.invalidateQueries({ queryKey: ['task-comments', fpfId] });
    },
  });

  // Build thread tree: top-level comments have no parent
  const topLevelComments = useMemo(() => {
    if (!data?.comments) return [];
    return data.comments.filter((c) => c.parent_comment_id === null);
  }, [data?.comments]);

  const allComments = data?.comments ?? [];

  function handleReply(commentId: number) {
    setReplyingTo(commentId);
  }

  const replyingToComment = replyingTo
    ? allComments.find((c) => c.id === replyingTo)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', animation: 'fade-in-up 0.3s ease-out forwards' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" style={{ color: 'var(--color-signal)' }} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            Comments
          </span>
        </div>
        {data && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              background: 'var(--color-bg-muted)',
              padding: '0 6px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {data.total}
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div
          className="flex items-center justify-center"
          style={{ padding: 'var(--space-6)' }}
        >
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--color-signal)' }} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-error-subtle)',
            border: '1px solid rgba(192, 57, 43, 0.2)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-error)',
          }}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load comments
        </div>
      )}

      {/* Comments list */}
      {data && topLevelComments.length === 0 && (
        <div
          className="text-center"
          style={{
            padding: 'var(--space-6)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          No comments yet. Be the first to comment.
        </div>
      )}

      {data && topLevelComments.length > 0 && (
        <div className="flex flex-col gap-2">
          {topLevelComments.map((comment) => {
            const replies = allComments.filter((c) => c.parent_comment_id === comment.id);
            return (
              <CommentThread
                key={comment.id}
                comment={comment}
                replies={replies}
                allComments={allComments}
                onReply={handleReply}
                depth={0}
              />
            );
          })}
        </div>
      )}

      {/* New comment form */}
      <div
        style={{
          borderTop: topLevelComments.length > 0 ? '1px solid var(--color-border)' : 'none',
          paddingTop: topLevelComments.length > 0 ? 'var(--space-4)' : '0',
        }}
      >
        {/* Reply indicator */}
        {replyingToComment && (
          <div
            className="mb-2 flex items-center gap-2"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Reply className="h-3 w-3" />
            Replying to {replyingToComment.author_name}
            <button
              onClick={() => setReplyingTo(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-faint)',
                padding: 0,
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Comment type selector */}
        <div className="mb-2 flex gap-2">
          {COMMENT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setCommentType(t.value)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${commentType === t.value ? 'var(--color-signal-border)' : 'var(--color-border)'}`,
                background: commentType === t.value ? 'var(--color-signal-subtle)' : 'transparent',
                color: commentType === t.value ? 'var(--color-signal)' : 'var(--color-text-faint)',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Textarea + submit */}
        <div className="flex gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            disabled={createMutation.isPending}
            rows={2}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-normal)',
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              resize: 'vertical',
            }}
          />
          <Button
            onClick={() => {
              if (commentText.trim()) createMutation.mutate();
            }}
            disabled={!commentText.trim() || createMutation.isPending}
            style={{
              alignSelf: 'flex-end',
              background: 'var(--color-signal)',
              color: 'var(--color-text-inverse)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wide)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              opacity: !commentText.trim() || createMutation.isPending ? 0.5 : 1,
              cursor: !commentText.trim() || createMutation.isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Error */}
        {createMutation.error && (
          <div
            className="mt-2 flex items-center gap-2"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-error)',
            }}
          >
            <AlertCircle className="h-3 w-3" />
            {createMutation.error.message ?? 'Failed to post comment'}
          </div>
        )}
      </div>
    </div>
  );
}
