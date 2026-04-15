import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ChatComposerV2 } from '../components/chat/ChatComposerV2.jsx';
import { ChatMessageList } from '../components/chat/ChatMessageList.jsx';
import { MobileChatComposerV2 } from '../components/chat/MobileChatComposerV2.jsx';
import { SearchChatsOverlay } from '../components/chat/SearchChatsOverlay.jsx';
import { CollapsedSidebarRail } from '../components/layout/CollapsedSidebarRail.jsx';
import { MobileSidebar } from '../components/layout/MobileSidebar.jsx';
import { ProfileFixedSidebarV2 } from '../components/layout/ProfileFixedSidebarV2.jsx';
import { useChatStore } from '../store/chatStore.js';
import { useThemeStore } from '../store/themeStore.js';

const mobilePrompts = [
  { label: 'Create image', color: 'text-[#56c65c]' },
  { label: 'Brainstorm', color: 'text-[#d2b13e]' },
  { label: 'Get advice', color: 'text-[#79b9ff]' },
  { label: 'Analyze images', color: 'text-[#7a67ff]' }
];

export function PriShiWorkspacePage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const {
    threads,
    currentThreadId,
    messagesByThread,
    loadingThreads,
    loadingMessages,
    streaming,
    streamError,
    fetchThreads,
    fetchMessages,
    createThread,
    setCurrentThread,
    setSelectedProvider,
    sendMessage
  } = useChatStore();
  const theme = useThemeStore((state) => state.theme);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pageError, setPageError] = useState('');
  const [draftMessage, setDraftMessage] = useState('');

  const dark = theme === 'dark';
  const activeThreadId = threadId || currentThreadId;
  const messages = useMemo(
    () => messagesByThread[activeThreadId] || [],
    [messagesByThread, activeThreadId]
  );

  useEffect(() => {
    fetchThreads().catch(() => null);
  }, [fetchThreads]);

  useEffect(() => {
    setSelectedProvider('auto');
  }, [setSelectedProvider]);

  useEffect(() => {
    if (threadId) {
      setCurrentThread(threadId);
      fetchMessages(threadId).catch(() => null);
    }
  }, [threadId, fetchMessages, setCurrentThread]);

  async function handleNewChat() {
    try {
      setPageError('');
      const thread = await createThread('auto');
      navigate(`/app/thread/${thread.id}`);
      setShowSidebar(false);
    } catch (error) {
      setPageError(error.message || 'Unable to create a new chat right now.');
    }
  }

  async function handleSend({ message, files, mode = 'chat' }) {
    try {
      setPageError('');
      await sendMessage({
        threadId: activeThreadId,
        message,
        files,
        mode,
        navigate
      });
      setDraftMessage('');

      if (!activeThreadId) {
        await fetchThreads();
      }
    } catch (error) {
      setPageError(error.message || 'Unable to send your message right now.');
    }
  }

  function handleEditMessage(message) {
    setDraftMessage(message.content || '');
  }

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <MobileSidebar
        open={showSidebar}
        threads={threads}
        onClose={() => setShowSidebar(false)}
        onNewChat={handleNewChat}
        onSearchChats={() => setSearchOpen(true)}
        onSelectThread={(nextThreadId) => {
          navigate(`/app/thread/${nextThreadId}`);
          setShowSidebar(false);
        }}
      />

      <div className="hidden md:block">
        {sidebarCollapsed ? (
          <CollapsedSidebarRail
            onExpand={() => setSidebarCollapsed(false)}
            onNewChat={handleNewChat}
            onSearchChats={() => setSearchOpen(true)}
          />
        ) : (
          <ProfileFixedSidebarV2
            threads={threads}
            activeThreadId={activeThreadId}
            onNewChat={handleNewChat}
            onSearchChats={() => setSearchOpen(true)}
            onSelectThread={(nextThreadId) => navigate(`/app/thread/${nextThreadId}`)}
            loading={loadingThreads}
            onCollapseSidebar={() => setSidebarCollapsed(true)}
          />
        )}
      </div>

      <main className={`relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden md:hidden ${dark ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <button
            type="button"
            onClick={() => setShowSidebar(true)}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-[20px] ${
              dark ? 'bg-[#232323] text-white' : 'bg-black/6 text-black'
            }`}
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={`flex h-11 items-center justify-center rounded-full px-3 text-[17px] ${
                dark ? 'bg-[#232323] text-white' : 'bg-black/6 text-black'
              }`}
            >
              ⌕
            </button>
            <button
              type="button"
              className={`flex h-11 items-center justify-center rounded-full px-3 text-[17px] ${
                dark ? 'bg-[#232323] text-white' : 'bg-black/6 text-black'
              }`}
            >
              ◌
            </button>
          </div>
        </div>

        {pageError || streamError ? (
          <div className={`px-4 py-2 text-center text-sm ${dark ? 'text-[#ffb5b5]' : 'text-[#b10000]'}`}>
            {pageError || streamError}
          </div>
        ) : null}

        {messages.length ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatMessageList
              messages={messages}
              loading={loadingMessages && Boolean(activeThreadId)}
              onEditMessage={handleEditMessage}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-32">
            <h2 className={`text-center text-[34px] font-medium tracking-[-0.04em] ${dark ? 'text-white' : 'text-black'}`}>
              What can I help with?
            </h2>
            <div className="mt-8 flex max-w-[360px] flex-wrap items-center justify-center gap-3">
              {mobilePrompts.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`rounded-full px-4 py-2 text-[13px] ${
                    dark ? 'border border-white/10 bg-[#101010] text-white/78' : 'border border-black/10 bg-[#f3f3f3] text-black/78'
                  }`}
                >
                  <span className={`${item.color} mr-2`}>◉</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <MobileChatComposerV2
          disabled={streaming}
          onSend={handleSend}
          draft={draftMessage}
          onDraftChange={setDraftMessage}
          placeholder="Ask PriShi"
        />
      </main>

      <main className={`relative hidden h-screen min-w-0 flex-1 flex-col overflow-hidden md:flex ${dark ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <header className="shrink-0 px-4 py-3 md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-base ${dark ? 'text-white' : 'text-black'}`}>
                ◎
              </div>
              <PriShiSelectorV2
                value={selectedProvider}
                onChange={setSelectedProvider}
                disabled={streaming}
              />
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <button
                type="button"
                className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white"
              >
                Log in
              </button>
              <button
                type="button"
                className={`rounded-full px-5 py-2.5 text-sm font-medium ${
                  dark ? 'border border-white/15 bg-transparent text-white' : 'border border-black/15 bg-white text-black'
                }`}
              >
                Sign up for free
              </button>
            </div>
          </div>
        </header>

        {pageError || streamError ? (
          <div className={`shrink-0 text-center text-sm ${dark ? 'bg-[#382525] text-white' : 'bg-[#fff3f3] text-black'}`}>
            <div className="px-4 py-2">{pageError || streamError}</div>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatMessageList
            messages={messages}
            loading={loadingMessages && Boolean(activeThreadId)}
            onEditMessage={handleEditMessage}
          />
          <ChatComposerV2
            disabled={streaming}
            onSend={handleSend}
            draft={draftMessage}
            onDraftChange={setDraftMessage}
            placeholder="Ask PriShi"
          />
        </div>

        <SearchChatsOverlay
          open={searchOpen}
          threads={threads}
          onClose={() => setSearchOpen(false)}
          onSelectThread={(nextThreadId) => navigate(`/app/thread/${nextThreadId}`)}
        />
      </main>
    </div>
  );
}
