# PFIS Enterprise Scaling & Production Architecture Guide
**From Pilot Prototype to National-Scale Public Health Infrastructure (10K to 1M+ Users)**

---

## 1. Architectural Scaling Milestones

```
   Phase 1: District Pilot (10K Users)
   ┌───────────────────────────────────────────────┐
   │ Monolith Node.js/Express + Single MongoDB Pod │
   │ Client: Vite PWA + IndexedDB (Dexie.js)       │
   └───────────────────────────────────────────────┘
                          │
                          ▼
   Phase 2: State Expansion (100K - 500K Users)
   ┌───────────────────────────────────────────────┐
   │ Load-Balanced Express Cluster (PM2 / K8s)    │
   │ Redis Sentinel Cache (OPD Queue / Tokens)     │
   │ MongoDB Atlas Replica Set (1 Primary, 2 Read) │
   │ Background Workers for Recall & Sync Outbox   │
   └───────────────────────────────────────────────┘
                          │
                          ▼
   Phase 3: National Scale (1M+ Users)
   ┌───────────────────────────────────────────────┐
   │ District-Sharded Database Clusters            │
   │ Apache Kafka Event Streaming (Care Journeys)  │
   │ Microservices: Triage, Consent, Teleconsult   │
   │ Multi-Region CDN with Edge PWA Asset Delivery │
   └───────────────────────────────────────────────┘
```

---

## 2. Scalability Across the 5 Layers

### Layer 1: Frontline Patient Access & Low-Bandwidth Networks
- **Offline-First Resilience**: All frontline registrations, surveys, and barrier assessments are written locally to IndexedDB via Dexie.js. 
- **Delta-Sync Protocol**: Frontline ASHA tablets sync using timestamp-based cursor queries (`/api/sync/flush` with `lastSyncTimestamp`), reducing payload size by over 95%.
- **Edge Static Caching**: Cloudflare / AWS CloudFront caching PWA micro-chunks so frontline workers load the application instantly even on 2G edge networks.

### Layer 2: Clinical Digital Triage & Routing Engine
- **Deterministic Rule Execution**: The `ClinicalTriageEngine` is stateless and CPU-efficient ($O(1)$ lookup across IMNCI, maternal ANC, and cardiovascular acute protocols).
- **Facility Capacity Router**: PHC and hospital bed counts and doctor availability tokens are cached in Redis with a 30-second TTL, avoiding database lookups during mass casualty or emergency triage spikes.

### Layer 3: Longitudinal Health Record & ABDM/ABHA Backbone
- **Interoperability**: Strict adherence to FHIR R4 resources (`FHIRPatient`, `FHIREncounter`, `FHIRCondition`, `FHIRServiceRequest`).
- **Cryptographic Signatures**: ABHA QR payloads are signed with SHA-256 HMAC tokens, enabling offline verification by district hospital scanning terminals without round-trip network latency.

### Layer 4: Care Coordination & High-Risk Defaulter Recall
- **State Machine Integrity**: Stateful cross-facility referrals (`initiated` $\rightarrow$ `accepted` $\rightarrow$ `in-transit` $\rightarrow$ `consulted` $\rightarrow$ `counter-referred`) use database transactions to prevent race conditions.
- **Asynchronous Protocol Engine**: High-risk defaulter scans (detecting missed ANC visits and child immunizations) run as detached asynchronous cron jobs at off-peak hours (02:00 AM) or via Kafka event triggers when an appointment passes without a consultation note.

### Layer 5: Governance Telemetry & Macro Heatmaps
- **Pre-Aggregated Materialized Views**: District and block friction aggregates are maintained in pre-aggregated hourly summary buckets, allowing government dashboards to render heatmaps and leakage funnels in sub-50ms without full-table table scans.

---

## 3. Security, Privacy & DISHA / ABDM Compliance

1. **Role-Based Access Control (RBAC)**:
   - 6 isolated roles: `patient`, `hospital`, `doctor`, `asha`, `government`, `admin`.
   - **Admin Role Isolation**: Self-assignment or public onboarding to the `admin` role is strictly rejected with `403 Forbidden` and security audit alerts.
2. **Audit Logging**:
   - Every read, write, referral status transition, and consent grant is recorded in `audit_logs` with actor ID, IP address, timestamp, and modified fields.
3. **Data Protection & Encryption**:
   - TLS 1.3 in transit.
   - AES-256 at rest for patient demographics and clinical history.
   - Purposive, time-bound consent grants under ABDM specifications.

---

## 4. Production Deployment & Monitoring Checklist

- [x] Dockerfile multi-stage build tested.
- [x] Docker Compose local orchestration verified.
- [x] Rate limiting active on authentication endpoints (`express-rate-limit`).
- [x] System health endpoint (`/api/health`) provides live memory, uptime, and database telemetry.
- [x] Automated test suite passing with 100% assertions against live MongoDB cluster.
