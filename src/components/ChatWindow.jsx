import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({ messages, isStreaming }) {
  const bottomRef = useRef(null);
  const showTypingIndicator = isStreaming && messages.at(-1)?.content === '';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.map((msg) =>
        msg.content === '' && msg.role === 'assistant' ? null : (
          <MessageBubble key={msg.id} message={msg} />
        )
      )}
      {showTypingIndicator && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
