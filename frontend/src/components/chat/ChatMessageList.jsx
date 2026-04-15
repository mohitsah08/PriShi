import { useEffect, useRef } from 'react';

import { ChatMessage } from './ChatMessage.jsx';
import { useThemeStore } from '../../store/themeStore.js';

export function ChatMessageList({ messages, loading, onEditMessage }) {
  const containerRef = useRef(null);
  const theme = useThemeStore((state) => state.theme);
  const dark = theme === 'dark';

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
        <div className="w-full max-w-[760px] -translate-y-10 text-center">
          <h2 className={`mb-12 text-[34px] font-medium tracking-[-0.03em] md:text-[42px] ${dark ? 'text-white' : 'text-black'}`}>
            What's on your mind today?
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 space-y-6 overflow-y-auto px-4 py-8 md:px-8">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} onEdit={onEditMessage} />
      ))}
    </div>
  );
}
