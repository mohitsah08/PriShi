import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore.js';

export function ProtectedRoute({ adminOnly = false }) {
  const location = useLocation();
  const { user, bootstrapped } = useAuthStore();

  if (!bootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app text-app-text">
        <div className="text-sm uppercase tracking-[0.3em] text-app-muted">Loading</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
