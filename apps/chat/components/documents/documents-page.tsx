'use client';

import { FileText, Plus, Search } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-background flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-2 text-3xl font-bold">
              Documents
            </h1>
            <p className="text-muted-foreground">
              Manage your uploaded documents
            </p>
          </div>
          <Button className="gap-2">
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

        <div className="border-border bg-muted/10 flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <FileText className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="text-foreground mb-1 text-lg font-semibold">
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
