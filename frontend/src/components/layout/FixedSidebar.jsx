import { formatRelativeTime } from '../../lib/format.js';
import { ProfileSidebarFooter } from './ProfileSidebarFooter.jsx';

function Icon({ children }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center text-[14px] leading-none text-black">
      {children}
    </span>
  );
}

export function FixedSidebar({
  threads,
  activeThreadId,
  onNewChat,
  onSearchChats,
  onSelectThread,
  loading
}) {
  return (
    <aside className="flex h-screen w-full flex-col border-r border-black/10 bg-[#f7f7f8] md:w-[260px]">
      <div className="shrink-0 border-b border-black/6 px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-black"
          >
            ◎
          </button>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xs text-black/45 transition hover:bg-black/5"
          >
            ▼
          </button>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-black transition hover:bg-black/5"
          >
            <Icon>✎</Icon>
            <span>New chat</span>
          </button>
        </div>

        <div className="mt-2 space-y-1">
          <button
            type="button"
            onClick={onSearchChats}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-black transition hover:bg-black/5"
          >
            <Icon>⌕</Icon>
            <span>Search chats</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-black transition hover:bg-black/5"
          >
            <Icon>◫</Icon>
            <span>Images</span>
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="px-3 pb-2 text-xs font-medium uppercase tracking-[0.14em] text-black/35">
          Recents
        </div>
        {loading ? (
          <div className="p-3 text-xs uppercase tracking-[0.2em] text-black/40">Loading</div>
        ) : (
          <div className="space-y-2">
            {!threads.length ? (
              <div className="rounded-2xl px-3 py-4 text-sm text-black/40">
                Your recent chats will appear here.
              </div>
            ) : null}
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

      <div className="mt-auto shrink-0 border-t border-black/10 p-3">
        <div className="space-y-1">
          {['See plans and pricing', 'Settings', 'Help'].map((label) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-black transition hover:bg-black/5"
            >
              <Icon>◌</Icon>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-2 rounded-[24px] border border-black/10 bg-white p-3">
          <div className="text-[13px] font-semibold leading-5 text-black">
            Get responses tailored to you
          </div>
          <p className="mt-2 text-[12px] leading-6 text-black/55">
            Log in to get answers based on saved chats, plus create images and upload files.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Log in
          </button>
        </div>
      </div>
    </aside>
  );
}
