'use client';

import { useState } from 'react';
import { Badge } from '@raweval/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { TranscriptResponse, TranscriptEntry } from '@/features/interview/types';

interface TranscriptViewerProps {
  transcript: TranscriptResponse;
}

function TranscriptEntryCard({ entry, index }: { entry: TranscriptEntry; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasRubric = entry.rubric && Object.keys(entry.rubric).length > 0;
  const hasCost = entry.cost_info && Object.keys(entry.cost_info).length > 0;

  return (
    <div className="space-y-2 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
      {/* Question */}
      {entry.question_text && (
        <div className="transcript-entry" data-speaker="ai">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
              Q{entry.turn_number ?? index + 1}
            </span>
            {entry.segment_type && (
              <Badge variant="secondary" className="text-[10px]">
                {entry.segment_type}
              </Badge>
            )}
            {entry.skill && (
              <Badge variant="outline" className="text-[10px]">
                {entry.skill}
              </Badge>
            )}
          </div>
          <p className="text-sm leading-relaxed">{entry.question_text}</p>
        </div>
      )}

      {/* Answer */}
      {entry.answer_text && (
        <div className="transcript-entry" data-speaker="expert">
          <p className="text-sm leading-relaxed">{entry.answer_text}</p>
          {entry.answer_quality_score !== null && (
            <div className="mt-2 flex items-center gap-2">
              <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--color-text-inverse-muted)]">
                Score
              </span>
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-inverse)]">
                {entry.answer_quality_score}/100
              </span>
            </div>
          )}
        </div>
      )}

      {/* Expandable details */}
      {(hasRubric || hasCost) && (
        <div className="ml-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)]"
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            Details
          </button>

          {expanded && (
            <div className="mt-2 space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 animate-fade-in">
              {hasRubric && (
                <div>
                  <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                    Rubric
                  </span>
                  <div className="mt-1 space-y-1">
                    {Array.isArray(entry.rubric.must_include_points) && (
                      <div>
                        <span className="text-xs font-medium text-[var(--color-text-secondary)]">Must Include:</span>
                        <ul className="ml-3 list-disc">
                          {(entry.rubric.must_include_points as string[]).map((p, i) => (
                            <li key={i} className="text-xs text-[var(--color-text-muted)]">{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(entry.rubric.red_flags) && (
                      <div>
                        <span className="text-xs font-medium text-[var(--color-error)]">Red Flags:</span>
                        <ul className="ml-3 list-disc">
                          {(entry.rubric.red_flags as string[]).map((f, i) => (
                            <li key={i} className="text-xs text-[var(--color-text-muted)]">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(entry.rubric.bonus_signals) && (
                      <div>
                        <span className="text-xs font-medium text-[var(--color-success)]">Bonus:</span>
                        <ul className="ml-3 list-disc">
                          {(entry.rubric.bonus_signals as string[]).map((b, i) => (
                            <li key={i} className="text-xs text-[var(--color-text-muted)]">{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {hasCost && (
                <div>
                  <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                    Cost Info
                  </span>
                  <div className="mt-1 flex flex-wrap gap-3 font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                    {entry.model_used && <span>Model: {entry.model_used}</span>}
                    {entry.provider && <span>Provider: {entry.provider}</span>}
                    {Object.entries(entry.cost_info).map(([k, v]) => (
                      <span key={k}>{k}: {String(v)}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
          {transcript.total_entries} entries
        </span>
      </div>
      <div className="space-y-6">
        {transcript.entries.map((entry, idx) => (
          <TranscriptEntryCard key={entry.transcript_id} entry={entry} index={idx} />
        ))}
      </div>
    </div>
  );
}
