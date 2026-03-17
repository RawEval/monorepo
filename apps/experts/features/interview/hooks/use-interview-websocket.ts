'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useInterviewStore } from '@/stores/interview-store';
import type {
  WSServerMessage,
  WSClientMessage,
  InterviewPhase,
  InterviewQuestion,
} from '@/features/interview/types';

interface UseInterviewWebSocketOptions {
  wsUrl: string | null;
  token?: string;
  onQuestion?: (question: InterviewQuestion) => void;
  onEvaluation?: (data: WSServerMessage) => void;
  onCheatAlert?: (data: WSServerMessage) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

interface UseInterviewWebSocketReturn {
  isConnected: boolean;
  sendMessage: (message: WSClientMessage) => void;
  sendAudioChunk: (data: string, energy?: number) => void;
  sendVideoFrame: (data: string) => void;
  sendHeartbeat: () => void;
  sendBargeIn: (speechDurationMs?: number) => void;
  sendForceSubmit: () => void;
  disconnect: () => void;
}

export function useInterviewWebSocket({
  wsUrl,
  token,
  onQuestion,
  onEvaluation,
  onCheatAlert,
  onError,
}: UseInterviewWebSocketOptions): UseInterviewWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

  const {
    setPhase,
    setCurrentQuestion,
    addMessage,
    updateProgress,
    addScore,
    setAdaptiveDifficulty,
    setInterimTranscript,
    appendFinalTranscript,
    setError,
  } = useInterviewStore();

  const handleServerMessage = useCallback(
    (msg: WSServerMessage) => {
      switch (msg.type) {
        case 'question': {
          const question: InterviewQuestion = {
            question_text: typeof msg.data === 'string' ? msg.data : '',
            question_id: `q-${msg.question_number ?? 0}`,
            transcript_id: 0,
            turn_number: msg.question_number ?? 0,
            segment_type: msg.pipeline ?? 'unknown',
            difficulty: 'medium',
          };
          setCurrentQuestion(question);
          addMessage({ type: 'ai', content: question.question_text });
          setPhase(msg.speak ? 'ai_speaking' : 'listening');
          onQuestion?.(question);
          break;
        }

        case 'transcript_segment': {
          if (msg.is_final && msg.text) {
            appendFinalTranscript(msg.text);
          } else if (msg.text) {
            setInterimTranscript(msg.text);
          }
          break;
        }

        case 'evaluation': {
          if (msg.data && typeof msg.data === 'object') {
            const evalData = msg.data as { score?: number };
            if (evalData.score !== undefined) {
              addScore(evalData.score);
            }
          }
          if (msg.adaptive_difficulty) {
            setAdaptiveDifficulty(msg.adaptive_difficulty);
          }
          if (msg.progress) {
            updateProgress(msg.progress);
          }
          if (msg.answer_text) {
            addMessage({ type: 'user', content: msg.answer_text });
          }
          onEvaluation?.(msg);
          break;
        }

        case 'barge_in_ack': {
          setPhase('listening');
          break;
        }

        case 'auto_submit_countdown': {
          if (msg.seconds_left !== undefined && msg.seconds_left > 0) {
            setPhase('countdown');
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
            const phase = phaseMap[msg.state] || 'connected';
            setPhase(phase);
          }
          if (msg.progress) {
            updateProgress(msg.progress);
          }
          break;
        }

        case 'speech_state': {
          if (msg.speech_active) {
            setPhase('user_speaking');
          }
          break;
        }

        case 'cheating_alert': {
          onCheatAlert?.(msg);
          break;
        }

        case 'question_repeat':
        case 'reprompt': {
          // Just update the question text for re-prompts
          if (msg.rephrased_question || msg.original_question) {
            addMessage({
              type: 'ai',
              content: msg.rephrased_question || msg.original_question || '',
            });
          }
          break;
        }

        case 'cancel_tts': {
          setPhase('listening');
          break;
        }

        case 'error': {
          setError(msg.message || 'WebSocket error');
          onError?.(msg.message || 'WebSocket error');
          break;
        }

        case 'heartbeat_ack':
          break;

        default:
          break;
      }
    },
    [
      setPhase,
      setCurrentQuestion,
      addMessage,
      updateProgress,
      addScore,
      setAdaptiveDifficulty,
      setInterimTranscript,
      appendFinalTranscript,
      setError,
      onQuestion,
      onEvaluation,
      onCheatAlert,
      onError,
    ],
  );

  const connect = useCallback(() => {
    if (!wsUrl) return;

    const url = token ? `${wsUrl}?token=${token}` : wsUrl;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      setPhase('connected');
      setError(null);

      // Start heartbeat
      heartbeatTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 15000);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSServerMessage = JSON.parse(event.data);
        handleServerMessage(msg);
      } catch {
        console.error('Failed to parse WebSocket message');
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);

      if (!event.wasClean && event.code !== 1000) {
        // Attempt reconnection
        reconnectTimer.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    ws.onerror = () => {
      setError('WebSocket connection error');
      onError?.('WebSocket connection error');
    };

    wsRef.current = ws;
  }, [wsUrl, token, handleServerMessage, setPhase, setError, onError]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: WSClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendAudioChunk = useCallback(
    (data: string, energy?: number) => {
      sendMessage({ type: 'audio', data, energy });
    },
    [sendMessage],
  );

  const sendVideoFrame = useCallback(
    (data: string) => {
      sendMessage({ type: 'video_frame', data });
    },
    [sendMessage],
  );

  const sendHeartbeat = useCallback(() => {
    sendMessage({ type: 'heartbeat' });
  }, [sendMessage]);

  const sendBargeIn = useCallback(
    (speechDurationMs?: number) => {
      sendMessage({ type: 'barge_in', speech_duration_ms: speechDurationMs });
    },
    [sendMessage],
  );

  const sendForceSubmit = useCallback(() => {
    sendMessage({ type: 'force_submit' });
  }, [sendMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    if (wsRef.current) {
      wsRef.current.close(1000);
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    sendMessage,
    sendAudioChunk,
    sendVideoFrame,
    sendHeartbeat,
    sendBargeIn,
    sendForceSubmit,
    disconnect,
  };
}
