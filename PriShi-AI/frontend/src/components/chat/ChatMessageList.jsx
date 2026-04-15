import { useEffect, useRef } from 'react';

import { ChatMessage } from './ChatMessage.jsx';

export function ChatMessageList({ messages, loading }) {
  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm uppercase tracking-[0.3em] text-black/35">
        Loading history
      </div>
    );
  }

  if (!messages?.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-[700px] text-center">
          <h2 className="mb-10 text-[46px] font-medium tracking-[-0.03em] text-black">
            Where should we begin?
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-7 text-black/45">
            Switch providers manually or let the router choose the best one for coding,
            quick answers, or long-context work.
          </p>
          <div className="mt-16 text-xs text-black/40">
            By messaging PriShi-AI, you agree to our Terms and Privacy Policy.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 space-y-6 overflow-y-auto px-4 py-8 md:px-8">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}
