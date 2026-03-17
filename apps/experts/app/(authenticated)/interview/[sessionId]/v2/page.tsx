'use client';

import { useEffect, useRef, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { useInterviewStore } from '@/stores/interview-store';
import { useInterviewWebSocket } from '@/features/interview/hooks/use-interview-websocket';
import { useAudioCapture } from '@/features/interview/hooks/use-audio-capture';
import { AIAvatar } from '@/features/interview/components/ai-avatar';
import type { Evaluation } from '@/features/interview/types';

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

  // Store (subscribe selectively)
  const phase = useInterviewStore((s) => s.phase);
  const currentQuestion = useInterviewStore((s) => s.currentQuestion);
  const progress = useInterviewStore((s) => s.progress);
  const averageScore = useInterviewStore((s) => s.averageScore);
  const interimTranscript = useInterviewStore((s) => s.interimTranscript);
  const finalTranscript = useInterviewStore((s) => s.finalTranscript);
  const wsUrl = useInterviewStore((s) => s.wsUrl);
  const storeError = useInterviewStore((s) => s.error);

  // Local UI state
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [cheatAlerts, setCheatAlerts] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState<string | null>(null);
  const [manualAnswer, setManualAnswer] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const videoFrameTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Track which question ID we already spoke — prevents re-speaking
  const lastSpokenQuestionRef = useRef<string | null>(null);
  const ttsWatchdogRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const interviewStartedRef = useRef(false);

  // Audio capture
  const { isCapturing, audioLevel, startCapture, stopCapture, error: audioError } = useAudioCapture();

  /* ---------------------------------------------------------------- */
  /* Build full WS URL                                                 */
  /* ---------------------------------------------------------------- */

  const fullWsUrl = (() => {
    if (!wsUrl) return null;
    if (wsUrl.startsWith('ws://') || wsUrl.startsWith('wss://')) return wsUrl;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.raweval.com';
    const wsProtocol = apiBase.startsWith('https') ? 'wss' : 'ws';
    const host = apiBase.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `${wsProtocol}://${host}${wsUrl}`;
  })();

  const wsToken = typeof document !== 'undefined'
    ? (() => {
        const match = document.cookie.split(';').find((c) => c.trim().startsWith('raweval_access_token='));
        return match ? decodeURIComponent(match.split('=').slice(1).join('=').trim()) : undefined;
      })()
    : undefined;

  /* ---------------------------------------------------------------- */
  /* WebSocket — stable hook, no callback props that change            */
  /* ---------------------------------------------------------------- */

  const onWsMessage = useCallback((type: string, msg: unknown) => {
    const data = msg as Record<string, unknown>;

    if (type === 'question') {
      // Add interviewer message to visible transcript
      const qData = (data.data ?? data) as Record<string, unknown>;
      const text = (qData.question_text as string) ?? '';
      if (text) {
        setTranscript((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'interviewer', text, timestamp: new Date() },
        ]);
      }
    }

    if (type === 'evaluation') {
      // Add user answer + score to transcript
      if (data.answer_text) {
        setTranscript((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'user', text: data.answer_text as string, timestamp: new Date() },
        ]);
      }
      const evalData = data.data as Record<string, unknown> | undefined;
      if (evalData?.score !== undefined) {
        setTranscript((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'system',
            text: `Score: ${evalData.score}/100`,
            timestamp: new Date(),
            evaluation: evalData as unknown as Evaluation,
            score: evalData.score as number,
          },
        ]);
      }
    }

    if (type === 'cheating_alert') {
      const alertText = (data.message as string) ||
        ((data.alerts as string[] | undefined)?.join(', ')) ||
        'Integrity alert';
      setCheatAlerts((prev) => [...prev, alertText]);
      setTimeout(() => setCheatAlerts((prev) => prev.slice(1)), 5000);
    }

    if (type === 'question_repeat' || type === 'reprompt') {
      const text = (data.rephrased_question ?? data.original_question) as string | undefined;
      if (text) {
        setTranscript((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'interviewer', text, timestamp: new Date() },
        ]);
      }
    }
  }, []);

  const {
    isConnected,
    connectionError,
    sendMessage,
    sendAudioChunk,
    sendVideoFrame,
    sendBargeIn,
    sendForceSubmit,
    disconnect,
  } = useInterviewWebSocket({
    wsUrl: fullWsUrl,
    token: wsToken,
    onMessage: onWsMessage,
  });

  /* ---------------------------------------------------------------- */
  /* TTS — only speak when a NEW question arrives                     */
  /* ---------------------------------------------------------------- */

  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      sendMessage({ type: 'tts_complete' });
      useInterviewStore.getState().setPhase('listening');
      return;
    }

    window.speechSynthesis.cancel();

    // Small delay after cancel (Chrome bug)
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Pick a natural English voice
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.name.includes('Samantha') || v.name.includes('Google UK English Female')) ??
        voices.find((v) => v.lang.startsWith('en') && v.localService) ??
        voices.find((v) => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        if (ttsWatchdogRef.current) clearTimeout(ttsWatchdogRef.current);
        sendMessage({ type: 'tts_complete' });
        useInterviewStore.getState().setPhase('listening');
      };

      utterance.onend = finish;
      utterance.onerror = () => finish();

      window.speechSynthesis.speak(utterance);

      // Watchdog: force-finish if Chrome stalls (common on long text)
      const estimatedMs = Math.max(text.split(/\s+/).length * 150, 3000) + 8000;
      ttsWatchdogRef.current = setTimeout(() => {
        if (!done) {
          window.speechSynthesis.cancel();
          finish();
        }
      }, estimatedMs);

      // Chrome resume hack: prevent pause on long utterances
      const resumeInterval = setInterval(() => {
        if (done) { clearInterval(resumeInterval); return; }
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else if (!window.speechSynthesis.speaking) {
          clearInterval(resumeInterval);
        }
      }, 10000);
    }, 80);
  }, [sendMessage]);

  // When phase becomes ai_speaking AND we have a new question, speak it ONCE
  useEffect(() => {
    if (
      phase === 'ai_speaking' &&
      currentQuestion &&
      interviewStartedRef.current &&
      currentQuestion.question_id !== lastSpokenQuestionRef.current
    ) {
      lastSpokenQuestionRef.current = currentQuestion.question_id;
      speakText(currentQuestion.question_text);
    }
  }, [phase, currentQuestion, speakText]);

  /* ---------------------------------------------------------------- */
  /* "Begin Interview" button — unlocks browser audio                   */
  /* ---------------------------------------------------------------- */

  const handleBeginInterview = useCallback(() => {
    setInterviewStarted(true);
    interviewStartedRef.current = true;

    // Unlock speechSynthesis with a silent utterance (Chrome requirement)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);
    }

    // Preload voices
    window.speechSynthesis?.getVoices();

    // If there's already a question waiting, speak it
    if (currentQuestion && currentQuestion.question_id !== lastSpokenQuestionRef.current) {
      setTranscript([{
        id: crypto.randomUUID(),
        role: 'interviewer',
        text: currentQuestion.question_text,
        timestamp: new Date(),
      }]);
      lastSpokenQuestionRef.current = currentQuestion.question_id;
      setTimeout(() => speakText(currentQuestion.question_text), 300);
    }
  }, [currentQuestion, speakText]);

  /* ---------------------------------------------------------------- */
  /* Camera setup                                                      */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        mediaStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        if (!cancelled) setMediaError('Camera access denied.');
      }
    }

    initMedia();
    return () => {
      cancelled = true;
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Audio capture: only when listening/user_speaking                   */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const shouldCapture = (phase === 'listening' || phase === 'user_speaking') && isMicOn && interviewStartedRef.current;
    if (shouldCapture && !isCapturing) {
      startCapture((data, energy) => sendAudioChunk(data, energy));
    } else if (!shouldCapture && isCapturing) {
      stopCapture();
    }
  }, [phase, isMicOn, isCapturing, startCapture, stopCapture, sendAudioChunk]);

  /* ---------------------------------------------------------------- */
  /* Video frames for cheat detection                                  */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 160;
      canvasRef.current.height = 120;
    }

    videoFrameTimerRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && isCameraOn && isConnected) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 160, 120);
          const base64 = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1] ?? '';
          sendVideoFrame(base64);
        }
      }
    }, 2000);

    return () => { if (videoFrameTimerRef.current) clearInterval(videoFrameTimerRef.current); };
  }, [isCameraOn, isConnected, sendVideoFrame]);

  /* ---------------------------------------------------------------- */
  /* Tab visibility                                                    */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handler = () => sendMessage({ type: 'tab_visibility', hidden: document.hidden });
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [sendMessage]);

  /* ---------------------------------------------------------------- */
  /* Elapsed timer                                                     */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (isConnected && phase !== 'idle' && phase !== 'complete' && interviewStarted) {
      elapsedTimerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    }
    return () => { if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current); };
  }, [isConnected, phase, interviewStarted]);

  /* ---------------------------------------------------------------- */
  /* Auto-scroll transcript                                            */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimTranscript]);

  /* ---------------------------------------------------------------- */
  /* Cleanup                                                           */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (ttsWatchdogRef.current) clearTimeout(ttsWatchdogRef.current);
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
    if (isMicOn && isCapturing) stopCapture();
  };

  const handleToggleCamera = () => {
    setIsCameraOn((prev) => {
      const next = !prev;
      mediaStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = next; });
      return next;
    });
  };

  const handleBargeIn = () => {
    window.speechSynthesis?.cancel();
    sendBargeIn();
  };

  const handleRepeatQuestion = () => {
    if (!currentQuestion) return;
    // Re-speak the current question
    lastSpokenQuestionRef.current = null; // Reset so it can be spoken again
    speakText(currentQuestion.question_text);
  };

  const handleForceSubmit = () => {
    // If user typed a manual answer, use REST submission
    if (useTextInput && manualAnswer.trim()) {
      handleSubmitManualAnswer();
      return;
    }
    if (isConnected) {
      sendForceSubmit();
    } else {
      handleSubmitViaREST();
    }
  };

  const handleSubmitManualAnswer = async () => {
    if (!currentQuestion || isSubmittingAnswer || !manualAnswer.trim()) return;
    setIsSubmittingAnswer(true);
    try {
      const { orchestratorService } = await import('@/services/orchestrator-service');
      const v1SessionId = useInterviewStore.getState().sessionId;
      if (!v1SessionId) throw new Error('No session ID');

      const result = await orchestratorService.submitAnswer(v1SessionId, currentQuestion.transcript_id, manualAnswer.trim());

      setTranscript((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', text: manualAnswer.trim(), timestamp: new Date() },
      ]);
      setManualAnswer('');

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

      if (result.next_question) {
        const store = useInterviewStore.getState();
        store.setCurrentQuestion(result.next_question);
        if (result.progress) store.updateProgress(result.progress);
        setTranscript((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'interviewer', text: result.next_question!.question_text, timestamp: new Date() },
        ]);
        if (interviewStartedRef.current) {
          lastSpokenQuestionRef.current = result.next_question.question_id;
          setTimeout(() => speakText(result.next_question!.question_text), 300);
        }
      } else {
        useInterviewStore.getState().setPhase('complete');
      }

      useInterviewStore.getState().clearTranscripts();
    } catch (err) {
      useInterviewStore.getState().setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleSubmitViaREST = async () => {
    if (!currentQuestion || isSubmittingAnswer) return;
    const answerText = finalTranscript.trim();
    if (!answerText) return;

    setIsSubmittingAnswer(true);
    try {
      const { orchestratorService } = await import('@/services/orchestrator-service');
      const v1SessionId = useInterviewStore.getState().sessionId;
      if (!v1SessionId) throw new Error('No session ID');

      const result = await orchestratorService.submitAnswer(v1SessionId, currentQuestion.transcript_id, answerText);

      setTranscript((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', text: answerText, timestamp: new Date() },
      ]);

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

      if (result.next_question) {
        const store = useInterviewStore.getState();
        store.setCurrentQuestion(result.next_question);
        if (result.progress) store.updateProgress(result.progress);

        setTranscript((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'interviewer', text: result.next_question!.question_text, timestamp: new Date() },
        ]);

        if (interviewStartedRef.current) {
          lastSpokenQuestionRef.current = result.next_question.question_id;
          setTimeout(() => speakText(result.next_question!.question_text), 300);
        }
      } else {
        useInterviewStore.getState().setPhase('complete');
      }

      useInterviewStore.getState().clearTranscripts();
    } catch (err) {
      useInterviewStore.getState().setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleComplete = () => router.push(`/results/${sessionId}?v2=true`);

  /* ---------------------------------------------------------------- */
  /* Derived values                                                    */
  /* ---------------------------------------------------------------- */

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const hasTranscript = finalTranscript.trim().length > 0 || interimTranscript.trim().length > 0 || manualAnswer.trim().length > 0;
  const questionsAnswered = progress?.questions_answered ?? 0;
  const totalPlanned = progress?.total_planned ?? 0;
  const canComplete = questionsAnswered >= Math.max(3, Math.floor(totalPlanned * 0.6));
  const displayError = (storeError && storeError !== 'WebSocket connection error') || audioError || mediaError || null;

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div style={S.page}>
      <style>{pageCSS}</style>

      {/* Begin overlay */}
      {!interviewStarted && (
        <div style={S.beginOverlay}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-signal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="var(--color-text-inverse)" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="var(--color-text-inverse)" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="19" x2="12" y2="22" stroke="var(--color-text-inverse)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-inverse)', fontWeight: 400, textAlign: 'center' }}>Ready to begin?</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse-muted)', textAlign: 'center', maxWidth: 400, lineHeight: 'var(--leading-relaxed)' }}>
            The AI interviewer will speak questions aloud. Make sure your speakers and microphone are on.
          </p>
          {totalPlanned > 0 && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-inverse-faint)', letterSpacing: 'var(--tracking-wide)' }}>
              {totalPlanned} questions &middot; ~{Math.ceil(totalPlanned * 2.5)} minutes
            </p>
          )}
          <Button onClick={handleBeginInterview} style={{ background: 'var(--color-signal)', color: 'var(--color-text-inverse)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', padding: '14px 32px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', marginTop: 'var(--space-2)' }}>
            Begin Interview
          </Button>
        </div>
      )}

      {/* Top Bar */}
      <header style={S.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={S.mono}>Session {sessionId}</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? 'var(--color-success)' : connectionError ? 'var(--color-error)' : 'var(--color-warning)', boxShadow: isConnected ? '0 0 6px rgba(45,122,78,0.5)' : 'none' }} />
          <span style={{ ...S.mono, fontSize: '11px' }}>{isConnected ? 'Connected' : connectionError ? 'Disconnected' : 'Connecting...'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ ...S.mono, fontSize: 'var(--text-base)' }}>{formatTime(elapsedSeconds)}</span>
          {totalPlanned > 0 && <Badge variant="outline" className="iv2-progress-badge">Q {questionsAnswered}/{totalPlanned}</Badge>}
        </div>
      </header>

      {/* Error / warning banners */}
      {displayError && <div style={S.errorBanner}>{displayError}</div>}
      {connectionError && interviewStarted && (
        <div style={S.warningBanner}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 }} />
          {connectionError}
        </div>
      )}

      {/* Cheat alerts */}
      {cheatAlerts.map((alert, i) => <div key={i} style={S.cheatAlert}>Integrity Warning: {alert}</div>)}

      {/* Main content */}
      <div style={S.mainGrid}>
        {/* LEFT: Avatar + Camera + Controls */}
        <div style={S.leftPanel}>
          <div style={S.avatarSection}>
            <AIAvatar phase={phase} isSpeaking={phase === 'ai_speaking'} className="iv2-avatar" />
          </div>

          {/* Current question text (always visible as fallback) */}
          {currentQuestion && interviewStarted && (
            <div style={{ padding: '12px 16px', background: phase === 'ai_speaking' ? 'var(--color-signal-subtle)' : 'rgba(245,242,236,0.04)', border: `1px solid ${phase === 'ai_speaking' ? 'var(--color-signal-border)' : 'var(--color-border-inverse)'}`, borderRadius: 'var(--radius-md)', margin: '0 24px var(--space-3)', transition: 'all 0.3s ease' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 6, color: phase === 'ai_speaking' ? 'var(--color-signal)' : 'var(--color-text-inverse-faint)' }}>
                {phase === 'ai_speaking' ? 'Speaking...' : 'Current Question'}
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: phase === 'ai_speaking' ? 'var(--color-text-primary)' : 'var(--color-text-inverse)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
                {currentQuestion.question_text}
              </p>
            </div>
          )}

          {/* Camera preview */}
          <div style={{ padding: '0 24px 16px', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 180, height: 135, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--color-border-inverse-strong)', background: '#1a1a1a' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isCameraOn ? 1 : 0 }} />
              {!isCameraOn && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={S.mono}>cam off</span></div>}
              {isCapturing && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ height: '100%', width: `${Math.max(4, audioLevel * 100)}%`, background: 'var(--color-signal)', borderRadius: '0 2px 2px 0', transition: 'width 0.1s ease-out' }} />
                </div>
              )}
            </div>

            {/* Live transcript */}
            {(interimTranscript || finalTranscript) && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(245,242,236,0.04)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse-muted)', maxHeight: 80, overflow: 'auto' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-info)', marginRight: 4 }}>You:</span>
                {finalTranscript}
                {interimTranscript && <span style={{ color: 'var(--color-text-inverse-faint)', fontStyle: 'italic' }}>{interimTranscript}</span>}
              </div>
            )}
          </div>

          {/* Text input area (for typing answers) */}
          {useTextInput && interviewStarted && (
            <div style={{ padding: '0 24px 12px', flexShrink: 0 }}>
              <textarea
                value={manualAnswer}
                onChange={(e) => setManualAnswer(e.target.value)}
                placeholder="Type your answer here..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && manualAnswer.trim()) {
                    e.preventDefault();
                    handleForceSubmit();
                  }
                }}
                style={{
                  width: '100%', minHeight: 80, maxHeight: 140, resize: 'vertical',
                  background: 'rgba(245,242,236,0.06)', border: '1px solid var(--color-border-inverse)',
                  borderRadius: 'var(--radius-md)', padding: '12px 14px',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-inverse)', lineHeight: 'var(--leading-normal)',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-inverse-faint)' }}>
                  {manualAnswer.length} chars &middot; Ctrl+Enter to submit
                </span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div style={S.controlsBar}>
            <Button variant={isMicOn ? 'default' : 'destructive'} size="sm" onClick={handleToggleMic} className="iv2-control-btn">{isMicOn ? 'Mic On' : 'Mic Off'}</Button>
            <Button variant={isCameraOn ? 'default' : 'destructive'} size="sm" onClick={handleToggleCamera} className="iv2-control-btn">{isCameraOn ? 'Cam On' : 'Cam Off'}</Button>
            <Button variant="outline" size="sm" onClick={handleRepeatQuestion} disabled={!currentQuestion || phase === 'ai_speaking'} className="iv2-control-btn">Repeat</Button>
            <Button variant="outline" size="sm" onClick={handleBargeIn} disabled={phase !== 'ai_speaking'} className="iv2-control-btn">Skip Speech</Button>
            <Button variant="outline" size="sm" onClick={() => setUseTextInput(!useTextInput)} className="iv2-control-btn" style={useTextInput ? { borderColor: 'var(--color-info)', color: 'var(--color-info)' } : {}}>
              {useTextInput ? 'Voice Mode' : 'Type Answer'}
            </Button>
            <Button
              variant="default" size="sm" onClick={handleForceSubmit}
              disabled={useTextInput ? !manualAnswer.trim() || isSubmittingAnswer : !hasTranscript || isSubmittingAnswer}
              className="iv2-control-btn iv2-submit-btn"
            >
              {isSubmittingAnswer ? 'Submitting...' : 'Submit Answer'}
            </Button>
            {canComplete && <Button variant="outline" size="sm" onClick={handleComplete} className="iv2-control-btn iv2-complete-btn">End Interview</Button>}
          </div>
        </div>

        {/* RIGHT: Transcript */}
        <div style={S.rightPanel}>
          <div style={S.sessionInfo}>
            <div style={S.infoCol}><span style={S.infoLabel}>Progress</span><span style={S.infoVal}>{questionsAnswered}/{totalPlanned || '--'}</span></div>
            <div style={S.infoCol}><span style={S.infoLabel}>Elapsed</span><span style={S.infoVal}>{formatTime(elapsedSeconds)}</span></div>
            {averageScore > 0 && (
              <div style={S.infoCol}>
                <span style={S.infoLabel}>Avg Score</span>
                <span style={{ ...S.infoVal, color: averageScore >= 65 ? 'var(--color-success)' : averageScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)' }}>{averageScore.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div style={S.transcriptList}>
            {transcript.length === 0 && <div style={{ textAlign: 'center', color: 'var(--color-text-inverse-faint)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', paddingTop: 40 }}>Waiting for interview to begin...</div>}
            {transcript.map((entry) => (
              <div key={entry.id} style={{ ...S.transcriptEntry, ...(entry.role === 'system' ? { background: 'rgba(212,68,12,0.04)', borderColor: 'var(--color-signal-border)' } : {}) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', fontWeight: 500, color: entry.role === 'interviewer' ? 'var(--color-signal)' : entry.role === 'user' ? 'var(--color-info)' : 'var(--color-text-muted)' }}>
                    {entry.role === 'interviewer' ? 'Interviewer' : entry.role === 'user' ? 'You' : 'Evaluation'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-inverse-faint)' }}>
                    {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)', color: 'var(--color-text-inverse)' }}>{entry.text}</div>
                {entry.evaluation && (
                  <div style={{ marginTop: 8, borderTop: '1px solid var(--color-border-inverse)', paddingTop: 8 }}>
                    <button onClick={() => setShowEvaluation(showEvaluation === entry.id ? null : entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', padding: 0, textDecoration: 'underline' }}>
                      {showEvaluation === entry.id ? 'Hide details' : 'Show details'}
                    </button>
                    {showEvaluation === entry.id && (
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--color-text-inverse-muted)' }}>
                        <div><strong>Why:</strong> {entry.evaluation.why_this_score}</div>
                        <div><strong>Improve:</strong> {entry.evaluation.improvement_plan}</div>
                        {entry.evaluation.detected_red_flags.length > 0 && <div><strong>Red flags:</strong> {entry.evaluation.detected_red_flags.join(', ')}</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Live interim */}
            {(phase === 'listening' || phase === 'user_speaking') && interimTranscript && (
              <div style={S.transcriptEntry}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-info)', textTransform: 'uppercase' }}>You</span>
                  <span className="iv2-typing-indicator" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse-faint)' }}>...</span>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse)', opacity: 0.6 }}>{interimTranscript}</div>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>

      {/* Completion overlay */}
      {phase === 'complete' && (
        <div style={S.completeOverlay}>
          <div style={{ background: 'var(--color-bg-inverse)', border: '1px solid var(--color-border-inverse-strong)', borderRadius: 'var(--radius-xl)', padding: 48, textAlign: 'center', maxWidth: 400, width: '90%' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-inverse)', marginBottom: 24 }}>Interview Complete</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 64, lineHeight: 1, color: 'var(--color-signal)' }}>{averageScore.toFixed(0)}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: 'var(--color-text-inverse-muted)' }}>/100</span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse-faint)', marginBottom: 32 }}>
              {questionsAnswered} questions in {formatTime(elapsedSeconds)}
            </p>
            <Button variant="default" onClick={handleComplete} className="iv2-results-btn">View Results</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const S: Record<string, React.CSSProperties> = {
  page: { height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-inverse)', color: 'var(--color-text-inverse)', fontFamily: 'var(--font-body)', overflow: 'hidden' },
  mono: { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse-muted)', letterSpacing: 'var(--tracking-wide)' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid var(--color-border-inverse)', flexShrink: 0 },
  errorBanner: { padding: '10px 24px', background: 'var(--color-error-subtle)', color: 'var(--color-error)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--color-error)', flexShrink: 0 },
  warningBanner: { padding: '6px 16px', background: 'var(--color-warning-subtle)', borderBottom: '1px solid rgba(138,106,0,0.2)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-warning)', flexShrink: 0 },
  cheatAlert: { padding: '10px 24px', background: 'rgba(212,68,12,0.12)', color: 'var(--color-signal-light)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--color-signal)', flexShrink: 0 },
  mainGrid: { display: 'flex', flex: 1, overflow: 'hidden' },
  leftPanel: { width: '60%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border-inverse)' },
  avatarSection: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 0 },
  controlsBar: { display: 'flex', alignItems: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid var(--color-border-inverse)', flexShrink: 0, flexWrap: 'wrap' as const },
  rightPanel: { width: '40%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  sessionInfo: { padding: '16px 20px', borderBottom: '1px solid var(--color-border-inverse)', display: 'flex', gap: 24, flexShrink: 0, flexWrap: 'wrap' as const },
  infoCol: { display: 'flex', flexDirection: 'column', gap: 2 },
  infoLabel: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-inverse-faint)', textTransform: 'uppercase' as const, letterSpacing: 'var(--tracking-wider)' },
  infoVal: { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)', color: 'var(--color-text-inverse)' },
  transcriptList: { flex: 1, overflowY: 'auto' as const, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 },
  transcriptEntry: { padding: '12px 14px', background: 'rgba(245,242,236,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-inverse)' },
  beginOverlay: { position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(13,13,13,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-6)' },
  completeOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
};

const pageCSS = `
  .iv2-progress-badge { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); border-color: var(--color-border-inverse-strong); color: var(--color-text-inverse-muted); }
  .iv2-control-btn { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; }
  .iv2-submit-btn:not(:disabled) { background: var(--color-signal); border-color: var(--color-signal); }
  .iv2-submit-btn:not(:disabled):hover { background: var(--color-signal-hover); }
  .iv2-complete-btn { border-color: var(--color-success); color: var(--color-success); }
  .iv2-results-btn { background: var(--color-signal); border-color: var(--color-signal); font-family: var(--font-mono); letter-spacing: var(--tracking-wide); text-transform: uppercase; padding: 12px 32px; }
  .iv2-results-btn:hover { background: var(--color-signal-hover); }
  .iv2-typing-indicator { animation: iv2Blink 1s steps(2) infinite; }
  @keyframes iv2Blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  @media (max-width: 768px) { .iv2-avatar { max-width: 180px; } }
`;
