import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ChatComposer } from '../components/chat/ChatComposer.jsx';
import { ChatMessageList } from '../components/chat/ChatMessageList.jsx';
import { ProviderSelector } from '../components/chat/ProviderSelector.jsx';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useChatStore } from '../store/chatStore.js';

export function DropdownChatPage() {
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
  const [pageError, setPageError] = useState('');

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

      if (!activeThreadId) {
        await fetchThreads();
      }
    } catch (error) {
      setPageError(error.message || 'Unable to send your message right now.');
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-black">
      <div
        className={`${
          showSidebar
            ? 'fixed inset-0 z-40 bg-black/20 md:static md:bg-transparent'
            : 'hidden md:block'
        }`}
      >
        <div className={`${showSidebar ? 'absolute inset-y-0 left-0 w-[260px]' : 'h-screen'}`}>
          <Sidebar
            threads={threads}
            activeThreadId={activeThreadId}
            onNewChat={handleNewChat}
            onSelectThread={(nextThreadId) => {
              navigate(`/app/thread/${nextThreadId}`);
              setShowSidebar(false);
            }}
            loading={loadingThreads}
          />
        </div>
      </div>

      <main className="flex h-screen flex-1 flex-col bg-white">
        <header className="px-4 py-3 md:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSidebar((value) => !value)}
                className="rounded-full border border-black/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-black/55 md:hidden"
              >
                Menu
              </button>
              <div className="flex items-center gap-3">
                <div className="text-[24px] leading-none text-black">◎</div>
                <ProviderSelector
                  value={selectedProvider}
                  onChange={setSelectedProvider}
                  disabled={streaming}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
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
          <div className="border-b border-black/10 bg-[#fff3f3] text-center text-sm text-black">
            <div className="px-4 py-2">{pageError || streamError}</div>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatMessageList
            messages={messages}
            loading={loadingMessages && Boolean(activeThreadId)}
          />
          <ChatComposer disabled={streaming} onSend={handleSend} />
        </div>
      </main>
    </div>
  );
}
