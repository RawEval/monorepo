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
    description:
      'Elevate your writing with tools designed for seamless creation, and sophisticated style refinement.',
    Icon: PenLine,
  },
  {
    title: 'Research & Analysis',
    prompt: 'Analyze the latest trends in artificial intelligence.',
    description:
      'Discover, analyze, interpret, and present information with clarity and impact.',
    Icon: Lightbulb,
  },
  {
    title: 'Programming',
    prompt: 'Help me debug this JavaScript code.',
    description:
      'Develop robust code, debug effectively, test thoroughly, and expand your expertise.',
    Icon: Code2,
  },
  {
    title: 'Learning Skills',
    prompt: 'Teach me about quantum computing fundamentals.',
    description:
      'Embark on a journey of innovation, exploring new ideas and evolving your existing skills.',
    Icon: GraduationCap,
  },
];

interface EmptyStateProps {
  onSuggestionClick: (prompt: string) => void;
  mounted?: boolean;
}

export function EmptyState({
  onSuggestionClick,
  mounted = true,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12',
        mounted ? 'animate-fade-in-up' : 'opacity-0'
      )}
    >
      {/* Welcome Message */}
      <div className="mb-6 px-2 text-center sm:mb-8">
        <div className="bg-primary/10 mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl sm:mb-4 sm:h-14 sm:w-14">
          <Wand2 className="text-primary h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <p className="text-muted-foreground mb-2 text-xs sm:text-sm">
          Welcome to RawEval
        </p>
        <h1 className="text-foreground text-xl font-bold sm:text-2xl">
          Ask me anything—I&apos;m here to help!
        </h1>
      </div>

      {/* Explore by Ready Prompt Section */}
      <div className="w-full max-w-4xl px-2 sm:px-0">
        <p className="text-muted-foreground mb-3 text-center text-xs sm:mb-4 sm:text-sm">
          Explore by ready prompt
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
          {suggestions.map((suggestion, idx) => (
            <Card
              key={idx}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="group border-border bg-card hover:border-primary/50 card-hover cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4">
                <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10">
                  <suggestion.Icon className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground mb-1 text-sm font-semibold sm:text-base">
                    {suggestion.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
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
