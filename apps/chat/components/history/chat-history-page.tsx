'use client';

import { useState, useMemo } from 'react';
import { MessageSquare, Search, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Input } from '@/components/ui/input';
import { useProjectsStore } from '@/stores/projects-store';
import { useChatStore } from '@/stores/chat-store';

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ChatHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const projects = useProjectsStore((s) => s.projects);
  const getMessages = useChatStore((s) => s.getMessages);

  // Convert projects to history items
  const history = useMemo(() => {
    return projects.map((project) => {
      const messages = getMessages(project.id);
      const firstMessage = messages.find((m) => m.role === 'user');
      const preview = firstMessage?.content || project.description || 'No messages yet';
      
      return {
        id: project.id,
        title: project.title,
        preview: preview.length > 100 ? preview.substring(0, 100) + '...' : preview,
        timestamp: new Date(project.updatedAt),
        messageCount: messages.length,
      };
    });
  }, [projects, getMessages]);

  const filteredHistory = useMemo(() => {
    return history.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.preview.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Chat History</h1>
          <p className="text-muted-foreground">
            View and manage your previous conversations
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* History List */}
        <div className="space-y-2">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No results found' : 'No chat history yet'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {item.messageCount} messages
                    </span>
                  </div>
                  <p className="mb-2 line-clamp-1 text-sm text-muted-foreground">
                    {item.preview}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
