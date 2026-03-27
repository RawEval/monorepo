'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WorkbenchGate, useWorkbenchGate } from '@/features/workbench/components/workbench-gate';
import { WorkbenchLayout } from '@/features/workbench/components/workbench-layout';
import type { SessionStats } from '@/features/workbench/components/workbench-layout';
import { TaskQueue } from '@/features/workbench/components/task-queue';
import { ConversationView } from '@/features/workbench/components/conversation-view';
import { RubricPanel } from '@/features/workbench/components/rubric-panel';
import { QuestionsPanel } from '@/features/workbench/components/questions-panel';
import { SubmissionForm } from '@/features/workbench/components/submission-form';
import { CommentsPanel } from '@/features/workbench/components/comments-panel';
import { StatusTimeline } from '@/features/workbench/components/status-timeline';
import { ErrorBoundary } from '@/components/error-boundary';
import type { TaskPrompt, TaskListResponse } from '@/features/workbench/types';
import {
  FileText,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Send,
  MessagesSquare,
  Maximize2,
  ChevronDown,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type RightTab = 'rubric' | 'questions' | 'submission' | 'comments';

const TAB_CONFIG: { key: RightTab; label: string; icon: React.ElementType; shortcut: string }[] = [
  { key: 'rubric', label: 'Rubric', icon: ClipboardList, shortcut: 'Alt+1' },
  { key: 'questions', label: 'Questions', icon: MessageSquare, shortcut: 'Alt+2' },
  { key: 'submission', label: 'Submit', icon: Send, shortcut: 'Alt+3' },
  { key: 'comments', label: 'Comments', icon: MessagesSquare, shortcut: 'Alt+4' },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function WorkbenchPage() {
  return (
    <ErrorBoundary fallbackMessage="The workbench encountered an error">
      <WorkbenchGate>
        <WorkbenchContent />
      </WorkbenchGate>
    </ErrorBoundary>
  );
}

/* ------------------------------------------------------------------ */
/* Workbench Content                                                   */
/* ------------------------------------------------------------------ */

function WorkbenchContent() {
  const { profileCompleted, missingFields } = useWorkbenchGate();
  const queryClient = useQueryClient();

  // ── Core state ──
  const [selectedAllocationId, setSelectedAllocationId] = useState<number | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<TaskPrompt | null>(null);
  const [activeTab, setActiveTab] = useState<RightTab>('rubric');

  // ── Post-submission success state ──
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSubmittedDomain, setLastSubmittedDomain] = useState<string | null>(null);

  // ── Focus mode ──
  const [focusMode, setFocusMode] = useState(false);

  // ── Command palette ──
  const [cmdOpen, setCmdOpen] = useState(false);

  // ── Session tracking ──
  const sessionStartRef = useRef(Date.now());
  const [sessionDuration, setSessionDuration] = useState('0m');

  useEffect(() => {
    const iv = setInterval(() => {
      const mins = Math.floor((Date.now() - sessionStartRef.current) / 60000);
      if (mins < 60) {
        setSessionDuration(`${mins}m`);
      } else {
        setSessionDuration(`${Math.floor(mins / 60)}h ${mins % 60}m`);
      }
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  // Derive session stats from React Query cache
  const sessionStats = useMemo<SessionStats>(() => {
    const data = queryClient.getQueryData<TaskListResponse>(['workbench-tasks']);
    let completedToday = 0;
    let pendingCount = 0;
    let streak = 0;
    let streakBroken = false;

    if (data?.items) {
      for (const alloc of data.items) {
        for (const p of alloc.prompts) {
          if (p.all_answered) {
            completedToday++;
            if (!streakBroken) streak++;
          } else {
            pendingCount++;
            streakBroken = true;
          }
        }
      }
    }

    const tier = data?.expert_tier ?? 3;
    const rate = tier === 1 ? 15 : tier === 2 ? 10 : 8;

    return {
      tasksCompletedToday: completedToday,
      sessionDuration,
      earningsToday: `$${(completedToday * rate).toFixed(0)}`,
      currentStreak: streak,
    };
  }, [queryClient, sessionDuration]);

  // Pending task count for collapsed sidebar badge
  const pendingTaskCount = useMemo(() => {
    const data = queryClient.getQueryData<TaskListResponse>(['workbench-tasks']);
    if (!data?.items) return 0;
    let count = 0;
    for (const alloc of data.items) {
      for (const p of alloc.prompts) {
        if (!p.all_answered) count++;
      }
    }
    return count;
  }, [queryClient]);

  // ── Handlers ──
  const handleSelectTask = useCallback((allocationId: number, prompt: TaskPrompt) => {
    setShowSuccess(false);
    setSelectedAllocationId(allocationId);
    setSelectedPrompt(prompt);
    setActiveTab('rubric');
  }, []);

  const handleAllAnswered = useCallback(() => {
    setActiveTab('submission');
  }, []);

  const handleSubmitted = useCallback(() => {
    setLastSubmittedDomain(selectedPrompt?.domain ?? null);
    setSelectedAllocationId(null);
    setSelectedPrompt(null);
    setActiveTab('rubric');
    setShowSuccess(true);
    // Refresh task list to update stats
    queryClient.invalidateQueries({ queryKey: ['workbench-tasks'] });
  }, [selectedPrompt, queryClient]);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((p) => !p);
  }, []);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      // Tab switching
      if (e.altKey) {
        if (e.key === '1') { setActiveTab('rubric'); e.preventDefault(); }
        if (e.key === '2') { setActiveTab('questions'); e.preventDefault(); }
        if (e.key === '3') { setActiveTab('submission'); e.preventDefault(); }
        if (e.key === '4') { setActiveTab('comments'); e.preventDefault(); }
      }

      // Focus mode
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setFocusMode((p) => !p);
      }

      // Escape to exit focus mode / close command palette
      if (e.key === 'Escape') {
        if (cmdOpen) { setCmdOpen(false); e.preventDefault(); }
        else if (focusMode) { setFocusMode(false); e.preventDefault(); }
      }

      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((p) => !p);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cmdOpen, focusMode]);

  // ── Command palette action handler ──
  const handleCommandAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'tab-rubric': setActiveTab('rubric'); break;
      case 'tab-questions': setActiveTab('questions'); break;
      case 'tab-submission': setActiveTab('submission'); break;
      case 'tab-comments': setActiveTab('comments'); break;
      case 'focus-toggle': setFocusMode((p) => !p); break;
      default: break;
    }
    setCmdOpen(false);
  }, []);

  const conversationId = selectedPrompt?.conversation_id ?? null;
  const fpfId = selectedPrompt?.failed_prompt_final_id ?? null;

  return (
    <>
      <WorkbenchLayout
        profileCompleted={profileCompleted}
        missingFields={missingFields}
        focusMode={focusMode}
        onToggleFocusMode={toggleFocusMode}
        sessionStats={sessionStats}
        currentTaskDomain={selectedPrompt?.domain}
        currentTaskStatus={selectedPrompt?.status}
        pendingTaskCount={pendingTaskCount}
        onOpenCommandPalette={() => setCmdOpen(true)}
        sidebar={
          <TaskQueue
            onSelectTask={handleSelectTask}
            selectedPromptId={fpfId ?? undefined}
          />
        }
        main={
          conversationId && selectedPrompt ? (
            <div className="wb-conversation-wrap">
              <ConversationView
                conversationId={conversationId}
                failedModel={selectedPrompt.failed_model}
                failedProvider={selectedPrompt.failed_provider}
                failedTurnNumber={selectedPrompt.failed_turn_number}
              />
            </div>
          ) : showSuccess ? (
            <SubmissionSuccessState
              domain={lastSubmittedDomain}
              sessionStats={sessionStats}
              pendingCount={pendingTaskCount}
              onNextTask={() => setShowSuccess(false)}
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

      {/* Command Palette */}
      {cmdOpen && (
        <CommandPalette
          onClose={() => setCmdOpen(false)}
          onAction={handleCommandAction}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Command Palette                                                     */
/* ------------------------------------------------------------------ */

interface CmdAction {
  id: string;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  group: string;
}

const CMD_ACTIONS: CmdAction[] = [
  { id: 'tab-rubric', label: 'Switch to Rubric', icon: ClipboardList, shortcut: 'Alt+1', group: 'Tabs' },
  { id: 'tab-questions', label: 'Switch to Questions', icon: MessageSquare, shortcut: 'Alt+2', group: 'Tabs' },
  { id: 'tab-submission', label: 'Switch to Submit', icon: Send, shortcut: 'Alt+3', group: 'Tabs' },
  { id: 'tab-comments', label: 'Switch to Comments', icon: MessagesSquare, shortcut: 'Alt+4', group: 'Tabs' },
  { id: 'focus-toggle', label: 'Toggle Focus Mode', icon: Maximize2, shortcut: 'F', group: 'View' },
];

function CommandPalette({
  onClose,
  onAction,
}: {
  onClose: () => void;
  onAction: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return CMD_ACTIONS;
    const q = query.toLowerCase();
    return CMD_ACTIONS.filter(
      (a) => a.label.toLowerCase().includes(q) || a.group.toLowerCase().includes(q),
    );
  }, [query]);

  // Reset selection when filter changes
  useEffect(() => { setSelectedIndex(0); }, [filtered.length]);

  // Autofocus
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        onAction(filtered[selectedIndex].id);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [filtered, selectedIndex, onAction, onClose],
  );

  // Group actions
  const groups = useMemo(() => {
    const map = new Map<string, CmdAction[]>();
    for (const a of filtered) {
      const list = map.get(a.group) ?? [];
      list.push(a);
      map.set(a.group, list);
    }
    return map;
  }, [filtered]);

  let globalIdx = 0;

  return (
    <div className="wb-cmd-overlay" onClick={onClose}>
      <div className="wb-cmd-box" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="wb-cmd-input"
          placeholder="Type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="wb-cmd-list">
          {filtered.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
              No matching commands
            </div>
          )}
          {[...groups.entries()].map(([group, actions]) => (
            <div key={group}>
              <div style={{
                padding: '8px 12px 4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-faint)',
              }}>
                {group}
              </div>
              {actions.map((action) => {
                const idx = globalIdx++;
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    className="wb-cmd-item"
                    data-selected={idx === selectedIndex}
                    onClick={() => onAction(action.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Icon className="wb-cmd-item-icon" />
                    <span>{action.label}</span>
                    {action.shortcut && <span className="wb-cmd-shortcut">{action.shortcut}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Right Panel with Pill Tabs                                          */
/* ------------------------------------------------------------------ */

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
  const [timelineOpen, setTimelineOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Progress strip ── */}
      <AnnotationProgressStrip fpfId={fpfId} />

      {/* ── Pill Tab Bar ── */}
      <div className="wb-pill-tab-bar">
        {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className="wb-pill-tab"
            data-active={activeTab === key}
            onClick={() => onTabChange(key)}
            title={`Switch to ${label}`}
          >
            <Icon style={{ width: 12, height: 12 }} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="wb-tab-content">
        {activeTab === 'rubric' && <RubricPanel conversationId={conversationId} />}
        {activeTab === 'questions' && (
          <QuestionsPanel fpfId={fpfId} allocationId={allocationId} onAllAnswered={onAllAnswered} />
        )}
        {activeTab === 'submission' && (
          <SubmissionForm
            allocationId={allocationId}
            promptId={fpfId}
            originalResponse={originalResponse}
            onSubmitted={onSubmitted}
          />
        )}
        {activeTab === 'comments' && <CommentsPanel fpfId={fpfId} />}
      </div>

      {/* ── Status Timeline — VS Code-style collapsible bottom panel ── */}
      <div
        className="wb-collapsible-header"
        data-open={timelineOpen}
        onClick={() => setTimelineOpen((p) => !p)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTimelineOpen((p) => !p); } }}
      >
        <ChevronDown className="wb-collapsible-chevron" />
        <span className="wb-collapsible-title">Timeline</span>
        <Clock style={{ width: 12, height: 12, color: 'var(--color-text-faint)' }} />
      </div>
      <div
        className="wb-collapsible-body scroll-area"
        data-open={timelineOpen}
      >
        <div style={{ padding: 'var(--space-3) var(--space-4) var(--space-4)' }}>
          <StatusTimeline fpfId={fpfId} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Annotation Progress Strip                                           */
/* ------------------------------------------------------------------ */

function AnnotationProgressStrip({ fpfId }: { fpfId: number }) {
  const queryClient = useQueryClient();

  // Read from cache — the QuestionsPanel populates this
  const data = queryClient.getQueryData<{ total_questions: number; my_progress: { questions_answered: number } }>(['task-questions', fpfId]);

  const total = data?.total_questions ?? 0;
  const answered = data?.my_progress?.questions_answered ?? 0;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  if (total === 0) return null;

  const color = pct >= 100 ? 'var(--color-success)' : pct >= 50 ? 'var(--color-signal)' : 'var(--color-warning)';

  return (
    <div className="wb-progress-strip">
      <div className="wb-progress-strip-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Submission Success State                                             */
/* ------------------------------------------------------------------ */

function SubmissionSuccessState({
  domain,
  sessionStats,
  pendingCount,
  onNextTask,
}: {
  domain: string | null;
  sessionStats: SessionStats;
  pendingCount: number;
  onNextTask: () => void;
}) {
  return (
    <div className="wb-success-state">
      <div className="wb-success-icon">
        <CheckCircle2 style={{ width: 32, height: 32, color: 'var(--color-success)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'center' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
          color: 'var(--color-text-primary)', margin: 0,
        }}>
          Annotation Submitted
        </h2>
        <p style={{
          fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)',
          lineHeight: 'var(--leading-normal)', maxWidth: '360px',
        }}>
          {domain
            ? `Your ${domain} annotation has been submitted for review. Great work!`
            : 'Your annotation has been submitted for review. Great work!'}
        </p>
      </div>

      {/* Session summary stats */}
      <div className="wb-success-stats">
        <div className="wb-success-stat">
          <span className="wb-success-stat-value">{sessionStats.tasksCompletedToday}</span>
          <span className="wb-success-stat-label">Completed</span>
        </div>
        <div className="wb-success-stat">
          <span className="wb-success-stat-value" style={{ color: 'var(--color-success)' }}>
            {sessionStats.earningsToday}
          </span>
          <span className="wb-success-stat-label">Earned</span>
        </div>
        <div className="wb-success-stat">
          <span className="wb-success-stat-value">{sessionStats.sessionDuration}</span>
          <span className="wb-success-stat-label">Session</span>
        </div>
        {sessionStats.currentStreak > 1 && (
          <div className="wb-success-stat">
            <span className="wb-success-stat-value" style={{ color: 'var(--color-signal)' }}>
              {sessionStats.currentStreak}
            </span>
            <span className="wb-success-stat-label">Streak</span>
          </div>
        )}
      </div>

      {/* Next action */}
      {pendingCount > 0 ? (
        <button
          onClick={onNextTask}
          className="btn-primary"
          style={{ gap: '8px', padding: '14px 28px', fontSize: 'var(--text-sm)' }}
        >
          Next Task
          <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
          }}>
            All tasks complete
          </p>
          <a
            href="/dashboard"
            className="btn-secondary"
            style={{ gap: '6px', fontSize: 'var(--text-xs)', padding: '10px 20px' }}
          >
            Back to Portal
            <ArrowRight style={{ width: 14, height: 14 }} />
          </a>
        </div>
      )}

      {pendingCount > 0 && (
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)',
        }}>
          {pendingCount} task{pendingCount !== 1 ? 's' : ''} remaining
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty States                                                        */
/* ------------------------------------------------------------------ */

function EmptyMainState() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-5"
      style={{ padding: 'var(--space-10)', color: 'var(--color-text-faint)' }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
      >
        <FileText className="h-7 w-7" style={{ color: 'var(--color-text-faint)' }} />
      </div>
      <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Select a task to begin
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', lineHeight: 'var(--leading-normal)', maxWidth: '320px' }}>
          Choose a task from the sidebar to start annotating AI model responses
        </p>
      </div>

      {/* Quick start hints */}
      <div
        className="flex flex-col gap-2"
        style={{
          maxWidth: '260px', marginTop: 'var(--space-2)',
          padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 'var(--space-1)',
        }}>
          Keyboard shortcuts
        </span>
        {[
          { keys: '[', label: 'Toggle task sidebar' },
          { keys: ']', label: 'Toggle right panel' },
          { keys: 'F', label: 'Enter focus mode' },
          { keys: '\u2318K', label: 'Command palette' },
        ].map(({ keys, label }) => (
          <div key={keys} className="flex items-center gap-3" style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <kbd style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '2px 8px',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-strong)',
              background: 'var(--color-bg-base)', color: 'var(--color-text-muted)', minWidth: '32px', textAlign: 'center',
            }}>
              {keys}
            </kbd>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyRightPanelState() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-4"
      style={{ padding: 'var(--space-8)', color: 'var(--color-text-faint)' }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: 'var(--color-bg-muted)', border: '1px solid var(--color-border)' }}
      >
        <BookOpen className="h-5 w-5" style={{ color: 'var(--color-text-faint)' }} />
      </div>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <p style={{
          fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0,
        }}>
          No task selected
        </p>
        <p style={{
          fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)',
          letterSpacing: 'var(--tracking-wide)', color: 'var(--color-text-faint)',
          lineHeight: 'var(--leading-normal)',
        }}>
          Rubric, questions, and submission form will appear here
        </p>
      </div>
    </div>
  );
}
