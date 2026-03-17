'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioCaptureReturn {
  isCapturing: boolean;
  audioLevel: number;
  startCapture: (onAudioChunk: (data: string, energy: number) => void) => Promise<void>;
  stopCapture: () => void;
  error: string | null;
}

export function useAudioCapture(): UseAudioCaptureReturn {
  const [isCapturing, setIsCapturing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const callbackRef = useRef<((data: string, energy: number) => void) | null>(null);
  const isCleanedUpRef = useRef(false);

  const computeRMS = useCallback((): number => {
    if (!analyserRef.current) return 0;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(dataArray);

    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i]! - 128) / 128;
      sumSquares += normalized * normalized;
    }

    const rms = Math.sqrt(sumSquares / dataArray.length);
    // Clamp to 0-1 range with a slight boost for sensitivity
    return Math.min(1, rms * 2.5);
  }, []);

  const updateAudioLevel = useCallback(() => {
    if (!isCleanedUpRef.current && analyserRef.current) {
      const level = computeRMS();
      setAudioLevel(level);
      animFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [computeRMS]);

  const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Strip the data URL prefix to get raw base64
          const base64 = reader.result.split(',')[1] ?? '';
          resolve(base64);
        } else {
          reject(new Error('Failed to read blob as base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  const startCapture = useCallback(
    async (onAudioChunk: (data: string, energy: number) => void) => {
      if (typeof window === 'undefined') return;

      setError(null);
      isCleanedUpRef.current = false;
      callbackRef.current = onAudioChunk;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
          },
        });

        mediaStreamRef.current = stream;

        // Set up AudioContext and AnalyserNode for energy/VAD
        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);
        analyserRef.current = analyser;

        // Start audio level monitoring
        animFrameRef.current = requestAnimationFrame(updateAudioLevel);

        // Determine supported MIME type
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/mp4';

        const recorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: 64000,
        });

        recorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && callbackRef.current && !isCleanedUpRef.current) {
            try {
              const base64 = await blobToBase64(event.data);
              const energy = computeRMS();
              callbackRef.current(base64, energy);
            } catch {
              // Ignore encoding errors during capture
            }
          }
        };

        recorder.onerror = () => {
          setError('Audio recording error');
        };

        recorder.start(250); // Capture in 250ms chunks
        mediaRecorderRef.current = recorder;
        setIsCapturing(true);
      } catch (err: unknown) {
        const message =
          err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'Microphone access denied. Please allow microphone permissions and try again.'
            : err instanceof DOMException && err.name === 'NotFoundError'
              ? 'No microphone found. Please connect a microphone.'
              : 'Failed to access microphone.';
        setError(message);
        setIsCapturing(false);
      }
    },
    [blobToBase64, computeRMS, updateAudioLevel],
  );

  const stopCapture = useCallback(() => {
    isCleanedUpRef.current = true;
    callbackRef.current = null;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }

    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsCapturing(false);
    setAudioLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCleanedUpRef.current = true;
      callbackRef.current = null;

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    isCapturing,
    audioLevel,
    startCapture,
    stopCapture,
    error,
  };
}
