# Local Development Guide

This guide covers workflows for contributing to and extending PFIS.

---

## Workspace Setup

PFIS is organized as an npm workspace containing the frontend client and the backend server.

```bash
# Install all dependencies at the root
npm install

# Start both frontend and backend concurrently
npm run dev
```

---

## Common Development Commands

### Building
```bash
# Build both frontend and backend
npm run build

# Build backend only
cd server && npm run build

# Build frontend only
cd client && npm run build
```

### Typechecking
```bash
# Typecheck TypeScript codebase
npm run typecheck
```

### Testing
```bash
# Run unit tests across all intelligence engines and adapters
npm test

# Run tests directly in server
cd server && npm test
```

### Synthetic Data Management
```bash
# Regenerate and seed 500 synthetic patient records
npm run seed:demo

# Reset database to blank state
npm run reset:demo
```

---

## Code Quality Standards

- **TypeScript Strictness**: Code in `server/src/intelligence/` must use strict TypeScript interfaces. Avoid `any`.
- **Explainability**: Every calculation must produce traceable component attribution.
- **Privacy & Safety**: Never commit real patient data, credentials, or production secrets.
- **Provider Decoupling**: If adding external APIs (e.g., SMS gateways or mapping APIs), implement an interface in `server/src/providers/` and provide a deterministic mock implementation.
