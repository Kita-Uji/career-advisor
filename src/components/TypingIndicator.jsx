export default function TypingIndicator() {
  return (
    <div className="mb-3">
      <div className="bg-indigo-50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1 items-center w-fit">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
      </div>
    </div>
  );
}
