'use client';

import { PenLine, Lightbulb, Code2, GraduationCap, Wand2 } from 'lucide-react';
import { Card } from '@raweval/ui/card';
import { cn } from '@raweval/utils';

interface Suggestion {
  title: string;
  prompt: string;
  description: string;
  Icon: typeof PenLine;
}

const suggestions: Suggestion[] = [
  {
    title: 'Writing',
    prompt: 'Help me write a professional email to a client.',
    description: 'Elevate your writing with tools designed for seamless creation, and sophisticated style refinement.',
    Icon: PenLine,
  },
  {
    title: 'Research & Analysis',
    prompt: 'Analyze the latest trends in artificial intelligence.',
    description: 'Discover, analyze, interpret, and present information with clarity and impact.',
    Icon: Lightbulb,
  },
  {
    title: 'Programming',
    prompt: 'Help me debug this JavaScript code.',
    description: 'Develop robust code, debug effectively, test thoroughly, and expand your expertise.',
    Icon: Code2,
  },
  {
    title: 'Learning Skills',
    prompt: 'Teach me about quantum computing fundamentals.',
    description: 'Embark on a journey of innovation, exploring new ideas and evolving your existing skills.',
    Icon: GraduationCap,
  },
];

interface EmptyStateProps {
  onSuggestionClick: (prompt: string) => void;
  mounted?: boolean;
}

export function EmptyState({ onSuggestionClick, mounted = true }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12',
        mounted ? 'animate-fade-in-up' : 'opacity-0'
      )}
    >
      {/* Welcome Message */}
      <div className="mb-6 sm:mb-8 text-center px-2">
        <div className="mb-3 sm:mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Wand2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
        </div>
        <p className="mb-2 text-xs sm:text-sm text-muted-foreground">Welcome to RawEval</p>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Ask me anything—I&apos;m here to help!
        </h1>
      </div>

      {/* Explore by Ready Prompt Section */}
      <div className="w-full max-w-4xl px-2 sm:px-0">
        <p className="mb-3 sm:mb-4 text-center text-xs sm:text-sm text-muted-foreground">
          Explore by ready prompt
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2">
          {suggestions.map((suggestion, idx) => (
            <Card
              key={idx}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="group cursor-pointer border-border bg-card transition-all hover:border-primary/50 hover:shadow-md card-hover"
            >
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <suggestion.Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="mb-1 text-sm sm:text-base font-semibold text-foreground">
                    {suggestion.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
