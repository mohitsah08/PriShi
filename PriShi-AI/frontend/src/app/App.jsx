import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { AppRouter } from '../router/index.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return <RouterProvider router={AppRouter} />;
}
