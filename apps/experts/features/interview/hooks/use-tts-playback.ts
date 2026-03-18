'use client';

import { useRef, useCallback, useState } from 'react';

interface UseTTSPlaybackOptions {
  onPlaybackComplete?: () => void;
  onAnalyserData?: (data: Uint8Array) => void;
}

interface UseTTSPlaybackReturn {
  isPlaying: boolean;
  queueAudioChunk: (base64Data: string, isLast: boolean) => void;
  cancelPlayback: () => void;
  getAnalyser: () => AnalyserNode | null;
}

/**
 * Hook for playing server-side TTS audio chunks received over WebSocket.
 *
 * Audio arrives as base64-encoded mp3 chunks (~4096 bytes each).
 * They are decoded and played sequentially via Web Audio API.
 * An AnalyserNode is exposed for driving lip-sync animations.
 */
export function useTTSPlayback({
  onPlaybackComplete,
  onAnalyserData,
}: UseTTSPlaybackOptions = {}): UseTTSPlaybackReturn {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const queueRef = useRef<Array<{ buffer: ArrayBuffer; isLast: boolean }>>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const onCompleteRef = useRef(onPlaybackComplete);
  const onAnalyserRef = useRef(onAnalyserData);
  const animFrameRef = useRef<number | null>(null);

  onCompleteRef.current = onPlaybackComplete;
  onAnalyserRef.current = onAnalyserData;

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 64;
      analyser.connect(audioCtxRef.current.destination);
      analyserRef.current = analyser;
    }
    // Resume if suspended (autoplay policy)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return { ctx: audioCtxRef.current, analyser: analyserRef.current! };
  }, []);

  const startAnalyserLoop = useCallback(() => {
    if (animFrameRef.current !== null) return;

    const data = new Uint8Array(analyserRef.current?.frequencyBinCount ?? 0);
    function loop() {
      if (analyserRef.current && onAnalyserRef.current) {
        analyserRef.current.getByteFrequencyData(data);
        onAnalyserRef.current(data);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    }
    loop();
  }, []);

  const stopAnalyserLoop = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const playNext = useCallback(async () => {
    if (queueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      stopAnalyserLoop();
      onCompleteRef.current?.();
      return;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);

    const { buffer } = queueRef.current.shift()!;
    const { ctx, analyser } = ensureAudioContext();

    try {
      const audioBuffer = await ctx.decodeAudioData(buffer.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      source.onended = () => playNext();
      source.start();
      startAnalyserLoop();
    } catch {
      // Skip corrupted chunk, try next
      playNext();
    }
  }, [ensureAudioContext, startAnalyserLoop, stopAnalyserLoop]);

  const queueAudioChunk = useCallback(
    (base64Data: string, isLast: boolean) => {
      const raw = atob(base64Data);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      queueRef.current.push({ buffer: bytes.buffer, isLast });

      if (!isPlayingRef.current) {
        playNext();
      }
    },
    [playNext],
  );

  const cancelPlayback = useCallback(() => {
    queueRef.current.length = 0;
    isPlayingRef.current = false;
    setIsPlaying(false);
    stopAnalyserLoop();
    // Stop any current audio by closing and recreating context
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      analyserRef.current = null;
    }
  }, [stopAnalyserLoop]);

  const getAnalyser = useCallback(() => analyserRef.current, []);

  return {
    isPlaying,
    queueAudioChunk,
    cancelPlayback,
    getAnalyser,
  };
}
