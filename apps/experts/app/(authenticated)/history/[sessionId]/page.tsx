'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@raweval/ui/badge';

import {
  ArrowLeft,
  Download,
  Loader2,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { orchestratorService } from '@/services/orchestrator-service';
import { interviewV2Service } from '@/services/interview-v2-service';
import { sessionService } from '@/services/session-service';
import type {
  TranscriptResponse,
  InterviewAnalysis,
  CheatEventsResponse,
} from '@/features/interview/types';
import { ScoreCircle } from '@/features/results/components/score-circle';
import { QuestionAnalysis } from '@/features/results/components/question-analysis';
import { TranscriptViewer } from '@/features/interview/components/transcript-viewer';

type Tab = 'overview' | 'transcript' | 'analysis' | 'cheating';

interface SessionDetail {
  session_id: number;
  title?: string;
  status: string;
  overall_score: number | null;
  total_questions: number;
  created_at: string;
  completed_at?: string;
  is_v2_session?: boolean;
}

function SegmentBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80 ? '#1a6b3a' : value >= 60 ? '#2d7a4e' : value >= 40 ? '#8a6a00' : '#c0392b';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{value}</span>
      </div>
      <div
        className="overflow-hidden"
        style={{ height: '8px', width: '100%', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-muted)' }}
      >
        <div
          style={{ height: '100%', borderRadius: 'var(--radius-full)', width: `${value}%`, backgroundColor: color, transition: 'width 0.7s ease-out' }}
        />
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadgeStyle(status: string): React.CSSProperties {
  switch (status) {
    case 'completed':
      return { background: 'var(--color-success-subtle)', color: 'var(--color-success)', border: '1px solid var(--color-success-border)' };
    case 'in_progress':
      return { background: 'var(--color-info-subtle)', color: 'var(--color-info)', border: '1px solid var(--color-info-border)' };
    case 'cancelled':
      return { background: 'var(--color-error-subtle)', color: 'var(--color-error)', border: '1px solid rgba(192,57,43,0.2)' };
    default:
      return { background: 'var(--color-bg-muted)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' };
  }
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = Number(params.sessionId);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
  const [cheatEvents, setCheatEvents] = useState<CheatEventsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [sessionData, analysisData, transcriptData] = await Promise.allSettled([
        sessionService.getSession(sessionId),
        orchestratorService.getAnalysis(sessionId),
        orchestratorService.getTranscript(sessionId),
      ]);

      if (sessionData.status === 'fulfilled') {
        setSession(sessionData.value as SessionDetail);
      }

      if (analysisData.status === 'fulfilled') {
        setAnalysis(analysisData.value as InterviewAnalysis);
      }

      if (transcriptData.status === 'fulfilled') {
        setTranscript(transcriptData.value as TranscriptResponse);
      }

      // Check if V2 session and fetch cheat events
      const sess = sessionData.status === 'fulfilled' ? (sessionData.value as SessionDetail) : null;
      if (sess?.is_v2_session) {
        try {
          const cheatData = await interviewV2Service.getCheatEvents(sessionId);
          setCheatEvents(cheatData);
        } catch {
          // Cheat events may not be available
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) fetchData();
  }, [sessionId, fetchData]);

  const handleDownloadTranscript = () => {
    if (!transcript) return;
    const text = transcript.entries
      .map((e) => {
        const parts: string[] = [];
        if (e.question_text) parts.push(`Q: ${e.question_text}`);
        if (e.answer_text) parts.push(`A: ${e.answer_text}`);
        if (e.answer_quality_score !== null) parts.push(`Score: ${e.answer_quality_score}/100`);
        return parts.join('\n');
      })
      .join('\n\n---\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-signal)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto text-center" style={{ maxWidth: '672px', padding: 'var(--section-y) var(--section-x)' }}>
        <AlertTriangle className="mx-auto h-12 w-12" style={{ color: 'var(--color-error)' }} />
        <h2
          className="mt-4"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', fontWeight: 400 }}
        >
          Failed to load session
        </h2>
        <p style={{ marginTop: '8px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {error}
        </p>
        <button type="button" onClick={fetchData} className="btn-primary mt-6">
          Retry
        </button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; hidden?: boolean }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'transcript', label: 'Transcript', icon: <FileText className="h-4 w-4" /> },
    { key: 'analysis', label: 'Q&A Analysis', icon: <MessageSquare className="h-4 w-4" /> },
    {
      key: 'cheating',
      label: 'Cheating Detection',
      icon: <Shield className="h-4 w-4" />,
      hidden: !session?.is_v2_session,
    },
  ];

  return (
    <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-8) var(--section-x)' }}>
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push('/history')}
          className="btn-secondary mb-4"
          style={{ padding: '8px 14px' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-text">Session Detail</span>
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
              {session?.title || `Session #${sessionId}`}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {session?.status && (
                <span
                  className="mono-label"
                  style={{
                    ...getStatusBadgeStyle(session.status),
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {session.status.replace(/_/g, ' ')}
                </span>
              )}
              {session?.created_at && (
                <span
                  className="mono-label"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {formatDate(session.created_at)}
                </span>
              )}
              {session?.total_questions !== undefined && (
                <span
                  className="mono-label"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {session.total_questions} questions
                </span>
              )}
            </div>
          </div>

          {session?.overall_score !== null && session?.overall_score !== undefined && (
            <ScoreCircle score={session.overall_score} size={80} />
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="mb-6 flex gap-1 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        {tabs
          .filter((t) => !t.hidden)
          .map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="mono-label flex items-center gap-2 whitespace-nowrap"
              style={{
                padding: '12px 16px',
                borderBottom: activeTab === tab.key
                  ? '2px solid var(--color-signal)'
                  : '2px solid transparent',
                color: activeTab === tab.key
                  ? 'var(--color-signal)'
                  : 'var(--color-text-muted)',
                background: 'none',
                border: 'none',
                borderBottomWidth: '2px',
                borderBottomStyle: 'solid',
                borderBottomColor: activeTab === tab.key
                  ? 'var(--color-signal)'
                  : 'transparent',
                cursor: 'pointer',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {analysis && (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Overall Score', value: String(analysis.overall_score) },
                    { label: 'Pass Rate', value: `${analysis.pass_rate}%` },
                    { label: 'Questions', value: `${analysis.passed_questions}/${analysis.total_questions}` },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="text-center"
                      style={{
                        background: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: 'var(--space-5)',
                      }}
                    >
                      <span
                        className="mono-label"
                        style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}
                      >
                        {item.label}
                      </span>
                      <p
                        className="mt-1"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {analysis.segment_performance &&
                  Object.keys(analysis.segment_performance).length > 0 && (
                    <div
                      style={{
                        background: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: 'var(--space-6)',
                      }}
                    >
                      <h3
                        className="mb-4"
                        style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontWeight: 400 }}
                      >
                        Segment Performance
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(analysis.segment_performance).map(([seg, score]) => (
                          <SegmentBar key={seg} label={seg} value={score} />
                        ))}
                      </div>
                    </div>
                  )}
              </>
            )}

            {!analysis && (
              <p
                className="py-8 text-center"
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}
              >
                No analysis data available for this session.
              </p>
            )}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="space-y-4">
            {transcript && (
              <>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleDownloadTranscript}
                    className="btn-secondary"
                    style={{ padding: '8px 14px' }}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
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
              </>
            )}
            {!transcript && (
              <p
                className="py-8 text-center"
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}
              >
                No transcript available for this session.
              </p>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div>
            {analysis?.question_analysis && analysis.question_analysis.length > 0 ? (
              <div
                style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-6)',
                }}
              >
                <h3
                  className="mb-4"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontWeight: 400 }}
                >
                  Per-Question Breakdown
                </h3>
                <QuestionAnalysis questions={analysis.question_analysis} />
              </div>
            ) : (
              <p
                className="py-8 text-center"
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}
              >
                No question analysis available.
              </p>
            )}
          </div>
        )}

        {activeTab === 'cheating' && (
          <div className="space-y-6">
            {cheatEvents ? (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div
                    className="text-center"
                    style={{
                      background: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xl)',
                      padding: 'var(--space-5)',
                    }}
                  >
                    <span
                      className="mono-label"
                      style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}
                    >
                      Total Events
                    </span>
                    <p
                      className="mt-1"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}
                    >
                      {cheatEvents.summary.total_events}
                    </p>
                  </div>
                  <div
                    className="text-center"
                    style={{
                      background: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xl)',
                      padding: 'var(--space-5)',
                    }}
                  >
                    <span
                      className="mono-label"
                      style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}
                    >
                      Critical
                    </span>
                    <p
                      className="mt-1"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-3xl)', color: 'var(--color-error)' }}
                    >
                      {cheatEvents.summary.critical_events}
                    </p>
                  </div>
                  <div
                    className="text-center"
                    style={{
                      background: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xl)',
                      padding: 'var(--space-5)',
                    }}
                  >
                    <span
                      className="mono-label"
                      style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}
                    >
                      By Type
                    </span>
                    <div className="mt-1 flex flex-wrap justify-center gap-1">
                      {Object.entries(cheatEvents.summary.by_type).map(([type, count]) => (
                        <Badge key={type} variant="secondary" className="text-[10px]">
                          {type}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Event Timeline */}
                {cheatEvents.events.length > 0 && (
                  <div
                    style={{
                      background: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xl)',
                      padding: 'var(--space-6)',
                    }}
                  >
                    <h3
                      className="mb-4"
                      style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontWeight: 400 }}
                    >
                      Event Timeline
                    </h3>
                    <div className="space-y-3">
                      {cheatEvents.events.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3"
                          style={{
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-3)',
                          }}
                        >
                          <div
                            className="mt-1 shrink-0"
                            style={{
                              height: '8px',
                              width: '8px',
                              borderRadius: 'var(--radius-full)',
                              background: event.severity >= 0.7
                                ? 'var(--color-error)'
                                : event.severity >= 0.4
                                  ? 'var(--color-warning)'
                                  : 'var(--color-text-muted)',
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                style={{
                                  fontSize: 'var(--text-sm)',
                                  fontWeight: 500,
                                  textTransform: 'capitalize',
                                  color: 'var(--color-text-primary)',
                                }}
                              >
                                {event.event_type.replace(/_/g, ' ')}
                              </span>
                              <span
                                className="mono-label"
                                style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}
                              >
                                sev: {event.severity.toFixed(1)}
                              </span>
                            </div>
                            <p
                              className="mt-0.5"
                              style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
                            >
                              {event.description}
                            </p>
                            <div
                              className="mono-label mt-1 flex gap-3"
                              style={{ fontSize: '10px', color: 'var(--color-text-faint)' }}
                            >
                              <span>Duration: {event.duration_seconds}s</span>
                              <span>Q: {event.question_id}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p
                className="py-8 text-center"
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}
              >
                No cheating detection data available.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
