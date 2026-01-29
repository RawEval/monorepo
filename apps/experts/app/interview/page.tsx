'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@raweval/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { interviewService } from '@/services/interview-service';
import { usersService } from '@/services/users-service';
import { ConversationMessage } from '@/features/interview/components/conversation-message';
import { InterviewSidebar } from '@/features/interview/components/interview-sidebar';
import { InterviewControls } from '@/features/interview/components/interview-controls';

interface Message {
  type: 'ai' | 'user';
  content: string;
  timestamp: string;
  metadata?: {
    type?: string;
    difficulty?: string;
    model?: string;
    provider?: string;
  };
}

interface QuestionEvolution {
  turn: number;
  type: string;
  difficulty: string;
  question: string;
  model: string;
  provider: string;
  timestamp: string;
  answerScore?: number;
}

interface ActivityLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function InterviewPage() {
  const [resumeText, setResumeText] = useState('');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentTranscriptId, setCurrentTranscriptId] = useState<number | null>(
    null,
  );
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [answerText, setAnswerText] = useState('');
  const [questionType, setQuestionType] = useState('conversation');
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [rubric, setRubric] = useState<unknown>(null);
  const [questionEvolution, setQuestionEvolution] = useState<
    QuestionEvolution[]
  >([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [sessionStatus, setSessionStatus] = useState('Not Started');
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [finalSummary, setFinalSummary] = useState<{
    overall_score?: number;
    total_questions: number;
    total_cost_usd: number;
    status: string;
    overall_rubric?: unknown;
  } | null>(null);

  const addActivityLog = useCallback(
    (message: string, type: 'info' | 'success' | 'error' = 'info') => {
      const timestamp = new Date().toLocaleTimeString();
      setActivityLogs((prev) => [...prev, { timestamp, message, type }]);
    },
    [],
  );

  const loadSessionFromStorage = useCallback(() => {
    const saved = localStorage.getItem('interviewSession');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.sessionId) setSessionId(data.sessionId);
        if (data.messages) setMessages(data.messages);
        if (data.resumeUploaded) setResumeUploaded(data.resumeUploaded);
        if (data.questionEvolution)
          setQuestionEvolution(data.questionEvolution);
        if (data.activityLogs) setActivityLogs(data.activityLogs);
        if (data.currentScore !== undefined)
          setCurrentScore(data.currentScore);
        if (data.rubric) setRubric(data.rubric);
        if (data.interviewStarted) setInterviewStarted(data.interviewStarted);
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    }
  }, []);

  const saveSessionToStorage = useCallback(() => {
    localStorage.setItem(
      'interviewSession',
      JSON.stringify({
        sessionId,
        messages,
        resumeUploaded,
        questionEvolution,
        activityLogs,
        currentScore,
        rubric,
        interviewStarted,
      }),
    );
  }, [
    sessionId,
    messages,
    resumeUploaded,
    questionEvolution,
    activityLogs,
    currentScore,
    rubric,
    interviewStarted,
  ]);

  useEffect(() => {
    loadSessionFromStorage();
  }, [loadSessionFromStorage]);

  useEffect(() => {
    saveSessionToStorage();
  }, [saveSessionToStorage]);

  useEffect(() => {
    if (sessionId && interviewStarted) {
      const interval = setInterval(async () => {
        try {
          const session = await interviewService.getSession(sessionId);
          setTotalQuestions(session.total_questions);
          setTotalCost(session.total_cost_usd);
          setSessionStatus(session.status);
          if (session.overall_score !== undefined) {
            setCurrentScore(session.overall_score);
          }
        } catch (error) {
          console.error('Error updating session info:', error);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [sessionId, interviewStarted]);

  const handleUploadResume = async () => {
    if (!resumeText.trim() || resumeText.length < 50) {
      addActivityLog('Please enter a valid resume (at least 50 characters)', 'error');
      return;
    }

    setIsUploading(true);
    addActivityLog('Uploading resume...', 'info');

    try {
      await usersService.updateProfile({
        professional_background: resumeText,
      });
      setResumeUploaded(true);
      addActivityLog('Resume uploaded successfully', 'success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to upload resume';
      addActivityLog(`Resume upload error: ${errorMsg}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!resumeUploaded) {
      addActivityLog('Please upload your resume first', 'error');
      return;
    }

    addActivityLog('Creating interview session...', 'info');

    try {
      const session = await interviewService.createSession({});
      setSessionId(session.session_id);
      setInterviewStarted(true);
      setSessionStatus('In Progress');
      addActivityLog(`Interview session created: ${session.session_id}`, 'success');
      await handleGenerateQuestion();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to start interview';
      addActivityLog(`Error starting interview: ${errorMsg}`, 'error');
    }
  };

  const handleGenerateQuestion = async () => {
    if (!sessionId) {
      await handleStartInterview();
      return;
    }

    setIsGenerating(true);
    addActivityLog(
      `Generating ${questionType} question (${difficulty})...`,
      'info',
    );

    try {
      const result = await interviewService.generateQuestion(
        sessionId,
        questionType,
        difficulty,
      );
      setCurrentTranscriptId(result.transcript_id);

      const evolutionEntry: QuestionEvolution = {
        turn: result.turn_number,
        type: questionType,
        difficulty,
        question: result.question,
        model: result.model_used,
        provider: result.provider,
        timestamp: new Date().toLocaleTimeString(),
      };
      setQuestionEvolution((prev) => [...prev, evolutionEntry]);

      const questionMsg: Message = {
        type: 'ai',
        content: result.question,
        timestamp: new Date().toLocaleTimeString(),
        metadata: {
          type: questionType,
          difficulty,
          model: result.model_used,
          provider: result.provider,
        },
      };
      setMessages((prev) => [...prev, questionMsg]);
      addActivityLog(
        `Question generated: ${questionType} (${result.model_used})`,
        'success',
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to generate question';
      addActivityLog(`Error generating question: ${errorMsg}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentTranscriptId || !sessionId) {
      addActivityLog('Please wait for a question first', 'error');
      return;
    }

    if (!answerText.trim()) {
      addActivityLog('Please enter an answer', 'error');
      return;
    }

    setIsSubmitting(true);
    addActivityLog('Submitting answer...', 'info');

    try {
      const result = await interviewService.submitAnswer(
        sessionId,
        currentTranscriptId,
        answerText,
        true,
      );

      const answerMsg: Message = {
        type: 'user',
        content: answerText,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, answerMsg]);

      if (result.evaluation) {
        setRubric(result.evaluation.rubric);
        setCurrentScore(result.evaluation.quality_score);
        setQuestionEvolution((prev) => {
          const updated = [...prev];
          const lastItem = updated[updated.length - 1];
          if (lastItem) {
            lastItem.answerScore = result.evaluation!.quality_score;
          }
          return updated;
        });
        addActivityLog(
          `Answer evaluated: Score ${result.evaluation.quality_score}/100`,
          'success',
        );
      }

      setAnswerText('');
      setCurrentTranscriptId(null);
      addActivityLog('Answer submitted successfully', 'success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to submit answer';
      addActivityLog(`Error submitting answer: ${errorMsg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (!sessionId) {
      addActivityLog('No active session', 'error');
      return;
    }

    if (!confirm('Complete interview session? This will generate final scores and rubric.')) {
      return;
    }

    addActivityLog('Completing interview session...', 'info');

    try {
      const result = await interviewService.completeSession(sessionId);
      setFinalSummary({
        overall_score: result.overall_score,
        total_questions: result.total_questions,
        total_cost_usd: result.total_cost_usd,
        status: result.status,
        overall_rubric: result.overall_rubric,
      });
      setSessionStatus('Completed');
      if (result.overall_score !== undefined) {
        setCurrentScore(result.overall_score);
      }
      addActivityLog('Interview completed successfully!', 'success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to complete interview';
      addActivityLog(`Error completing interview: ${errorMsg}`, 'error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-foreground">Real-Time Interview</h1>
          <p className="mt-2 text-muted-foreground">
            Interactive AI-Powered Interview Session
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-6">
            {!resumeUploaded && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Resume</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Please upload your resume or professional background to start
                    the interview.
                  </p>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume or professional background here..."
                    className="min-h-[200px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button
                    onClick={handleUploadResume}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Resume & Continue'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {resumeUploaded && !interviewStarted && (
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to Interview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    You are now in a real-time interview session with our AI
                    interviewer.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click &quot;Start Interview&quot; to begin!
                  </p>
                  <Button onClick={handleStartInterview} className="w-full">
                    Start Interview
                  </Button>
                </CardContent>
              </Card>
            )}

            {interviewStarted && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Conversation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[500px] space-y-4 overflow-y-auto">
                      {messages.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                          No messages yet. Generate a question to start.
                        </p>
                      ) : (
                        messages.map((msg, idx) => (
                          <ConversationMessage key={idx} {...msg} />
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <InterviewControls
                  questionType={questionType}
                  difficulty={difficulty}
                  onQuestionTypeChange={setQuestionType}
                  onDifficultyChange={setDifficulty}
                  onGenerateQuestion={handleGenerateQuestion}
                  isGenerating={isGenerating}
                />

                <Card>
                  <CardHeader>
                    <CardTitle>Your Answer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your answer here..."
                      className="min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!currentTranscriptId || isSubmitting}
                    />
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!currentTranscriptId || !answerText.trim() || isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <InterviewSidebar
            sessionId={sessionId}
            status={sessionStatus}
            totalQuestions={totalQuestions}
            totalCost={totalCost}
            currentScore={currentScore}
            rubric={rubric}
            questionEvolution={questionEvolution}
            activityLogs={activityLogs}
            finalSummary={finalSummary || undefined}
            onComplete={
              interviewStarted && sessionStatus !== 'completed'
                ? handleCompleteInterview
                : undefined
            }
          />
        </div>
      </div>
    </main>
  );
}
