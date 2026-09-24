# Frequently Asked Questions (FAQ)

### 1. What problem does PFIS solve?
Healthcare systems frequently focus on clinical diagnostics and physical facility availability. However, up to 40% of patients fail to complete prescribed care due to **non-clinical friction**: distance, lack of transport, lost daily wages, documentation hurdles, and digital illiteracy. PFIS quantifies, models, and simulates these friction barriers.

---

### 2. Is PFIS a clinical medical diagnosis tool?
**No.** PFIS is explicitly an operational logistics, health-access research, and decision-support prototype. It does not diagnose diseases, predict clinical outcomes, or prescribe medications.

---

### 3. Do I need an OpenAI or Google Maps API key to run PFIS?
**No.** PFIS is 100% self-contained and local-first.
- Mapping uses OpenStreetMap tiles and internal geodesic calculation.
- AI intelligence uses deterministic, mathematical rule-based scoring.
- If desired, you can optionally connect a local offline LLM via Ollama or plug in cloud providers via adapter interfaces.

---

### 4. Can I run PFIS without Docker?
**Yes.** Running `npm install` followed by `npm run dev` starts the complete system with an embedded relational JSON store. No Docker daemon, PostgreSQL server, or MongoDB instance is required for local exploration.

---

### 5. Does the public demo require signing up or logging in?
**No.** Public exploration (`/`, `/demo`, `/demo/simulator`, `/architecture`, `/api-docs`) is completely authentication-free. Operational clinical and administrative portals are segregated under `/portals` for organizations deploying authenticated staff workflows.

---

### 6. What database does PFIS use?
PFIS includes a multi-driver database layer supporting:
1. **Embedded JSON Relational Store** (Default, zero-setup)
2. **PostgreSQL** (Recommended for scalable multi-user self-hosting)
3. **MongoDB** (Supported for document-centric workflows)
