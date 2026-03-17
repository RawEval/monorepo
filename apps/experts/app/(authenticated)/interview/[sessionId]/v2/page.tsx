'use client';

import { useEffect, useRef, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { useInterviewStore } from '@/stores/interview-store';
import { useInterviewWebSocket } from '@/features/interview/hooks/use-interview-websocket';
import { useAudioCapture } from '@/features/interview/hooks/use-audio-capture';
import { AIAvatar } from '@/features/interview/components/ai-avatar';
import type {
  InterviewQuestion,
  WSServerMessage,
  Evaluation,
} from '@/features/interview/types';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface TranscriptEntry {
  id: string;
  role: 'interviewer' | 'user' | 'system';
  text: string;
  timestamp: Date;
  evaluation?: Evaluation;
  score?: number;
}

interface CheatAlertEntry {
  id: string;
  message: string;
  timestamp: Date;
}

/* ------------------------------------------------------------------ */
/* Page Component                                                      */
/* ------------------------------------------------------------------ */

export default function InterviewV2Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();

  // Store
  const {
    phase,
    currentQuestion,
    progress,
    averageScore,
    interimTranscript,
    finalTranscript,
    wsUrl,
    error: storeError,
    setPhase,
    setError,
    clearTranscripts,
  } = useInterviewStore();

  // Local state
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [cheatAlerts, setCheatAlerts] = useState<CheatAlertEntry[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [showEvaluation, setShowEvaluation] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const videoFrameTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Audio capture
  const {
    isCapturing,
    audioLevel,
    startCapture,
    stopCapture,
    error: audioError,
  } = useAudioCapture();

  /* ---------------------------------------------------------------- */
  /* WebSocket callbacks                                               */
  /* ---------------------------------------------------------------- */

  const handleQuestion = useCallback(
    (question: InterviewQuestion) => {
      // Add question to visible transcript
      setTranscript((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'interviewer',
          text: question.question_text,
          timestamp: new Date(),
        },
      ]);
      clearTranscripts();

      // The WebSocket hook sets phase to 'ai_speaking' when speak=true,
      // which triggers the TTS useEffect. If speak was not set, manually trigger.
      // Small delay to ensure state update propagates
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          // Phase should already be 'ai_speaking' from the WS hook
          // TTS will be triggered by the useEffect watching phase + question_id
        }
      }, 100);
    },
    [clearTranscripts],
  );

  const handleEvaluation = useCallback((msg: WSServerMessage) => {
    if (msg.answer_text) {
      setTranscript((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'user',
          text: msg.answer_text!,
          timestamp: new Date(),
        },
      ]);
    }

    if (msg.data && typeof msg.data === 'object') {
      const evalData = msg.data as Evaluation;
      if (evalData.score !== undefined) {
        setTranscript((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'system',
            text: `Score: ${evalData.score}/100`,
            timestamp: new Date(),
            evaluation: evalData,
            score: evalData.score,
          },
        ]);
      }
    }
  }, []);

  const handleCheatAlert = useCallback((msg: WSServerMessage) => {
    const alertText =
      msg.message || (msg.alerts && msg.alerts.length > 0 ? msg.alerts.join(', ') : 'Integrity alert detected');
    setCheatAlerts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        message: alertText,
        timestamp: new Date(),
      },
    ]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setCheatAlerts((prev) => prev.slice(1));
    }, 5000);
  }, []);

  const [wsConnectionFailed, setWsConnectionFailed] = useState(false);

  const handleWSError = useCallback(
    (error: string) => {
      setWsConnectionFailed(true);
      console.warn('WebSocket error:', error, '— Interview will continue with TTS + REST fallback');
      // Don't set a blocking error — the interview can still work with TTS for questions
      // and REST API for answer submission
    },
    [],
  );

  // Build full WebSocket URL from the relative path returned by API
  // API returns: "/ws/v2/interview/5" — the WS endpoint is at the root, NOT under /api/v1
  const fullWsUrl = (() => {
    if (!wsUrl) return null;
    // If already a full URL, use as-is
    if (wsUrl.startsWith('ws://') || wsUrl.startsWith('wss://')) return wsUrl;
    // Build from API base URL
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.raweval.com';
    const wsProtocol = apiBase.startsWith('https') ? 'wss' : 'ws';
    const host = apiBase.replace(/^https?:\/\//, '').replace(/\/$/, '');
    // The ws_url from the API is already the correct path — don't add any prefix
    return `${wsProtocol}://${host}${wsUrl}`;
  })();

  // Get auth token for WebSocket connection
  const wsToken = typeof document !== 'undefined'
    ? (() => {
        const match = document.cookie.split(';').find(c => c.trim().startsWith('raweval_access_token='));
        return match ? decodeURIComponent(match.split('=').slice(1).join('=').trim()) : undefined;
      })()
    : undefined;

  // WebSocket
  const {
    isConnected,
    sendMessage,
    sendAudioChunk,
    sendVideoFrame,
    sendBargeIn,
    sendForceSubmit,
    disconnect,
  } = useInterviewWebSocket({
    wsUrl: fullWsUrl,
    token: wsToken,
    onQuestion: handleQuestion,
    onEvaluation: handleEvaluation,
    onCheatAlert: handleCheatAlert,
    onError: handleWSError,
  });

  /* ---------------------------------------------------------------- */
  /* TTS (Text-to-Speech) for AI speaking                              */
  /* ---------------------------------------------------------------- */

  // User must click "Begin" to satisfy browser autoplay policy
  const [interviewStarted, setInterviewStarted] = useState(false);
  const voicesLoadedRef = useRef(false);
  const pendingTextRef = useRef<string | null>(null);

  // Preload voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    function loadVoices() {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) voicesLoadedRef.current = true;
    }

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speakText = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        // No TTS — skip to listening
        sendMessage({ type: 'tts_complete' });
        setPhase('listening');
        return;
      }

      // Chrome requires user gesture before first speak()
      if (!interviewStarted) {
        pendingTextRef.current = text;
        return;
      }

      // Cancel any current speech
      window.speechSynthesis.cancel();

      // Chrome bug: need a small delay after cancel()
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Pick a natural-sounding English voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) =>
            v.name.includes('Samantha') ||
            v.name.includes('Google UK English Female') ||
            v.name.includes('Microsoft Zira') ||
            v.name.includes('Karen'),
        ) ?? voices.find(
          (v) => v.lang.startsWith('en') && v.localService,
        ) ?? voices.find(
          (v) => v.lang.startsWith('en'),
        );

        if (preferred) utterance.voice = preferred;

        utterance.onstart = () => {
          setPhase('ai_speaking');
        };

        utterance.onend = () => {
          sendMessage({ type: 'tts_complete' });
          setPhase('listening');
        };

        utterance.onerror = (e) => {
          console.warn('TTS error:', e.error);
          sendMessage({ type: 'tts_complete' });
          setPhase('listening');
        };

        ttsUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }, 50);
    },
    [sendMessage, setPhase, interviewStarted],
  );

  // When user clicks "Begin Interview" — unlock audio and speak first question
  const handleBeginInterview = useCallback(() => {
    setInterviewStarted(true);

    // Unlock speechSynthesis with a silent utterance (Chrome requirement)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);
    }

    // If there's a pending question to speak, do it now
    if (currentQuestion) {
      // Add to transcript if not already there
      if (transcript.length === 0) {
        setTranscript([{
          id: crypto.randomUUID(),
          role: 'interviewer',
          text: currentQuestion.question_text,
          timestamp: new Date(),
        }]);
      }

      // Speak after a short delay (let unlock utterance finish)
      setTimeout(() => {
        speakText(currentQuestion.question_text);
      }, 200);
    }
  }, [currentQuestion, transcript.length, speakText]);

  // Trigger TTS when a new question arrives from WebSocket
  useEffect(() => {
    if (phase === 'ai_speaking' && currentQuestion && interviewStarted) {
      speakText(currentQuestion.question_text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQuestion?.question_id, interviewStarted]);

  /* ---------------------------------------------------------------- */
  /* Camera + Media setup                                              */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false, // Audio handled separately by useAudioCapture
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (!cancelled) {
          setMediaError(
            'Camera access denied. Please allow camera permissions for the interview.',
          );
        }
      }
    }

    initMedia();

    return () => {
      cancelled = true;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Audio capture: start when listening, stop when not                 */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const shouldCapture =
      (phase === 'listening' || phase === 'user_speaking') && isMicOn;

    if (shouldCapture && !isCapturing) {
      startCapture((data, energy) => {
        sendAudioChunk(data, energy);
      });
    } else if (!shouldCapture && isCapturing) {
      stopCapture();
    }
  }, [phase, isMicOn, isCapturing, startCapture, stopCapture, sendAudioChunk]);

  /* ---------------------------------------------------------------- */
  /* Video frame capture (for cheat detection)                         */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 160;
      canvasRef.current.height = 120;
    }

    videoFrameTimerRef.current = setInterval(() => {
      if (
        videoRef.current &&
        canvasRef.current &&
        isCameraOn &&
        isConnected
      ) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            videoRef.current,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );
          const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5);
          const base64 = dataUrl.split(',')[1] ?? '';
          sendVideoFrame(base64);
        }
      }
    }, 2000);

    return () => {
      if (videoFrameTimerRef.current) clearInterval(videoFrameTimerRef.current);
    };
  }, [isCameraOn, isConnected, sendVideoFrame]);

  /* ---------------------------------------------------------------- */
  /* Tab visibility detection                                          */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibility = () => {
      sendMessage({ type: 'tab_visibility', hidden: document.hidden });
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [sendMessage]);

  /* ---------------------------------------------------------------- */
  /* Elapsed timer                                                     */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (isConnected && phase !== 'idle' && phase !== 'complete') {
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }

    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [isConnected, phase]);

  /* ---------------------------------------------------------------- */
  /* Auto-scroll transcript                                            */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimTranscript]);

  /* ---------------------------------------------------------------- */
  /* Cleanup on unmount                                                */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }
      disconnect();
      stopCapture();
      if (videoFrameTimerRef.current) clearInterval(videoFrameTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------------------------- */
  /* Handlers                                                          */
  /* ---------------------------------------------------------------- */

  const handleToggleMic = () => {
    setIsMicOn((prev) => !prev);
    if (isMicOn && isCapturing) {
      stopCapture();
    }
  };

  const handleToggleCamera = () => {
    setIsCameraOn((prev) => {
      const next = !prev;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach((t) => {
          t.enabled = next;
        });
      }
      return next;
    });
  };

  const handleBargeIn = () => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
    sendBargeIn();
  };

  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const handleForceSubmit = () => {
    if (isConnected) {
      sendForceSubmit();
    } else {
      // REST fallback — submit accumulated transcript as answer
      handleSubmitVoiceREST();
    }
  };

  // Submit spoken answer via REST when WebSocket is unavailable
  const handleSubmitVoiceREST = async () => {
    if (!currentQuestion || isSubmittingAnswer) return;

    const answerText = finalTranscript.trim();
    if (!answerText) return;

    setIsSubmittingAnswer(true);
    try {
      const { orchestratorService } = await import('@/services/orchestrator-service');
      const v1SessionId = useInterviewStore.getState().sessionId;
      if (!v1SessionId) throw new Error('No session ID');

      const result = await orchestratorService.submitAnswer(
        v1SessionId,
        currentQuestion.transcript_id,
        answerText,
      );

      // Add answer to transcript
      setTranscript((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', text: answerText, timestamp: new Date() },
      ]);

      // Add evaluation
      if (result.evaluation) {
        setTranscript((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(), role: 'system',
            text: `Score: ${result.evaluation.score}/100`,
            timestamp: new Date(), evaluation: result.evaluation, score: result.evaluation.score,
          },
        ]);
      }

      // Handle next question
      if (result.next_question) {
        const { setCurrentQuestion, updateProgress: up } = useInterviewStore.getState();
        setCurrentQuestion(result.next_question);
        if (result.progress) up(result.progress);

        setTranscript((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'interviewer', text: result.next_question!.question_text, timestamp: new Date() },
        ]);

        // Speak the next question
        if (interviewStarted) {
          setTimeout(() => speakText(result.next_question!.question_text), 300);
        }
      } else {
        setPhase('complete');
      }

      clearTranscripts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleComplete = () => {
    router.push(`/results/${sessionId}?v2=true`);
  };

  /* ---------------------------------------------------------------- */
  /* Helpers                                                           */
  /* ---------------------------------------------------------------- */

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const hasTranscript = finalTranscript.trim().length > 0 || interimTranscript.trim().length > 0;
  const questionsAnswered = progress?.questions_answered ?? 0;
  const totalPlanned = progress?.total_planned ?? 0;
  const canComplete = questionsAnswered >= Math.max(3, Math.floor(totalPlanned * 0.6));
  // Don't show WS connection error as blocking — the interview has a text fallback
  const displayError = (storeError && storeError !== 'WebSocket connection error') || audioError || mediaError;

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div style={styles.page}>
      <style>{pageCSS}</style>

      {/* Begin Interview overlay — required for browser autoplay policy */}
      {!interviewStarted && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(13,13,13,0.92)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 'var(--space-6)',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--color-signal)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="var(--color-text-inverse)" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="var(--color-text-inverse)" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="19" x2="12" y2="22" stroke="var(--color-text-inverse)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)',
            color: 'var(--color-text-inverse)', fontWeight: 400, textAlign: 'center',
          }}>
            Ready to begin?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
            color: 'var(--color-text-inverse-muted)', textAlign: 'center',
            maxWidth: 400, lineHeight: 'var(--leading-relaxed)',
          }}>
            The AI interviewer will speak the questions aloud. Make sure your speakers and microphone are on. Camera is used for integrity monitoring.
          </p>
          {currentQuestion && (
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--color-text-inverse-faint)', textAlign: 'center',
              letterSpacing: 'var(--tracking-wide)',
            }}>
              {progress?.total_planned ?? 10} questions &middot; ~{progress?.total_planned ? Math.ceil(progress.total_planned * 2.5) : 25} minutes
            </p>
          )}
          <Button
            onClick={handleBeginInterview}
            style={{
              background: 'var(--color-signal)', color: 'var(--color-text-inverse)',
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
              letterSpacing: 'var(--tracking-wide)', padding: '14px 32px',
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              marginTop: 'var(--space-2)',
            }}
          >
            Begin Interview
          </Button>
        </div>
      )}

      {/* Top Bar */}
      <header style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <span style={styles.sessionLabel}>
            Session {sessionId}
          </span>
          <span
            className="iv2-status-dot"
            style={{
              ...styles.statusDot,
              background: isConnected
                ? 'var(--color-success)'
                : 'var(--color-error)',
              boxShadow: isConnected
                ? '0 0 6px rgba(45,122,78,0.5)'
                : '0 0 6px rgba(192,57,43,0.4)',
            }}
          />
          <span style={styles.statusText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div style={styles.topBarRight}>
          <span style={styles.timer}>{formatTime(elapsedSeconds)}</span>
          {totalPlanned > 0 && (
            <Badge variant="outline" className="iv2-progress-badge">
              Q {questionsAnswered}/{totalPlanned}
            </Badge>
          )}
        </div>
      </header>

      {/* Error banner */}
      {displayError && (
        <div style={styles.errorBanner}>
          {displayError}
        </div>
      )}

      {/* WS reconnecting banner */}
      {wsConnectionFailed && interviewStarted && (
        <div style={{
          padding: '6px 16px', background: 'var(--color-warning-subtle)',
          borderBottom: '1px solid rgba(138,106,0,0.2)', display: 'flex',
          alignItems: 'center', gap: '8px',
          fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-warning)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 }} />
          Real-time connection lost — reconnecting. You can still speak and submit answers.
        </div>
      )}

      {/* Cheat alerts */}
      {cheatAlerts.map((alert) => (
        <div key={alert.id} style={styles.cheatAlert}>
          Integrity Warning: {alert.message}
        </div>
      ))}

      {/* Main content */}
      <div style={styles.mainGrid}>
        {/* LEFT panel: Avatar + Camera + Controls */}
        <div style={styles.leftPanel}>
          {/* AI Avatar */}
          <div style={styles.avatarSection}>
            <AIAvatar
              phase={phase}
              isSpeaking={phase === 'ai_speaking'}
              className="iv2-avatar"
            />
          </div>

          {/* User camera preview */}
          <div style={styles.cameraSection}>
            <div style={styles.cameraContainer}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  ...styles.cameraVideo,
                  opacity: isCameraOn ? 1 : 0,
                }}
              />
              {!isCameraOn && (
                <div style={styles.cameraOff}>
                  <span style={styles.cameraOffIcon}>cam off</span>
                </div>
              )}

              {/* Audio level indicator */}
              {isCapturing && (
                <div style={styles.audioLevelContainer}>
                  <div
                    style={{
                      ...styles.audioLevelBar,
                      width: `${Math.max(4, audioLevel * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Interim transcript preview */}
            {(interimTranscript || finalTranscript) && (
              <div style={styles.liveTranscript}>
                <span style={styles.liveTranscriptLabel}>You:</span>{' '}
                {finalTranscript}
                {interimTranscript && (
                  <span style={styles.interim}>{interimTranscript}</span>
                )}
              </div>
            )}
          </div>

          {/* Controls bar */}
          <div style={styles.controlsBar}>
            <Button
              variant={isMicOn ? 'default' : 'destructive'}
              size="sm"
              onClick={handleToggleMic}
              className="iv2-control-btn"
            >
              {isMicOn ? 'Mic On' : 'Mic Off'}
            </Button>

            <Button
              variant={isCameraOn ? 'default' : 'destructive'}
              size="sm"
              onClick={handleToggleCamera}
              className="iv2-control-btn"
            >
              {isCameraOn ? 'Cam On' : 'Cam Off'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBargeIn}
              disabled={phase !== 'ai_speaking'}
              className="iv2-control-btn"
            >
              Interrupt
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleForceSubmit}
              disabled={!hasTranscript || isSubmittingAnswer}
              className="iv2-control-btn iv2-submit-btn"
            >
              {isSubmittingAnswer ? 'Submitting...' : 'Submit Answer'}
            </Button>

            {canComplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleComplete}
                className="iv2-control-btn iv2-complete-btn"
              >
                Complete Interview
              </Button>
            )}
          </div>
        </div>

        {/* RIGHT panel: Transcript + Session Info */}
        <div style={styles.rightPanel}>
          {/* Session info header */}
          <div style={styles.sessionInfo}>
            <div style={styles.sessionInfoRow}>
              <span style={styles.sessionInfoLabel}>Progress</span>
              <span style={styles.sessionInfoValue}>
                {questionsAnswered}/{totalPlanned || '--'} questions
              </span>
            </div>
            <div style={styles.sessionInfoRow}>
              <span style={styles.sessionInfoLabel}>Elapsed</span>
              <span style={styles.sessionInfoValue}>
                {formatTime(elapsedSeconds)}
              </span>
            </div>
            {averageScore > 0 && (
              <div style={styles.sessionInfoRow}>
                <span style={styles.sessionInfoLabel}>Avg Score</span>
                <span
                  style={{
                    ...styles.sessionInfoValue,
                    color:
                      averageScore >= 65
                        ? 'var(--color-success)'
                        : averageScore >= 40
                          ? 'var(--color-warning)'
                          : 'var(--color-error)',
                  }}
                >
                  {averageScore.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Transcript list */}
          <div style={styles.transcriptList}>
            {transcript.length === 0 && (
              <div style={styles.transcriptEmpty}>
                Waiting for the interview to begin...
              </div>
            )}

            {transcript.map((entry) => (
              <div
                key={entry.id}
                style={{
                  ...styles.transcriptEntry,
                  ...(entry.role === 'system' ? styles.transcriptSystem : {}),
                }}
              >
                <div style={styles.transcriptMeta}>
                  <span
                    style={{
                      ...styles.transcriptRole,
                      color:
                        entry.role === 'interviewer'
                          ? 'var(--color-signal)'
                          : entry.role === 'user'
                            ? 'var(--color-info)'
                            : 'var(--color-text-muted)',
                    }}
                  >
                    {entry.role === 'interviewer'
                      ? 'Interviewer'
                      : entry.role === 'user'
                        ? 'You'
                        : 'Evaluation'}
                  </span>
                  <span style={styles.transcriptTime}>
                    {entry.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div style={styles.transcriptText}>{entry.text}</div>

                {/* Collapsible evaluation */}
                {entry.evaluation && (
                  <div style={styles.evalSection}>
                    <button
                      style={styles.evalToggle}
                      onClick={() =>
                        setShowEvaluation(
                          showEvaluation === entry.id ? null : entry.id,
                        )
                      }
                    >
                      {showEvaluation === entry.id
                        ? 'Hide details'
                        : 'Show details'}
                    </button>
                    {showEvaluation === entry.id && (
                      <div style={styles.evalDetails}>
                        <div style={styles.evalRow}>
                          <span>Why this score:</span>
                          <span>{entry.evaluation.why_this_score}</span>
                        </div>
                        <div style={styles.evalRow}>
                          <span>Improvement:</span>
                          <span>{entry.evaluation.improvement_plan}</span>
                        </div>
                        {entry.evaluation.detected_red_flags.length > 0 && (
                          <div style={styles.evalRow}>
                            <span>Red flags:</span>
                            <span>
                              {entry.evaluation.detected_red_flags.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Live speaking indicator */}
            {(phase === 'listening' || phase === 'user_speaking') &&
              interimTranscript && (
                <div style={styles.transcriptEntry}>
                  <div style={styles.transcriptMeta}>
                    <span
                      style={{
                        ...styles.transcriptRole,
                        color: 'var(--color-info)',
                      }}
                    >
                      You
                    </span>
                    <span className="iv2-typing-indicator" style={styles.typingDots}>
                      ...
                    </span>
                  </div>
                  <div style={{ ...styles.transcriptText, opacity: 0.6 }}>
                    {interimTranscript}
                  </div>
                </div>
              )}

            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>

      {/* Completion overlay */}
      {phase === 'complete' && (
        <div style={styles.completeOverlay}>
          <div style={styles.completeCard}>
            <h2 style={styles.completeTitle}>Interview Complete</h2>
            <div style={styles.completeScore}>
              <span style={styles.completeScoreValue}>
                {averageScore.toFixed(0)}
              </span>
              <span style={styles.completeScoreLabel}>/100</span>
            </div>
            <p style={styles.completeSubtext}>
              {questionsAnswered} questions answered in{' '}
              {formatTime(elapsedSeconds)}
            </p>
            <Button
              variant="default"
              onClick={handleComplete}
              className="iv2-results-btn"
            >
              View Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline Styles                                                       */
/* ------------------------------------------------------------------ */

const styles: Record<string, React.CSSProperties> = {
  page: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-bg-inverse)',
    color: 'var(--color-text-inverse)',
    fontFamily: 'var(--font-body)',
    overflow: 'hidden',
  },

  // Top bar
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderBottom: '1px solid var(--color-border-inverse)',
    flexShrink: 0,
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  sessionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-inverse-muted)',
    letterSpacing: 'var(--tracking-wide)',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusText: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-inverse-muted)',
    fontFamily: 'var(--font-mono)',
  },
  timer: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-inverse)',
    letterSpacing: 'var(--tracking-wide)',
  },

  // Error / alerts
  errorBanner: {
    padding: '10px 24px',
    background: 'var(--color-error-subtle)',
    color: 'var(--color-error)',
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-mono)',
    borderBottom: '1px solid var(--color-error)',
    flexShrink: 0,
  },
  cheatAlert: {
    padding: '10px 24px',
    background: 'rgba(212, 68, 12, 0.12)',
    color: 'var(--color-signal-light)',
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-mono)',
    borderBottom: '1px solid var(--color-signal)',
    flexShrink: 0,
  },

  // Main grid
  mainGrid: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  // Left panel
  leftPanel: {
    width: '60%',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--color-border-inverse)',
  },
  avatarSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    minHeight: 0,
  },
  cameraSection: {
    padding: '0 24px 16px',
    flexShrink: 0,
  },
  cameraContainer: {
    position: 'relative',
    width: '180px',
    height: '135px',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    border: '2px solid var(--color-border-inverse-strong)',
    background: '#1a1a1a',
  },
  cameraVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
  },
  cameraOff: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a1a1a',
  },
  cameraOffIcon: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-inverse-faint)',
    textTransform: 'uppercase' as const,
    letterSpacing: 'var(--tracking-wider)',
  },
  audioLevelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'rgba(255,255,255,0.1)',
  },
  audioLevelBar: {
    height: '100%',
    background: 'var(--color-signal)',
    borderRadius: '0 2px 2px 0',
    transition: 'width 0.1s ease-out',
  },
  liveTranscript: {
    marginTop: '12px',
    padding: '10px 14px',
    background: 'rgba(245, 242, 236, 0.04)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-inverse-muted)',
    lineHeight: 'var(--leading-normal)',
    maxHeight: '80px',
    overflow: 'auto',
  },
  liveTranscriptLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-info)',
    marginRight: '4px',
  },
  interim: {
    color: 'var(--color-text-inverse-faint)',
    fontStyle: 'italic',
  },

  // Controls
  controlsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 24px',
    borderTop: '1px solid var(--color-border-inverse)',
    flexShrink: 0,
    flexWrap: 'wrap' as const,
  },

  // Right panel
  rightPanel: {
    width: '40%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sessionInfo: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--color-border-inverse)',
    display: 'flex',
    gap: '24px',
    flexShrink: 0,
    flexWrap: 'wrap' as const,
  },
  sessionInfoRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  sessionInfoLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--color-text-inverse-faint)',
    textTransform: 'uppercase' as const,
    letterSpacing: 'var(--tracking-wider)',
  },
  sessionInfoValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-inverse)',
  },

  // Transcript
  transcriptList: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  transcriptEmpty: {
    textAlign: 'center' as const,
    color: 'var(--color-text-inverse-faint)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-sm)',
    paddingTop: '40px',
  },
  transcriptEntry: {
    padding: '12px 14px',
    background: 'rgba(245, 242, 236, 0.03)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-inverse)',
  },
  transcriptSystem: {
    background: 'rgba(212, 68, 12, 0.04)',
    borderColor: 'var(--color-signal-border)',
  },
  transcriptMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  transcriptRole: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'uppercase' as const,
    fontWeight: 500,
  },
  transcriptTime: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--color-text-inverse-faint)',
  },
  transcriptText: {
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--leading-normal)',
    color: 'var(--color-text-inverse)',
  },
  typingDots: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-inverse-faint)',
  },

  // Evaluation
  evalSection: {
    marginTop: '8px',
    borderTop: '1px solid var(--color-border-inverse)',
    paddingTop: '8px',
  },
  evalToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-signal)',
    padding: 0,
    textDecoration: 'underline',
  },
  evalDetails: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  evalRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-inverse-muted)',
    lineHeight: 'var(--leading-normal)',
  },

  // Complete overlay
  completeOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  completeCard: {
    background: 'var(--color-bg-inverse)',
    border: '1px solid var(--color-border-inverse-strong)',
    borderRadius: 'var(--radius-xl)',
    padding: '48px',
    textAlign: 'center' as const,
    maxWidth: '400px',
    width: '90%',
  },
  completeTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    color: 'var(--color-text-inverse)',
    marginBottom: '24px',
  },
  completeScore: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '4px',
    marginBottom: '12px',
  },
  completeScoreValue: {
    fontFamily: 'var(--font-display)',
    fontSize: '64px',
    lineHeight: 1,
    color: 'var(--color-signal)',
  },
  completeScoreLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-lg)',
    color: 'var(--color-text-inverse-muted)',
  },
  completeSubtext: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-inverse-faint)',
    marginBottom: '32px',
  },
};

/* ------------------------------------------------------------------ */
/* Scoped CSS for animations & overrides                               */
/* ------------------------------------------------------------------ */

const pageCSS = `
  .iv2-progress-badge {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    border-color: var(--color-border-inverse-strong);
    color: var(--color-text-inverse-muted);
  }

  .iv2-control-btn {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
  }

  .iv2-submit-btn:not(:disabled) {
    background: var(--color-signal);
    border-color: var(--color-signal);
  }
  .iv2-submit-btn:not(:disabled):hover {
    background: var(--color-signal-hover);
  }

  .iv2-complete-btn {
    border-color: var(--color-success);
    color: var(--color-success);
  }

  .iv2-results-btn {
    background: var(--color-signal);
    border-color: var(--color-signal);
    font-family: var(--font-mono);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    padding: 12px 32px;
  }
  .iv2-results-btn:hover {
    background: var(--color-signal-hover);
  }

  .iv2-typing-indicator {
    animation: iv2Blink 1s steps(2) infinite;
  }

  @keyframes iv2Blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .iv2-avatar {
      max-width: 180px;
    }
  }
`;
