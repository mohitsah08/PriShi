import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AdminPage } from '../pages/AdminPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { ReferenceChatPage } from '../pages/ReferenceChatPage.jsx';

export const AppRouter = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app" replace />
  },
  {
    path: '/login',
    element: <Navigate to="/app" replace />
  },
  {
    path: '/signup',
    element: <Navigate to="/app" replace />
  },
  {
    path: '/app',
    element: <ReferenceChatPage />
  },
  {
    path: '/app/thread/:threadId',
    element: <ReferenceChatPage />
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
