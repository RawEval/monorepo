'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
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

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    stopRecording();
    chunksRef.current = [];
    setRecordingTime(0);
    onCancel?.();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={startRecording}
        disabled={disabled}
        className="h-9 w-9 text-muted-foreground hover:text-foreground disabled:opacity-50"
        aria-label="Start voice recording"
      >
        <Mic className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/5 px-3 py-1.5">
      {/* Pulse indicator */}
      <div className="relative flex h-8 w-8 items-center justify-center">
        <div className="absolute h-8 w-8 animate-ping rounded-full bg-primary/30" />
        <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary">
          <Square className="h-3 w-3 text-primary-foreground" />
        </div>
      </div>

      {/* Timer */}
      <span className="text-sm font-medium text-foreground">{formatTime(recordingTime)}</span>

      {/* Stop button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={stopRecording}
        className="h-7 px-2 text-sm"
      >
        Stop
      </Button>

      {/* Cancel button */}
      {onCancel && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={cancelRecording}
          className="h-7 px-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
