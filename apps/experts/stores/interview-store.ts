/**
 * Interview Store
 *
 * Zustand store for managing interview session state including
 * questions, messages, progress, and V2 real-time state.
 */

import { create } from 'zustand';
import type {
  InterviewQuestion,
  Evaluation,
  AdaptiveDifficulty,
  SubmitAnswerProgress,
  InterviewPhase,
} from '@/features/interview/types';

interface InterviewMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  evaluation?: Evaluation;
  questionId?: string;
  transcriptId?: number;
}

interface InterviewState {
  // Session
  sessionId: number | null;
  v2SessionId: number | null;
  isV2: boolean;
  phase: InterviewPhase;

  // Questions & Messages
  currentQuestion: InterviewQuestion | null;
  messages: InterviewMessage[];

  // Progress
  progress: SubmitAnswerProgress | null;
  scores: number[];
  averageScore: number;
  adaptiveDifficulty: AdaptiveDifficulty | null;

  // V2 specific
  wsUrl: string | null;
  interimTranscript: string;
  finalTranscript: string;

  // UI state
  isSubmitting: boolean;
  isCompleting: boolean;
  error: string | null;

  // Actions
  setSession: (sessionId: number, v2SessionId?: number) => void;
  setPhase: (phase: InterviewPhase) => void;
  setCurrentQuestion: (question: InterviewQuestion | null) => void;
  addMessage: (message: Omit<InterviewMessage, 'id' | 'timestamp'>) => void;
  updateProgress: (progress: SubmitAnswerProgress) => void;
  addScore: (score: number) => void;
  setAdaptiveDifficulty: (difficulty: AdaptiveDifficulty) => void;
  setWsUrl: (url: string) => void;
  setInterimTranscript: (text: string) => void;
  appendFinalTranscript: (text: string) => void;
  clearTranscripts: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setCompleting: (isCompleting: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  v2SessionId: null,
  isV2: false,
  phase: 'idle' as InterviewPhase,
  currentQuestion: null,
  messages: [],
  progress: null,
  scores: [],
  averageScore: 0,
  adaptiveDifficulty: null,
  wsUrl: null,
  interimTranscript: '',
  finalTranscript: '',
  isSubmitting: false,
  isCompleting: false,
  error: null,
};

export const useInterviewStore = create<InterviewState>((set) => ({
  ...initialState,

  setSession: (sessionId, v2SessionId) =>
    set({ sessionId, v2SessionId: v2SessionId ?? null, isV2: !!v2SessionId }),

  setPhase: (phase) => set({ phase }),

  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: crypto.randomUUID(), timestamp: new Date() },
      ],
    })),

  updateProgress: (progress) => set({ progress }),

  addScore: (score) =>
    set((state) => {
      const scores = [...state.scores, score];
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      return { scores, averageScore };
    }),

  setAdaptiveDifficulty: (difficulty) =>
    set({ adaptiveDifficulty: difficulty }),

  setWsUrl: (url) => set({ wsUrl: url }),

  setInterimTranscript: (text) => set({ interimTranscript: text }),

  appendFinalTranscript: (text) =>
    set((state) => ({
      finalTranscript: state.finalTranscript
        ? `${state.finalTranscript} ${text}`
        : text,
      interimTranscript: '',
    })),

  clearTranscripts: () => set({ interimTranscript: '', finalTranscript: '' }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  setCompleting: (isCompleting) => set({ isCompleting }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
