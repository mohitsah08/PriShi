import { useMemo } from 'react';

import { useAuthStore } from '../../store/authStore.js';

function getInitials(name) {
  if (!name) {
    return 'G';
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function MobileSidebar({
  open,
  threads,
  onClose,
  onNewChat,
  onSearchChats,
  onSelectThread
}) {
  const user = useAuthStore((state) => state.user);

  const profile = useMemo(
    () => ({
      name: user?.name || 'Guest',
      initials: getInitials(user?.name || 'Guest')
    }),
    [user]
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black md:hidden" onClick={onClose}>
      <div
        className="absolute inset-0 flex h-full w-full flex-col overflow-hidden bg-[#111111] text-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 px-4 pb-4 pt-6">
          <div className="flex items-center justify-between">
            <div className="text-[31px] font-semibold tracking-[-0.04em] text-white">PriShi</div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onSearchChats}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#232323] text-[18px]"
              >
                ⌕
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#232323] text-[14px] font-semibold"
              >
                {profile.initials}
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="flex w-[88px] flex-col items-center rounded-[24px] bg-[#1d1d1d] px-3 py-4"
            >
              <span className="text-[20px]">▣</span>
              <span className="mt-2 text-xs text-white/75">Images</span>
            </button>
            <button
              type="button"
              className="flex w-[88px] flex-col items-center rounded-[24px] bg-[#1d1d1d] px-3 py-4"
            >
              <span className="text-[20px]">◍</span>
              <span className="mt-2 text-xs text-white/75">Apps</span>
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-white/8 px-4 pb-28 pt-4">
          <div className="text-sm font-medium text-white/85">Projects</div>
          <div className="mt-3 space-y-4 text-[16px] text-white/92">
            {['New project', 'AI tools aggregate', 'PriShi-AI'].map((item) => (
              <button
                key={item}
                type="button"
                className="flex w-full items-center gap-3 text-left"
              >
                <span className="text-lg">▢</span>
                <span>{item}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 text-sm font-medium text-white/85">Recents</div>
          <div className="mt-4 space-y-5">
            {threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => {
                  onSelectThread(thread.id);
                  onClose();
                }}
                className="block w-full text-left text-[16px] text-white/95"
              >
                <span className="block truncate">{thread.title || 'New chat'}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="absolute bottom-6 right-4 flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black shadow-[0_12px_28px_rgba(0,0,0,0.3)]"
        >
          <span className="text-base">✎</span>
          <span>Chat</span>
        </button>
      </div>
    </div>
  );
}
