'use client';

import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground">
            Browse and use pre-built chat templates
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="py-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Templates coming soon</p>
        </div>
      </div>
    </div>
  );
}
