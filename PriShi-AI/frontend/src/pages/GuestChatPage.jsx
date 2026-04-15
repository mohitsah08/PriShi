import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ChatComposer } from '../components/chat/ChatComposer.jsx';
import { ChatMessageList } from '../components/chat/ChatMessageList.jsx';
import { ProviderSelector } from '../components/chat/ProviderSelector.jsx';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useChatStore } from '../store/chatStore.js';

export function GuestChatPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
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
    const thread = await createThread(selectedProvider);
    navigate(`/app/thread/${thread.id}`);
    setShowSidebar(false);
  }

  async function handleSend({ message, files }) {
    await sendMessage({
      threadId: activeThreadId,
      message,
      files,
      navigate
    });

    if (!activeThreadId) {
      await fetchThreads();
    }
  }

  return (
    <div className="flex min-h-screen bg-app text-app-text">
      <div
        className={`${
          showSidebar
            ? 'fixed inset-0 z-40 bg-black/70 md:static md:bg-transparent'
            : 'hidden md:block'
        }`}
      >
        <div className={`${showSidebar ? 'absolute inset-y-0 left-0 w-[300px]' : 'h-screen'}`}>
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

      <main className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-white/10 bg-black/70 px-4 py-4 md:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSidebar((value) => !value)}
                className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-app-muted md:hidden"
              >
                Menu
              </button>
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-app-muted">PriShi-AI</div>
                <div className="mt-1 text-sm text-white">
                  {(user?.name || 'Guest User') + ' · ' + (user?.plan || 'pro') + ' plan'}
                </div>
              </div>
            </div>

            <ProviderSelector
              value={selectedProvider}
              onChange={setSelectedProvider}
              disabled={streaming}
            />

            <div className="flex items-center gap-3">
              {user?.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-app-muted"
                >
                  Admin
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        {streamError ? (
          <div className="border-b border-white/10 bg-white text-center text-sm text-black">
            <div className="px-4 py-2">{streamError}</div>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col">
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
