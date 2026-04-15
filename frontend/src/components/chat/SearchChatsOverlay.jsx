import { useEffect, useMemo, useState } from 'react';

function getSectionLabel(dateString) {
  if (!dateString) {
    return 'Older';
  }

  const now = new Date();
  const date = new Date(dateString);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((startOfToday - startOfTarget) / 86400000);

  if (diffDays <= 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays <= 7) {
    return 'Previous 7 Days';
  }

  return 'Older';
}

export function SearchChatsOverlay({ open, threads, onClose, onSelectThread }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const filteredThreads = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return threads;
    }

    return threads.filter((thread) => {
      const title = (thread.title || '').toLowerCase();
      const preview = (thread.lastAssistantPreview || '').toLowerCase();
      return title.includes(search) || preview.includes(search);
    });
  }, [query, threads]);

  const sections = useMemo(() => {
    const grouped = new Map();

    for (const thread of filteredThreads) {
      const label = getSectionLabel(thread.lastMessageAt);
      if (!grouped.has(label)) {
        grouped.set(label, []);
      }
      grouped.get(label).push(thread);
    }

    return ['Today', 'Yesterday', 'Previous 7 Days', 'Older']
      .filter((label) => grouped.has(label))
      .map((label) => ({
        label,
        items: grouped.get(label)
      }));
  }, [filteredThreads]);

  if (!open) {
    return null;
  }

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-50 flex items-start justify-center bg-black/8 px-4 py-8 md:px-8"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex h-[min(720px,calc(100vh-64px))] w-full max-w-[720px] flex-col overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-center gap-3 border-b border-black/8 px-5 py-4">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chats..."
            className="flex-1 border-0 bg-transparent text-[22px] font-normal text-black outline-none placeholder:text-black/35"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-black/35 transition hover:bg-black/5 hover:text-black/55"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {sections.length ? (
            <div className="space-y-7">
              {sections.map((section) => (
                <div key={section.label}>
                  <div className="mb-3 text-sm text-black/35">{section.label}</div>
                  <div className="space-y-1">
                    {section.items.map((thread) => (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => {
                          onSelectThread(thread.id);
                          onClose();
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-black/4"
                      >
                        <span className="flex h-5 w-5 items-center justify-center text-[15px] text-black">
                          ◌
                        </span>
                        <span className="truncate text-[15px] text-black">
                          {thread.title || 'New chat'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-10 text-center text-sm text-black/40">
              No chats found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
