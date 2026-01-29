'use client';

import { Button } from '@raweval/ui/button';

interface InterviewControlsProps {
  questionType: string;
  difficulty: string;
  onQuestionTypeChange: (type: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onGenerateQuestion: () => void;
  isGenerating: boolean;
}

export function InterviewControls({
  questionType,
  difficulty,
  onQuestionTypeChange,
  onDifficultyChange,
  onGenerateQuestion,
  isGenerating,
}: InterviewControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={questionType}
          onChange={(e) => onQuestionTypeChange(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="conversation">Conversation</option>
          <option value="technical">Technical</option>
          <option value="coding">Coding</option>
          <option value="behavioral">Behavioral</option>
        </select>
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <Button
          onClick={onGenerateQuestion}
          disabled={isGenerating}
          variant="outline"
        >
          {isGenerating ? 'Generating...' : 'Ask Next Question'}
        </Button>
      </div>
    </div>
  );
}
