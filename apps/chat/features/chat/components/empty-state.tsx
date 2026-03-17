'use client';

import { PenLine, Lightbulb, Code2, GraduationCap, Sparkles } from 'lucide-react';
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
    description: 'Craft emails, essays, reports, and creative content with clarity and style.',
    Icon: PenLine,
  },
  {
    title: 'Research & Analysis',
    prompt: 'Analyze the latest trends in artificial intelligence.',
    description: 'Discover insights, analyze data, and synthesize information from complex topics.',
    Icon: Lightbulb,
  },
  {
    title: 'Programming',
    prompt: 'Help me debug this JavaScript code.',
    description: 'Write, debug, and optimize code across any language or framework.',
    Icon: Code2,
  },
  {
    title: 'Learning',
    prompt: 'Teach me about quantum computing fundamentals.',
    description: 'Explore new concepts with clear explanations tailored to your level.',
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
        'flex min-h-[60vh] flex-col items-center justify-center py-8 sm:min-h-0 sm:py-16',
        mounted ? 'animate-fade-in-up' : 'opacity-0'
      )}
    >
      {/* Welcome Message */}
      <div className="mb-8 px-4 text-center sm:mb-10 sm:px-2">
        <div className="bg-gradient-to-br from-primary/15 to-primary/5 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-primary/10 sm:h-16 sm:w-16">
          <Sparkles className="text-primary h-7 w-7 sm:h-8 sm:w-8" />
        </div>
        <h1 className="text-foreground mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
          What can I help with?
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Ask anything or pick a suggestion below
        </p>
      </div>

      {/* Suggestion Cards */}
      <div className="w-full max-w-3xl px-2 sm:px-0">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="group border-border bg-card hover:border-primary/40 flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] sm:gap-3 sm:p-4"
            >
              <div className="bg-muted group-hover:bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg transition-colors sm:h-10 sm:w-10">
                <suggestion.Icon className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-foreground mb-0.5 text-sm font-semibold sm:text-base">
                  {suggestion.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed sm:text-sm">
                  {suggestion.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
