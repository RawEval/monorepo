'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workbenchService } from '@/services/workbench-service';
import {
  Loader2,
  Inbox,
} from 'lucide-react';
import type { TaskPrompt, TaskAllocation } from '@/features/workbench/types';

interface TaskQueueProps {
  onSelectTask: (allocationId: number, prompt: TaskPrompt) => void;
  selectedPromptId?: number;
}

type FlatTask = {
  allocation: TaskAllocation;
  prompt: TaskPrompt;
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'in_progress':
    case 'annotation_in_progress':
      return 'var(--color-signal)';
    case 'submitted':
    case 'completed':
      return 'var(--color-text-faint)';
    default:
      return 'var(--color-success)';
  }
}

function getStatusLabel(prompt: TaskPrompt, allocation: TaskAllocation): string {
  if (prompt.my_responses > 0 && !prompt.all_answered) return 'In Progress';
  if (prompt.all_answered) return 'Submitted';
  if (allocation.session_started_at) return 'Started';
  return 'Pending';
}

function getTierLabel(tier: number): string {
  if (tier === 1) return 'T1';
  if (tier === 2) return 'T2';
  return `T${tier}`;
}

export function TaskQueue({ onSelectTask, selectedPromptId }: TaskQueueProps) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['workbench-tasks'],
    queryFn: () => workbenchService.getMyTasks(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // Flatten allocations into individual prompt cards, sorted: in-progress first, then pending
  const flatTasks = useMemo<FlatTask[]>(() => {
    if (!data?.items) return [];

    const tasks: FlatTask[] = [];
    for (const allocation of data.items) {
      for (const prompt of allocation.prompts) {
        tasks.push({ allocation, prompt });
      }
    }

    return tasks.sort((a, b) => {
      const aInProgress = a.prompt.my_responses > 0 && !a.prompt.all_answered;
      const bInProgress = b.prompt.my_responses > 0 && !b.prompt.all_answered;
      if (aInProgress && !bInProgress) return -1;
      if (!aInProgress && bInProgress) return 1;

      const aSubmitted = a.prompt.all_answered;
      const bSubmitted = b.prompt.all_answered;
      if (!aSubmitted && bSubmitted) return -1;
      if (aSubmitted && !bSubmitted) return 1;

      return 0;
    });
  }, [data]);

  // Loading
  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3"
        style={{ padding: 'var(--space-8) var(--space-4)' }}
      >
        <Loader2
          className="h-5 w-5 animate-spin"
          style={{ color: 'var(--color-text-faint)' }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
          }}
        >
          Loading tasks...
        </span>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div
        className="flex flex-col items-center gap-2 text-center"
        style={{ padding: 'var(--space-8) var(--space-4)' }}
      >
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-error)',
          }}
        >
          Failed to load tasks
        </p>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)',
          }}
        >
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Empty state
  if (flatTasks.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 text-center"
        style={{ padding: 'var(--space-10) var(--space-4)' }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: 'var(--color-bg-muted)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Inbox
            className="h-6 w-6"
            style={{ color: 'var(--color-text-faint)' }}
          />
        </div>
        <div>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--weight-medium)',
              marginBottom: '4px',
            }}
          >
            No tasks available
          </p>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              lineHeight: 'var(--leading-normal)',
            }}
          >
            New tasks will appear here when assigned to you.
          </p>
        </div>
      </div>
    );
  }

  // Split tasks into groups
  const inProgressTasks = flatTasks.filter(({ prompt, allocation }) => {
    const label = getStatusLabel(prompt, allocation);
    return label === 'In Progress' || label === 'Started';
  });
  const pendingTasks = flatTasks.filter(({ prompt, allocation }) => getStatusLabel(prompt, allocation) === 'Pending');
  const doneTasks = flatTasks.filter(({ prompt }) => prompt.all_answered);

  function renderTaskCard({ allocation, prompt }: FlatTask) {
    const isSelected = selectedPromptId === prompt.failed_prompt_final_id;
    const statusColor = getStatusColor(prompt.status);
    const statusLabel = getStatusLabel(prompt, allocation);
    const progress =
      prompt.total_questions > 0
        ? (prompt.my_responses / prompt.total_questions) * 100
        : 0;

    return (
      <button
        key={`${allocation.allocation_id}-${prompt.failed_prompt_final_id}`}
        onClick={() => onSelectTask(allocation.allocation_id, prompt)}
        className="wb-task-card flex w-full flex-col text-left"
        data-selected={isSelected}
        style={{
          padding: 'var(--space-3) var(--space-3) var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid transparent',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        {/* Color-coded left border */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '6px',
            bottom: '6px',
            width: '3px',
            background: statusColor,
            borderRadius: '2px',
          }}
        />

        {/* Top row: domain + tier + batch */}
        <div className="mb-1.5 flex items-center gap-2">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: 'var(--color-signal)',
              background: 'var(--color-signal-subtle)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-signal-border)',
            }}
          >
            {prompt.domain}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--color-text-faint)',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            {getTierLabel(allocation.tier)}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--color-text-faint)',
              marginLeft: 'auto',
            }}
          >
            #{allocation.batch_number}
          </span>
        </div>

        {/* Failure reason */}
        {prompt.failure_reason && (
          <p
            className="mb-2 line-clamp-2"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-snug)',
              margin: 0,
              marginBottom: 'var(--space-2)',
            }}
          >
            {prompt.failure_reason}
          </p>
        )}

        {/* Bottom row: progress + status */}
        <div className="flex items-center gap-2">
          {/* Progress bar */}
          <div
            className="flex-1"
            style={{
              height: '3px',
              background: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background:
                  progress >= 100
                    ? 'var(--color-success)'
                    : 'var(--color-signal)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Fraction */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--color-text-faint)',
              whiteSpace: 'nowrap',
            }}
          >
            {prompt.my_responses}/{prompt.total_questions}
          </span>

          {/* Status */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: statusColor,
              whiteSpace: 'nowrap',
            }}
          >
            {statusLabel}
          </span>
        </div>
      </button>
    );
  }

  function renderSection(label: string, tasks: FlatTask[], count: number) {
    if (tasks.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <div
          style={{
            padding: 'var(--space-1) var(--space-2)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-text-faint)',
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--color-text-faint)',
              background: 'var(--color-bg-muted)',
              padding: '0 5px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {count}
          </span>
        </div>
        {tasks.map(renderTaskCard)}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{ padding: 'var(--space-2)', gap: 'var(--space-3)' }}
    >
      {renderSection('In Progress', inProgressTasks, inProgressTasks.length)}
      {renderSection('Pending', pendingTasks, pendingTasks.length)}
      {renderSection('Completed', doneTasks, doneTasks.length)}
    </div>
  );
}
