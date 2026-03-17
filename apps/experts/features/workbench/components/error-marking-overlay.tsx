'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@raweval/ui/button';
import {
  AlertTriangle,
  X,
  Loader2,
  Check,
  ChevronDown,
} from 'lucide-react';
import { workbenchService } from '@/services/workbench-service';
import type { ErrorMarking, ErrorType, ErrorSeverity } from '@/features/workbench/types';

interface ErrorMarkingOverlayProps {
  conversationId: number;
  fpfId: number;
  turnNumber: number;
  content: string;
  existingMarkings: ErrorMarking[];
  onMarkingAdded: () => void;
}

const ERROR_TYPE_CONFIG: Record<ErrorType, { label: string; color: string; bg: string; border: string }> = {
  hallucination: {
    label: 'Hallucination',
    color: '#c0392b',
    bg: 'rgba(192, 57, 43, 0.12)',
    border: 'rgba(192, 57, 43, 0.3)',
  },
  factual_error: {
    label: 'Factual Error',
    color: '#d4440c',
    bg: 'rgba(212, 68, 12, 0.12)',
    border: 'rgba(212, 68, 12, 0.3)',
  },
  reasoning_error: {
    label: 'Reasoning Error',
    color: '#185fa5',
    bg: 'rgba(24, 95, 165, 0.12)',
    border: 'rgba(24, 95, 165, 0.3)',
  },
  omission: {
    label: 'Omission',
    color: '#8a6a00',
    bg: 'rgba(138, 106, 0, 0.12)',
    border: 'rgba(138, 106, 0, 0.3)',
  },
  inconsistency: {
    label: 'Inconsistency',
    color: '#185fa5',
    bg: 'rgba(24, 95, 165, 0.10)',
    border: 'rgba(24, 95, 165, 0.25)',
  },
  safety: {
    label: 'Safety',
    color: '#8b1a1a',
    bg: 'rgba(139, 26, 26, 0.12)',
    border: 'rgba(139, 26, 26, 0.3)',
  },
};

const SEVERITY_OPTIONS: ErrorSeverity[] = ['critical', 'major', 'minor', 'negligible'];

interface TextSelection {
  start: number;
  end: number;
  text: string;
  rect: DOMRect;
}

