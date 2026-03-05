'use client';

import { FileText, Plus, Search } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-background flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-foreground mb-1 text-2xl font-bold sm:mb-2 sm:text-3xl">
              Documents
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your uploaded documents
            </p>
          </div>
          <Button className="w-full gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-background h-10 pl-9 shadow-xs"
            />
          </div>
        </div>

        <div className="border-border bg-muted/10 flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-16 text-center sm:py-20">
          <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16">
            <FileText className="text-muted-foreground h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <h3 className="text-foreground mb-1 text-base font-semibold sm:text-lg">
            No documents uploaded yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-sm">
            Upload PDFs, Word documents, or text files to use them as reference
            materials in your chats.
          </p>
          <Button variant="outline" className="bg-background gap-2">
            <Plus className="h-4 w-4" />
            Upload Your First Document
          </Button>
        </div>
      </div>
    </div>
  );
}
