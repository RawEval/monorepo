'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';

interface InterviewSidebarProps {
  sessionId: number | null;
  status: string;
  totalQuestions: number;
  totalCost: number;
  currentScore: number | null;
  rubric: unknown;
  questionEvolution: Array<{
    turn: number;
    type: string;
    difficulty: string;
    question: string;
    model: string;
    provider: string;
    timestamp: string;
    answerScore?: number;
  }>;
  activityLogs: Array<{
    timestamp: string;
    message: string;
    type: string;
  }>;
  finalSummary?: {
    overall_score?: number;
    total_questions: number;
    total_cost_usd: number;
    status: string;
    overall_rubric?: unknown;
  };
  onComplete?: () => void;
}

export function InterviewSidebar({
  sessionId,
  status,
  totalQuestions,
  totalCost,
  currentScore,
  rubric,
  questionEvolution,
  activityLogs,
  finalSummary,
  onComplete,
}: InterviewSidebarProps) {
  const renderRubric = (rubricData: unknown) => {
    if (!rubricData) {
      return (
        <p className="text-center text-sm text-muted-foreground">
          No evaluation yet. Submit an answer to see rubric.
        </p>
      );
    }

    if (typeof rubricData === 'string') {
      try {
        rubricData = JSON.parse(rubricData);
      } catch {
        return (
          <div className="rounded-lg bg-white p-3">
            <div className="text-sm text-muted-foreground">{String(rubricData)}</div>
          </div>
        );
      }
    }

    if (typeof rubricData === 'object' && rubricData !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(rubricData).map(([key, value]) => (
            <div
              key={key}
              className="rounded-lg border-l-4 border-primary bg-white p-3"
            >
              <div className="mb-1 font-semibold text-foreground">{key}</div>
              <div className="text-sm text-muted-foreground">
                {typeof value === 'object'
                  ? JSON.stringify(value, null, 2)
                  : String(value)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full space-y-6 lg:w-96">
      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Session ID</span>
            <span className="font-mono font-semibold">
              {sessionId || '-'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Questions Asked</span>
            <span className="font-semibold">{totalQuestions}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Cost</span>
            <span className="font-mono font-semibold">
              ${totalCost.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
            <div
              className={`text-5xl font-bold ${
                currentScore !== null && currentScore >= 80
                  ? 'text-green-600'
                  : currentScore !== null && currentScore >= 60
                    ? 'text-yellow-600'
                    : currentScore !== null
                      ? 'text-red-600'
                      : 'text-muted-foreground'
              }`}
            >
              {currentScore !== null ? currentScore : '-'}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Overall Quality Score
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Rubric</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {renderRubric(rubric)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {questionEvolution.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                See how AI adapts questions based on your answers...
              </p>
            ) : (
              questionEvolution
                .slice()
                .reverse()
                .map((entry) => {
                  const scoreColor =
                    entry.answerScore !== undefined && entry.answerScore >= 80
                      ? 'text-green-600'
                      : entry.answerScore !== undefined &&
                          entry.answerScore >= 60
                        ? 'text-yellow-600'
                        : entry.answerScore !== undefined
                          ? 'text-red-600'
                          : 'text-muted-foreground';
                  return (
                    <div
                      key={entry.turn}
                      className="rounded-lg border-l-4 border-primary bg-white p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold text-primary">
                          Q{entry.turn}: {entry.type.toUpperCase()}
                        </span>
                        {entry.answerScore !== undefined ? (
                          <span className={`font-bold ${scoreColor}`}>
                            {entry.answerScore}/100
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </div>
                      <div className="mb-1 text-sm text-muted-foreground">
                        {entry.question.substring(0, 80)}
                        {entry.question.length > 80 ? '...' : ''}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Model: {entry.model} • {entry.timestamp}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 space-y-1 overflow-y-auto font-mono text-xs">
            {activityLogs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No activity yet.
              </p>
            ) : (
              activityLogs
                .slice(-20)
                .reverse()
                .map((log, idx) => {
                  const color =
                    log.type === 'success'
                      ? 'text-green-600'
                      : log.type === 'error'
                        ? 'text-red-600'
                        : 'text-blue-600';
                  return (
                    <div
                      key={idx}
                      className={`border-l-2 pl-2 ${color}`}
                    >
                      <span className="text-muted-foreground">
                        [{log.timestamp}]
                      </span>{' '}
                      {log.message}
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>

      {finalSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Final Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center">
              <div className="text-4xl font-bold text-primary">
                {finalSummary.overall_score || 'N/A'}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Overall Score
              </div>
            </div>
            <div className="space-y-2 rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Questions</span>
                <span className="font-semibold">
                  {finalSummary.total_questions}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Cost</span>
                <span className="font-mono font-semibold">
                  ${finalSummary.total_cost_usd.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="default">{finalSummary.status}</Badge>
              </div>
            </div>
            {(() => {
              const rubric = finalSummary.overall_rubric;
              if (rubric === undefined || rubric === null) return null;
              const rubricText = typeof rubric === 'string'
                ? rubric
                : JSON.stringify(rubric, null, 2);
              return (
                <div className="rounded-lg bg-muted p-3">
                  <div className="mb-2 font-semibold">Overall Rubric:</div>
                  <div className="text-sm text-muted-foreground">{rubricText}</div>
                </div>
              );
            })()}
            {onComplete && (
              <button
                onClick={onComplete}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
              >
                Complete Interview
              </button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
