'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Command,
  Inbox,
  X,
} from 'lucide-react';
// cn utility available if needed for dynamic class composition

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface SessionStats {
  tasksCompletedToday: number;
  sessionDuration: string;
  earningsToday: string;
  currentStreak: number;
}

interface WorkbenchLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  rightPanel: React.ReactNode;
  profileCompleted: boolean;
  missingFields?: string[];
  focusMode: boolean;
  onToggleFocusMode: () => void;
  sessionStats: SessionStats;
  currentTaskDomain?: string;
  currentTaskStatus?: string;
  pendingTaskCount: number;
  onOpenCommandPalette: () => void;
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function WorkbenchLayout({
  sidebar,
  main,
  rightPanel,
  profileCompleted,
  missingFields,
  focusMode,
  onToggleFocusMode,
  sessionStats,
  currentTaskDomain,
  pendingTaskCount,
  onOpenCommandPalette,
}: WorkbenchLayoutProps) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightPanelWidth, setRightPanelWidth] = useState(380);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const resizingRef = useRef(false);

  // Save panel state before focus mode
  const savedPanelState = useRef({ leftOpen: true, rightOpen: true });

  // When entering focus mode, save state and collapse
  useEffect(() => {
    if (focusMode) {
      savedPanelState.current = { leftOpen, rightOpen };
      setLeftOpen(false);
      setDrawerOpen(false);
    } else {
      setLeftOpen(savedPanelState.current.leftOpen);
      setDrawerOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMode]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) return;

      if (e.key === '[') {
        e.preventDefault();
        if (!focusMode) setLeftOpen((p) => !p);
      } else if (e.key === ']') {
        e.preventDefault();
        if (focusMode) {
          setDrawerOpen((p) => !p);
        } else {
          setRightOpen((p) => !p);
        }
      }
    },
    [focusMode],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Resize handle logic
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    const startX = e.clientX;
    const startWidth = rightPanelWidth;

    function onMove(ev: MouseEvent) {
      if (!resizingRef.current) return;
      const delta = startX - ev.clientX;
      const next = Math.min(600, Math.max(300, startWidth + delta));
      setRightPanelWidth(next);
    }
    function onUp() {
      resizingRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rightPanelWidth]);

  const handleResizeDoubleClick = useCallback(() => {
    setRightPanelWidth((w) => (w > 400 ? 380 : Math.min(600, Math.round(window.innerWidth * 0.45))));
  }, []);

  /* ================================================================ */
  /* Focus Mode Header (32px mini-strip)                               */
  /* ================================================================ */

  if (focusMode) {
    return (
      <div className="flex h-screen flex-col" style={{ background: 'var(--color-bg-base)' }}>
        {/* Mini header */}
        <header
          className="flex shrink-0 items-center justify-between"
          style={{
            height: '36px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg-surface)',
            padding: '0 var(--space-4)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-5 w-5 items-center justify-center"
              style={{ background: 'var(--color-bg-inverse)', borderRadius: 'var(--radius-sm)' }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-text-inverse)', fontWeight: 'var(--weight-medium)' }}>
                R
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>
              Focus
            </span>
            {currentTaskDomain && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '1px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-signal-subtle)', color: 'var(--color-signal)',
                border: '1px solid var(--color-signal-border)',
              }}>
                {currentTaskDomain}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen((p) => !p)}
              style={{ ...iconBtnStyle, color: drawerOpen ? 'var(--color-signal)' : 'var(--color-text-faint)' }}
              title="Toggle rubric panel [ ] ]"
            >
              {drawerOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
            </button>
            <button onClick={onToggleFocusMode} style={iconBtnStyle} title="Exit focus mode">
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Full-width main content */}
        <main className="min-w-0 flex-1 overflow-y-auto">{main}</main>

        {/* Drawer backdrop + panel */}
        {drawerOpen && (
          <>
            <div className="wb-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
            <div className="wb-drawer" style={{ width: `${rightPanelWidth}px`, top: '36px' }}>
              <div className="flex shrink-0 items-center justify-between" style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Rubric & Questions
                </span>
                <button onClick={() => setDrawerOpen(false)} style={iconBtnStyle} title="Close panel">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="scroll-area flex-1 overflow-y-auto">{rightPanel}</div>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ================================================================ */
  /* Normal Mode                                                       */
  /* ================================================================ */

  return (
    <div className="flex h-screen flex-col" style={{ background: 'var(--color-bg-base)' }}>
      {/* ── Command Center Header ── */}
      <header
        className="flex shrink-0 items-center justify-between"
        style={{
          height: '52px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-base)',
          padding: '0 var(--space-5)',
        }}
      >
        {/* Left: logo + title + domain */}
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="flex items-center gap-2.5 no-underline"
            title="Back to Portal"
          >
            <div
              className="flex h-7 w-7 items-center justify-center"
              style={{ background: 'var(--color-bg-inverse)', borderRadius: 'var(--radius-sm)' }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-inverse)', fontWeight: 'var(--weight-medium)' }}>
                R
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', color: 'var(--color-text-primary)' }}>
              Workbench
            </span>
          </a>
          {currentTaskDomain && (
            <>
              <span style={{ color: 'var(--color-border-strong)', fontSize: '14px', fontWeight: 300 }}>/</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-signal-subtle)', color: 'var(--color-signal)',
                border: '1px solid var(--color-signal-border)', letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
              }}>
                {currentTaskDomain}
              </span>
            </>
          )}
        </div>

        {/* Center: session stats */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="wb-stat">
            <span className="wb-stat-label">Completed</span>
            <span className="wb-stat-value">{sessionStats.tasksCompletedToday}</span>
          </div>
          <div className="wb-stat">
            <span className="wb-stat-label">Session</span>
            <span className="wb-stat-value">{sessionStats.sessionDuration}</span>
          </div>
          <div className="wb-stat">
            <span className="wb-stat-label">Earned</span>
            <span className="wb-stat-value" style={{ color: 'var(--color-success)' }}>{sessionStats.earningsToday}</span>
          </div>
          {sessionStats.currentStreak > 0 && (
            <div className="wb-stat">
              <span className="wb-stat-label">Streak</span>
              <span className="wb-stat-value" style={{ color: 'var(--color-signal)' }}>
                {sessionStats.currentStreak}
              </span>
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {!profileCompleted && (
            <a
              href="/onboarding"
              className="flex items-center gap-1.5 no-underline"
              style={{
                background: 'var(--color-warning-subtle)',
                border: '1px solid rgba(138,106,0,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '4px 10px',
                fontSize: '11px',
                color: 'var(--color-warning)',
              }}
            >
              <AlertTriangle className="h-3 w-3" />
              <span>
                Incomplete{missingFields && missingFields.length > 0 ? `: ${missingFields.slice(0, 2).join(', ')}` : ''}
              </span>
            </a>
          )}
          <button onClick={onOpenCommandPalette} style={iconBtnStyle} title="Command palette (Cmd+K)">
            <Command className="h-4 w-4" />
          </button>
          <button onClick={onToggleFocusMode} style={iconBtnStyle} title="Focus mode (F)">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── Three-Zone Body ── */}
      <div className="flex min-h-0 flex-1">
        {/* Zone A: Left sidebar */}
        <aside
          className="shrink-0 overflow-hidden transition-all duration-200"
          style={{
            width: leftOpen ? '280px' : '0px',
            borderRight: leftOpen ? '1px solid var(--color-border)' : 'none',
            background: 'var(--color-bg-surface)',
          }}
        >
          {leftOpen && (
            <div className="flex h-full flex-col">
              <div
                className="flex shrink-0 items-center justify-between"
                style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)' }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Task Queue
                </span>
                <button onClick={() => setLeftOpen(false)} style={iconBtnStyle} title="Collapse sidebar [ [ ]">
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>
              <div className="scroll-area flex-1 overflow-y-auto">{sidebar}</div>
            </div>
          )}
        </aside>

        {/* Left sidebar toggle (collapsed) */}
        {!leftOpen && (
          <button
            onClick={() => setLeftOpen(true)}
            className="relative flex shrink-0 flex-col items-center justify-center"
            style={{
              width: '40px',
              borderRight: '1px solid var(--color-border)',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-faint)',
              cursor: 'pointer',
              gap: '10px',
              border: 'none',
              borderRightWidth: '1px',
              borderRightStyle: 'solid',
              borderRightColor: 'var(--color-border)',
            }}
            title="Expand sidebar [ [ ]"
          >
            {pendingTaskCount > 0 && (
              <span className="wb-sidebar-badge">{pendingTaskCount > 99 ? '99+' : pendingTaskCount}</span>
            )}
            <Inbox className="h-4 w-4" style={{ marginTop: pendingTaskCount > 0 ? '28px' : '0' }} />
            <PanelLeftOpen className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Zone B: Main content */}
        <main className="min-w-0 flex-1 overflow-y-auto">{main}</main>

        {/* Resize handle */}
        {rightOpen && (
          <div
            className="wb-resize-handle"
            onMouseDown={startResize}
            onDoubleClick={handleResizeDoubleClick}
          />
        )}

        {/* Right panel toggle (collapsed) */}
        {!rightOpen && (
          <button
            onClick={() => setRightOpen(true)}
            className="flex shrink-0 items-center justify-center"
            style={{
              width: '40px',
              borderLeft: '1px solid var(--color-border)',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-faint)',
              border: 'none',
              borderLeftWidth: '1px',
              borderLeftStyle: 'solid',
              borderLeftColor: 'var(--color-border)',
              cursor: 'pointer',
            }}
            title="Expand panel [ ] ]"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
        )}

        {/* Zone C: Right panel */}
        <aside
          className="shrink-0 overflow-hidden transition-all duration-200"
          style={{
            width: rightOpen ? `${rightPanelWidth}px` : '0px',
            borderLeft: rightOpen ? 'none' : 'none', // handle provides visual border
            background: 'var(--color-bg-surface)',
          }}
        >
          {rightOpen && (
            <div className="flex h-full flex-col">
              <div
                className="flex shrink-0 items-center justify-between"
                style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)' }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Rubric & Questions
                </span>
                <button onClick={() => setRightOpen(false)} style={iconBtnStyle} title="Collapse panel [ ] ]">
                  <PanelRightClose className="h-4 w-4" />
                </button>
              </div>
              <div className="scroll-area flex-1 overflow-y-auto">{rightPanel}</div>
            </div>
          )}
        </aside>
      </div>

      {/* ── Bottom Status Bar ── */}
      <footer
        className="flex shrink-0 items-center justify-between"
        style={{
          height: '28px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-muted)',
          padding: '0 var(--space-4)',
        }}
      >
        <div className="flex items-center gap-4">
          <ShortcutHint keys="[" label="Tasks" />
          <ShortcutHint keys="]" label="Panel" />
          <ShortcutHint keys="F" label="Focus" />
          <ShortcutHint keys="\u2318K" label="Commands" />
        </div>
        <div className="flex items-center gap-4">
          <ShortcutHint keys="Alt+1\u20134" label="Tabs" />
          <ShortcutHint keys="Esc" label="Exit" />
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const iconBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: 'var(--radius-md)',
  background: 'transparent',
  border: 'none',
  color: 'var(--color-text-faint)',
  cursor: 'pointer',
  transition: 'color 0.15s, background 0.15s',
};

function ShortcutHint({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5" style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
      <kbd
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          padding: '1px 5px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border-strong)',
          background: 'var(--color-bg-base)',
          color: 'var(--color-text-muted)',
        }}
      >
        {keys}
      </kbd>
      <span>{label}</span>
    </div>
  );
}
