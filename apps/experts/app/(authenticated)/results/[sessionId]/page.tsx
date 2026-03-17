'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils/cn';
import {
  ArrowLeft,
  FileText,
  Shield,
  AlertTriangle,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { orchestratorService } from '@/services/orchestrator-service';
import { interviewV2Service } from '@/services/interview-v2-service';
import type {
  CompleteInterviewResponse,
  CompleteV2InterviewResponse,
  TranscriptResponse,
  InterviewGrade,
  InterviewAnalysis,
  IntegrityInfo,
  V2Grade,
} from '@/features/interview/types';
import { ReportCard } from '@/features/results/components/report-card';
import { ScoreCircle } from '@/features/results/components/score-circle';
import { TranscriptViewer } from '@/features/interview/components/transcript-viewer';

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = Number(params.sessionId);
  const isV2 = searchParams.get('v2') === 'true';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grade, setGrade] = useState<InterviewGrade | null>(null);
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
  const [v2Grade, setV2Grade] = useState<V2Grade | null>(null);
  const [integrity, setIntegrity] = useState<IntegrityInfo | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isV2) {
        // V2: Try to get status first, then complete only if needed
        try {
          const status = await interviewV2Service.getIntegrity(sessionId);
          // If integrity score exists, interview is already complete — fetch results
          if (status.integrity_score != null) {
            setIntegrity(status as unknown as IntegrityInfo);
          }
        } catch {
          // Not yet complete or no integrity — try completing
        }

        try {
          const result: CompleteV2InterviewResponse =
            await interviewV2Service.completeInterview(sessionId);
          setGrade(result.v1_grade);
          setAnalysis(result.analysis);
          setTranscript(result.transcript);
          setV2Grade(result.grade);
          if (result.integrity) setIntegrity(result.integrity);
        } catch {
          // Already completed — fetch analysis and transcript separately
          const [analysisData, transcriptData] = await Promise.all([
            orchestratorService.getAnalysis(sessionId),
            orchestratorService.getTranscript(sessionId),
          ]);
          setAnalysis(analysisData);
          setTranscript(transcriptData);
        }
      } else {
        // V1: Try to get status first to see if already completed
        let sessionStatus: string | null = null;
        try {
          const statusData = await orchestratorService.getStatus(sessionId);
          sessionStatus = statusData.session_status;
        } catch {
          // Can't get status — proceed
        }

        if (sessionStatus === 'completed') {
          // Already completed — fetch existing analysis and transcript
          const [analysisData, transcriptData] = await Promise.all([
            orchestratorService.getAnalysis(sessionId),
            orchestratorService.getTranscript(sessionId),
          ]);
          setAnalysis(analysisData);
          setTranscript(transcriptData);
        } else {
          // Not yet complete — call complete endpoint
          try {
            const result: CompleteInterviewResponse =
              await orchestratorService.completeInterview(sessionId);
            setGrade(result.grade);
            setAnalysis(result.analysis);
            setTranscript(result.transcript);
          } catch {
            // Fallback: try fetching analysis anyway (might have been completed by another tab)
            const [analysisData, transcriptData] = await Promise.all([
              orchestratorService.getAnalysis(sessionId),
              orchestratorService.getTranscript(sessionId),
            ]);
            setAnalysis(analysisData);
            setTranscript(transcriptData);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [sessionId, isV2]);

  useEffect(() => {
    if (sessionId) {
      fetchResults();
    }
  }, [sessionId, fetchResults]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-signal)' }} />
          <p
            className="mono-label"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}
          >
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto text-center" style={{ maxWidth: '672px', padding: 'var(--section-y) var(--section-x)' }}>
        <AlertTriangle className="mx-auto h-12 w-12" style={{ color: 'var(--color-error)' }} />
        <h2
          className="mt-4"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}
        >
          Could not load results
        </h2>
        <p style={{ marginTop: '8px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {error}
        </p>
        <button type="button" onClick={fetchResults} className="btn-primary mt-6">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-8) var(--section-x)' }}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-secondary"
            style={{ padding: '8px 14px' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <div className="eyebrow">
              <span className="eyebrow-text">Results</span>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                lineHeight: 'var(--leading-tight)',
                fontWeight: 400,
                color: 'var(--color-text-primary)',
              }}
            >
              Interview Results
            </h1>
            <p
              className="mono-label"
              style={{ marginTop: '4px', color: 'var(--color-text-muted)' }}
            >
              Session #{sessionId}
              {isV2 && ' (V2)'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Report Card */}
      {grade && analysis && <ReportCard grade={grade} analysis={analysis} />}

      {/* Analysis-only fallback (when grade not available) */}
      {!grade && analysis && (
        <div className="space-y-6">
          <div
            className="flex flex-col items-center gap-4"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
            }}
          >
            <ScoreCircle score={analysis.overall_score} size={180} />
            <div
              className="mono-label"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {analysis.passed_questions}/{analysis.total_questions} passed |
              Pass rate: {analysis.pass_rate}%
            </div>
          </div>
        </div>
      )}

      {/* V2 Integrity Section */}
      {(v2Grade || integrity) && (
        <div className="mt-8 space-y-6">
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
            }}
          >
            Integrity & Proctoring
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {integrity && (
              <div
                style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-6)',
                }}
              >
                <h3
                  className="mb-4 flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontWeight: 400 }}
                >
                  <Shield className="h-5 w-5" style={{ color: 'var(--color-signal)' }} />
                  Integrity Score
                </h3>
                <ScoreCircle
                  score={integrity.integrity_score}
                  size={120}
                  label="Integrity"
                  className="mb-4"
                />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Risk Level</span>
                    <Badge
                      variant={integrity.risk_level === 'low' ? 'default' : 'destructive'}
                      className="uppercase"
                    >
                      {integrity.risk_level}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Cheat Events</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
                      {integrity.cheat_events_total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Critical Events</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}>
                      {integrity.critical_events_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Gaze Consistency</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
                      {integrity.gaze_consistency_score}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Face Presence</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
                      {integrity.face_presence_score}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Voice Consistency</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
                      {integrity.voice_consistency_score}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {v2Grade && v2Grade.flagged_events_summary.length > 0 && (
              <div
                style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-6)',
                }}
              >
                <h3
                  className="mb-4 flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontWeight: 400 }}
                >
                  <AlertTriangle className="h-5 w-5" style={{ color: 'var(--color-warning)' }} />
                  Flagged Events
                </h3>
                <div className="space-y-3">
                  {v2Grade.flagged_events_summary.map((event, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                      style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '8px 12px',
                      }}
                    >
                      <span style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>
                        {event.event_type.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          x{event.count}
                        </span>
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5',
                            event.avg_severity >= 0.7
                              ? 'score-band-deficient'
                              : event.avg_severity >= 0.4
                                ? 'score-band-below'
                                : '',
                          )}
                          style={
                            event.avg_severity < 0.4
                              ? { background: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' }
                              : undefined
                          }
                        >
                          sev: {event.avg_severity.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {v2Grade.explanation && (
                  <p
                    className="mt-4 pt-3"
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      lineHeight: 'var(--leading-relaxed)',
                    }}
                  >
                    {v2Grade.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {grade?.reasoning_summary && (
        <div
          className="mt-8"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
          }}
        >
          <h3
            className="mb-3 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontWeight: 400 }}
          >
            <MessageSquare className="h-5 w-5" style={{ color: 'var(--color-signal)' }} />
            Recommendations
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', color: 'var(--color-text-secondary)' }}>
            {grade.reasoning_summary}
          </p>
        </div>
      )}

      {/* Transcript */}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setShowTranscript(!showTranscript)}
          className="btn-secondary mb-4"
        >
          <FileText className="h-4 w-4" />
          {showTranscript ? 'Hide Transcript' : 'View Full Transcript'}
        </button>

        {showTranscript && transcript && (
          <div
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
            }}
          >
            <TranscriptViewer transcript={transcript} />
          </div>
        )}

        {showTranscript && !transcript && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            No transcript available for this session.
          </p>
        )}
      </div>
    </div>
  );
}
