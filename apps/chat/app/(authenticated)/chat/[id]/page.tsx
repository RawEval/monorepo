'use client';

import { use } from 'react';
import { ChatInterface } from '@/features/chat/components/chat-interface';

export default function ChatSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return <ChatInterface id={resolvedParams.id} />;
}
