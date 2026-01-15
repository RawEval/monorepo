 'use client';

import { useCallback } from 'react';
import { useProjectsStore } from '@/stores/projects-store';
import { useChatStore } from '@/stores/chat-store';

export function useChat() {
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const touchProject = useProjectsStore((s) => s.touchProject);

  // Use Zustand selectors properly to subscribe to state changes
  const projectId = selectedProjectId ?? 'p1';
  
  // Subscribe to messagesByProject to get reactive updates
  const messagesByProject = useChatStore((s) => s.messagesByProject);
  const typingByProject = useChatStore((s) => s.typingByProject);
  const sendUserMessage = useChatStore((s) => s.sendUserMessage);
  const appendAssistantMessage = useChatStore((s) => s.appendAssistantMessage);
  const setTyping = useChatStore((s) => s.setTyping);

  // Get messages for current project - this will react to changes
  const messages = (messagesByProject[projectId] ?? []).map((m) => ({
    ...m,
    createdAt: new Date(m.createdAt),
  }));
  const isTyping = Boolean(typingByProject[projectId]);

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      sendUserMessage(projectId, content, images);
      touchProject(projectId);
      setTyping(projectId, true);

      // Simulate AI response with typing delay (UI-only)
      setTimeout(() => {
        setTyping(projectId, false);
        appendAssistantMessage(
          projectId,
          generateMockResponse(content, images),
          Math.random() > 0.7
        );
        touchProject(projectId);
      }, 1500 + Math.random() * 1000);
    },
    [
      appendAssistantMessage,
      projectId,
      sendUserMessage,
      setTyping,
      touchProject,
    ]
  );

  const markAsWrong = useCallback((messageId: string) => {
    // TODO: Mark message as wrong and send to workbench for QA
    // This should:
    // 1. Store the marked response with status 'pending' in the payouts store
    // 2. Send to workbench queue for QA verification
    // 3. Show confirmation to user
    console.log('Marking message as wrong:', messageId);
    
    // Find the message
    const message = messages.find((m) => m.id === messageId);
    if (message && message.role === 'assistant') {
      // TODO: Save to payouts store with status 'pending'
      // TODO: Send to workbench QA queue
      alert('Response marked as wrong! It will be reviewed by our workbench team. You\'ll be notified when QA is complete.');
    }
  }, [messages]);

  const approveMessage = useCallback((messageId: string) => {
    console.log('Approving message:', messageId);
  }, []);

  const requestHuman = useCallback((messageId?: string) => {
    console.log('Requesting human assistance for message:', messageId);
  }, []);

  return { messages, isTyping, sendMessage, markAsWrong, approveMessage, requestHuman };
}

function generateMockResponse(content: string, images?: string[]): string {
  const lowerContent = content.toLowerCase();

  if (images && images.length > 0) {
    return `I can see you've shared ${images.length} image${images.length > 1 ? 's' : ''}. In a production environment, I would analyze the visual content and provide detailed insights. For now, this is a mock response demonstrating the multi-modal capabilities of the chat interface.

The image analysis would include:
- Object detection and recognition
- Text extraction (OCR)
- Scene understanding
- Color and composition analysis

What specific aspect of the image would you like me to focus on?`;
  }

  if (lowerContent.includes('code') || lowerContent.includes('programming')) {
    return `I'd be happy to help with your code! Here's a sample response:

\`\`\`typescript
function example() {
  return "This is a code example";
}
\`\`\`

In production, I would provide actual code assistance based on your specific question. You can flag this response if it's not helpful or approve it if it meets your needs.`;
  }

  if (lowerContent.includes('quantum')) {
    return `Quantum computing is a fascinating field! Here's a brief overview:

**Key Concepts:**
- Qubits can exist in superposition (0 and 1 simultaneously)
- Entanglement allows qubits to be correlated
- Quantum gates manipulate qubit states
- Quantum algorithms can solve certain problems exponentially faster

Would you like me to dive deeper into any specific aspect of quantum computing?`;
  }

  return `I understand you're asking about "${content}". In a production environment, I would provide a comprehensive, expert-verified response to your question.

This is a demonstration of the chat interface. You can:
- Upload images for visual analysis
- Ask coding questions
- Request explanations on various topics
- Flag responses that need improvement
- Approve helpful responses

How can I assist you further?`;
}
