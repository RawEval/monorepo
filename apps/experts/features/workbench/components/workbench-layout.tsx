'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@raweval/utils/cn';

interface WorkbenchLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  rightPanel: React.ReactNode;
  profileCompleted: boolean;
  missingFields?: string[];
}

export function WorkbenchLayout({
  sidebar,
  main,
  rightPanel,
  profileCompleted,
  missingFields,
}: WorkbenchLayoutProps) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger when typing in inputs
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }

    if (e.key === '[') {
      e.preventDefault();
      setLeftOpen((prev) => !prev);
    } else if (e.key === ']') {
      e.preventDefault();
      setRightOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="flex h-screen flex-col"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Top bar */}
      <header
        className="flex shrink-0 items-center justify-between"
        style={{
          height: 'var(--nav-height)',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-base)',
          padding: '0 var(--space-5)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-7 w-7 items-center justify-center"
            style={{
              background: 'var(--color-bg-inverse)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-inverse)',
                fontWeight: 'var(--weight-medium)',
              }}
            >
              R
            </span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-md)',
              color: 'var(--color-text-primary)',
            }}
          >
            Workbench
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Profile incomplete banner */}
          {!profileCompleted && (
            <a
              href="/onboarding"
              className="flex items-center gap-2 no-underline"
              style={{
                background: 'var(--color-warning-subtle)',
                border: '1px solid rgba(138, 106, 0, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-warning)',
              }}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>
                Profile incomplete
                {missingFields && missingFields.length > 0
                  ? `: ${missingFields.slice(0, 2).join(', ')}${missingFields.length > 2 ? '...' : ''}`
                  : ''}
              </span>
              <ArrowRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </header>

      {/* Main three-zone area */}
      <div className="flex min-h-0 flex-1">
        {/* Zone A: Left sidebar */}
        <aside
          className={cn(
            'shrink-0 overflow-hidden transition-all duration-200',
          )}
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
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Task Queue
                </span>
                <button
                  onClick={() => setLeftOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded"
                  style={{
                    color: 'var(--color-text-faint)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="Collapse sidebar [ [ ]"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>
              <div className="scroll-area flex-1 overflow-y-auto">
                {sidebar}
              </div>
            </div>
          )}
        </aside>

        {/* Left sidebar toggle (when collapsed) */}
        {!leftOpen && (
          <button
            onClick={() => setLeftOpen(true)}
            className="flex shrink-0 items-center justify-center"
            style={{
              width: '32px',
              borderRight: '1px solid var(--color-border)',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-faint)',
              border: 'none',
              borderRightWidth: '1px',
              borderRightStyle: 'solid',
              borderRightColor: 'var(--color-border)',
              cursor: 'pointer',
            }}
            title="Expand sidebar [ [ ]"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        {/* Zone B: Main content */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          {main}
        </main>

        {/* Right panel toggle (when collapsed) */}
        {!rightOpen && (
          <button
            onClick={() => setRightOpen(true)}
            className="flex shrink-0 items-center justify-center"
            style={{
              width: '32px',
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
          className={cn(
            'shrink-0 overflow-hidden transition-all duration-200',
          )}
          style={{
            width: rightOpen ? '360px' : '0px',
            borderLeft: rightOpen ? '1px solid var(--color-border)' : 'none',
            background: 'var(--color-bg-surface)',
          }}
        >
          {rightOpen && (
            <div className="flex h-full flex-col">
              <div
                className="flex shrink-0 items-center justify-between"
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Rubric & Questions
                </span>
                <button
                  onClick={() => setRightOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded"
                  style={{
                    color: 'var(--color-text-faint)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="Collapse panel [ ] ]"
                >
                  <PanelRightClose className="h-4 w-4" />
                </button>
              </div>
              <div className="scroll-area flex-1 overflow-y-auto">
                {rightPanel}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Bottom bar: keyboard shortcut hints */}
      <footer
        className="flex shrink-0 items-center justify-center gap-6"
        style={{
          height: '32px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-surface)',
          padding: '0 var(--space-4)',
        }}
      >
        <div className="flex items-center gap-4">
          <ShortcutHint keys="[" label="Toggle task list" />
          <ShortcutHint keys="]" label="Toggle rubric panel" />
        </div>
      </footer>
    </div>
  );
}

function ShortcutHint({ keys, label }: { keys: string; label: string }) {
  return (
    <div
      className="flex items-center gap-1.5"
      style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}
    >
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
