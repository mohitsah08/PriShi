const providers = [
  { value: 'auto', label: 'Auto' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'claude', label: 'Claude' },
  { value: 'grok', label: 'Grok' },
  { value: 'deepseek', label: 'DeepSeek' }
];

export function ProviderSelector({ value, onChange, disabled = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {providers.map((provider) => (
        <button
          key={provider.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(provider.value)}
          className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition ${
            value === provider.value
              ? 'border-white bg-white text-black'
              : 'border-white/10 text-app-muted hover:border-white/30 hover:text-white'
          }`}
        >
          {provider.label}
        </button>
      ))}
    </div>
  );
}
