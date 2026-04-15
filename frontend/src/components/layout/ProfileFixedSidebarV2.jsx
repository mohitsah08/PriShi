import { formatRelativeTime } from '../../lib/format.js';
import { useThemeStore } from '../../store/themeStore.js';
import { ProfileSidebarFooterV3 } from './ProfileSidebarFooterV3.jsx';

function Icon({ children }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center text-[14px] leading-none">
      {children}
    </span>
  );
}

export function ProfileFixedSidebarV2({
  threads,
  activeThreadId,
  onNewChat,
  onSearchChats,
  onSelectThread,
  loading,
  onCollapseSidebar
}) {
  const theme = useThemeStore((state) => state.theme);
  const dark = theme === 'dark';

  return (
    <aside
      className={`flex h-screen w-full flex-col md:w-[260px] ${
        dark ? 'border-r border-white/10 bg-[#171717] text-white' : 'border-r border-black/10 bg-[#f7f7f8] text-black'
      }`}
    >
      <div className={`shrink-0 px-4 pb-3 pt-4 ${dark ? 'border-b border-white/8' : 'border-b border-black/6'}`}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg"
          >
            ◎
          </button>
          <button
            type="button"
            onClick={onCollapseSidebar}
            className={`rounded-md px-2 py-1 text-xs transition ${dark ? 'text-white/45 hover:bg-white/6' : 'text-black/45 hover:bg-black/5'}`}
            title="Hide sidebar"
          >
            ◫
          </button>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={onNewChat}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${dark ? 'hover:bg-white/6' : 'hover:bg-black/5'}`}
          >
            <Icon>✎</Icon>
            <span>New chat</span>
          </button>
        </div>

        <div className="mt-2 space-y-1">
          <button
            type="button"
            onClick={onSearchChats}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${dark ? 'hover:bg-white/6' : 'hover:bg-black/5'}`}
          >
            <Icon>⌕</Icon>
            <span>Search chats</span>
          </button>
          <button
            type="button"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${dark ? 'hover:bg-white/6' : 'hover:bg-black/5'}`}
          >
            <Icon>◫</Icon>
            <span>Images</span>
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className={`px-3 pb-2 text-xs font-medium uppercase tracking-[0.14em] ${dark ? 'text-white/35' : 'text-black/35'}`}>
          Recents
        </div>

        {loading ? (
          <div className={`p-3 text-xs uppercase tracking-[0.2em] ${dark ? 'text-white/40' : 'text-black/40'}`}>
            Loading
          </div>
        ) : (
          <div className="space-y-2">
            {!threads.length ? (
              <div className={`rounded-2xl px-3 py-4 text-sm ${dark ? 'text-white/40' : 'text-black/40'}`}>
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
                    ? dark
                      ? 'bg-white/10 text-white'
                      : 'bg-black/10 text-black'
                    : dark
                      ? 'text-white/80 hover:bg-white/6'
                      : 'text-black/80 hover:bg-black/5'
                }`}
              >
                <div className="truncate text-sm font-medium">{thread.title || 'New chat'}</div>
                <div className={`mt-1 flex items-center justify-between gap-2 text-[0.68rem] uppercase tracking-[0.15em] ${dark ? 'text-white/40' : 'text-black/40'}`}>
                  <span>{thread.resolvedProvider || thread.provider}</span>
                  <span>{formatRelativeTime(thread.lastMessageAt)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`mt-auto shrink-0 p-3 ${dark ? 'border-t border-white/10' : 'border-t border-black/10'}`}>
        <ProfileSidebarFooterV3 />
      </div>
    </aside>
  );
}
