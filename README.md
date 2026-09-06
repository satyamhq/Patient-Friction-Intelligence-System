# Patient Friction Intelligence System (PFIS)
### Non-Clinical Healthcare Accessibility Portal & Operational System

PFIS is a specialized **non-clinical healthcare accessibility platform** designed to help vulnerable, elderly, and rural patients identify and navigate operational access barriers—including travel distance, lack of transport, low digital literacy, vernacular language hurdles, documentation readiness, caregiver constraints, and daily wage timing.

> **CRITICAL NON-CLINICAL MANDATE:**
> PFIS strictly analyzes **operational, geographic, and accessibility friction**.
> - It does **NOT** diagnose diseases.
> - It does **NOT** predict medical outcomes or provide clinical prognoses.
> - It does **NOT** recommend prescription drugs or medical treatments.
> - It does **NOT** replace certified doctors or medical professionals.

---

## Technology Stack

- **Frontend (`client/`)**:
  - React 18 & Vite (TypeScript)
  - Tailwind CSS & Lucide React Icons
  - Multilingual Engine (11 Indian Vernacular Languages: English, Hindi, Bengali, Marathi, Tamil, Telugu, Gujarati, Kannada, Malayalam, Punjabi, Urdu)
  - WCAG 2.1 Accessibility Toolbar (Text Size scaling, High Contrast mode, Simple Language toggle, Voice Assistance TTS, Reduce Motion)
  - Real-time Map Navigation (OpenStreetMap, Esri Satellite, and Direct Google Maps GPS Turn-by-Turn routing)

- **Backend (`server/`)**:
  - Node.js & Express.js (REST APIs)
  - Clean Database Abstraction Layer (`IDatabaseClient` supporting PostgreSQL, MySQL, and Embedded Relational SQL for zero-config local testing)
  - **Zero MongoDB**: Mongoose and MongoDB dependencies have been completely removed.
  - Role-Based Access Control (Patient, Hospital Staff, Admin)
  - Google OAuth & Email/Password Authentication (Bcrypt + JWT)

---

## Relational Database Architecture

The system utilizes 13 relational tables with foreign keys and indexes:
1. `users` — User authentication, credentials, and roles
2. `patient_profiles` — Socio-geographic and non-clinical access determinants
3. `hospitals` — Verified healthcare facilities, bed counts, emergency status
4. `hospital_services` — Departments, daily token capacity, available seats
5. `appointments` — OPD token scheduling and queue status
6. `teleconsultations` — Remote navigation sessions and room identifiers
7. `friction_profiles` — Explainable non-clinical friction scores (0–100)
8. `friction_factors` — Decomposed operational barrier factors
9. `accessibility_risks` — Risk severity and mitigation pathways
10. `requests` — Transit, escort, and appointment access inquiries
11. `documents` — Patient Document Vault (ID proofs, referral slips)
12. `notifications` — Real-time operational status alerts
13. `audit_logs` — Activity tracking and compliance auditing

---

## Quick Start & Local Run Instructions

### 1. Installation

From the project root:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Create or inspect `.env` in the root or `server/`:
```env
PORT=5000
DATABASE_TYPE=auto

# Optional: To connect to PostgreSQL:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pfis
# Optional: To connect to MySQL:
# DATABASE_URL=mysql://root:password@localhost:3306/pfis

JWT_SECRET=pfis_super_secure_jwt_secret_key_2026_sih
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*Note: If no external PostgreSQL or MySQL database is running, PFIS automatically launches its high-performance Embedded Relational SQL engine with zero setup required.*

### 3. Running the Application

From the root folder:
```bash
# Start both backend API and frontend concurrently:
npm run dev
```
Or start individually:
```bash
# Terminal 1 (Backend API - http://localhost:5000):
cd server && npm run dev

# Terminal 2 (Frontend Client - http://localhost:5173):
cd client && npm run dev
```

---

## Verified Demo Credentials

| Role | Email | Password | Access / Features |
| :--- | :--- | :--- | :--- |
| **Executive Admin** | `dhirajkumar464748@gmail.com` | `Admin@123` | Full Intelligence Dashboard, Friction Heatmaps, Leakage Analytics |
| **System Admin** | `admin@pfis.org` | `Admin@123` | System Audit, Patient Directory, Hospital Registry |
| **Demo Patient** | `patient@pfis.org` | `Patient@123` | Sunita Devi (60, Rural, 65km, Bus, Caregiver Constrained) |
| **Hospital Staff** | `staff@hospital.org` | `Hospital@123` | Request Queue, Token Management, Ambulance & Escort Status |

---

## Key Non-Clinical Features

1. **Digital Twin Simulator**:
   Interactive 7-stage patient journey simulation (Find Hospital -> Travel -> Registration -> Appointment -> Consultation -> Documentation -> Follow-up) displaying stage difficulty, real-time barriers, and actionable interventions.

2. **Explainable Friction Engine**:
   Transparent, rule-based 0–100 scoring based on distance, transportation reliability, digital literacy, caregiver support, wage loss timing, language comprehension, and documentation readiness.

3. **Live Nearby Hospital Locator**:
   Discovers verified nearby hospitals using live GPS coordinates, displays OPD token capacity, bed availability, ambulance ETA, and provides direct turn-by-turn **Google Maps Directions**.

4. **Accessibility Toolbar (WCAG 2.1)**:
   Floating control on every page providing:
   - Text Size (Normal 100%, Large 112%, Extra Large 125%)
   - High Contrast mode
   - Simple Language Mode (removes jargon)
   - Voice Assistance (Text-to-Speech)
   - Reduced Motion mode
