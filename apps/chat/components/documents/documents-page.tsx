'use client';

import { FileText, Plus, Search } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Documents</h1>
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="py-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No documents yet</p>
        </div>
      </div>
    </div>
  );
}
