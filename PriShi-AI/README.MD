## PriShi-AI

Production-oriented multi-provider AI SaaS platform with:

- React + Vite frontend
- Node.js + Express backend
- MongoDB for users, threads, messages, usage, and logs
- Redis for rate limiting and active stream state
- Real provider integrations for OpenAI, Gemini, Claude, Grok, and DeepSeek
- Server-Sent Events streaming
- JWT auth, plan enforcement, usage tracking, uploads, and admin APIs

## Structure

```text
backend/
  package.json
  .env.example
  src/
    app.js
    server.js
    config/
    controllers/
    middlewares/
    models/
    routes/
    services/
    utils/
    validators/

frontend/
  package.json
  .env.example
  index.html
  vite.config.js
  tailwind.config.js
  postcss.config.js
  src/
    api/
    app/
    components/
    lib/
    pages/
    router/
    store/
    styles/
```

## Backend Highlights

- `User`, `ChatThread`, `Message`, `UsageRecord`, and `ApiLog` schemas avoid unbounded thread arrays by storing messages in their own collection with indexes.
- Provider isolation lives in:
  - `backend/src/services/openai.service.js`
  - `backend/src/services/gemini.service.js`
  - `backend/src/services/claude.service.js`
  - `backend/src/services/grok.service.js`
  - `backend/src/services/deepseek.service.js`
- `modelRouter.service.js` selects providers automatically for coding, fast answers, and long-context input.
- `aiOrchestrator.service.js` retries, applies timeout control, and falls back between providers without crashing the app.
- `streamState.service.js` stores partial streaming state in Redis for recovery/status inspection.
- `upload.service.js` extracts PDF text and OCR text from images, and forwards image payloads to multimodal providers.

## Frontend Highlights

- ChatGPT-style shell with left sidebar, central message pane, and bottom composer.
- Provider selector for `Auto`, `OpenAI`, `Gemini`, `Claude`, `Grok`, and `DeepSeek`.
- Zustand stores for auth and chat state.
- Markdown and code block rendering with syntax highlighting.
- SSE streaming client built on `fetch()` and incremental event parsing.
- Admin console for overview, users, usage, logs, and errors.

## Environment

Create these files before running:

- `backend/.env`
- `frontend/.env`

Copy from:

- `backend/.env.example`
- `frontend/.env.example`

Important backend variables:

- `MONGODB_URI`
- `REDIS_URL`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `ANTHROPIC_API_KEY`
- `XAI_API_KEY`
- `DEEPSEEK_API_KEY`

## Install

```bash
npm install
```

That root install will install dependencies for both workspaces:

- `backend`
- `frontend`

## Run

Start both apps from the repo root:

```bash
npm run dev
```

Useful workspace-specific commands:

```bash
npm run dev:backend
npm run dev:frontend
```

Create demo accounts from the repo root:

```bash
npm run seed
```

Seeded credentials:

- `admin@prishi.ai` / `Admin@12345`
- `user@prishi.ai` / `User@12345`

Frontend defaults to `http://localhost:5173`.
Backend defaults to `http://localhost:8081`.

## API Surface

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

Threads:

- `GET /api/threads`
- `POST /api/threads`
- `GET /api/threads/:threadId/messages`
- `PATCH /api/threads/:threadId`

Chat:

- `POST /api/chats/threads/:threadId/messages/stream`
- `GET /api/chats/streams/:requestId`

Uploads:

- `POST /api/uploads`

Admin:

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `GET /api/admin/usage`
- `GET /api/admin/logs`
- `GET /api/admin/errors`

## Notes

- Free plan users can access non-premium providers. Premium provider access is enforced server-side.
- Usage is recorded per request and provider, ready for future billing extensions.
- To access the admin dashboard, set a user document's `role` to `admin` in MongoDB.
- Redis is required in production for distributed rate limiting and stream-state coordination.
