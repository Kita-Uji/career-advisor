import { useChat } from './hooks/useChat';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

export default function App() {
  const { messages, isStreaming, error, sendMessage } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
          CA
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Career Advisor</h1>
          <p className="text-xs text-gray-500">Powered by Claude</p>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700 flex-shrink-0">
          {error}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden max-w-3xl mx-auto w-full">
        <ChatWindow messages={messages} isStreaming={isStreaming} />
        <ChatInput onSend={sendMessage} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
