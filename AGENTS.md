# AGENTS.md

## What this repo is

A static marketing/ordering page (`index.html`, plain HTML + inline JS, no build
step) plus two Vercel serverless functions in `api/`:

- `api/bundles.ts` — fetches bundle catalogues from the Statum API
  (`STATUM_CONSUMER_KEY` / `STATUM_CONSUMER_SECRET`, OAuth client credentials).
- `api/callback.ts` — M-Pesa/TinyPesa payment callback that sends mobile data
  through Africa's Talking (`AT_API_KEY`, optional `AT_USERNAME`,
  `AT_PRODUCT_NAME`).

The delivered page does **not** call these endpoints: "Pay with M-Pesa" links out
to `https://tinypesa.com/ahmeddatadealskenya`. The endpoints are kept for callbacks
and future use, so the site renders and is usable without any credentials.

`free_x5f_garissa_x5f_ready_x5f_linktree (2).html` is an unrelated exported
artifact kept in the repo; it is served as a static file and is not linked.

## Running locally (sandbox)

```sh
docker compose -f docker-compose.base44.yml up -d --build
```

- `web` — Vite dev server, host port 3000 (live reload on HTML edits).
- `api` — Express host (`server/dev-api.ts`) running the `api/*.ts` handlers with
  `tsx watch` on internal port 8000; Vite proxies `/api/*` to it, so everything is
  single-origin.
- Dependencies install on container start from `package.json` (no lockfile is
  committed; installs use `--no-package-lock`).

## Verifying it works

- `curl -s http://localhost:3000/ | grep -i "Ahmed Data"`.
- `curl -s -o /dev/null -w '%{http_code}' -X OPTIONS http://localhost:3000/api/callback`
  → `200` proves the API host is reachable and proxied.
- `GET /api/bundles` and a real `POST /api/callback` need the external
  credentials above; without them they return an error payload (never a crash).
  `POST /api/callback` sends real mobile data — do not call it with live keys.

## Gotchas

- There is no npm test suite or linter; verification is manual HTTP + UI checks.
- Compose passes `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` through to Vite so the
  preview proxy's hostname is accepted.
