import { useEffect, useMemo, useRef, useState } from 'react';

const quickTools = [
  { title: 'Create image', subtitle: 'Visualize anything', icon: '✾' },
  { title: 'Thinking', subtitle: 'Think longer for better answers', icon: '◌' },
  { title: 'Deep research', subtitle: 'The research tool is a tool that allows you to perform research or more...', icon: '✈' },
  { title: 'Web search', subtitle: 'Find real-time news and info', icon: '⊕' },
  { title: 'GitHub', subtitle: 'Access repositories, issues, and pull requests. Required for some feat...', icon: '◔' }
];

export function MobileChatComposer({
  disabled,
  onSend,
  draft,
  onDraftChange,
  placeholder = 'Ask PriShi'
}) {
  const [localMessage, setLocalMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputRef = useRef(null);
  const message = useMemo(
    () => (typeof draft === 'string' ? draft : localMessage),
    [draft, localMessage]
  );

  function updateMessage(nextValue) {
    if (typeof onDraftChange === 'function') {
      onDraftChange(nextValue);
      return;
    }

    setLocalMessage(nextValue);
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSheetOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function submitMessage() {
    if (!message.trim() || disabled) {
      return;
    }

    await onSend({
      message: message.trim(),
      files
    });

    updateMessage('');
    setFiles([]);
  }

  return (
    <>
      {sheetOpen ? (
        <div
          className="absolute inset-0 z-40 bg-white/35 backdrop-blur-[1px] md:hidden"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[26px] bg-[#121212] px-4 pb-6 pt-4 text-white shadow-[0_-12px_32px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Camera', icon: '◉' },
                { label: 'Photos', icon: '▣' },
                { label: 'Files', icon: '⌕' }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl bg-[#3a3a3a] px-3 py-4"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="mt-1 text-sm">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-4">
              {quickTools.map((tool) => (
                <button
                  key={tool.title}
                  type="button"
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span className="mt-0.5 flex h-7 w-7 items-center justify-center text-[18px] text-white/90">
                    {tool.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] text-white">{tool.title}</span>
                    <span className="block truncate text-xs text-white/55">{tool.subtitle}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-4 md:hidden">
        <div className="pointer-events-auto mx-auto max-w-md rounded-[26px] border border-white/10 bg-[#2b2b2b] px-4 py-3 shadow-[0_12px_26px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
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
              type={message.trim() ? 'button' : 'button'}
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
    </>
  );
}
