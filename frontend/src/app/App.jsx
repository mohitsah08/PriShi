import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { AppRouter } from '../router/index.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useChatStore } from '../store/chatStore.js';
import { useThemeStore } from '../store/themeStore.js';

export default function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const sessionType = useAuthStore((state) => state.sessionType);
  const userId = useAuthStore((state) => state.user?.id || null);
  const hydrateForSession = useChatStore((state) => state.hydrateForSession);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    const sessionKey =
      sessionType === 'user' && userId
        ? `user:${userId}`
        : sessionType === 'guest'
          ? 'guest'
          : 'anonymous';

    hydrateForSession(sessionKey);
  }, [hydrateForSession, sessionType, userId]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
  }, [theme]);

  return <RouterProvider router={AppRouter} />;
}
