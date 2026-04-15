import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore.js';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError('');
      await login(form);
      navigate(location.state?.from?.pathname || '/app');
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/70 p-8 shadow-panel">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.35em] text-app-muted">PriShi-AI</div>
          <h1 className="mt-3 text-3xl font-semibold text-white">Sign in</h1>
          <p className="mt-2 text-sm text-app-muted">
            Multi-provider AI chat with streaming, routing, and admin visibility.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
          />

          {error ? <div className="text-sm text-white">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-black disabled:opacity-40"
          >
            {loading ? 'Signing in' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-sm text-app-muted">
          New here?{' '}
          <Link to="/signup" className="text-white underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
