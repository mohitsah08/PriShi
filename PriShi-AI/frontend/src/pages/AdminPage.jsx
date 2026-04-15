import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../api/client.js';

export function AdminPage() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [usage, setUsage] = useState([]);
  const [logs, setLogs] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    async function load() {
      const [overviewResponse, usersResponse, usageResponse, logsResponse, errorsResponse] =
        await Promise.all([
          api.get('/api/admin/overview'),
          api.get('/api/admin/users'),
          api.get('/api/admin/usage'),
          api.get('/api/admin/logs'),
          api.get('/api/admin/errors')
        ]);

      setOverview(overviewResponse.data.data);
      setUsers(usersResponse.data.data);
      setUsage(usageResponse.data.data);
      setLogs(logsResponse.data.data);
      setErrors(errorsResponse.data.data);
    }

    load().catch(() => null);
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-app-muted">Admin</div>
            <h1 className="mt-3 text-3xl font-semibold text-white">Operations console</h1>
          </div>
          <Link
            to="/app"
            className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-app-muted"
          >
            Back to chat
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['Users', overview?.totalUsers || 0],
            ['Tokens', overview?.totalTokens || 0],
            ['Requests', overview?.totalRequests || 0],
            ['Errors', overview?.totalErrors || 0]
          ].map(([label, value]) => (
            <div key={label} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="text-xs uppercase tracking-[0.25em] text-app-muted">{label}</div>
              <div className="mt-4 text-3xl font-semibold text-white">{value}</div>
            </div>
          ))}
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <DataCard title="Users" rows={users} />
          <DataCard title="Usage" rows={usage} />
          <DataCard title="Logs" rows={logs} />
          <DataCard title="Errors" rows={errors} />
        </section>
      </div>
    </div>
  );
}

function DataCard({ title, rows }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 text-xs uppercase tracking-[0.25em] text-app-muted">{title}</div>
      <div className="max-h-[420px] overflow-auto rounded-2xl border border-white/10">
        <pre className="whitespace-pre-wrap p-4 text-xs leading-6 text-app-muted">
          {JSON.stringify(rows, null, 2)}
        </pre>
      </div>
    </div>
  );
}
