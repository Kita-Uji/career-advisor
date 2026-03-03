export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%] whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <div className="bg-indigo-50 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%] shadow-sm whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
        {message.content}
      </div>
    </div>
  );
}
