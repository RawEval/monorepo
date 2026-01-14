'use client';

import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <span className="text-lg font-semibold">RawEval Chat</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Live
          </Badge>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            Become an Expert
          </Button>
          <Button size="sm">Sign In</Button>
        </nav>
      </div>
    </header>
  );
}
