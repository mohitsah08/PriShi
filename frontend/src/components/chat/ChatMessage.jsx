import { MarkdownRenderer } from '../common/MarkdownRenderer.jsx';
import { useThemeStore } from '../../store/themeStore.js';

function IconButton({ label, onClick, children, dark }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
        dark ? 'text-white/48 hover:bg-white/8 hover:text-white' : 'text-black/45 hover:bg-black/5 hover:text-black'
      }`}
    >
      {children}
    </button>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7">
      <rect x="7" y="5" width="9" height="11" rx="2" />
      <rect x="4" y="2" width="9" height="11" rx="2" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7">
      <path d="M8 9V5.8c0-1 .3-2 .9-2.9L10.5 1l1.1.8c.5.4.8 1 .8 1.7V6h2.4c1.1 0 1.9 1 1.7 2.1l-.9 5.4c-.1.9-.9 1.5-1.8 1.5H8" />
      <path d="M4 9h4v7H4z" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7">
      <path d="M12 11v3.2c0 1-.3 2-.9 2.9L9.5 19l-1.1-.8c-.5-.4-.8-1-.8-1.7V14H5.2c-1.1 0-1.9-1-1.7-2.1l.9-5.4C4.5 5.6 5.3 5 6.2 5H12" />
      <path d="M12 4h4v7h-4z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10l6-6" />
      <path d="M9 4h4v4" />
      <path d="M13 11v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 10a6 6 0 0 1-10.2 4.2" />
      <path d="M4 10A6 6 0 0 1 14.2 5.8" />
      <path d="M14 3.5v3.2h-3.2" />
      <path d="M6 16.5v-3.2h3.2" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
      <circle cx="5" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="15" cy="10" r="1.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.8V16h1.2l8.1-8.1-1.2-1.2z" />
      <path d="M11.4 5.6l1.2 1.2" />
      <path d="M12.6 4.4l1 .9a1 1 0 0 1 0 1.4l-.2.2-1.2-1.2.2-.2a1 1 0 0 1 1.4-.1z" />
    </svg>
  );
}

export function ChatMessage({ message, onEdit }) {
  const isUser = message.role === 'user';
  const theme = useThemeStore((state) => state.theme);
  const dark = theme === 'dark';

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  async function handleCopy() {
    await copyText(message.content || '');
  }

  async function handleShare() {
    const text = message.content || '';

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        return;
      }
    }

    await copyText(text);
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={isUser ? 'max-w-[220px]' : 'max-w-3xl'}>
        {isUser ? (
          <div
            className={`inline-flex rounded-full px-4 py-3 text-[15px] leading-6 ${
              dark ? 'bg-white/10 text-white' : 'bg-[#f4f4f4] text-black'
            }`}
          >
            {message.content}
          </div>
        ) : (
          <div className={`${dark ? 'text-white' : 'text-black'}`}>
            <MarkdownRenderer content={message.content} streaming={message.status === 'streaming'} />
          </div>
        )}

        <div
          className={`mt-3 flex items-center gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
          {!isUser ? (
            <div
              className={`mr-2 text-[11px] font-medium ${
                dark ? 'text-white/35' : 'text-black/35'
              }`}
            >
              {message.provider
                ? `${String(message.provider).toUpperCase()}${message.model ? ` · ${message.model}` : ''}`
                : 'ASSISTANT'}
            </div>
          ) : null}
          <IconButton label="Copy" onClick={handleCopy} dark={dark}>
            <CopyIcon />
          </IconButton>
          {!isUser ? (
            <>
              <IconButton label="Like" onClick={() => null} dark={dark}>
                <ThumbUpIcon />
              </IconButton>
              <IconButton label="Dislike" onClick={() => null} dark={dark}>
                <ThumbDownIcon />
              </IconButton>
            </>
          ) : null}
          <IconButton label="Share" onClick={handleShare} dark={dark}>
            <ShareIcon />
          </IconButton>
          {!isUser ? (
            <>
              <IconButton label="Refresh" onClick={() => null} dark={dark}>
                <RefreshIcon />
              </IconButton>
              <IconButton label="More" onClick={() => null} dark={dark}>
                <MoreIcon />
              </IconButton>
            </>
          ) : (
            <IconButton label="Edit" onClick={() => onEdit?.(message)} dark={dark}>
              <EditIcon />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}
