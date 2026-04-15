import { useEffect, useMemo, useRef, useState } from 'react';

const primaryItems = [
  { key: 'upload', label: 'Upload photos & files', icon: '⌕' },
  { key: 'screenshot', label: 'Take screenshot', icon: '◌' },
  { key: 'camera', label: 'Take photo', icon: '◎' },
  { key: 'image', label: 'Create image', icon: '✾' },
  { key: 'thinking', label: 'Thinking', icon: '◔' },
  { key: 'research', label: 'Deep research', icon: '✈' },
  { key: 'more', label: 'More', icon: '…', hasArrow: true }
];

const secondaryItems = [
  { key: 'web', label: 'Web search', icon: '⊕' },
  { key: 'canvas', label: 'Canvas', icon: '✎' },
  { key: 'github', label: 'GitHub', icon: '⌘' },
  { key: 'quizzes', label: 'Quizzes', icon: '▣' }
];

export function MobileChatComposerV2({
  disabled,
  onSend,
  draft,
  onDraftChange,
  placeholder = 'Ask PriShi'
}) {
  const [localMessage, setLocalMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mode, setMode] = useState('chat');
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const message = useMemo(
    () => (typeof draft === 'string' ? draft : localMessage),
    [draft, localMessage]
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (!wrapRef.current?.contains(event.target)) {
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

  async function submitMessage() {
    if (!message.trim() || disabled) {
      return;
    }

    await onSend({
      message: message.trim(),
      files,
      mode
    });

    updateMessage('');
    setFiles([]);
    setMode('chat');
    setMenuOpen(false);
    setMoreOpen(false);
  }

  function handleItem(itemKey) {
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

    setMenuOpen(false);
    setMoreOpen(false);
  }

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-4 md:hidden">
      {menuOpen ? (
        <div className="pointer-events-auto absolute bottom-[calc(100%+10px)] left-4 w-[250px] rounded-[22px] border border-black/10 bg-white p-2 text-black shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
          {primaryItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleItem(item.key)}
              className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-[15px] transition hover:bg-black/5"
            >
              <span className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </span>
              {item.hasArrow ? <span className="text-black/35">›</span> : null}
            </button>
          ))}

          {moreOpen ? (
            <div className="absolute bottom-0 left-[calc(100%+8px)] w-[180px] rounded-[20px] border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
              {secondaryItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleItem(item.key)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] transition hover:bg-black/5"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="pointer-events-auto mx-auto max-w-md rounded-[26px] border border-white/10 bg-[#2b2b2b] px-4 py-3 shadow-[0_12px_26px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[25px] leading-none text-white/80"
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
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-white outline-none placeholder:text-white/45"
          />
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/65"
          >
            ⌄
          </button>
          <button
            type="button"
            onClick={message.trim() ? submitMessage : undefined}
            disabled={disabled}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[18px] text-black disabled:opacity-40"
          >
            {message.trim() ? '↑' : '◉'}
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
    </div>
  );
}
