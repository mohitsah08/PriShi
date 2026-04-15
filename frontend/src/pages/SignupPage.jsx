import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore.js';

export function SignupPage() {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
  const loading = useAuthStore((state) => state.loading);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError('');
      await signup(form);
      navigate('/app');
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/70 p-8 shadow-panel">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.35em] text-app-muted">PriShi-AI</div>
          <h1 className="mt-3 text-3xl font-semibold text-white">Create account</h1>
          <p className="mt-2 text-sm text-app-muted">
            Stand up your workspace with plan-aware provider access from day one.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
          />
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
            {loading ? 'Creating' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-app-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-white underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
