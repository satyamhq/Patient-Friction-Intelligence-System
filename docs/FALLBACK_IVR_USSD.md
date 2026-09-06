# PFIS: Zero-Connectivity & Feature-Phone Access Architecture
### Layer 1 Non-Clinical Fallback Specification (IVR & USSD Gateways)

In rural and remote tribal habitations of India where smartphones, high-speed 4G/5G, and digital literacy are absent, the **Patient Friction Intelligence System (PFIS)** deploys an interoperable, zero-data fallback path using **Toll-Free Interactive Voice Response (IVR)** and **Unstructured Supplementary Service Data (USSD `*99#` style shortcodes)**.

---

## 1. Architectural Topology

```mermaid
graph TD
    A[Feature Phone User / Rural Patient] -->|Toll-Free Dial 1800-XXX-PFIS| B[Telecom TSP Gateway (Airtel/BSNL/Jio)]
    A -->|USSD Shortcode *139*7347#| B
    B --> C[PFIS Voice & Telephony Telephony Broker (Asterisk / Kaleyra / Exotel)]
    C --> D[Bhashini Multilingual Speech Engine (ASR / TTS)]
    D --> E[PFIS Core Triage & Coordination Engine]
    E --> F[SMS Gateway (MSG91 / CDAC National Mobile Service)]
    F -->|Instant SMS Token / Booking Voucher| A
```

---

## 2. Interactive Voice Response (IVR) Fallback Journey

- **Toll-Free Dial-in**: Patient dials `1800-180-7347` (Free across BSNL, Airtel, Jio, Vi).
- **Language Detection**:
  - *"हिन्दी के लिए 1 दबाएं"*
  - *"সাঁওতালি বা বাংলার জন্য 2 টিপুন"*
  - *"Press 3 for English"*
- **Symptom Triage (Dual-Tone Multi-Frequency DTMF + Voice Recognition via Bhashini)**:
  - **Press 1**: गर्भवती महिला स्वास्थ्य सहायता (Maternal ANC / Danger Signs)
  - **Press 2**: 5 वर्ष से कम बच्चे का टीकाकरण या बीमारी (Child Health & Immunization)
  - **Press 3**: सुगर, बीपी या नियमित दवा समाप्त (Diabetes/Hypertension Medicine Refill)
  - **Press 9**: 🚨 आपातकालीन एम्बुलेंस 108 सहायता (Direct 108 Escalation)
- **Automatic OPD Token Issuance**:
  - Telephony engine reserves a digital token at the patient's nearest Sub-Centre or PHC based on caller cell-tower location.
  - Returns a synthesized audio confirmation and triggers an instant vernacular SMS:
    > *"नमस्ते Sunita Devi, Angara PHC में आपका टोकन #104 सुरक्षित है। बुधवार सुबह 9:30 बजे डॉक्टर उपस्थित रहेंगे। - PFIS/NHM"*

---

## 3. USSD Fallback (`*139*7347#` GSM Channel)

For areas with intermittent 2G GSM cellular voice channels where even voice calls drop:
1. Patient dials `*139*7347#`.
2. Interactive menu appears directly on handset screen (zero internet required):
   ```
   PFIS Health Access
   1. Check OPD Token
   2. Medicine Stock at Nearest PHC
   3. Request ASHA Visit
   4. Emergency 108 Alert
   ```
3. Patient selects `2` -> Enters PIN code `835103` -> Screen displays:
   ```
   Angara PHC Stock Status:
   - Paracetamol: In Stock
   - IFA Tablets: In Stock
   - Metformin: STOCKOUT (Visit Silli CHC)
   ```

---

## 4. Frontline Synchronization with ASHA App

When an IVR or USSD call is placed from a village:
1. The backend event queue checks the caller's mobile number against registered ABHA records.
2. An asynchronous dispatch is pushed to the assigned ASHA worker's offline queue (`AshaDashboard`).
3. If an emergency red flag is detected over the phone, the system triggers automated simultaneous SMS alerts to the local 108 Ambulance dispatch desk and the village ASHA worker.
