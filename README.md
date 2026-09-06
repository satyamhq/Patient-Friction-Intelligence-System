# Patient Friction Intelligence System (PFIS)

> **An integrated care-access and quality intelligence layer for public healthcare, especially rural and underserved communities.**  
> *Smart India Hackathon (SIH) 2026 | National Health Mission & Ayushman Bharat Digital Mission (ABDM) Aligned*

---

## 💡 The Core Innovation

Traditional healthcare management systems ask only:
> *"Is healthcare available?"* (Do we have a doctor, a clinic, and medicines?)

PFIS asks the missing, high-impact question:
> **"Can this patient practically navigate and complete the healthcare journey?"**

```
Traditional Healthcare View:
Patient ──> Disease ──> Doctor ──> Hospital ──> Treatment

Patient Friction Intelligence View:
Patient ──> Medical Need + Travel + Cost + Transport + Digital Access + Language + Documentation + Family Support 
        ──> Can this patient actually complete care?
```

**One-Line Innovation Statement:**
> *We model the invisible, non-clinical barriers that cause a patient's healthcare journey to fail, then simulate practical interventions to identify the most cost-effective way to remove those barriers with limited public-health resources.*

---

## 🧠 9 Core Intelligence Features

| # | Feature | Operational Capability |
|---|---|---|
| **1** | **Patient Friction Fingerprint** | Multi-dimensional scoring across 8 non-clinical barriers: Travel Distance, Transport, Digital Literacy, Language, Family Support, Documentation/Identity, Cost, and Appointment Timing. |
| **2** | **Friction Interaction Engine** | Evaluates compounding barrier amplification (e.g., transport deficit + lack of caregiver creates superlinear care dropout risk). |
| **3** | **Care Failure Risk** | Computes the non-clinical probability (0–100%) that a patient will drop out before completing their prescribed care regimen. |
| **4** | **Friction Digital Twin** | Virtual patient model mirroring real-world barriers for counterfactual scenario analysis. |
| **5** | **What-If Intervention Simulator** | Real-time decision support simulating policy interventions (e.g., Community Shuttle + Local Diagnostics improving care completion from 37% → 60% → 82%). |
| **6** | **Intervention Optimizer** | Budget-constrained resource allocation (knapsack algorithm) prioritizing maximum lives saved and highest barrier reduction per rupee spent. |
| **7** | **Population Friction Map** | Geographic heatmap of rural administrative blocks identifying localized dominant friction types (e.g., Transport in Block A vs. Diagnostics in Block B). |
| **8** | **Care Leakage Funnel** | Tracks 5-stage patient attrition: `Referral` → `Consultation` → `Diagnostics` → `Treatment` → `Follow-up`. |
| **9** | **"Why Did Care Fail?" Engine** | Post-dropout root-cause attribution quantifying non-clinical causes (e.g., 36% Transport, 21% Timing, 17% Diagnostic Delays). |

---

## 🏛️ Interoperable 5-Layer Public Healthcare Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│              LAYER 1: FRONTLINE PATIENT ACCESS (OFFLINE-FIRST)          │
│  Progressive Web App (PWA) • Dexie.js IndexedDB Sync • Multilingual UI  │
├─────────────────────────────────────────────────────────────────────────┤
│              LAYER 2: CLINICAL DIGITAL TRIAGE & DECISION ROUTER         │
│  IMNCI Pediatric (<5y) • Maternal High-Risk Flags • Urgency Router     │
├─────────────────────────────────────────────────────────────────────────┤
│              LAYER 3: LONGITUDINAL HEALTH CONTINUITY BACKBONE           │
│  FHIR R4 Schemas • 14-Digit ABHA ID & Cryptographic QR Verification     │
├─────────────────────────────────────────────────────────────────────────┤
│              LAYER 4: CROSS-FACILITY CARE COORDINATION                  │
│  Stateful Referral Tracking • Automated Recall for High-Risk Defaulters │
├─────────────────────────────────────────────────────────────────────────┤
│              LAYER 5: FACILITY & GOVERNMENT POPULATION INTELLIGENCE     │
│  What-If Policy Simulator • Care Leakage Funnel • Friction Heatmaps     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 6 Dedicated Role Portals & Verified Demo Credentials