export function ErrorMarkingOverlay({
  conversationId,
  fpfId,
  turnNumber,
  content,
  existingMarkings,
  onMarkingAdded,
}: ErrorMarkingOverlayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [selectedErrorType, setSelectedErrorType] = useState<ErrorType | null>(null);
  const [severity, setSeverity] = useState<ErrorSeverity>('major');
  const [description, setDescription] = useState('');
  const [correction, setCorrection] = useState('');
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);

  const markMutation = useMutation({
    mutationFn: () => {
      if (!selection || !selectedErrorType) throw new Error('Missing selection');
      return workbenchService.markError({
        conversation_id: conversationId,
        failed_prompt_final_id: fpfId,
        turn_number: turnNumber,
        error_type: selectedErrorType,
        start_char_offset: selection.start,
        end_char_offset: selection.end,
        marked_text: selection.text,
        error_severity: severity,
        error_description: description.trim() || undefined,
        correct_information: correction.trim() || undefined,
      });
    },
    onSuccess: () => {
      resetToolbar();
      onMarkingAdded();
    },
  });

  function resetToolbar() {
    setSelection(null);
    setSelectedErrorType(null);
    setSeverity('major');
    setDescription('');
    setCorrection('');
    setToolbarPosition(null);
    setShowSeverityDropdown(false);
  }

  const handleMouseUp = useCallback(() => {
    const windowSelection = window.getSelection();
    if (!windowSelection || windowSelection.isCollapsed || !contentRef.current) {
      return;
    }

    const range = windowSelection.getRangeAt(0);
    if (!contentRef.current.contains(range.commonAncestorContainer)) {
      return;
    }

    // Calculate the character offset within the content text
    const selectedText = windowSelection.toString().trim();
    if (!selectedText) return;

    const startOffset = getTextOffset(contentRef.current, range.startContainer, range.startOffset);
    const endOffset = getTextOffset(contentRef.current, range.endContainer, range.endOffset);

    const rect = range.getBoundingClientRect();
    const containerRect = contentRef.current.getBoundingClientRect();

    setSelection({
      start: startOffset,
      end: endOffset,
      text: selectedText,
    rect,
    });

    setToolbarPosition({
      top: rect.top - containerRect.top - 8,
      left: Math.max(0, rect.left - containerRect.left + rect.width / 2 - 150),
    });
  }, []);

  // Close toolbar when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(e.target as Node)
      ) {
        resetToolbar();
      }
    }
    if (selection) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selection]);

  // Build content segments with existing markings highlighted
  const renderedContent = useMemo(() => {
    if (existingMarkings.length === 0) {
      return <span>{content}</span>;
    }

    // Sort markings by start offset
    const sorted = [...existingMarkings].sort((a, b) => a.start_offset - b.start_offset);
    const segments: Array<{ text: string; marking?: ErrorMarking }> = [];
    let cursor = 0;

    for (const marking of sorted) {
      if (marking.start_offset > cursor) {
        segments.push({ text: content.slice(cursor, marking.start_offset) });
      }
      segments.push({
        text: content.slice(marking.start_offset, marking.end_offset),
        marking,
      });
      cursor = marking.end_offset;
    }
    if (cursor < content.length) {
      segments.push({ text: content.slice(cursor) });
    }

    return (
      <>
        {segments.map((seg, i) => {
          if (!seg.marking) return <span key={i}>{seg.text}</span>;
          const config = ERROR_TYPE_CONFIG[seg.marking.error_type];
          return (
            <mark
              key={i}
              title={`${config.label} (${seg.marking.error_severity})${seg.marking.error_description ? ': ' + seg.marking.error_description : ''}`}
              style={{
                backgroundColor: config.bg,
                borderBottom: `2px solid ${config.color}`,
                color: 'inherit',
                padding: '0 1px',
                borderRadius: '2px',
                cursor: 'help',
              }}
            >
              {seg.text}
            </mark>
          );
        })}
      </>
    );
  }, [content, existingMarkings]);

  return (
    <div className="relative">
      {/* Existing markings legend */}
      {existingMarkings.length > 0 && (
        <div
          className="mb-3 flex flex-wrap gap-2"
          style={{ fontSize: 'var(--text-xs)' }}
        >
          {Array.from(new Set(existingMarkings.map((m) => m.error_type))).map((type) => {
            const config = ERROR_TYPE_CONFIG[type];
            return (
              <span
                key={type}
                className="flex items-center gap-1"
                style={{
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: 'var(--tracking-wide)',
                  textTransform: 'uppercase',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: config.bg,
                  color: config.color,
                  border: `1px solid ${config.border}`,
                }}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: config.color }}
                />
                {config.label} ({existingMarkings.filter((m) => m.error_type === type).length})
              </span>
            );
          })}
        </div>
      )}

      {/* Content area */}
      <div
        ref={contentRef}
        onMouseUp={handleMouseUp}
        style={{
          fontSize: 'var(--text-sm)',
          lineHeight: 'var(--leading-relaxed)',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)',
          position: 'relative',
          cursor: 'text',
          userSelect: 'text',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {renderedContent}
      </div>

      {/* Floating toolbar */}
      {selection && toolbarPosition && (
        <div
          ref={toolbarRef}
          className="animate-fade-in-up"
          style={{
            position: 'absolute',
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            zIndex: 50,
            background: 'var(--color-bg-base)',
            border: '1px solid var(--color-border-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-3)',
            boxShadow: 'var(--shadow-md)',
            minWidth: '300px',
            maxWidth: '400px',
          }}
        >
          {/* Close button */}
          <button
            onClick={resetToolbar}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-faint)',
              padding: '2px',
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Selected text preview */}
          <div
            className="mb-3"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-1)',
            }}
          >
            Selected Text
          </div>
          <div
            className="mb-3"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              padding: 'var(--space-2)',
              background: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-sm)',
              maxHeight: '60px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 'var(--leading-normal)',
            }}
          >
            &ldquo;{selection.text.slice(0, 120)}{selection.text.length > 120 ? '...' : ''}&rdquo;
          </div>

          {/* Error type grid */}
          {!selectedErrorType ? (
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.entries(ERROR_TYPE_CONFIG) as [ErrorType, (typeof ERROR_TYPE_CONFIG)[ErrorType]][]).map(
                ([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedErrorType(type)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      letterSpacing: 'var(--tracking-wide)',
                      textTransform: 'uppercase',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: config.bg,
                      color: config.color,
                      border: `1px solid ${config.border}`,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {config.label}
                  </button>
                ),
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Selected error type badge */}
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: 'var(--tracking-wide)',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: ERROR_TYPE_CONFIG[selectedErrorType].bg,
                    color: ERROR_TYPE_CONFIG[selectedErrorType].color,
                    border: `1px solid ${ERROR_TYPE_CONFIG[selectedErrorType].border}`,
                  }}
                >
                  {ERROR_TYPE_CONFIG[selectedErrorType].label}
                </span>
                <button
                  onClick={() => setSelectedErrorType(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-faint)',
                    padding: 0,
                  }}
                >
                  Change
                </button>
              </div>

              {/* Severity selector */}
              <div className="relative">
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-faint)',
                    marginBottom: '4px',
                  }}
                >
                  Severity
                </label>
                <button
                  onClick={() => setShowSeverityDropdown(!showSeverityDropdown)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    textTransform: 'capitalize',
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  {severity}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showSeverityDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 10,
                      background: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '2px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {SEVERITY_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSeverity(s);
                          setShowSeverityDropdown(false);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '6px 10px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          textTransform: 'capitalize',
                          color: severity === s ? 'var(--color-signal)' : 'var(--color-text-secondary)',
                          background: severity === s ? 'var(--color-signal-subtle)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-faint)',
                    marginBottom: '4px',
                  }}
                >
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the error..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    lineHeight: 'var(--leading-normal)',
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-primary)',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Correction */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-faint)',
                    marginBottom: '4px',
                  }}
                >
                  Correct Information (optional)
                </label>
                <textarea
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  placeholder="What should it say instead..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    lineHeight: 'var(--leading-normal)',
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-primary)',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Error message */}
              {markMutation.error && (
                <div
                  className="flex items-center gap-1"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {markMutation.error.message ?? 'Failed to save marking'}
                </div>
              )}

              {/* Submit */}
              <Button
                onClick={() => markMutation.mutate()}
                disabled={markMutation.isPending}
                style={{
                  background: ERROR_TYPE_CONFIG[selectedErrorType].color,
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wide)',
                  textTransform: 'uppercase',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: markMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: markMutation.isPending ? 0.6 : 1,
                  width: '100%',
                }}
              >
                {markMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1 h-3.5 w-3.5" />
                )}
                Mark Error
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Calculate the character offset of a node/offset pair within the container's text content.
 */
function getTextOffset(container: Node, targetNode: Node, targetOffset: number): number {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let offset = 0;
  let node: Node | null;

  while ((node = walker.nextNode())) {
    if (node === targetNode) {
      return offset + targetOffset;
    }
    offset += (node.textContent?.length ?? 0);
  }
  return offset + targetOffset;
}
