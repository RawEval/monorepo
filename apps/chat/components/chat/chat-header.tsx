'use client';

import { Zap, HelpCircle, Gift, Bot } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { useUiStore } from '@/stores/ui-store';

export function ChatHeader() {
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-lg font-semibold text-foreground">AI Chat</h1>
      <div className="flex items-center gap-2">
        <Button
          onClick={openUpgradeModal}
          className="h-9 gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          <Zap className="h-4 w-4" />
          Upgrade
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Gift className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bot className="h-4 w-4" />
          </Button>
          <div className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[var(--color-success)]" />
        </div>
      </div>
    </header>
  );
}
