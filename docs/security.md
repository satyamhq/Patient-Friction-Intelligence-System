# Security & Privacy Policy

## Healthcare Operational Mandate

PFIS is an **operational research and decision-support prototype** for measuring non-clinical barriers (transportation, lost wages, digital divide, administrative steps) that impede healthcare access.

- **Non-Clinical Guarantee**: PFIS algorithms do not evaluate symptoms, determine medical prognoses, suggest therapeutic protocols, or replace licensed clinicians.
- **Zero Real PHI**: The public demonstration and default local datasets are **100% synthetic**. Never input real, unredacted patient medical records into a public PFIS instance.

---

## Technical Security Architecture

1. **Local-First & Offline Resilience**:
   - Zero telemetry tracking scripts (no Google Analytics, Hotjar, or third-party trackers).
   - Pluggable offline adapters (OpenStreetMap tiles and local Ollama LLMs).
2. **CORS & Rate Limiting**:
   - Express server enforces strict CORS origin policies.
   - Rate limiting middleware safeguards API endpoints from denial-of-service abuse.
3. **Data Sanitization & Authentication Boundaries**:
   - Public exploration routes (`/api/demo/*`) are isolated from operational portals.
   - Password hashing utilizes modern `bcrypt` algorithms.
   - Token issuance leverages signed JSON Web Tokens (JWT) with configurable expiration.

---

## Reporting a Security Vulnerability

If you discover a security vulnerability within the PFIS repository:

1. **Do not disclose it publicly** via GitHub issues.
2. Email the maintainers at `security@satyamhq.org` (or open a confidential GitHub Advisory).
3. Include detailed reproduction steps and an impact assessment.
4. The maintainers will respond within 48 hours and coordinate a coordinated security patch.
