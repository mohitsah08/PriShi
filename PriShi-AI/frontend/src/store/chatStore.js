import { create } from 'zustand';

import { api } from '../api/client.js';
import { streamChatMessage } from '../api/chatStream.js';
import { normalizeMessage, normalizeThread } from '../lib/format.js';
import { useAuthStore } from './authStore.js';

function appendMessages(existing = [], next = []) {
  const map = new Map(existing.map((message) => [message.id, message]));

  for (const message of next) {
    map.set(message.id, message);
  }

  return Array.from(map.values()).sort(
    (left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0)
  );
}

export const useChatStore = create((set, get) => ({
  threads: [],
  currentThreadId: null,
  messagesByThread: {},
  selectedProvider: 'auto',
  loadingThreads: false,
  loadingMessages: false,
  streaming: false,
  streamRequestId: null,
  streamError: null,
  async fetchThreads() {
    set({ loadingThreads: true });

    try {
      const { data } = await api.get('/api/threads');
      set({
        threads: data.data.map(normalizeThread),
        loadingThreads: false
      });
    } catch (error) {
      set({ loadingThreads: false });
      throw new Error(error.response?.data?.message || 'Failed to load threads');
    }
  },
  async createThread(provider = get().selectedProvider) {
    const { data } = await api.post('/api/threads', {
      provider
    });

    const thread = normalizeThread(data.data);
    set((state) => ({
      threads: [thread, ...state.threads.filter((item) => item.id !== thread.id)],
      currentThreadId: thread.id,
      messagesByThread: {
        ...state.messagesByThread,
        [thread.id]: state.messagesByThread[thread.id] || []
      }
    }));

    return thread;
  },
  async fetchMessages(threadId) {
    if (!threadId) {
      return;
    }

    set({ loadingMessages: true, currentThreadId: threadId });

    try {
      const { data } = await api.get(`/api/threads/${threadId}/messages`);
      set((state) => ({
        loadingMessages: false,
        messagesByThread: {
          ...state.messagesByThread,
          [threadId]: data.data.map(normalizeMessage)
        }
      }));
    } catch (error) {
      set({ loadingMessages: false });
      throw new Error(error.response?.data?.message || 'Failed to load messages');
    }
  },
  setSelectedProvider(provider) {
    set({ selectedProvider: provider });
  },
  setCurrentThread(threadId) {
    set({ currentThreadId: threadId });
  },
  async sendMessage({ threadId, message, files = [], navigate }) {
    const token = useAuthStore.getState().token;
    let activeThreadId = threadId || get().currentThreadId;

    if (!activeThreadId) {
      const createdThread = await get().createThread(get().selectedProvider);
      activeThreadId = createdThread.id;
      navigate?.(`/app/thread/${activeThreadId}`);
    }

    const now = new Date().toISOString();
    const tempUserId = `temp-user-${Date.now()}`;
    const tempAssistantId = `temp-assistant-${Date.now()}`;
    let finalMessage = null;
    let streamErrorMessage = null;

    set((state) => ({
      currentThreadId: activeThreadId,
      streaming: true,
      streamError: null,
      messagesByThread: {
        ...state.messagesByThread,
        [activeThreadId]: appendMessages(state.messagesByThread[activeThreadId], [
          {
            id: tempUserId,
            role: 'user',
            content: message,
            status: 'complete',
            createdAt: now
          },
          {
            id: tempAssistantId,
            role: 'assistant',
            content: '',
            status: 'streaming',
            provider: get().selectedProvider === 'auto' ? null : get().selectedProvider,
            createdAt: now
          }
        ])
      }
    }));

    try {
      await streamChatMessage({
        threadId: activeThreadId,
        token,
        message,
        provider: get().selectedProvider,
        files,
        onEvent: (event, payload) => {
          if (event === 'ready') {
            set({ streamRequestId: payload.requestId });
          }

          if (event === 'message-created') {
            set((state) => ({
              messagesByThread: {
                ...state.messagesByThread,
                [activeThreadId]: (state.messagesByThread[activeThreadId] || []).map(
                  (item) => {
                    if (item.id === tempUserId) {
                      return { ...item, id: payload.userMessageId };
                    }

                    if (item.id === tempAssistantId) {
                      return { ...item, id: payload.assistantMessageId };
                    }

                    return item;
                  }
                )
              }
            }));
          }

          if (event === 'provider') {
            set((state) => ({
              messagesByThread: {
                ...state.messagesByThread,
                [activeThreadId]: (state.messagesByThread[activeThreadId] || []).map(
                  (item) =>
                    item.id === tempAssistantId || item.status === 'streaming'
                      ? {
                          ...item,
                          provider: payload.provider,
                          model: payload.model
                        }
                      : item
                )
              }
            }));
          }

          if (event === 'delta') {
            set((state) => ({
              messagesByThread: {
                ...state.messagesByThread,
                [activeThreadId]: (state.messagesByThread[activeThreadId] || []).map(
                  (item) =>
                    item.id === payload.messageId || item.id === tempAssistantId
                      ? {
                          ...item,
                          id: payload.messageId || item.id,
                          content: payload.content,
                          status: 'streaming'
                        }
                      : item
                )
              }
            }));
          }

          if (event === 'error') {
            streamErrorMessage = payload.message;
          }

          if (event === 'complete') {
            finalMessage = normalizeMessage(payload.message);
            set((state) => ({
              threads: state.threads.map((thread) =>
                thread.id === activeThreadId
                  ? {
                      ...thread,
                      title:
                        thread.title && thread.title !== 'New chat'
                          ? thread.title
                          : message.slice(0, 80),
                      resolvedProvider: finalMessage.provider,
                      lastAssistantPreview: finalMessage.content.slice(0, 240),
                      lastMessageAt: finalMessage.createdAt
                    }
                  : thread
              ),
              messagesByThread: {
                ...state.messagesByThread,
                [activeThreadId]: (state.messagesByThread[activeThreadId] || []).map(
                  (item) =>
                    item.id === finalMessage.id || item.id === tempAssistantId
                      ? {
                          ...finalMessage,
                          status: 'complete'
                        }
                      : item
                )
              }
            }));
          }
        }
      });

      if (streamErrorMessage) {
        throw new Error(streamErrorMessage);
      }

      await get().fetchThreads();
      await get().fetchMessages(activeThreadId);
      return {
        threadId: activeThreadId,
        message: finalMessage
      };
    } catch (error) {
      set((state) => ({
        streamError: error.message,
        messagesByThread: {
          ...state.messagesByThread,
          [activeThreadId]: (state.messagesByThread[activeThreadId] || []).map((item) =>
            item.id === tempAssistantId
              ? {
                  ...item,
                  status: 'failed',
                  content: item.content || error.message
                }
              : item
          )
        }
      }));
      throw error;
    } finally {
      set({
        streaming: false,
        streamRequestId: null
      });
    }
  }
}));
