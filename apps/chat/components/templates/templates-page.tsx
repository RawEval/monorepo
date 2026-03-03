'use client';

import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-background flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Browse and use pre-built chat templates
          </p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-background h-10 pl-9 shadow-xs"
            />
          </div>
        </div>

        <div className="border-border bg-muted/10 flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <FileText className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="text-foreground mb-1 text-lg font-semibold">
            Templates Coming Soon
          </h3>
          <p className="text-muted-foreground max-w-sm text-sm">
            We are working on bringing you a library of powerful, pre-built chat
            templates to streamline your workflows.
          </p>
        </div>
      </div>
    </div>
  );
}
