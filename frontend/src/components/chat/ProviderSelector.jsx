import { useEffect, useRef, useState } from 'react';

const providers = [
  { value: 'auto', label: 'Auto' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'claude', label: 'Claude' },
  { value: 'grok', label: 'Grok' },
  { value: 'deepseek', label: 'DeepSeek' }
];

export function ProviderSelector({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const activeProvider = providers.find((provider) => provider.value === value);

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
        className="rounded-xl bg-[#f5f5f5] px-4 py-2 text-[20px] font-semibold text-black"
      >
        PriShi
        <span className="ml-2 text-sm text-black/45">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div className="absolute left-0 top-[56px] z-20 min-w-[220px] rounded-2xl border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
          <div className="px-3 pb-2 pt-1 text-xs uppercase tracking-[0.2em] text-black/35">
            Providers
          </div>
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

      <div className="mt-1 px-1 text-xs uppercase tracking-[0.18em] text-black/35">
        {activeProvider?.label || 'Auto'}
      </div>
    </div>
  );
}
