import { useEffect, useMemo, useRef, useState } from 'react';

import { useThemeStore } from '../../store/themeStore.js';

const mainItems = [
  { key: 'upload', label: 'Upload photos & files', icon: '⌕' },
  { key: 'screenshot', label: 'Take screenshot', icon: '◌' },
  { key: 'camera', label: 'Take photo', icon: '◎' },
  { key: 'image', label: 'Create image', icon: '✾' },
  { key: 'thinking', label: 'Thinking', icon: '◔' },
  { key: 'research', label: 'Deep research', icon: '✈' },
  { key: 'more', label: 'More', icon: '…', hasArrow: true }
];

const moreItems = [
  { key: 'web', label: 'Web search', icon: '⊕' },
  { key: 'canvas', label: 'Canvas', icon: '✎' },
  { key: 'github', label: 'GitHub', icon: '⌘' },
  { key: 'quizzes', label: 'Quizzes', icon: '▣' }
];

export function ChatComposerV2({
  disabled,
  onSend,
  draft,
  onDraftChange,
  placeholder = 'Ask PriShi'
}) {
  const theme = useThemeStore((state) => state.theme);
  const [localMessage, setLocalMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mode, setMode] = useState('chat');
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const message = useMemo(
    () => (typeof draft === 'string' ? draft : localMessage),
    [draft, localMessage]
  );
  const dark = theme === 'dark';

  useEffect(() => {
    function handleClickOutside(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
        setMoreOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function updateMessage(nextValue) {
    if (typeof onDraftChange === 'function') {
      onDraftChange(nextValue);
      return;
    }

    setLocalMessage(nextValue);
  }

  function resetComposer() {
    updateMessage('');
    setFiles([]);
    setMode('chat');
    setMenuOpen(false);
    setMoreOpen(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  async function submitMessage() {
    if (!message.trim() || disabled) {
      return;
    }

    await onSend({
      message: message.trim(),
      files,
      mode
    });

    resetComposer();
  }

  function handleAction(itemKey) {
    if (itemKey === 'upload' || itemKey === 'camera' || itemKey === 'screenshot') {
      inputRef.current?.click();
      setMenuOpen(false);
      setMoreOpen(false);
      return;
    }

    if (itemKey === 'image') {
      setMode('image');
      setMenuOpen(false);
      setMoreOpen(false);
      return;
    }

    if (itemKey === 'more') {
      setMoreOpen((current) => !current);
      return;
    }

    setMode('chat');
    setMenuOpen(false);
    setMoreOpen(false);
  }

  const shellClasses = dark
    ? 'border-white/10 bg-[#2b2b2b] text-white shadow-[0_6px_22px_rgba(0,0,0,0.24)]'
    : 'border-black/10 bg-white text-black shadow-[0_6px_22px_rgba(0,0,0,0.08)]';
  const menuClasses = dark
    ? 'border-white/10 bg-[#171717] text-white'
    : 'border-black/10 bg-white text-black';
  const actionClasses = dark
    ? 'hover:bg-white/6 text-white'
    : 'hover:bg-black/5 text-black';

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitMessage();
      }}
      className="px-4 pb-6 pt-2 md:px-8"
    >
      <div className="mx-auto max-w-[700px]">
        <div ref={menuRef} className={`relative rounded-[28px] border px-4 py-2.5 ${shellClasses}`}>
          {menuOpen ? (
            <div
              className={`absolute bottom-[calc(100%+10px)] left-0 z-30 w-[240px] rounded-[22px] border p-2 shadow-[0_18px_50px_rgba(0,0,0,0.18)] ${menuClasses}`}
            >
              {mainItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleAction(item.key)}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-[15px] transition ${actionClasses}`}
                >
                  <span className="flex items-center gap-3">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.hasArrow ? <span className={dark ? 'text-white/45' : 'text-black/35'}>›</span> : null}
                </button>
              ))}

              {moreOpen ? (
                <div
                  className={`absolute bottom-0 left-[calc(100%+8px)] w-[180px] rounded-[20px] border p-2 shadow-[0_18px_50px_rgba(0,0,0,0.18)] ${menuClasses}`}
                >
                  {moreItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleAction(item.key)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] transition ${actionClasses}`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[28px] leading-none transition ${dark ? 'text-white/70 hover:bg-white/6' : 'text-black/55 hover:bg-black/5'}`}
            >
              +
            </button>
            <input
              value={message}
              onChange={(event) => updateMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  submitMessage();
                }
              }}
              placeholder={placeholder}
              className={`flex-1 border-0 bg-transparent text-[15px] outline-none ${dark ? 'text-white placeholder:text-white/40' : 'text-black placeholder:text-black/40'}`}
            />
            <button
              type="button"
              className={`flex h-8 w-8 items-center justify-center rounded-full ${dark ? 'text-white/65' : 'text-black/55'}`}
            >
              ⌄
            </button>
            <button
              type="submit"
              disabled={disabled}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                dark ? 'bg-white text-black hover:bg-white/90' : 'bg-[#f3f3f3] text-black hover:bg-[#ececec]'
              }`}
            >
              {message.trim() ? 'Send' : 'Voice'}
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/*"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
            className="hidden"
          />
        </div>

        {(files.length || mode === 'image') && (
          <div className="mt-3 flex flex-wrap items-center gap-2 px-2">
            {files.length ? (
              <div className={`rounded-full px-3 py-1.5 text-xs ${dark ? 'bg-white/8 text-white/70' : 'bg-black/5 text-black/65'}`}>
                {files.length} file(s) attached
              </div>
            ) : null}
            {mode === 'image' ? (
              <div className={`rounded-full px-3 py-1.5 text-xs ${dark ? 'bg-white/8 text-white/70' : 'bg-black/5 text-black/65'}`}>
                Create image mode
              </div>
            ) : null}
          </div>
        )}
      </div>
    </form>
  );
}
