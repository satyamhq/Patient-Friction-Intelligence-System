# Patient Friction Intelligence System (PFIS)

> **An open-source platform for modeling, measuring, visualizing, and simulating non-clinical barriers that prevent patients from completing healthcare journeys.**

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-emerald.svg)](https://github.com/satyamhq/Patient-Friction-Intelligence-System)
[![Tests: 27/27](https://img.shields.io/badge/Tests-27%2F27%20Passed-blue.svg)](https://github.com/satyamhq/Patient-Friction-Intelligence-System)
[![Docker: Supported](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://github.com/satyamhq/Patient-Friction-Intelligence-System)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg)](https://www.typescriptlang.org/)
[![Synthetic Data: 100%](https://img.shields.io/badge/Data-100%25%20Synthetic-9333EA.svg)](./data/README.md)

---

## Why PFIS?

Traditional healthcare systems ask:
> *"Is care physically available?"* (Do we have a doctor, hospital beds, and pharmaceuticals?)

Yet across low- and middle-income regions, up to 40% of patients fail to complete prescribed medical regimens because of **non-clinical friction**:
- **Transit & Distance**: Lack of reliable buses or prohibitive travel costs
- **Lost Wages**: Inability of daily informal wage earners to surrender a day of income
- **Documentation**: Missing health insurance cards, identity certificates, or referral slips
- **Digital Literacy**: Inability to navigate mobile booking portals
- **Language & Cultural Barriers**: Vernacular disconnect with urban tertiary providers

**PFIS quantifies these invisible barriers into an actionable operational intelligence layer, allowing health administrators to simulate interventions and optimize care completion under constrained budgets.**

---

## What PFIS Does

```
Traditional View:
  Patient ──► Hospital ──► Care Complete (Assumed)

PFIS Friction Journey:
  Referral ──► Consultation ──► Diagnostics ──► Treatment ──► Follow-up
      │              │               │              │             │
      ▼              ▼               ▼              ▼             ▼
   Transit        Wage Loss      Missing Docs   Wait Times    Affordability
  (Dropout)      (Dropout)        (Dropout)     (Dropout)       (Dropout)
```

PFIS tracks and simulates this attrition, identifying where patients drop out and which programmatic levers (e.g. community shuttles, point-of-care diagnostics, or vernacular counselors) produce the highest completion gains per dollar spent.

---

## Core Features

1. **Patient Friction Fingerprint (8D)**: Multi-dimensional scoring across travel distance, transit reliability, direct cost, wage loss, documentation, digital access, language, and clinic timing.
2. **Friction Interaction Engine**: Evaluates compounding non-linear barrier amplification (e.g., transit deficit $\times$ daily wage loss creates superlinear dropout hazard).
3. **Care Failure Risk Model**: Computes calibrated care abandonment probabilities using a logistic response curve.
4. **Friction Digital Twin**: Parameterized counterfactual models representing archetypal socio-demographic patient profiles.
5. **What-If Intervention Simulator**: Real-time interactive decision support simulating policy interventions (e.g., Baseline 42% $\to$ Shuttle 61% $\to$ Local Labs 76% completion).
6. **Constrained Intervention Optimizer**: Knapsack optimization maximizing care completion under finite operational budgets.
7. **Population Friction Map**: Geospatial visualization powered by OpenStreetMap identifying local barrier clusters.
8. **5-Stage Care Leakage Funnel**: Continuous Markov tracking from initial referral to long-term follow-up.
9. **Additive Barrier Attribution**: Decomposes total friction into an explainable point-by-point breakdown (no opaque black boxes).

---

## Architecture Overview

```mermaid
graph TD
    Client[React 18 + Vite SPA<br/>Zero-Auth Landing & Simulator] -->|REST JSON| API[Express.js Engine]
    API --> Intel[Core Intelligence Suite<br/>8D Friction | Markov Leakage | Knapsack Optimizer]
    API --> Providers[Pluggable Adapters<br/>Maps: OSM | AI: Deterministic/Ollama | Storage: Local]
    API --> DB[Storage Layer<br/>Default: Embedded JSON | Optional: Postgres / Mongo]
```

See [docs/architecture.md](./docs/architecture.md) for detailed architectural specifications.

---

## Quick Start

### ⚡ Local Development (Zero Docker, Zero SaaS)

PFIS includes an embedded relational JSON storage driver, running 100% offline out-of-the-box without requiring database servers or paid API keys.

```bash
# 1. Clone the repository
git clone https://github.com/satyamhq/Patient-Friction-Intelligence-System.git
cd Patient-Friction-Intelligence-System

# 2. Install dependencies
npm install

# 3. Start development servers
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173) (Instant public exploration without login!)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### 🐳 Docker Quick Start

To launch the complete containerized stack:

```bash
docker compose up -d
```

To stop:
```bash
docker compose down
```

---

## Public Demo & Exploration

PFIS strictly separates public exploration from internal organization portals:

- **Public Landing Page**: `/` — 8-dimension interactive slider, live what-if simulation, and architecture diagrams.
- **Interactive Simulator**: `/demo/simulator` — Counterfactual parameter testing and scenario comparison.
- **Population Intelligence**: `/demo` — Aggregate metrics and care leakage funnel.
- **API Reference**: `/api-docs` — Interactive OpenAPI 3.0 schema.
- **Operational Portals**: `/portals` — Role launchpad for Patient, Doctor, ASHA Worker, Hospital, and Health Authority workflows.

---

## Synthetic Data Pipeline

PFIS adheres to a **Synthetic Data First** principle. Zero Protected Health Information (PHI) is required or stored.

```bash
# Seed 500 deterministic synthetic patient journeys (Mulberry32 PRNG)
npm run seed:demo

# Reset database to initial state
npm run reset:demo
```

Explore synthetic fixtures in [`data/examples/`](./data/examples/) and documentation in [`data/README.md`](./data/README.md).

---

## Configuration

Create a `.env` file in the root or `server/` directory (see [`.env.example`](./.env.example)):

```bash
PORT=5000
NODE_ENV=development
APP_MODE=demo
DEMO_MODE=true

# Database: 'embedded' (default), 'postgres', or 'mongodb'
DB_MODE=embedded

# Pluggable Adapters: 100% free & open-source by default
MAP_PROVIDER=openstreetmap
AI_PROVIDER=deterministic
STORAGE_PROVIDER=local
STORAGE_LOCAL_DIR=./uploads
```

See [docs/configuration.md](./docs/configuration.md) for full options.

---

## Pluggable Providers & Local LLM Support

PFIS never locks you into paid proprietary APIs:

| Provider Type | Open-Source Default | Optional Local LLM | Optional Cloud SaaS |
|:---|:---|:---|:---|
| **Maps & Routing** | OpenStreetMap + Haversine | — | Google Maps API |
| **Barrier Synthesis** | Deterministic Math Engine | Ollama (`llama3.2`) | OpenAI API |
| **Artifact Storage** | Local Filesystem (`./uploads`) | MinIO S3 | AWS S3 |

### Using Local Offline Ollama
```bash
# In server/.env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

---

## API Specification

PFIS provides an OpenAPI 3.0 specification at [`openapi/openapi.yaml`](./openapi/openapi.yaml).

Core demo endpoints require zero authentication:
- `GET /api/health` — Health check and active providers
- `GET /api/demo/overview` — Population KPI aggregates
- `POST /api/demo/simulate` — What-if friction simulation
- `GET /api/demo/leakage` — 5-stage Markov care leakage funnel
- `GET /api/demo/friction-map` — Geospatial friction points

See [docs/api.md](./docs/api.md) for full documentation.

---

## Healthcare Operational Disclaimer

> **IMPORTANT:** The Patient Friction Intelligence System (PFIS) is an open-source research and operational decision-support prototype designed exclusively to model and measure non-clinical barriers (transportation, daily wage loss, digital literacy, documentation hurdles). All public demo datasets are synthetic. **PFIS does NOT provide clinical diagnoses, medical advice, or treatment recommendations.**

---

## Testing & Quality Assurance

```bash
# Run unit tests across all intelligence engines and adapters
npm test

# Run strict TypeScript typechecking
npm run typecheck

# Build frontend and backend production bundles
npm run build
```

---

## Contributing

We welcome contributions from researchers, software engineers, public health analysts, and UX designers! Please read our:
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)

---

## Project Roadmap

See [ROADMAP.md](./ROADMAP.md) for upcoming milestones, including FHIR R4 bundle exports, GTFS municipal transit feeds, and H3 hexagonal spatial indexing.

---

## License

This project is licensed under the [MIT License](./LICENSE).

*Historical Note: PFIS originated as a prototype developed during the Smart India Hackathon (SIH) 2026 and has since been transformed into an independent, general-purpose open-source health-access intelligence platform.*
