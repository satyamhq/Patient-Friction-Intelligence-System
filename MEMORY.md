# PFIS Project Memory & Architecture Context Bank
### Institutional Knowledge Ledger & Rebuild History (SIH 2026)

---

## 1. Core Mandate & Hackathon Alignment

- **Event**: Smart India Hackathon (SIH) 2026
- **Problem Statement**: "Accessibility and quality of public healthcare services, particularly in rural and underserved areas"
- **Platform Identity**: Patient Friction Intelligence System (PFIS) — an offline-first, layered public health continuity platform built to **strengthen, not replace**, existing government infrastructure (ABDM, e-Sanjeevani, HMIS).

---

## 2. Key Architectural Decisions (Rebuild Log)

### Decision 1: 5-Layer Layered System Architecture
- **Mandate**: Prohibit monolith collapse; enforce 5 distinct interoperable layers:
  1. *Layer 1*: Frontline Patient Access (PWA, ASHA Touch/Voice Portal, IndexedDB offline sync, IVR/USSD fallback).
  2. *Layer 2*: Digital Triage & Symptom Router (NHM/IMNCI rule-based clinical triage, 4-tier urgency classification, capability load router).
  3. *Layer 3*: Longitudinal Health Record (FHIR R4 compliance, ABHA 14-digit & QR generator/scanner, cross-facility patient timeline).
  4. *Layer 4*: Care Coordination Engine (Stateful referral tracking, high-risk defaulter recall engine for ANC/UIP/NCD, essential medicine stockout registry).
  5. *Layer 5*: Facility & Governance Dashboards (District CMO & State Health accountability telemetry, referral completion rates, defaulter closure rates).

### Decision 2: Multi-Engine Database Abstraction & MongoDB Atlas Primary
- Configured MongoDB Atlas cluster (`cluster0.vndyysc.mongodb.net`) via `MONGODB_URI` with embedded fallback for zero-dependency test execution.
- Native FHIR R4 JSON documents and repository interfaces ensure compatibility with both relational stores and document databases.

### Decision 3: Offline-First Client Architecture (Dexie + Mutation Queue)
- Frontend client uses Dexie.js (IndexedDB) for local data storage (`patients`, `triageAssessments`, `revisitTasks`, `syncQueue`).
- When network disconnects, mutations are queued locally with optimistic UI updates.
- Upon reconnection, `syncManager.ts` flushes queued operations to `POST /api/sync/flush`.

### Decision 4: Stateful Referral & Recall Engines
- Referrals are never static forms; they are stateful finite state machines (`initiated → accepted → in-transit → consulted → counter-referred`).
- High-risk recall engine continuously compares patient schedules against gestational age / infant age / refill dates and automatically dispatches prioritized tasks to the assigned ASHA worker.

---

## 3. Verified Demo Accounts & Credentials

| Role | Portal URL | Seeded Demo Persona | Default Password | Features Demonstrated |
|---|---|---|---|---|
| **ASHA Worker** | `/asha` | **Anita Devi** (Angara Block) | `Asha@123` | Offline Registration, Audio Triage, Defaulter Tasks |
| **PHC Doctor** | `/doctor` | **Dr. Alok Verma** (Angara PHC) | `Doctor@123` | OPD Queue, Longitudinal Timeline, Stateful Referral |
| **DH Specialist** | `/hospital/referrals` | **Dr. Meenakshi Roy** (Ranchi DH) | `Hospital@123` | Inbound Referrals, Bed Reservation, Counter-Referral |
| **System Admin** | `/admin` | **admin@pfis.org** | `Admin@123` | Referral Completion Rate, Defaulter Tracking, EDL Stocks |
| **Demo Patient** | `/patient` | **Sunita Devi** (Hesal Village) | `Patient@123` | ABHA Digital Card, Journey Timeline, Teleconsult Room |
