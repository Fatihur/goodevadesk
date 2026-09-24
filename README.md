# GoodevaDesk

GoodevaDesk is a multi-tenant customer-support ticketing system. It provides a NestJS API, PostgreSQL persistence, Redis-backed exact LLM analysis caching, and a React dashboard for support agents.

## Current scope

- Ticket integration API under `/api/tickets` authenticated by `x-api-key`.
- Tenant isolation on every ticket query.
- LLM classification and suggested reply with graceful failure.
- Redis cache using versioned SHA-256 keys.
- Dashboard authentication with `admin` and `agent` roles.
- React dashboard foundation and responsive ticket workflow.

## Local setup

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL and Redis locally.
3. Install dependencies with `npm install`.
4. Generate Prisma Client with `npm run db:generate`.
5. Apply the development migration with `npm run db:migrate`.
6. Seed development data with `npm run db:seed`.
7. Start API and dashboard with `npm run dev`.

API docs are available at `http://localhost:3000/api/docs`. The production target is `https://goodevadesk.fatihur.web.id`.

## Production deployment

The VPS deployment runs PostgreSQL, Redis, the NestJS API, and the React web container with Docker Compose. Host Nginx terminates the public domain and proxies to API port `3005` and web port `8085`; the deployment templates are in `deploy/nginx/`.

```bash
ssh atlantic
cd /opt/goodevadesk
git pull --ff-only origin main
docker compose build
docker compose run --rm api npx prisma migrate deploy
docker compose up -d
docker compose ps
curl -fsS https://goodevadesk.fatihur.web.id/api/health
```

Production `.env` is kept only on the VPS. It must contain `SESSION_SECRET` and `REDIS_PASSWORD`; `AI_BASE_URL`, `AI_API_KEY`, and `AI_MODEL` enable LLM ticket enrichment when configured. The application remains available if the optional LLM provider is unavailable, while the ticket itself is still stored.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm test
```

Real API keys and credentials must remain in environment variables. The repository is intentionally public and must never contain production secrets.
