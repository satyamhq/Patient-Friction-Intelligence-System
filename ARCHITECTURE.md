# PFIS Technical Architecture & System Design
### Open-Source Platform for Modeling, Measuring, and Simulating Non-Clinical Healthcare Access Friction

---

## 1. Executive Summary & Core Mandate

The **Patient Friction Intelligence System (PFIS)** is an open-source platform for measuring, modeling, visualizing, and simulating non-clinical barriers (transit deficits, lost daily wages, digital illiteracy, documentation hurdles) that prevent patients from completing healthcare journeys.

### Guiding Architectural Principles
1. **Strengthen Longitudinal Continuity**: Support care workflows from community outreach to primary health centres and referral hospitals.
2. **Local-First & Offline Resilience**: Operate without mandatory internet connectivity, external SaaS accounts, or cloud API keys.
3. **Pluggable Provider Architecture**: Mapping, AI, and storage are isolated behind clean TypeScript adapter interfaces (`IMapProvider`, `IAIProvider`, `IStorageProvider`).
4. **Deterministic & Explainable Intelligence**: All scoring calculations, nonlinear compounding effects, and attribution models use deterministic, inspectable mathematics.
5. **Privacy & Synthetic Data Safety**: Public demos and testing pipelines use 100% synthetic cohorts. Real PHI is never required for aggregate non-clinical friction modeling.
6. **Zero Authentication Wall for Exploration**: The public landing page, interactive simulator, and API explorer are accessible without an account.

---

## 2. Solution Architecture

```mermaid
graph TD
    subgraph "Frontend Layer (React 18 + Vite + Tailwind)"
        F1[Public Landing & Live Friction Slider]
        F2[Interactive What-If Simulator]
        F3[Geospatial Friction Map (OpenStreetMap / Leaflet)]
        F4[Operational Role Portals: Patient / Doctor / ASHA / Admin]
    end

    subgraph "API Transport & Gateways (Express.js + TypeScript)"
        API1[Public Demo Endpoints /api/demo/* (Zero Auth)]
        API2[Operational Endpoints /api/* (JWT / Role Auth)]
        API3[OpenAPI 3.0 Documentation Explorer]
    end

    subgraph "Core Intelligence Suite (server/src/intelligence/)"
        I1[8D Friction Fingerprint Engine]
        I2[Nonlinear Interaction Compounding Engine]
        I3[Markov Care Leakage Funnel Engine]
        I4[Constrained Knapsack Intervention Optimizer]
        I5[Additive Barrier Attribution & Explainability Engine]
        I6[Patient Digital Twin Simulator]
    end

    subgraph "Pluggable Provider Adapters (server/src/providers/)"
        P1[Map: OpenStreetMap / Nominatim (Default) | Google Maps]
        P2[AI: Deterministic Rules (Default) | Ollama | OpenAI]
        P3[Storage: Local Filesystem (Default) | S3 / MinIO]
    end

    subgraph "Persistence & Storage Layer"
        D1[Embedded SQL JSON Store (Zero Setup Default)]
        D2[PostgreSQL (Relational Multi-User Profile)]
        D3[MongoDB (Document Store Profile)]
    end

    F1 & F2 & F3 -->|REST JSON| API1
    F4 -->|REST JSON with JWT| API2
    API1 & API2 --> I1 & I2 & I3 & I4 & I5 & I6
    API1 & API2 --> P1 & P2 & P3
    API1 & API2 --> D1 & D2 & D3
```

---

## 3. Pluggable Provider Architecture

PFIS strictly isolates third-party integrations:

### Map Provider (`server/src/providers/maps/`)
- **Default**: `OpenStreetMapProvider` provides open tiles and haversine geodesic calculation. No external billing required.
- **Optional**: `GoogleMapsProvider` can be activated via `MAP_PROVIDER=google` and `GOOGLE_MAPS_API_KEY`.

### AI Provider (`server/src/providers/ai/`)
- **Default**: `DeterministicAIProvider` provides 100% offline, explainable rule-based synthesis.
- **Local LLM**: `OllamaProvider` connects to local Ollama instances (`http://localhost:11434`) running open weights like `llama3.2`.
- **Optional Cloud**: `OpenAIProvider` can be activated via `AI_PROVIDER=openai`.

### Storage Provider (`server/src/providers/storage/`)
- **Default**: `LocalStorageProvider` saves uploaded artifacts to the local filesystem (`./uploads`).
- **Object Store**: `S3MinioProvider` enables S3-compatible object storage for production clusters.

---

## 4. Multi-Engine Intelligence Suite

All modules in `server/src/intelligence/` are purely functional, deterministic, and independently testable:

1. **`frictionEngine.ts`**: Computes weighted friction across 8 socio-demographic and logistics dimensions.
2. **`interactionEngine.ts`**: Applies quadratic interaction multipliers to model compounding barriers.
3. **`failureRiskEngine.ts`**: Calculates care abandonment hazard via a calibrated logistic response function.
4. **`careLeakageEngine.ts`**: Tracks cohort attrition across the 5-stage care continuum (Referral $\to$ Consultation $\to$ Diagnostics $\to$ Treatment $\to$ Follow-up).
5. **`knapsackOptimizer.ts`**: Solves the 0/1 knapsack resource allocation problem for operational interventions under a fixed budget.
6. **`barrierAttributionEngine.ts`**: Decomposes total friction into an explainable point-by-point narrative.
7. **`patientDigitalTwinEngine.ts`**: Runs counterfactual scenario simulations against demographic profiles.

---

## 5. Security & Healthcare Governance

- **Non-Clinical System**: PFIS explicitly models operational and non-clinical access friction. It does not provide clinical diagnosis or therapeutic prescriptions.
- **Synthetic Data**: Public demonstrations and test suites utilize seeded synthetic datasets. Real Protected Health Information (PHI) is strictly avoided in public instances.
