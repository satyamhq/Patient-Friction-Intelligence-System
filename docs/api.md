# REST API Reference

The PFIS API follows REST principles, accepts JSON payloads, and returns structured JSON responses.

For an interactive OpenAPI schema, explore the OpenAPI file at [`openapi/openapi.yaml`](../openapi/openapi.yaml) or visit the `/api-docs` route in the web interface.

---

## Base URLs
- **Local Dev**: `http://localhost:5000/api`
- **Container**: `http://localhost:5000/api`

---

## Core Endpoints

### 1. Health & Status
`GET /health`
Returns system status, active database engine, and enabled providers.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-09-24T18:00:00.000Z",
  "storage": "embedded-json",
  "aiProvider": "deterministic-rules",
  "mapProvider": "openstreetmap"
}
```

---

### 2. Public Demo Overview
`GET /demo/overview`
Returns high-level population aggregate statistics without requiring authentication.

**Response:**
```json
{
  "totalPatients": 500,
  "avgFrictionScore": 44.8,
  "highFrictionCohortPercent": 28.5,
  "predictedCompletionRate": 52.4,
  "topBarriers": [
    { "name": "Transit Distance", "friction": 68.2, "share": "31%" },
    { "name": "Wage Loss Burden", "friction": 54.1, "share": "24%" }
  ]
}
```

---

### 3. Simulation Engine
`POST /demo/simulate`
Simulates friction scores, care completion estimates, and intervention recommendations for arbitrary demographic and logistics parameters.

**Request Payload:**
```json
{
  "distanceKm": 24,
  "transportScore": 30,
  "costBurden": 65,
  "digitalLiteracy": 25,
  "languageBarrier": 40,
  "familySupport": 35,
  "documentationAvailable": false,
  "appointmentTimingScore": 45
}
```

**Response:**
```json
{
  "frictionScore": 72.4,
  "frictionTier": "HIGH",
  "careCompletionEstimate": 28.6,
  "dominantBarriers": [
    "Distance & Transit Infrastructure",
    "Direct & Lost Opportunity Costs",
    "Missing Documentation"
  ],
  "recommendedInterventions": [
    {
      "title": "Community Shuttle Subsidy",
      "expectedFrictionReduction": 18.5,
      "category": "transit"
    }
  ]
}
```

---

### 4. Markov Care Leakage Funnel
`GET /demo/leakage`
Calculates step-by-step patient attrition across the 5 core milestones of a healthcare journey:
1. Referral
2. Consultation
3. Diagnostics
4. Treatment
5. Follow-up

**Response:**
```json
{
  "cohortSize": 500,
  "overallCompletionRate": 41.2,
  "funnel": [
    {
      "stage": "Referral",
      "incoming": 500,
      "completed": 460,
      "dropped": 40,
      "dropRatePercent": 8.0,
      "primaryFrictionDrivers": ["Documentation", "Awareness"]
    },
    {
      "stage": "Consultation",
      "incoming": 460,
      "completed": 380,
      "dropped": 80,
      "dropRatePercent": 17.4,
      "primaryFrictionDrivers": ["Travel Time", "Clinic Wait Time"]
    }
  ]
}
```

---

### 5. Population Geospatial Points
`GET /demo/friction-map`
Fetches geographic coordinates and friction intensity points formatted for OpenStreetMap / Leaflet layers.
