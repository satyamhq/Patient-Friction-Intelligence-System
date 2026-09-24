# Environment Configuration Guide

PFIS supports three environment operational profiles configured via standard `.env` variables:
1. **`DEMO`**: Synthetic dataset, zero authentication required, 100% offline.
2. **`DEVELOPMENT`**: Local embedded storage, live hot-reloading.
3. **`PRODUCTION`**: Strict CORS, PostgreSQL persistence, optional OIDC authentication.

---

## Configuration Variables Reference

| Variable | Default Value | Description |
|:---|:---|:---|
| `PORT` | `5000` | Port for the Express.js server |
| `NODE_ENV` | `development` | `development`, `production`, or `test` |
| `APP_MODE` | `demo` | `demo`, `development`, or `production` |
| `DEMO_MODE` | `true` | When `true`, all `/api/demo/*` routes function without authentication |
| `DB_MODE` | `embedded` | `embedded` (local JSON), `postgres`, or `mongodb` |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/pfis` | Postgres connection string (when `DB_MODE=postgres`) |
| `MONGODB_URI` | `mongodb://localhost:27017/pfis` | Mongo connection string (when `DB_MODE=mongodb`) |
| `JWT_SECRET` | *Dev default* | Secret used for signing JWTs in operational portals |
| `AI_PROVIDER` | `deterministic` | `deterministic`, `ollama`, or `openai` |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Endpoint for local Ollama daemon |
| `OLLAMA_MODEL` | `llama3.2` | Model name to use in Ollama |
| `MAP_PROVIDER` | `openstreetmap` | `openstreetmap` or `google` |
| `STORAGE_PROVIDER`| `local` | `local` (filesystem) or `s3` (AWS/MinIO) |
| `STORAGE_LOCAL_DIR`| `./uploads` | Directory for local file storage |

---

## Local Development `.env` Example

Create a file named `.env` in the `server/` directory:

```bash
# Server Port
PORT=5000
NODE_ENV=development
APP_MODE=demo
DEMO_MODE=true

# Database: Uses fast embedded relational JSON by default
DB_MODE=embedded

# Pluggable Providers (Zero SaaS out-of-the-box)
AI_PROVIDER=deterministic
MAP_PROVIDER=openstreetmap
STORAGE_PROVIDER=local
STORAGE_LOCAL_DIR=./uploads

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## Running with Local Ollama (Offline AI)

If you wish to augment PFIS barrier analysis with a local LLM:

1. Install and start [Ollama](https://ollama.ai/):
   ```bash
   ollama run llama3.2
   ```
2. Update `server/.env`:
   ```bash
   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   ```
3. Restart PFIS:
   ```bash
   npm run dev
   ```
