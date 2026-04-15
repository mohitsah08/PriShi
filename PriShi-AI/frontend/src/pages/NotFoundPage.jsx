import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="rounded-[2rem] border border-white/10 bg-black/70 p-10 text-center shadow-panel">
        <div className="text-xs uppercase tracking-[0.35em] text-app-muted">404</div>
        <h1 className="mt-4 text-3xl font-semibold text-white">Page not found</h1>
        <Link
          to="/app"
          className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black"
        >
          Return to chat
        </Link>
      </div>
    </div>
  );
}
