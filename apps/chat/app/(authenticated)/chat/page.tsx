'use client';

import { ChatInterface } from '@/features/chat/components/chat-interface';
import { ChatHeader } from '@/components/chat/chat-header';

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <ChatHeader />
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
