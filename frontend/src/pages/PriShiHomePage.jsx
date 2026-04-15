import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ChatComposer } from '../components/chat/ChatComposer.jsx';
import { MobileChatComposer } from '../components/chat/MobileChatComposer.jsx';
import { ChatMessageList } from '../components/chat/ChatMessageList.jsx';
import { PriShiSelector } from '../components/chat/PriShiSelector.jsx';
import { SearchChatsOverlay } from '../components/chat/SearchChatsOverlay.jsx';
import { MobileSidebar } from '../components/layout/MobileSidebar.jsx';
import { ProfileFixedSidebar } from '../components/layout/ProfileFixedSidebar.jsx';
import { useChatStore } from '../store/chatStore.js';

const mobilePrompts = [
  { label: 'Create image', color: 'text-[#56c65c]' },
  { label: 'Brainstorm', color: 'text-[#d2b13e]' },
  { label: 'Get advice', color: 'text-[#79b9ff]' },
  { label: 'Analyze images', color: 'text-[#7a67ff]' }
];

export function PriShiHomePage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const {
    threads,
    currentThreadId,
    messagesByThread,
    selectedProvider,
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
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pageError, setPageError] = useState('');
  const [draftMessage, setDraftMessage] = useState('');

  useEffect(() => {
    fetchThreads().catch(() => null);
  }, [fetchThreads]);

  useEffect(() => {
    if (threadId) {
      setCurrentThread(threadId);
      fetchMessages(threadId).catch(() => null);
    }
  }, [threadId, fetchMessages, setCurrentThread]);

  const activeThreadId = threadId || currentThreadId;
  const messages = useMemo(
    () => messagesByThread[activeThreadId] || [],
    [messagesByThread, activeThreadId]
  );

  async function handleNewChat() {
    try {
      setPageError('');
      const thread = await createThread(selectedProvider);
      navigate(`/app/thread/${thread.id}`);
      setShowSidebar(false);
    } catch (error) {
      setPageError(error.message || 'Unable to create a new chat right now.');
    }
  }

  async function handleSend({ message, files }) {
    try {
      setPageError('');
      await sendMessage({
        threadId: activeThreadId,
        message,
        files,
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
    <div className="flex h-screen overflow-hidden bg-black text-white md:bg-white md:text-black">
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

      <div
        className="hidden"
        onClick={() => setShowSidebar(false)}
      >
        <div
          className="absolute inset-y-0 left-0 w-[260px]"
          onClick={(event) => event.stopPropagation()}
        >
          <ProfileFixedSidebar
            threads={threads}
            activeThreadId={activeThreadId}
            onNewChat={handleNewChat}
            onSearchChats={() => setSearchOpen(true)}
            onSelectThread={(nextThreadId) => {
              navigate(`/app/thread/${nextThreadId}`);
              setShowSidebar(false);
            }}
            loading={loadingThreads}
            onCollapseSidebar={() => setShowSidebar(false)}
          />
        </div>
      </div>

      <div
        className={`relative hidden overflow-hidden md:block md:shrink-0 md:transition-[width] md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sidebarCollapsed ? 'md:w-0' : 'md:w-[260px]'
        }`}
      >
        <div
          className={`absolute inset-y-0 left-0 w-[260px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            sidebarCollapsed ? 'translate-x-[-28px] opacity-0' : 'translate-x-0 opacity-100'
          }`}
        >
          <ProfileFixedSidebar
            threads={threads}
            activeThreadId={activeThreadId}
            onNewChat={handleNewChat}
            onSearchChats={() => setSearchOpen(true)}
            onSelectThread={(nextThreadId) => {
              navigate(`/app/thread/${nextThreadId}`);
              setShowSidebar(false);
            }}
            loading={loadingThreads}
            onCollapseSidebar={() => setSidebarCollapsed(true)}
          />
        </div>
      </div>

      <main className="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-black text-white md:hidden">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <button
            type="button"
            onClick={() => setShowSidebar(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#232323] text-[20px] text-white"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-11 items-center justify-center rounded-full bg-[#232323] px-3 text-[17px] text-white"
            >
              ⌕
            </button>
            <button
              type="button"
              className="flex h-11 items-center justify-center rounded-full bg-[#232323] px-3 text-[17px] text-white"
            >
              ◌
            </button>
          </div>
        </div>

        {pageError || streamError ? (
          <div className="px-4 py-2 text-center text-sm text-[#ffb5b5]">
            {pageError || streamError}
          </div>
        ) : null}

        {messages.length ? (
          <div className="min-h-0 flex-1 overflow-hidden bg-black text-white">
            <ChatMessageList
              messages={messages}
              loading={loadingMessages && Boolean(activeThreadId)}
              onEditMessage={handleEditMessage}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-32">
            <h2 className="text-center text-[34px] font-medium tracking-[-0.04em] text-white">
              What can I help with?
            </h2>
            <div className="mt-8 flex max-w-[360px] flex-wrap items-center justify-center gap-3">
              {mobilePrompts.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="rounded-full border border-white/10 bg-[#101010] px-4 py-2 text-[13px] text-white/78 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                >
                  <span className={`${item.color} mr-2`}>◉</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <MobileChatComposer
          disabled={streaming}
          onSend={handleSend}
          draft={draftMessage}
          onDraftChange={setDraftMessage}
          placeholder="Ask PriShi"
        />
      </main>

      <main className="relative hidden h-screen min-w-0 flex-1 flex-col overflow-hidden bg-white md:flex">
        {sidebarCollapsed ? (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            className="absolute left-5 top-3 z-20 hidden h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[18px] text-black/70 transition hover:bg-black/5 md:flex"
            title="Show sidebar"
          >
            ☰
          </button>
        ) : null}

        <header className="shrink-0 px-4 py-3 md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {sidebarCollapsed ? (
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  className="hidden rounded-full border border-black/10 px-3 py-2 text-sm text-black/70 transition hover:bg-black/5"
                  title="Show sidebar"
                >
                  ☰
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setShowSidebar((value) => !value)}
                className="rounded-full border border-black/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-black/55 md:hidden"
              >
                Menu
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-base text-black">
                  ◎
                </div>
                <PriShiSelector
                  value={selectedProvider}
                  onChange={setSelectedProvider}
                  disabled={streaming}
                />
              </div>
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
                className="rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm font-medium text-black"
              >
                Sign up for free
              </button>
            </div>
          </div>
        </header>

        {pageError || streamError ? (
          <div className="shrink-0 bg-[#fff3f3] text-center text-sm text-black">
            <div className="px-4 py-2">{pageError || streamError}</div>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatMessageList
            messages={messages}
            loading={loadingMessages && Boolean(activeThreadId)}
            onEditMessage={handleEditMessage}
          />
          <ChatComposer
            disabled={streaming}
            onSend={handleSend}
            draft={draftMessage}
            onDraftChange={setDraftMessage}
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
