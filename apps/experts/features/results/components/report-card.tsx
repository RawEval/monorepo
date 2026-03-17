'use client';

import { cn } from '@raweval/utils/cn';
import { CheckCircle2, XCircle, TrendingUp, BarChart3 } from 'lucide-react';
import type { InterviewGrade, InterviewAnalysis } from '@/features/interview/types';
import { getHireRecommendation, getScoreBand } from '@/features/interview/types';
import { ScoreCircle } from './score-circle';
import { QuestionAnalysis } from './question-analysis';

interface ReportCardProps {
  grade: InterviewGrade;
  analysis: InterviewAnalysis;
}

function getRecommendationStyle(rec: string): string {
  switch (rec) {
    case 'Strong Hire': return 'bg-[#1a6b3a] text-white';
    case 'Hire': return 'bg-[var(--color-success)] text-white';
    case 'Borderline': return 'bg-[#8a6a00] text-white';
    case 'No Hire': return 'bg-[var(--color-signal)] text-white';
    case 'Strong No Hire': return 'bg-[var(--color-error)] text-white';
    default: return 'bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]';
  }
}

function SegmentBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? '#1a6b3a' : value >= 60 ? '#2d7a4e' : value >= 40 ? '#8a6a00' : '#c0392b';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm capitalize text-[var(--color-text-secondary)]">{label}</span>
        <span className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-text-primary)]">
          {value}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function ReportCard({ grade, analysis }: ReportCardProps) {
  const recommendation = grade.hire_recommendation || getHireRecommendation(grade.overall_score);

  return (
    <div className="space-y-6">
      {/* Hero Score Section */}
      <div className="flex flex-col items-center gap-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-8">
        <ScoreCircle score={grade.overall_score} size={180} />
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'rounded-full px-4 py-1.5 font-[family-name:var(--font-mono)] text-sm font-medium',
              getRecommendationStyle(recommendation),
            )}
          >
            {recommendation}
          </span>
        </div>
        <div className="flex items-center gap-6 font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
          <span>Confidence: {grade.confidence_level}%</span>
          <span>Pass Rate: {analysis.pass_rate}%</span>
          <span>
            {analysis.passed_questions}/{analysis.total_questions} passed
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Score Overview */}
        <div className="rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6">
          <h3 className="mb-4 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg text-[var(--color-text-primary)]">
            <BarChart3 className="h-5 w-5 text-[var(--color-signal)]" />
            Score Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">Overall</span>
              <span
                className={cn(
                  'inline-flex items-center rounded px-2 py-0.5 font-[family-name:var(--font-mono)] text-xs',
                  `score-band-${getScoreBand(grade.overall_score) === 'meets_minimum' ? 'meets' : getScoreBand(grade.overall_score) === 'below_expectations' ? 'below' : getScoreBand(grade.overall_score)}`,
                )}
              >
                {grade.overall_score}
              </span>
            </div>
            {grade.score_distribution &&
              Object.entries(grade.score_distribution).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-[var(--color-text-secondary)]">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                    {value}
                  </span>
                </div>
              ))}
            {grade.reasoning_summary && (
              <p className="mt-3 border-t border-[var(--color-border)] pt-3 text-sm text-[var(--color-text-muted)]">
                {grade.reasoning_summary}
              </p>
            )}
          </div>
        </div>

        {/* Segment Performance */}
        <div className="rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6">
          <h3 className="mb-4 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg text-[var(--color-text-primary)]">
            <TrendingUp className="h-5 w-5 text-[var(--color-signal)]" />
            Segment Performance
          </h3>
          <div className="space-y-4">
            {analysis.segment_performance &&
              Object.entries(analysis.segment_performance).map(([segment, score]) => (
                <SegmentBar key={segment} label={segment} value={score} />
              ))}
            {(!analysis.segment_performance ||
              Object.keys(analysis.segment_performance).length === 0) && (
              <p className="text-sm text-[var(--color-text-muted)]">
                No segment performance data available.
              </p>
            )}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6">
          <h3 className="mb-4 font-[family-name:var(--font-display)] text-lg text-[var(--color-text-primary)]">
            Strengths
          </h3>
          <ul className="space-y-2">
            {grade.top_strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                {s}
              </li>
            ))}
            {grade.top_strengths.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">None identified.</p>
            )}
          </ul>
        </div>

        <div className="rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6">
          <h3 className="mb-4 font-[family-name:var(--font-display)] text-lg text-[var(--color-text-primary)]">
            Weaknesses
          </h3>
          <ul className="space-y-2">
            {grade.critical_weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-error)]" />
                {w}
              </li>
            ))}
            {grade.critical_weaknesses.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">None identified.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Per-Question Analysis */}
      <div className="rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6">
        <h3 className="mb-4 font-[family-name:var(--font-display)] text-lg text-[var(--color-text-primary)]">
          Per-Question Analysis
        </h3>
        <QuestionAnalysis
          questions={
            grade.per_question_summary.map((q) => ({
              ...q,
              segment_type: analysis.question_analysis.find((a) => a.question_id === q.question_id)?.segment_type || 'unknown',
            }))
          }
        />
      </div>
    </div>
  );
}
