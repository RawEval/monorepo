'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@raweval/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel?: () => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (_error) {
      console.error('Error accessing microphone:', _error);
      setMicError('Microphone access denied');
      setTimeout(() => setMicError(null), 3000);
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    stopRecording();
    chunksRef.current = [];
    setRecordingTime(0);
    onCancel?.();
  }, [stopRecording, onCancel]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === 'recording'
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return (
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={startRecording}
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground h-8 w-8 touch-manipulation disabled:opacity-50 sm:h-9 sm:w-9"
          aria-label="Start voice recording"
        >
          <Mic className="h-4 w-4" />
        </Button>
        {micError && (
          <div className="text-destructive absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-bg-base)]/95 px-2.5 py-1 text-[11px] font-medium shadow-lg backdrop-blur-sm">
            {micError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-primary/50 bg-primary/5 flex items-center gap-1.5 rounded-lg border px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5'
      )}
    >
      {/* Pulse indicator */}
      <div className="relative flex h-6 w-6 items-center justify-center sm:h-8 sm:w-8">
        <div className="bg-primary/30 absolute h-6 w-6 animate-ping rounded-full sm:h-8 sm:w-8" />
        <div className="bg-primary relative flex h-5 w-5 items-center justify-center rounded-full sm:h-6 sm:w-6">
          <Square className="text-primary-foreground h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </div>
      </div>

      <span className="text-foreground text-xs font-medium tabular-nums sm:text-sm">
        {formatTime(recordingTime)}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={stopRecording}
        className="h-6 touch-manipulation px-2 text-xs sm:h-7 sm:text-sm"
      >
        Stop
      </Button>

      {onCancel ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={cancelRecording}
          className="text-muted-foreground hover:text-foreground h-6 touch-manipulation px-1 sm:h-7 sm:px-2"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
