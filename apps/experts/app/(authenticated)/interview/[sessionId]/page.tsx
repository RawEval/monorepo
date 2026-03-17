'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils';
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Trophy,
} from 'lucide-react';
import { orchestratorService } from '@/services/orchestrator-service';
import { useInterviewStore } from '@/stores/interview-store';
import { QuestionDisplay } from '@/features/interview/components/question-display';
import { AnswerInput } from '@/features/interview/components/answer-input';
import { EvaluationDisplay } from '@/features/interview/components/evaluation-display';
import { ProgressTracker } from '@/features/interview/components/progress-tracker';
import { InterviewHeader } from '@/features/interview/components/interview-header';
import type {
  Evaluation,
  AdaptiveDifficulty,
  InterviewQuestion,
  InterviewStatusResponse,
} from '@/features/interview/types';

interface MessageEntry {
  id: string;
  kind: 'question' | 'answer' | 'evaluation' | 'system';
  question?: InterviewQuestion;
  questionNumber?: number;
  answerText?: string;
  evaluation?: Evaluation;
  adaptiveDifficulty?: AdaptiveDifficulty;
  conversationalResponse?: string;
  text?: string;
  timestamp: Date;
}

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = Number(params.sessionId);

  const {
    currentQuestion,
    setCurrentQuestion,
    phase,
    setPhase,
    progress,
    updateProgress,
    scores,
    averageScore,
    addScore,
    setAdaptiveDifficulty,
    isSubmitting,
    setSubmitting,
    isCompleting,
    setCompleting,
    error,
    setError,
    setSession,
    addMessage,
  } = useInterviewStore();

  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [skillScores, setSkillScores] = useState<Record<string, number[]>>({});
  const [currentDifficulty, setCurrentDifficulty] = useState('medium');
  const [questionCounter, setQuestionCounter] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize session
  useEffect(() => {
    if (!sessionId || isNaN(sessionId)) return;
    setSession(sessionId);

    // If there's already a current question in the store (from setup page), add it
    if (currentQuestion) {
      setQuestionCounter(1);
      setMessages([
        {
          id: crypto.randomUUID(),
          kind: 'question',
          question: currentQuestion,
          questionNumber: 1,
          timestamp: new Date(),
        },
      ]);
    } else {
      // Fetch status to resume or get initial state
      fetchStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Poll status — fast (2s) when waiting for first question, slower (10s) after
  useEffect(() => {
    const interval = currentQuestion ? 10000 : 2000;
    statusIntervalRef.current = setInterval(() => {
      fetchStatusSilent();
    }, interval);
    return () => {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, !!currentQuestion]);

  async function fetchStatus() {
    try {
      const status = await orchestratorService.getStatus(sessionId);
      applyStatusUpdate(status);
    } catch {
      // Ignore fetch errors on initial load
    }
  }

  async function fetchStatusSilent() {
    try {
      const status = await orchestratorService.getStatus(sessionId);
      applyStatusUpdate(status);
    } catch {
      // Silent fail on poll
    }
  }

  function applyStatusUpdate(status: InterviewStatusResponse) {
    if (status.progress) {
      updateProgress({
        questions_asked: status.progress.questions_asked,
        questions_answered: status.progress.questions_answered,
        total_planned: status.progress.total_planned,
        is_complete: status.session_status === 'completed',
      });
    }
    if (status.skill_scores) {
      setSkillScores(status.skill_scores);
    }
    if (status.progress?.current_difficulty) {
      setCurrentDifficulty(status.progress.current_difficulty);
    }

    // Handle async first question — backend generates it async after session creation
    if (status.first_question_ready && status.first_question && !currentQuestion && messages.length === 0) {
      const q = status.first_question;
      setCurrentQuestion(q);
      setQuestionCounter(1);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: 'question',
          question: q,
          questionNumber: 1,
          timestamp: new Date(),
        },
      ]);
      addMessage({ type: 'ai', content: q.question_text });
      setPhase('connected');
    }

    if (status.session_status === 'completed') {
      setPhase('complete');
      setIsComplete(true);
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    }
  }

  const handleSubmitAnswer = useCallback(
    async (answerText: string) => {
      if (!currentQuestion) return;

      setSubmitting(true);
      setError(null);

      // Add user answer to message stream
      const answerId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: answerId,
          kind: 'answer',
          answerText,
          timestamp: new Date(),
        },
      ]);

      addMessage({ type: 'user', content: answerText });

      try {
        const response = await orchestratorService.submitAnswer(
          sessionId,
          currentQuestion.transcript_id,
          answerText,
        );

        // Add evaluation
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            kind: 'evaluation',
            evaluation: response.evaluation,
            adaptiveDifficulty: response.adaptive_difficulty,
            conversationalResponse: response.conversational_response ?? undefined,
            timestamp: new Date(),
          },
        ]);

        // Update store
        addScore(response.evaluation.score);
        if (response.adaptive_difficulty) {
          setAdaptiveDifficulty(response.adaptive_difficulty);
          if (response.adaptive_difficulty.current) {
            setCurrentDifficulty(response.adaptive_difficulty.current);
          }
        }
        if (response.progress) {
          updateProgress(response.progress);
        }

        // Add conversational response as system message
        if (response.conversational_response) {
          addMessage({ type: 'ai', content: response.conversational_response });
        }

        // Next question or complete
        if (response.next_question) {
          const nextNum = questionCounter + 1;
          setQuestionCounter(nextNum);
          setCurrentQuestion(response.next_question);

          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              kind: 'question',
              question: response.next_question ?? undefined,
              questionNumber: nextNum,
              timestamp: new Date(),
            },
          ]);

          addMessage({ type: 'ai', content: response.next_question.question_text });
          setPhase('connected');
        } else {
          // Interview complete
          setCurrentQuestion(null);
          setPhase('complete');
          setIsComplete(true);
          if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);

          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              kind: 'system',
              text: 'Interview complete! All questions have been answered.',
              timestamp: new Date(),
            },
          ]);
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to submit answer. Please try again.';
        setError(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [
      currentQuestion,
      sessionId,
      questionCounter,
      setSubmitting,
      setError,
      addScore,
      setAdaptiveDifficulty,
      updateProgress,
      setCurrentQuestion,
      setPhase,
      addMessage,
    ],
  );

  async function handleCompleteInterview() {
    setCompleting(true);
    setError(null);
    try {
      await orchestratorService.completeInterview(sessionId);
      setPhase('complete');
      setIsComplete(true);
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to complete interview.';
      setError(msg);
    } finally {
      setCompleting(false);
    }
  }

  function navigateToResults() {
    router.push(`/results/${sessionId}`);
  }

  if (!sessionId || isNaN(sessionId)) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
          Invalid session ID
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <InterviewHeader sessionId={sessionId} progress={progress} phase={phase} />

      <div className="flex flex-1 overflow-hidden">
        {/* Main conversation area */}
        <div className="flex flex-1 flex-col">
          {/* Messages */}
          <div className="scroll-area flex-1 overflow-y-auto" style={{ padding: 'var(--space-5)' }}>
            <div className="mx-auto space-y-5" style={{ maxWidth: '800px' }}>
              {messages.length === 0 && !currentQuestion && (
                <div className="flex h-64 items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto mb-3 size-8 animate-spin" style={{ color: 'var(--color-signal)' }} />
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      Loading interview session...
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg) => {
                switch (msg.kind) {
                  case 'question':
                    return (
                      <div key={msg.id} className="flex justify-start">
                        <div className="max-w-[85%]">
                          <QuestionDisplay
                            question={msg.question!}
                            questionNumber={msg.questionNumber!}
                          />
                        </div>
                      </div>
                    );

                  case 'answer':
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div
                          className="max-w-[80%] animate-fade-in-up"
                          style={{
                            background: 'var(--color-bg-inverse)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-4) var(--space-5)',
                            color: 'var(--color-text-inverse)',
                          }}
                        >
                          <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)' }}>
                            {msg.answerText}
                          </p>
                          <p
                            className="mt-2 text-right"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-inverse-faint)' }}
                          >
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );

                  case 'evaluation':
                    return (
                      <div key={msg.id} className="space-y-3">
                        {msg.conversationalResponse && (
                          <div className="flex justify-start">
                            <div
                              className="max-w-[85%] animate-fade-in-up"
                              style={{
                                background: 'var(--color-bg-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--space-4) var(--space-5)',
                              }}
                            >
                              <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)', color: 'var(--color-text-secondary)' }}>
                                {msg.conversationalResponse}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="mx-auto max-w-[90%]">
                          <EvaluationDisplay
                            evaluation={msg.evaluation!}
                            adaptiveDifficulty={msg.adaptiveDifficulty}
                          />
                        </div>
                      </div>
                    );

                  case 'system':
                    return (
                      <div
                        key={msg.id}
                        className="flex justify-center"
                      >
                        <div
                          className="animate-fade-in-up flex items-center gap-2"
                          style={{
                            background: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-full)',
                            padding: '8px 16px',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          <CheckCircle2 className="size-4" style={{ color: 'var(--color-success)' }} />
                          {msg.text}
                        </div>
                      </div>
                    );

                  default:
                    return null;
                }
              })}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div
              style={{
                borderTop: '1px solid rgba(192,57,43,0.2)',
                background: 'var(--color-error-subtle)',
                padding: 'var(--space-3) var(--space-5)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-error)',
              }}
            >
              {error}
            </div>
          )}

          {/* Completion banner */}
          {isComplete && (
            <div
              style={{
                borderTop: '1px solid var(--color-success-border)',
                background: 'var(--color-success-subtle)',
                padding: 'var(--space-4) var(--space-5)',
              }}
            >
              <div className="mx-auto flex items-center justify-between" style={{ maxWidth: '800px' }}>
                <div className="flex items-center gap-3">
                  <Trophy className="size-5" style={{ color: 'var(--color-success)' }} />
                  <div>
                    <p style={{ fontWeight: 500, color: 'var(--color-success)' }}>
                      Interview Complete
                    </p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      {scores.length} questions answered with an average score of{' '}
                      {Math.round(averageScore)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={navigateToResults}
                  className="btn-primary"
                >
                  View Results
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Answer input */}
          {!isComplete && (
            <AnswerInput
              onSubmit={handleSubmitAnswer}
              isSubmitting={isSubmitting}
              disabled={!currentQuestion || phase === 'complete'}
            />
          )}
        </div>

        {/* Sidebar toggle (mobile) */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed right-4 bottom-24 z-30 flex size-10 items-center justify-center rounded-full lg:hidden"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
          }}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? (
            <PanelRightClose className="size-4" />
          ) : (
            <PanelRightOpen className="size-4" />
          )}
        </button>

        {/* Sidebar */}
        <div
          className={cn(
            'transition-all duration-300',
            // Desktop
            'hidden lg:block',
            sidebarOpen ? 'w-[320px]' : 'w-0 overflow-hidden',
            // Mobile: overlay
            'max-lg:fixed max-lg:inset-y-16 max-lg:right-0 max-lg:z-20 max-lg:w-[85vw] max-lg:max-w-[360px]',
            !sidebarOpen && 'max-lg:translate-x-full',
          )}
          style={{
            borderLeft: '1px solid var(--color-border)',
            background: 'var(--color-bg-base)',
          }}
        >
          <div className="scroll-area h-full overflow-y-auto" style={{ padding: 'var(--space-5)' }}>
            {/* Session info */}
            <div
              className="mb-5"
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
              }}
            >
              <h3
                className="mono-label mb-3"
                style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}
              >
                Session
              </h3>
              <div className="space-y-2" style={{ fontSize: 'var(--text-sm)' }}>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-muted)' }}>ID</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                    #{sessionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-muted)' }}>Status</span>
                  <Badge
                    variant={isComplete ? 'default' : 'secondary'}
                    className="text-[10px]"
                  >
                    {isComplete ? 'Complete' : 'In Progress'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-muted)' }}>Difficulty</span>
                  <span
                    className="mono-label"
                    style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}
                  >
                    {currentDifficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress tracker */}
            {progress && (
              <ProgressTracker
                progress={progress}
                scores={scores}
                averageScore={averageScore}
                skillScores={Object.keys(skillScores).length > 0 ? skillScores : undefined}
              />
            )}

            {/* Complete button */}
            {!isComplete && progress && progress.questions_answered > 0 && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleCompleteInterview}
                  disabled={isCompleting}
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    opacity: isCompleting ? 0.6 : 1,
                    cursor: isCompleting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Complete Interview
                    </>
                  )}
                </button>
                <p
                  className="mt-1.5 text-center"
                  style={{ fontSize: '10px', color: 'var(--color-text-faint)' }}
                >
                  End the interview and generate final results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
