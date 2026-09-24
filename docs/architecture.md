# System Architecture

PFIS is structured as a modular, local-first platform designed to run without mandatory cloud SaaS dependencies.

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)              │
│   Public Explorer | What-If Simulator | Portals UI     │
└───────────────────────────▲────────────────────────────┘
                            │ REST / JSON (OpenAPI 3.0)
┌───────────────────────────▼────────────────────────────┐
│                    Express.js REST API                 │
│   /api/demo/*  |  /api/simulation  |  /api/patients    │
└─────────────┬───────────────────────────────┬──────────┘
              │                               │
┌─────────────▼───────────────┐ ┌─────────────▼──────────┐
│   Core Intelligence Suite   │ │   Pluggable Adapters   │
│  - 8D Friction Fingerprint  │ │  - Maps: OSM / Google  │
│  - Nonlinear Interaction    │ │  - AI: Rules / Ollama  │
│  - Markov Care Leakage      │ │  - Storage: Local / S3 │
│  - Knapsack Optimizer       │ └────────────────────────┘
│  - Attribution Engine       │
│  - Patient Digital Twin     │
└─────────────┬───────────────┘
              │
┌─────────────▼──────────────────────────────────────────┐
│                  Relational & Storage Layer            │
│  Default: Embedded SQL JSON | Option: Postgres / Mongo │
└────────────────────────────────────────────────────────┘
```

---

## Architectural Principles

### 1. Zero Mandatory SaaS Dependencies
Traditional healthcare demos often require an active Google Maps API key, AWS S3 bucket, or an OpenAI account. PFIS operates **100% offline**:
- **Maps**: Defaults to OpenStreetMap / Leaflet tiles with built-in Haversine geodesic routing.
- **AI**: Defaults to deterministic, explainable rule-based scoring with an optional Ollama adapter for local LLMs.
- **Database**: Defaults to an embedded JSON relational store, with native support for PostgreSQL and MongoDB.

### 2. Provider Abstraction Layer (`server/src/providers/`)
All external dependencies are isolated behind TypeScript interfaces:
- **`IMapProvider`**: Geo-coding and distance calculation (`OpenStreetMapProvider`, `GoogleMapsProvider`).
- **`IAIProvider`**: Barrier analysis and conversational synthesis (`DeterministicAIProvider`, `OllamaProvider`, `OpenAIProvider`).
- **`IStorageProvider`**: File uploads and artifact storage (`LocalStorageProvider`, `S3MinioProvider`).

### 3. Decoupled Intelligence Engines (`server/src/intelligence/`)
Business and intelligence logic is completely separated from HTTP transport and UI controllers. Each engine has:
- Strictly typed TypeScript interfaces
- Deterministic and explainable formulas
- Comprehensive automated unit tests

---

## Directory Structure

```
Patient-Friction-Intelligence-System/
├── client/                     # Vite + React 18 + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/         # Shared UI components & layouts
│   │   ├── pages/              # Public routes & operational portals
│   │   └── services/           # REST client with demo fallbacks
│   └── public/                 # Static assets & icons
├── server/                     # Node.js + TypeScript Express backend
│   ├── src/
│   │   ├── intelligence/       # Deterministic intelligence engines
│   │   ├── providers/          # Pluggable maps, AI, and storage
│   │   ├── controllers/        # Route controllers
│   │   ├── routes/             # Public demo & operational endpoints
│   │   ├── database/           # Relational DB & embedded storage driver
│   │   └── seed/               # Synthetic data seeders
│   └── tests/                  # Engine & provider unit tests
├── data/
│   ├── synthetic/              # Mulberry32 PRNG cohort generator
│   └── examples/               # Representative friction & leakage fixtures
├── openapi/                    # OpenAPI 3.0 YAML specification
├── docs/                       # Architectural & operational documentation
└── docker-compose.yml          # Container configuration
```
