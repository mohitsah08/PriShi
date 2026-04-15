import { useEffect, useRef } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AdminPage } from '../pages/AdminPage.jsx';
import { AuthPage } from '../pages/AuthPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { PricingPage } from '../pages/PricingPage.jsx';
import { PriShiAutoWorkspacePage } from '../pages/PriShiAutoWorkspacePage.jsx';
import { useAuthStore } from '../store/authStore.js';

function AppSessionGuard() {
  const { bootstrapped, sessionType, continueAsGuest } = useAuthStore();
  const requestedGuestRef = useRef(false);

  if (!bootstrapped) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-black/55">Loading PriShi...</div>;
  }

  if (sessionType === 'guest' || sessionType === 'user') {
    return <PriShiAutoWorkspacePage />;
  }

  return (
    <AutoGuestBootstrap
      continueAsGuest={continueAsGuest}
      requestedGuestRef={requestedGuestRef}
    />
  );
}

function AutoGuestBootstrap({ continueAsGuest, requestedGuestRef }) {
  useEffect(() => {
    if (requestedGuestRef.current) {
      return;
    }

    requestedGuestRef.current = true;
    continueAsGuest().catch(() => {
      requestedGuestRef.current = false;
    });
  }, [continueAsGuest, requestedGuestRef]);

  return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-black/55">Opening PriShi in guest mode...</div>;
}

function LoginPageGuard() {
  const { bootstrapped, sessionType } = useAuthStore();

  if (!bootstrapped) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-black/55">Loading PriShi...</div>;
  }

  if (sessionType === 'user') {
    return <Navigate to="/app" replace />;
  }

  return <AuthPage defaultMode="login" />;
}

export const AppRouter = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app" replace />
  },
  {
    path: '/login',
    element: <LoginPageGuard />
  },
  {
    path: '/signup',
    element: <LoginPageGuard />
  },
  {
    path: '/app',
    element: <AppSessionGuard />
  },
  {
    path: '/app/thread/:threadId',
    element: <AppSessionGuard />
  },
  {
    path: '/pricing',
    element: <PricingPage />
  },
  {
    path: '/admin',
    element: <AdminPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
