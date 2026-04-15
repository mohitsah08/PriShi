import { formatRelativeTime } from '../../lib/format.js';

export function Sidebar({
  threads,
  activeThreadId,
  onNewChat,
  onSelectThread,
  loading
}) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-black/10 bg-[#f7f7f8] md:w-[260px]">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="text-lg font-semibold text-black">◎</div>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-sm text-black/50 hover:bg-black/5"
        >
          ⌄
        </button>
      </div>
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-black transition hover:bg-black/5"
        >
          <span className="text-base">✎</span>
          <span>New chat</span>
        </button>
      </div>
      <div className="space-y-1 px-3 pb-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-black transition hover:bg-black/5"
        >
          <span>⌕</span>
          <span>Search chats</span>
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-black transition hover:bg-black/5"
        >
          <span>◫</span>
          <span>Images</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        {loading ? (
          <div className="p-3 text-xs uppercase tracking-[0.2em] text-black/40">Loading</div>
        ) : (
          <div className="space-y-2">
            {threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelectThread(thread.id)}
                className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                  activeThreadId === thread.id
                    ? 'bg-black/10 text-black'
                    : 'text-black/80 hover:bg-black/5'
                }`}
              >
                <div className="truncate text-sm font-medium">
                  {thread.title || 'New chat'}
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-[0.68rem] uppercase tracking-[0.15em] text-black/40">
                  <span>{thread.resolvedProvider || thread.provider}</span>
                  <span>{formatRelativeTime(thread.lastMessageAt)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-black/10 p-3">
        <div className="space-y-1">
          {['See plans and pricing', 'Settings', 'Help'].map((label) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-black transition hover:bg-black/5"
            >
              <span>◌</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-2xl border border-black/10 bg-white p-4">
          <div className="text-sm font-semibold text-black">Get responses tailored to you</div>
          <p className="mt-3 text-sm leading-6 text-black/55">
            Log in to get answers based on saved chats, plus create images and upload files.
          </p>
          <button
            type="button"
            className="mt-4 w-full rounded-full border border-black/15 bg-white px-4 py-2.5 text-sm font-medium text-black"
          >
            Log in
          </button>
        </div>
      </div>
    </aside>
  );
}
