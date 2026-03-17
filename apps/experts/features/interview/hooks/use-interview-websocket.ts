'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useInterviewStore } from '@/stores/interview-store';
import type {
  WSClientMessage,
  InterviewPhase,
  InterviewQuestion,
} from '@/features/interview/types';

interface UseInterviewWebSocketOptions {
  wsUrl: string | null;
  token?: string;
  onMessage?: (type: string, data: unknown) => void;
}

interface UseInterviewWebSocketReturn {
  isConnected: boolean;
  connectionError: string | null;
  sendMessage: (message: WSClientMessage) => void;
  sendAudioChunk: (data: string, energy?: number) => void;
  sendVideoFrame: (data: string) => void;
  sendBargeIn: (speechDurationMs?: number) => void;
  sendForceSubmit: () => void;
  disconnect: () => void;
}

/**
 * Stable WebSocket hook for V2 interviews.
 *
 * Key design decisions:
 * - Uses refs for callbacks/state to avoid re-creating the connection
 * - Only reconnects on abnormal close, with exponential backoff
 * - Max 3 reconnect attempts before giving up
 * - Heartbeat every 15s to keep connection alive
 */
export function useInterviewWebSocket({
  wsUrl,
  token,
  onMessage,
}: UseInterviewWebSocketOptions): UseInterviewWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const reconnectCountRef = useRef(0);
  const intentionalCloseRef = useRef(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Store actions — accessed via ref to keep stable
  const storeRef = useRef(useInterviewStore.getState());
  useEffect(() => {
    return useInterviewStore.subscribe((state) => {
      storeRef.current = state;
    });
  }, []);

  const handleServerMessage = useCallback((raw: string) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    const type = msg.type as string;
    const store = storeRef.current;

    // Forward to page-level handler
    onMessageRef.current?.(type, msg);

    switch (type) {
      case 'question': {
        const data = (msg.data ?? msg) as Record<string, unknown>;
        const question: InterviewQuestion = {
          question_text: (data.question_text as string) ?? '',
          question_id: (data.question_id as string) ?? `q-${msg.question_number ?? 0}`,
          transcript_id: (data.transcript_id as number) ?? 0,
          turn_number: (data.turn_number as number) ?? (msg.question_number as number) ?? 0,
          segment_type: (data.segment_type as string) ?? 'conversation',
          difficulty: (data.difficulty as string) ?? 'medium',
        };
        store.setCurrentQuestion(question);
        store.addMessage({ type: 'ai', content: question.question_text });
        store.setPhase(msg.speak === false ? 'listening' : 'ai_speaking');
        break;
      }

      case 'transcript_segment': {
        if (msg.is_final && msg.text) {
          store.appendFinalTranscript(msg.text as string);
        } else if (msg.text) {
          store.setInterimTranscript(msg.text as string);
        }
        break;
      }

      case 'evaluation': {
        const evalData = msg.data as Record<string, unknown> | undefined;
        if (evalData?.score !== undefined) {
          store.addScore(evalData.score as number);
        }
        if (msg.adaptive_difficulty) {
          store.setAdaptiveDifficulty(msg.adaptive_difficulty as Parameters<typeof store.setAdaptiveDifficulty>[0]);
        }
        if (msg.progress) {
          store.updateProgress(msg.progress as Parameters<typeof store.updateProgress>[0]);
        }
        if (msg.answer_text) {
          store.addMessage({ type: 'user', content: msg.answer_text as string });
        }
        break;
      }

      case 'state_update': {
        if (msg.state) {
          const phaseMap: Record<string, InterviewPhase> = {
            CONNECTED: 'connected',
            AI_SPEAKING: 'ai_speaking',
            LISTENING: 'listening',
            USER_SPEAKING: 'user_speaking',
            PROCESSING: 'processing',
            COUNTDOWN: 'countdown',
            EVALUATING: 'evaluating',
            COMPLETE: 'complete',
          };
          store.setPhase(phaseMap[msg.state as string] ?? 'connected');
        }
        if (msg.progress) {
          store.updateProgress(msg.progress as Parameters<typeof store.updateProgress>[0]);
        }
        break;
      }

      case 'barge_in_ack':
      case 'cancel_tts':
        store.setPhase('listening');
        break;

      case 'auto_submit_countdown':
        if ((msg.seconds_left as number) > 0) store.setPhase('countdown');
        break;

      case 'speech_state':
        if (msg.state === 'speaking') store.setPhase('user_speaking');
        break;

      case 'question_repeat':
      case 'reprompt':
        if (msg.rephrased_question || msg.original_question) {
          store.addMessage({
            type: 'ai',
            content: (msg.rephrased_question ?? msg.original_question) as string,
          });
        }
        break;

      case 'error':
        store.setError((msg.message as string) ?? 'Server error');
        break;

      case 'heartbeat_ack':
      case 'detection_result':
      case 'cheating_alert':
      case 'soft_warning':
        // Handled by onMessage callback
        break;

      default:
        break;
    }
  }, []);

  // --- Connection logic (runs only when wsUrl/token change) ---
  useEffect(() => {
    if (!wsUrl) return;

    intentionalCloseRef.current = false;
    reconnectCountRef.current = 0;

    function createConnection() {
      // Clean up previous
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        if (wsRef.current.readyState < 2) wsRef.current.close(1000);
        wsRef.current = null;
      }

      const url = token ? `${wsUrl}?token=${token}` : wsUrl!;
      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch {
        setConnectionError('Failed to create WebSocket connection');
        return;
      }

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectCountRef.current = 0;
        storeRef.current.setPhase('connected');
        storeRef.current.setError(null);

        // Start heartbeat
        if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        handleServerMessage(event.data);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = undefined;
        }

        // Don't reconnect if intentional or clean close
        if (intentionalCloseRef.current || event.code === 1000) return;

        // Reconnect with backoff (max 3 attempts)
        if (reconnectCountRef.current < 3) {
          const delay = Math.min(2000 * Math.pow(2, reconnectCountRef.current), 10000);
          reconnectCountRef.current += 1;
          reconnectTimerRef.current = setTimeout(createConnection, delay);
        } else {
          setConnectionError('Connection lost after 3 attempts. You can still submit answers via text.');
        }
      };

      ws.onerror = () => {
        // onerror always fires before onclose — just log, don't set error here
      };

      wsRef.current = ws;
    }

    createConnection();

    return () => {
      intentionalCloseRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        if (wsRef.current.readyState < 2) wsRef.current.close(1000);
        wsRef.current = null;
      }
    };
  }, [wsUrl, token, handleServerMessage]);

  // --- Stable send helpers ---
  const sendMessage = useCallback((message: WSClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendAudioChunk = useCallback(
    (data: string, energy?: number) => sendMessage({ type: 'audio', data, energy }),
    [sendMessage],
  );

  const sendVideoFrame = useCallback(
    (data: string) => sendMessage({ type: 'video_frame', data }),
    [sendMessage],
  );

  const sendBargeIn = useCallback(
    (speechDurationMs?: number) => sendMessage({ type: 'barge_in', speech_duration_ms: speechDurationMs }),
    [sendMessage],
  );

  const sendForceSubmit = useCallback(
    () => sendMessage({ type: 'force_submit' }),
    [sendMessage],
  );

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    if (wsRef.current) {
      if (wsRef.current.readyState < 2) wsRef.current.close(1000);
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    connectionError,
    sendMessage,
    sendAudioChunk,
    sendVideoFrame,
    sendBargeIn,
    sendForceSubmit,
    disconnect,
  };
}