| Role | Portal Path | Preloaded Account | Password | Primary Key Capabilities |
|---|---|---|---|---|
| **System Admin** | [`/admin`](http://localhost:5173/admin) | `admin@pfis.org` | `Admin@123` | System telemetry, immutable audit trails, institutional user provisioning, isolation enforcement. |
| **Doctor** | [`/doctor`](http://localhost:5173/doctor) | `doctor@pfis.org` | `Doctor@123` | OPD queue, clinical tele-triage, prescription pad, stateful cross-facility referral initiation. |
| **ASHA Worker** | [`/asha`](http://localhost:5173/asha) | `asha@pfis.org` | `Asha@123` | Touch-friendly village roster, doorstep visit logger, audio-assisted triage wizard, ANC recall. |
| **Government** | [`/government`](http://localhost:5173/government) | `government@pfis.org` | `Gov@123` | Macro district health index, What-If simulator, care leakage funnel, block barrier heatmaps. |
| **Hospital Desk** | [`/hospital`](http://localhost:5173/hospital) | `hospital@pfis.org` | `Hospital@123` | Inbound referral reception, bed reservations, ABHA lookup, cross-facility counter-referrals. |
| **Patient** | [`/patient`](http://localhost:5173/patient) | `patient@pfis.org` | `Patient@123` | 5-stage care journey, friction radar, nearest verified PHC locator, teleconsultation launcher. |

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (Node 20 Recommended)
- **MongoDB**: MongoDB Atlas (URI configured) or local MongoDB instance

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/satyamhq/PFIS-Patient-Friction-Intelligence-System.git
cd PFIS-Patient-Friction-Intelligence-System

# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 3. Run Development Servers
```bash
# From the project root:
npm run dev

# Or independently:
# Terminal 1 (Backend API):
cd server && npm run dev

# Terminal 2 (Frontend Client):
cd client && npm run dev
```

* **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)
* **API Health Telemetry**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Comprehensive Verification Suites (88/88 Tests Passed)

### Test Suite 1: Full Rebuild & 500 Synthetic Cohort Verification
```bash
cd server
npm test
```
* **Result**: 16/16 Passed (100%)
* Verifies 500+ Patients, Friction Profiles, Risks, Journeys, 120 Referrals, Admin Isolation, Triage Engine, Defaulter Recalls, and ABDM/ABHA QR generation.

### Test Suite 2: Exhaustive End-to-End Live HTTP Audit
```bash
cd server
node tests/e2e_exhaustive_audit.js
```
* **Result**: 72/72 Passed (100%)
* Tests all 13 core operational workflows via live HTTP network requests against running services.

### Test Suite 3: Production Builds
```bash
# Server production build
cd server && npm run build    # Exit 0 (Strict TypeScript compilation)

# Client production build
cd ../client && npm run build  # Exit 0 (2,457 modules transformed, ~355 kB shell)
```

---

## 🔒 Security & Compliance

- **Role Isolation Rule**: The `admin` role is strictly quarantined from public registration and Google OAuth onboarding. Attempted privilege self-escalation is intercepted with `403 Forbidden` and audited to security ledgers.
- **Rate Limiting**: Specialized brute-force rate limiter (`authLimiter`) on authentication routes (60 requests / 15 minutes).
- **ABDM Compliance**: Generates standard 14-digit ABHA tokens with cryptographic HMAC-SHA256 signatures for QR scanning.
- **Audit Logging**: Immutable audit logs capturing user actions (`AUTH_LOGIN`, `AUTH_LOGOUT`, `PATIENT_PROFILE_UPDATED`, `REFERRAL_INITIATED`).

---

## 📄 License & Acknowledgements

Built for the **Smart India Hackathon (SIH) 2026** to empower rural and underserved communities across India through data-driven, non-clinical operational intelligence.
