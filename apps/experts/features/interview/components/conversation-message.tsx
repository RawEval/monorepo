'use client';

interface ConversationMessageProps {
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

export function ConversationMessage({
  type,
  content,
  timestamp,
  metadata,
}: ConversationMessageProps) {
  return (
    <div
      className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          type === 'ai'
            ? 'bg-blue-50 border-l-4 border-blue-500'
            : 'bg-purple-50 border-l-4 border-purple-500'
        }`}
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          {type === 'ai' ? '🤖 AI Interviewer' : '👤 You'} • {timestamp}
        </div>
        <div className="text-base leading-relaxed text-foreground">
          {content}
        </div>
        {metadata && type === 'ai' && (
          <div className="mt-2 text-xs text-muted-foreground">
            {metadata.type && (
              <span className="mr-2">Type: {metadata.type}</span>
            )}
            {metadata.difficulty && (
              <span className="mr-2">Difficulty: {metadata.difficulty}</span>
            )}
            {metadata.model && (
              <span className="mr-2">Model: {metadata.model}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
