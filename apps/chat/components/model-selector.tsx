'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@raweval/utils';

export type ModelType = 'gpt-4' | 'gpt-3.5' | 'claude-3' | 'claude-sonnet' | 'gemini-flash' | 'gemini-pro' | 'grok' | 'llama-3';

interface Model {
  id: ModelType;
  name: string;
  provider: string;
  description?: string;
}

const models: Model[] = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', description: 'Most capable model' },
  { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', provider: 'OpenAI', description: 'Fast and efficient' },
  { id: 'claude-3', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Advanced reasoning' },
  { id: 'claude-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', description: 'Balanced performance' },
  { id: 'gemini-flash', name: 'Gemini Flash', provider: 'Google', description: 'Fast responses' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'High quality' },
  { id: 'grok', name: 'Grok', provider: 'xAI', description: 'Real-time knowledge' },
  { id: 'llama-3', name: 'Llama 3', provider: 'Meta', description: 'Open source' },
];

interface ModelSelectorProps {
  selectedModel?: ModelType;
  onModelChange?: (model: ModelType) => void;
  className?: string;
}

export function ModelSelector({
  selectedModel = 'gpt-4',
  onModelChange,
  className,
}: ModelSelectorProps) {
  const [currentModel, setCurrentModel] = useState<ModelType>(selectedModel);

  useEffect(() => {
    setCurrentModel(selectedModel);
  }, [selectedModel]);

  const selectedModelData = models.find((m) => m.id === currentModel) ?? models[0]!;

  const handleModelChange = (model: ModelType) => {
    setCurrentModel(model);
    onModelChange?.(model);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-2 rounded-lg border-0 bg-transparent px-2 py-1.5 text-sm font-medium text-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0',
          className
        )}
      >
        <span className="text-sm truncate font-medium">{selectedModelData?.name ?? 'GPT-4'}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => handleModelChange(model.id)}
              className={cn(
                'flex flex-col items-start gap-0.5 py-2',
                currentModel === model.id && 'bg-accent text-accent-foreground'
              )}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{model.name}</span>
              {currentModel === model.id && (
                <span className="text-xs text-muted-foreground">•</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{model.provider}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
