import { useEffect, useRef, useState } from 'react';

const providers = [
  { value: 'auto', label: 'Auto' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'claude', label: 'Claude' },
  { value: 'grok', label: 'Grok' },
  { value: 'deepseek', label: 'DeepSeek' }
];

export function PriShiSelector({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-[18px] font-medium text-black transition hover:bg-black/4 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>PriShi</span>
        <span className="text-[11px] text-black/45">{open ? '⌄' : '⌄'}</span>
      </button>

      {open ? (
        <div className="absolute left-0 top-[44px] z-20 min-w-[220px] rounded-2xl border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
          {providers.map((provider) => (
            <button
              key={provider.value}
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange(provider.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${
                value === provider.value
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-black/5'
              }`}
            >
              <span>{provider.label}</span>
              {value === provider.value ? <span>✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
