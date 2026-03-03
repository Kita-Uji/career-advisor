import { useState, useCallback } from 'react';
import { streamMessage } from '../services/claudeApi';

const GREETING = "Hi! I'm your career advisor. What's on your mind? Where are you hoping to go with your career?";

function makeId() {
  return Math.random().toString(36).slice(2);
}

export function useChat() {
  const [messages, setMessages] = useState([
    { id: makeId(), role: 'assistant', content: GREETING },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    (text) => {
      if (isStreaming || !text.trim()) return;

      setError(null);

      const userMsg = { id: makeId(), role: 'user', content: text };
      const assistantId = makeId();
      const assistantPlaceholder = { id: assistantId, role: 'assistant', content: '' };

      setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
      setIsStreaming(true);

      // Build API messages array (strip internal id field)
      const apiMessages = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

      streamMessage(
        apiMessages,
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        },
        () => {
          setIsStreaming(false);
        },
        (err) => {
          setIsStreaming(false);
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setError(err.message || 'Something went wrong. Please try again.');
        }
      );
    },
    [messages, isStreaming]
  );

  return { messages, isStreaming, error, sendMessage };
}
