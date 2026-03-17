'use client';

import { useState, useCallback, useEffect } from 'react';
import { WorkbenchGate, useWorkbenchGate } from '@/features/workbench/components/workbench-gate';
import { WorkbenchLayout } from '@/features/workbench/components/workbench-layout';
import { TaskQueue } from '@/features/workbench/components/task-queue';
import { ConversationView } from '@/features/workbench/components/conversation-view';
import { RubricPanel } from '@/features/workbench/components/rubric-panel';
import { QuestionsPanel } from '@/features/workbench/components/questions-panel';
import { SubmissionForm } from '@/features/workbench/components/submission-form';
import { CommentsPanel } from '@/features/workbench/components/comments-panel';
import { StatusTimeline } from '@/features/workbench/components/status-timeline';
import { ErrorBoundary } from '@/components/error-boundary';
import type { TaskPrompt } from '@/features/workbench/types';
import { FileText, BookOpen, MessageSquare, ClipboardList, Send, MessagesSquare } from 'lucide-react';

// ── Right panel tab type ────────────────────────────────────────────────────

type RightTab = 'rubric' | 'questions' | 'submission' | 'comments';

const TAB_CONFIG: { key: RightTab; label: string; icon: React.ElementType }[] = [
  { key: 'rubric', label: 'Rubric', icon: ClipboardList },
  { key: 'questions', label: 'Questions', icon: MessageSquare },
  { key: 'submission', label: 'Submit', icon: Send },
  { key: 'comments', label: 'Comments', icon: MessagesSquare },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function WorkbenchPage() {
  return (
    <ErrorBoundary fallbackMessage="The workbench encountered an error">
      <WorkbenchGate>
        <WorkbenchContent />
      </WorkbenchGate>
    </ErrorBoundary>
  );
}

// ── Workbench Content ───────────────────────────────────────────────────────

function WorkbenchContent() {
  const { profileCompleted, missingFields } = useWorkbenchGate();
  const [selectedAllocationId, setSelectedAllocationId] = useState<number | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<TaskPrompt | null>(null);
  const [activeTab, setActiveTab] = useState<RightTab>('rubric');

  const handleSelectTask = useCallback((allocationId: number, prompt: TaskPrompt) => {
    setSelectedAllocationId(allocationId);
    setSelectedPrompt(prompt);
    setActiveTab('rubric');
  }, []);

  const handleAllAnswered = useCallback(() => {
    setActiveTab('submission');
  }, []);

  const handleSubmitted = useCallback(() => {
    setSelectedAllocationId(null);
    setSelectedPrompt(null);
    setActiveTab('rubric');
  }, []);

  // Keyboard shortcuts for tab switching
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === '1' && e.altKey) { setActiveTab('rubric'); e.preventDefault(); }
      if (e.key === '2' && e.altKey) { setActiveTab('questions'); e.preventDefault(); }
      if (e.key === '3' && e.altKey) { setActiveTab('submission'); e.preventDefault(); }
      if (e.key === '4' && e.altKey) { setActiveTab('comments'); e.preventDefault(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const conversationId = selectedPrompt?.conversation_id ?? null;
  const fpfId = selectedPrompt?.failed_prompt_final_id ?? null;

  return (
    <WorkbenchLayout
      profileCompleted={profileCompleted}
      missingFields={missingFields}
      sidebar={
        <TaskQueue
          onSelectTask={handleSelectTask}
          selectedPromptId={fpfId ?? undefined}
        />
      }
      main={
        conversationId && selectedPrompt ? (
          <ConversationView
            conversationId={conversationId}
            failedModel={selectedPrompt.failed_model}
            failedProvider={selectedPrompt.failed_provider}
            failedTurnNumber={selectedPrompt.failed_turn_number}
          />
        ) : (
          <EmptyMainState />
        )
      }
      rightPanel={
        fpfId && selectedAllocationId ? (
          <RightPanel
            conversationId={conversationId!}
            fpfId={fpfId}
            allocationId={selectedAllocationId}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAllAnswered={handleAllAnswered}
            onSubmitted={handleSubmitted}
            originalResponse={selectedPrompt?.failure_reason ?? ''}
          />
        ) : (
          <EmptyRightPanelState />
        )
      }
    />
  );
}

// ── Right Panel ─────────────────────────────────────────────────────────────

function RightPanel({
  conversationId,
  fpfId,
  allocationId,
  activeTab,
  onTabChange,
  onAllAnswered,
  onSubmitted,
  originalResponse,
}: {
  conversationId: number;
  fpfId: number;
  allocationId: number;
  activeTab: RightTab;
  onTabChange: (tab: RightTab) => void;
  onAllAnswered: () => void;
  onSubmitted: () => void;
  originalResponse: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Tab Bar ── */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-base)',
          position: 'sticky',
          top: 0,
          zIndex: 5,
        }}
      >
        {TAB_CONFIG.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              style={{
                flex: 1,
                padding: '10px 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                borderBottom: isActive ? '2px solid var(--color-signal)' : '2px solid transparent',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'transparent',
                border: 'none',
                borderBottomStyle: 'solid',
                cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              <Icon style={{ width: 13, height: 13 }} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'rubric' && (
          <RubricPanel conversationId={conversationId} />
        )}
        {activeTab === 'questions' && (
          <QuestionsPanel
            fpfId={fpfId}
            allocationId={allocationId}
            onAllAnswered={onAllAnswered}
          />
        )}
        {activeTab === 'submission' && (
          <SubmissionForm
            allocationId={allocationId}
            promptId={fpfId}
            originalResponse={originalResponse}
            onSubmitted={onSubmitted}
          />
        )}
        {activeTab === 'comments' && (
          <CommentsPanel fpfId={fpfId} />
        )}
      </div>

      {/* ── Status Timeline (collapsed at bottom) ── */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          maxHeight: 120,
          overflow: 'auto',
        }}
      >
        <StatusTimeline fpfId={fpfId} />
      </div>
    </div>
  );
}

// ── Empty States ────────────────────────────────────────────────────────────

function EmptyMainState() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-4"
      style={{ padding: 'var(--space-8)', color: 'var(--color-text-faint)' }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
      >
        <FileText className="h-7 w-7" style={{ color: 'var(--color-text-faint)' }} />
      </div>
      <div className="text-center">
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
          Select a task to begin
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', letterSpacing: 'var(--tracking-wide)' }}>
          Choose a task from the sidebar to start annotating
        </p>
      </div>
    </div>
  );
}

function EmptyRightPanelState() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-3"
      style={{ padding: 'var(--space-6)', color: 'var(--color-text-faint)' }}
    >
      <BookOpen className="h-6 w-6" style={{ color: 'var(--color-text-faint)' }} />
      <p
        className="text-center"
        style={{
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: 'var(--tracking-wide)',
          textTransform: 'uppercase',
          lineHeight: 'var(--leading-normal)',
        }}
      >
        Rubric and questions will appear here when a task is selected
      </p>
    </div>
  );
}
