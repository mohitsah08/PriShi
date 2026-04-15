import { useEffect, useMemo, useRef, useState } from 'react';

export function ChatComposer({ disabled, onSend, draft, onDraftChange, placeholder = 'Ask anything' }) {
  const [localMessage, setLocalMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [studyModeEnabled, setStudyModeEnabled] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
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

  function resetComposer() {
    updateMessage('');
    setFiles([]);
    setWebSearchEnabled(false);
    setStudyModeEnabled(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!message.trim() || disabled) {
      return;
    }

    await onSend({
      message: message.trim(),
      files
    });

    resetComposer();
  }

  async function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (!message.trim() || disabled) {
        return;
      }

      await onSend({
        message: message.trim(),
        files
      });

      resetComposer();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-6 pt-2 md:px-8">
      <div className="mx-auto max-w-[700px]">
        <div
          ref={menuRef}
          className="relative rounded-[28px] border border-black/10 bg-white px-4 py-2.5 shadow-[0_6px_22px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[28px] leading-none text-black/55 transition hover:bg-black/5"
            >
              +
            </button>
            <input
              value={message}
              onChange={(event) => updateMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 border-0 bg-transparent text-[15px] text-black outline-none placeholder:text-black/40"
            />
            <button
              type={message.trim() ? 'submit' : 'button'}
              disabled={disabled}
              className="rounded-full bg-[#f3f3f3] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#ececec] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {message.trim() ? 'Send' : 'Voice'}
            </button>
          </div>

          {menuOpen ? (
            <div className="absolute left-2 top-[56px] z-20 w-[190px] rounded-[22px] border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] text-black transition hover:bg-black/5"
              >
                <span>⌘</span>
                <span>Add photos</span>
              </button>
              <button
                type="button"
                onClick={() => setWebSearchEnabled((value) => !value)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] text-black transition hover:bg-black/5"
              >
                <span>◍</span>
                <span>Web search</span>
              </button>
              <button
                type="button"
                onClick={() => setStudyModeEnabled((value) => !value)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] text-black transition hover:bg-black/5"
              >
                <span>◫</span>
                <span>Study and learn</span>
              </button>
              <div className="mx-2 my-1 border-t border-black/10" />
              <div className="px-3 py-2 text-[15px] text-black/45">Log in to use...</div>
              <button
                type="button"
                className="mx-2 mb-2 mt-1 w-[calc(100%-16px)] rounded-full bg-black px-4 py-3 text-sm font-semibold text-white"
              >
                Log in
              </button>
              <div className="space-y-1 px-2 pb-1 pt-1 text-[15px] text-black/28">
                <div className="rounded-2xl px-3 py-2.5">Create image</div>
                <div className="rounded-2xl px-3 py-2.5">Deep research</div>
                <div className="rounded-2xl px-3 py-2.5">GPT-5</div>
              </div>
            </div>
          ) : null}

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/*"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
            className="hidden"
          />
        </div>

        {(files.length || webSearchEnabled || studyModeEnabled) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 px-2">
            {files.length ? (
              <div className="rounded-full bg-black/5 px-3 py-1.5 text-xs text-black/65">
                {files.length} file(s) attached
              </div>
            ) : null}
            {webSearchEnabled ? (
              <div className="rounded-full bg-black/5 px-3 py-1.5 text-xs text-black/65">
                Web search on
              </div>
            ) : null}
            {studyModeEnabled ? (
              <div className="rounded-full bg-black/5 px-3 py-1.5 text-xs text-black/65">
                Study mode on
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-black/40">
          By messaging PriShi-AI, you agree to our Terms and Privacy Policy.
        </div>
      </div>
    </form>
  );
}
