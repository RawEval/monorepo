'use client';

import { useEffect, useRef, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@raweval/ui/badge';
import { conversationalService } from '@/services/conversational-service';
import type { ConversationalInputResponse } from '@/services/conversational-service';
import { AIAvatar } from '@/features/interview/components/ai-avatar';
import type { InterviewPhase } from '@/features/interview/types';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Message {
  id: string;
  role: 'ai' | 'user' | 'system';
  text: string;
  time: Date;
  score?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecAny = any;

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const SILENCE_MS = 3000;
const MIN_CHARS = 10;

/* ------------------------------------------------------------------ */
/* getSR — get SpeechRecognition constructor or null                    */
/* ------------------------------------------------------------------ */

function getSR(): SpeechRecAny | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const W = window as any;
  return W.SpeechRecognition || W.webkitSpeechRecognition || null;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function InterviewV2Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId: rawId } = use(params);
  const sessionId = Number(rawId);
  const router = useRouter();

  /* ---- UI state ---- */
  const [phase, setPhase] = useState<InterviewPhase>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [liveText, setLiveText] = useState('');
  const [liveInterim, setLiveInterim] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [micStatus, setMicStatus] = useState<'off' | 'starting' | 'listening' | 'error'>('off');
  const [started, setStarted] = useState(false);

  /* ---- Refs ---- */
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const ttsWatchdogRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const silenceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const countdownRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const recRef = useRef<SpeechRecAny>(null);
  const startedRef = useRef(false);

  // Mutable mirrors — accessed from callbacks to avoid stale closures
  const liveTextRef = useRef('');
  const busyRef = useRef(false);
  const wantListenRef = useRef(false);

  /* ================================================================ */
  /* TTS                                                               */
  /* ================================================================ */

  const speak = useCallback((text: string, onDone?: () => void) => {
    if (!window.speechSynthesis) { onDone?.(); return; }
    window.speechSynthesis.cancel();
    setPhase('ai_speaking');

    setTimeout(() => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.95;
      const voices = window.speechSynthesis.getVoices();
      const v =
        voices.find((x) => x.name.includes('Samantha') || x.name.includes('Google UK English Female')) ??
        voices.find((x) => x.lang.startsWith('en') && x.localService) ??
        voices.find((x) => x.lang.startsWith('en'));
      if (v) utt.voice = v;

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        if (ttsWatchdogRef.current) clearTimeout(ttsWatchdogRef.current);
        onDone?.();
      };
      utt.onend = finish;
      utt.onerror = () => finish();
      window.speechSynthesis.speak(utt);

      const ms = Math.max(text.split(/\s+/).length * 160, 3000) + 8000;
      ttsWatchdogRef.current = setTimeout(() => {
        if (!done) { window.speechSynthesis.cancel(); finish(); }
      }, ms);

      // Chrome pause/resume hack
      const iv = setInterval(() => {
        if (done) { clearInterval(iv); return; }
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else if (!window.speechSynthesis.speaking) clearInterval(iv);
      }, 10000);
    }, 50);
  }, []);

  /* ================================================================ */
  /* Silence timer                                                     */
  /* ================================================================ */

  const clearSilence = useCallback(() => {
    if (silenceRef.current) { clearTimeout(silenceRef.current); silenceRef.current = undefined; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = undefined; }
    setCountdown(null);
  }, []);

  const submitRef = useRef<(t: string) => void>(() => {});

  const resetSilence = useCallback(() => {
    clearSilence();
    const t0 = Date.now();
    countdownRef.current = setInterval(() => {
      const left = Math.max(0, SILENCE_MS - (Date.now() - t0));
      setCountdown(Math.ceil(left / 1000));
      if (left <= 0 && countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = undefined; }
    }, 200);
    silenceRef.current = setTimeout(() => {
      clearSilence();
      const txt = liveTextRef.current.trim();
      if (txt.length >= MIN_CHARS && !busyRef.current) {
        console.log('[V2] Auto-submitting:', txt.slice(0, 60) + '...');
        submitRef.current(txt);
      }
    }, SILENCE_MS);
  }, [clearSilence]);

  /* ================================================================ */
  /* Speech Recognition                                                */
  /* ================================================================ */

  const stopRec = useCallback(() => {
    wantListenRef.current = false;
    clearSilence();
    const r = recRef.current;
    if (r) {
      try { r.stop(); } catch { /* ok */ }
      recRef.current = null;
    }
    setMicStatus('off');
  }, [clearSilence]);

  const startRec = useCallback(() => {
    const SR = getSR();
    if (!SR) {
      setError('Speech recognition is not supported. Please use Google Chrome.');
      setMicStatus('error');
      return;
    }

    // Stop any existing
    if (recRef.current) {
      try { recRef.current.stop(); } catch { /* ok */ }
      recRef.current = null;
    }

    wantListenRef.current = true;
    setMicStatus('starting');

    // Clear transcript for fresh question
    liveTextRef.current = '';
    setLiveText('');
    setLiveInterim('');
    clearSilence();

    console.log('[V2] Starting speech recognition...');

    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';
    r.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      // Accumulate incrementally using resultIndex — preserves text across restarts
      let newFinal = '';
      let interim = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i]?.[0]?.transcript ?? '';
        if (e.results[i]?.isFinal) {
          newFinal += text;
        } else {
          interim += text;
        }
      }

      // Append any new final text to accumulated
      if (newFinal) {
        liveTextRef.current += (liveTextRef.current ? ' ' : '') + newFinal;
      }

      setLiveText(liveTextRef.current);
      setLiveInterim(interim);
      setMicStatus('listening');

      console.log('[V2] Speech:', { final: liveTextRef.current.slice(-40), interim: interim.slice(0, 30) });

      // Reset auto-submit timer when we have enough text
      if (liveTextRef.current.trim().length >= MIN_CHARS) {
        resetSilence();
      }
    };

    r.onstart = () => {
      console.log('[V2] Recognition started');
      setMicStatus('listening');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onerror = (e: any) => {
      const code = e.error;
      console.warn('[V2] Recognition error:', code);

      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setError('Microphone access denied. Please allow mic in your browser and reload.');
        setMicStatus('error');
        wantListenRef.current = false;
        return;
      }
      // 'no-speech' and 'aborted' are normal — recognition will restart via onend
    };

    r.onend = () => {
      console.log('[V2] Recognition ended, wantListen:', wantListenRef.current, 'busy:', busyRef.current);
      setMicStatus('off');

      // Auto-restart with fresh instance if we still want to listen
      if (wantListenRef.current && !busyRef.current) {
        setTimeout(() => {
          if (!wantListenRef.current || busyRef.current) return;

          console.log('[V2] Restarting recognition...');
          const fresh = new SR();
          fresh.continuous = true;
          fresh.interimResults = true;
          fresh.lang = 'en-US';
          fresh.maxAlternatives = 1;
          // Reuse same handlers — liveTextRef preserves accumulated text
          fresh.onresult = r.onresult;
          fresh.onstart = r.onstart;
          fresh.onerror = r.onerror;
          fresh.onend = r.onend;
          recRef.current = fresh;
          try {
            fresh.start();
            setMicStatus('starting');
          } catch (err) {
            console.warn('[V2] Restart failed:', err);
          }
        }, 200);
      }
    };

    recRef.current = r;
    try {
      r.start();
    } catch (err) {
      console.warn('[V2] Start failed:', err);
      setMicStatus('error');
    }
  }, [clearSilence, resetSilence]);

  /* ================================================================ */
  /* Submit answer                                                     */
  /* ================================================================ */

  const submitAnswer = useCallback(async (text: string) => {
    if (!text.trim() || busyRef.current) return;

    stopRec();
    setPhase('processing');
    busyRef.current = true;
    setIsProcessing(true);
    setError(null);

    const userText = text.trim();
    setMessages((p) => [...p, { id: crypto.randomUUID(), role: 'user', text: userText, time: new Date() }]);
    setLiveText('');
    setLiveInterim('');
    liveTextRef.current = '';

    try {
      const result: ConversationalInputResponse = await conversationalService.sendInput(sessionId, userText);

      if (result.evaluation?.score !== undefined) {
        const s = result.evaluation.score;
        setAvgScore((prev) => {
          const n = questionsAsked || 1;
          return prev === 0 ? s : (prev * (n - 1) + s) / n;
        });
        setMessages((p) => [...p, {
          id: crypto.randomUUID(), role: 'system',
          text: `Score: ${s}/100${result.evaluation?.why_this_score ? ` — ${result.evaluation.why_this_score}` : ''}`,
          time: new Date(), score: s,
        }]);
      }

      if (result.question) setQuestionsAsked((n) => n + 1);

      if (result.conversation_state === 'completed' || result.action === 'complete') {
        if (result.response) {
          setMessages((p) => [...p, { id: crypto.randomUUID(), role: 'ai', text: result.response, time: new Date() }]);
          speak(result.response, () => setPhase('complete'));
        } else {
          setPhase('complete');
        }
      } else if (result.response) {
        setMessages((p) => [...p, { id: crypto.randomUUID(), role: 'ai', text: result.response, time: new Date() }]);
        speak(result.response, () => setPhase('listening'));
      } else {
        setPhase('listening');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process. Try again.');
      setPhase('listening');
    } finally {
      busyRef.current = false;
      setIsProcessing(false);
    }
  }, [sessionId, questionsAsked, speak, stopRec]);

  useEffect(() => { submitRef.current = submitAnswer; }, [submitAnswer]);

  /* ================================================================ */
  /* Phase → recognition control                                       */
  /* ================================================================ */

  useEffect(() => {
    if (phase === 'listening' && isMicOn && startedRef.current) {
      startRec();
    } else {
      stopRec();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isMicOn]);

  /* ================================================================ */
  /* Begin interview — triggered by user click (required for mic)      */
  /* ================================================================ */

  // Preload voices on mount
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      setTimeout(() => window.speechSynthesis.getVoices(), 300);
    }
  }, []);

  const handleBegin = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);

    // Unlock TTS (must happen in user gesture handler)
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }

    // Request mic permission NOW in user gesture context — then release
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop()); // release immediately
      console.log('[V2] Mic permission granted');
    } catch {
      setError('Microphone access is required. Please allow and try again.');
      startedRef.current = false;
      setStarted(false);
      return;
    }

    setPhase('processing');

    try {
      const result = await conversationalService.sendInput(sessionId, 'Hello, I am ready to start the interview.');
      if (result.response) {
        setMessages([{ id: crypto.randomUUID(), role: 'ai', text: result.response, time: new Date() }]);
        if (result.question) setQuestionsAsked(1);
        speak(result.response, () => setPhase('listening'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview');
      setPhase('idle');
      startedRef.current = false;
      setStarted(false);
    }
  }, [sessionId, speak]);

  /* ================================================================ */
  /* Repeat / Skip                                                     */
  /* ================================================================ */

  const handleRepeat = useCallback(() => {
    const last = [...messages].reverse().find((m) => m.role === 'ai');
    if (last) speak(last.text, () => setPhase('listening'));
  }, [messages, speak]);

  const handleSkip = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (ttsWatchdogRef.current) clearTimeout(ttsWatchdogRef.current);
    setPhase('listening');
  }, []);

  /* ================================================================ */
  /* Camera (video only)                                               */
  /* ================================================================ */

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let dead = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: false });
        if (dead) { s.getTracks().forEach((t) => t.stop()); return; }
        mediaRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch { /* camera optional */ }
    })();
    return () => { dead = true; mediaRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  /* Timer */
  useEffect(() => {
    if (phase !== 'idle' && phase !== 'complete') {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  /* Auto-scroll */
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, liveInterim]);

  /* Cleanup */
  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    if (ttsWatchdogRef.current) clearTimeout(ttsWatchdogRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    stopRec();
  }, [stopRec]);

  /* Helpers */
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const hasText = liveText.trim().length > 0 || liveInterim.trim().length > 0;

  /* ================================================================ */
  /* Render                                                            */
  /* ================================================================ */

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* Start overlay — one click needed to unlock mic + TTS */}
      {!started && (
        <div style={S.overlay}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--color-signal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="var(--color-text-inverse)" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="var(--color-text-inverse)" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="19" x2="12" y2="22" stroke="var(--color-text-inverse)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-inverse)', fontWeight: 400 }}>
            Ready to begin?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse-muted)', textAlign: 'center', maxWidth: 400, lineHeight: 'var(--leading-relaxed)' }}>
            The AI interviewer will speak questions. You respond by speaking naturally. Your speech is transcribed and sent automatically after a brief pause.
          </p>
          <button onClick={handleBegin} className="btn-primary" style={{ padding: '14px 40px', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
            Start Interview
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-inverse-faint)', letterSpacing: 'var(--tracking-wide)' }}>
            Microphone required &middot; Chrome recommended
          </span>
        </div>
      )}

      {/* Top bar */}
      <header style={S.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={S.mono}>Session {rawId}</span>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0, transition: 'all 0.3s',
            background:
              phase === 'ai_speaking' ? 'var(--color-signal)'
              : phase === 'listening' ? 'var(--color-success)'
              : phase === 'processing' ? 'var(--color-warning)'
              : phase === 'complete' ? 'var(--color-success)'
              : 'var(--color-text-inverse-faint)',
            boxShadow:
              phase === 'ai_speaking' ? '0 0 8px rgba(212,68,12,0.5)'
              : phase === 'listening' ? '0 0 6px rgba(45,122,78,0.5)'
              : 'none',
          }} />
          <span style={{ ...S.mono, fontSize: '11px' }}>
            {phase === 'ai_speaking' ? 'AI Speaking — Listen'
              : phase === 'listening' ? (hasText ? 'Hearing you...' : 'Your Turn — Speak Now')
              : phase === 'processing' ? 'Processing...'
              : phase === 'complete' ? 'Complete'
              : 'Starting...'}
          </span>
          {phase === 'listening' && (
            <span style={{
              ...S.mono, fontSize: '10px', fontWeight: 600,
              color: micStatus === 'listening' ? '#4ade80' : micStatus === 'starting' ? 'var(--color-warning)' : micStatus === 'error' ? 'var(--color-error)' : 'var(--color-text-inverse-faint)',
            }}>
              {micStatus === 'listening' ? 'MIC LIVE' : micStatus === 'starting' ? 'MIC STARTING...' : micStatus === 'error' ? 'MIC ERROR' : 'MIC OFF'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ ...S.mono, fontSize: 'var(--text-base)', color: 'var(--color-text-inverse)' }}>{fmt(elapsed)}</span>
          {questionsAsked > 0 && <Badge variant="outline" className="v2-badge">Q {questionsAsked}</Badge>}
        </div>
      </header>

      {/* Error */}
      {error && (
        <div style={{ padding: '8px 24px', background: 'var(--color-error-subtle)', color: 'var(--color-error)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>dismiss</button>
        </div>
      )}

      {/* Main */}
      <div style={S.grid}>
        {/* LEFT */}
        <div style={S.left}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, minHeight: 0 }}>
            <AIAvatar phase={phase} isSpeaking={phase === 'ai_speaking'} />
          </div>

          {/* Live speech box */}
          {(phase === 'listening' || (phase === 'processing' && (liveText || liveInterim))) && (
            <div style={{
              margin: '0 24px', padding: '14px 18px',
              background: hasText ? 'rgba(45,122,78,0.06)' : 'rgba(245,242,236,0.03)',
              border: `1px solid ${hasText ? 'rgba(45,122,78,0.25)' : 'var(--color-border-inverse)'}`,
              borderRadius: 'var(--radius-md)', transition: 'all 0.3s', minHeight: 48,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase', marginBottom: 6,
                color: hasText ? 'var(--color-success)' : 'var(--color-text-inverse-faint)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: micStatus === 'listening' ? '#4ade80' : micStatus === 'starting' ? 'var(--color-warning)' : isMicOn ? 'var(--color-text-inverse-faint)' : 'var(--color-error)',
                    animation: micStatus === 'listening' ? 'v2pulse 1.5s ease-in-out infinite' : 'none',
                  }} />
                  {hasText ? 'Hearing you...' : micStatus === 'listening' ? 'Listening — speak now' : micStatus === 'starting' ? 'Starting microphone...' : isMicOn ? 'Connecting mic...' : 'Microphone off'}
                </div>
                {countdown !== null && countdown > 0 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-warning)', fontWeight: 500 }}>
                    Sending in {countdown}s
                  </span>
                )}
              </div>
              {(liveText || liveInterim) ? (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
                  {liveText}
                  {liveInterim && <span style={{ color: 'var(--color-text-inverse-faint)', fontStyle: 'italic' }}> {liveInterim}</span>}
                </p>
              ) : (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse-faint)', margin: 0, fontStyle: 'italic' }}>
                  Waiting for your response...
                </p>
              )}
            </div>
          )}

          {/* Camera + Controls */}
          <div style={{ padding: '12px 24px 16px', borderTop: '1px solid var(--color-border-inverse)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexShrink: 0, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 130, height: 98, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--color-border-inverse-strong)', background: '#1a1a1a', flexShrink: 0 }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isCameraOn ? 1 : 0 }} />
              {!isCameraOn && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ ...S.mono, fontSize: '10px' }}>cam off</span></div>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button onClick={() => setIsMicOn(!isMicOn)} className={isMicOn ? 'btn-secondary' : 'btn-primary'} style={{ padding: '6px 12px', fontSize: '11px' }}>
                {isMicOn ? 'Mute' : 'Unmute'}
              </button>
              <button onClick={() => { setIsCameraOn(!isCameraOn); mediaRef.current?.getVideoTracks().forEach((t) => { t.enabled = !isCameraOn; }); }} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                {isCameraOn ? 'Cam Off' : 'Cam On'}
              </button>
              {phase === 'ai_speaking' && (
                <button onClick={handleSkip} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>Skip</button>
              )}
              {phase !== 'ai_speaking' && messages.length > 0 && (
                <button onClick={handleRepeat} disabled={isProcessing} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', opacity: isProcessing ? 0.4 : 1 }}>Repeat</button>
              )}
              {questionsAsked >= 2 && phase !== 'complete' && !isProcessing && (
                <button onClick={() => router.push(`/results/${rawId}?v2=true`)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}>End</button>
              )}
              {phase !== 'complete' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
                <button
                  onClick={() => {
                    stopRec();
                    window.speechSynthesis?.cancel();
                    if (timerRef.current) clearInterval(timerRef.current);
                    router.push(`/results/${rawId}?v2=true`);
                  }}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '11px', borderColor: 'var(--color-warning)', color: 'var(--color-warning)' }}
                >
                  Demo: Skip to Results
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={S.right}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border-inverse)', display: 'flex', gap: 24, flexShrink: 0 }}>
            <div style={S.infoCol}><span style={S.label}>Questions</span><span style={S.val}>{questionsAsked}</span></div>
            <div style={S.infoCol}><span style={S.label}>Time</span><span style={S.val}>{fmt(elapsed)}</span></div>
            {avgScore > 0 && <div style={S.infoCol}><span style={S.label}>Avg Score</span><span style={{ ...S.val, color: avgScore >= 65 ? 'var(--color-success)' : avgScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)' }}>{avgScore.toFixed(0)}</span></div>}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--color-text-inverse-faint)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', paddingTop: 60 }}>
                <div className="v2-dots"><span /><span /><span /></div>
                <p style={{ marginTop: 12 }}>Starting your interview...</p>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} style={{
                padding: '12px 14px',
                background: m.role === 'ai' ? 'rgba(212,68,12,0.04)' : m.role === 'system' ? 'rgba(245,242,236,0.02)' : 'rgba(24,95,165,0.06)',
                border: `1px solid ${m.role === 'ai' ? 'rgba(212,68,12,0.15)' : m.role === 'system' ? 'var(--color-border-inverse)' : 'rgba(24,95,165,0.2)'}`,
                borderRadius: 'var(--radius-md)', animation: 'v2fadeIn 0.3s ease-out',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', fontWeight: 500, color: m.role === 'ai' ? 'var(--color-signal)' : m.role === 'system' ? 'var(--color-text-muted)' : 'var(--color-info)' }}>
                    {m.role === 'ai' ? 'Interviewer' : m.role === 'user' ? 'You' : 'Evaluation'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-inverse-faint)' }}>
                    {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', color: m.role === 'system' ? 'var(--color-text-inverse-muted)' : 'var(--color-text-inverse)' }}>{m.text}</div>
                {m.score !== undefined && (
                  <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: '12px', color: m.score >= 65 ? 'var(--color-success)' : m.score >= 40 ? 'var(--color-warning)' : 'var(--color-error)' }}>
                    Score: {m.score}/100
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div style={{ padding: '12px 14px', background: 'rgba(245,242,236,0.02)', border: '1px solid var(--color-border-inverse)', borderRadius: 'var(--radius-md)' }}>
                <div className="v2-dots" style={{ justifyContent: 'flex-start' }}><span /><span /><span /></div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </div>
      </div>

      {/* Complete overlay */}
      {phase === 'complete' && (
        <div style={S.overlay}>
          <div style={{ background: 'var(--color-bg-inverse)', border: '1px solid var(--color-border-inverse-strong)', borderRadius: 'var(--radius-xl)', padding: 48, textAlign: 'center', maxWidth: 400, width: '90%' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-inverse)', marginBottom: 24 }}>Interview Complete</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 64, lineHeight: 1, color: 'var(--color-signal)' }}>{avgScore.toFixed(0)}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: 'var(--color-text-inverse-muted)' }}>/100</span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse-faint)', marginBottom: 32 }}>
              {questionsAsked} questions in {fmt(elapsed)}
            </p>
            <button onClick={() => router.push(`/results/${rawId}?v2=true`)} className="btn-primary" style={{ padding: '12px 32px' }}>View Results</button>
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
  page: { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-inverse)', color: 'var(--color-text-inverse)', fontFamily: 'var(--font-body)', overflow: 'hidden' },
  mono: { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-inverse-muted)', letterSpacing: 'var(--tracking-wide)' },
  overlay: { position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(13,13,13,0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-5)' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', borderBottom: '1px solid var(--color-border-inverse)', flexShrink: 0 },
  grid: { display: 'flex', flex: 1, overflow: 'hidden' },
  left: { width: '50%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border-inverse)', overflow: 'hidden' },
  right: { width: '50%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  infoCol: { display: 'flex', flexDirection: 'column', gap: 2 },
  label: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-inverse-faint)', textTransform: 'uppercase' as const, letterSpacing: 'var(--tracking-wider)' },
  val: { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)', color: 'var(--color-text-inverse)' },
};

const css = `
  .v2-badge { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); border-color: var(--color-border-inverse-strong); color: var(--color-text-inverse-muted); }
  @keyframes v2pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  @keyframes v2fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .v2-dots { display: flex; gap: 6px; align-items: center; justify-content: center; }
  .v2-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--color-text-inverse-faint); animation: v2bounce 1.2s ease-in-out infinite; }
  .v2-dots span:nth-child(2) { animation-delay: 0.15s; }
  .v2-dots span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes v2bounce { 0%,80%,100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1.1); } }
`;
