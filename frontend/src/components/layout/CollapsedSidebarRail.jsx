import { useThemeStore } from '../../store/themeStore.js';

export function CollapsedSidebarRail({ onExpand, onNewChat, onSearchChats }) {
  const theme = useThemeStore((state) => state.theme);
  const dark = theme === 'dark';

  return (
    <aside
      className={`flex h-screen w-[72px] flex-col items-center justify-between py-4 ${
        dark ? 'border-r border-white/10 bg-[#171717] text-white' : 'border-r border-black/10 bg-[#f7f7f8] text-black'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={onExpand}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
            dark ? 'bg-white/6 hover:bg-white/10' : 'bg-black/4 hover:bg-black/8'
          }`}
        >
          ☰
        </button>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-lg">
          ◎
        </button>
        <button
          type="button"
          onClick={onNewChat}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
            dark ? 'hover:bg-white/10' : 'hover:bg-black/8'
          }`}
        >
          ✎
        </button>
        <button
          type="button"
          onClick={onSearchChats}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
            dark ? 'hover:bg-white/10' : 'hover:bg-black/8'
          }`}
        >
          ⌕
        </button>
        <button
          type="button"
          className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
            dark ? 'hover:bg-white/10' : 'hover:bg-black/8'
          }`}
        >
          ◫
        </button>
      </div>

      <button
        type="button"
        onClick={onExpand}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4b15c] text-sm font-semibold text-white"
      >
        G
      </button>
    </aside>
  );
}
