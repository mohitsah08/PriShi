import { MarkdownRenderer } from '../common/MarkdownRenderer.jsx';

export function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl rounded-3xl border px-5 py-4 ${
          isUser
            ? 'border-black/10 bg-[#f3f3f3] text-black'
            : 'border-black/8 bg-white text-black'
        }`}
      >
        <div className="mb-3 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.25em] text-black/45">
          <span>{isUser ? 'You' : message.provider || 'Assistant'}</span>
          {!isUser && message.model ? <span className="opacity-60">{message.model}</span> : null}
        </div>
        <MarkdownRenderer content={message.content} streaming={message.status === 'streaming'} />
      </div>
    </div>
  );
}
