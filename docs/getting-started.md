# Getting Started with PFIS

The **Patient Friction Intelligence System (PFIS)** is an open-source platform for measuring, modeling, and simulating non-clinical barriers that prevent patients from completing healthcare journeys.

---

## Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- *(Optional)* **Docker & Docker Compose**: For containerized deployment
- *(Optional)* **Ollama**: For local offline LLM integration

---

## ⚡ 60-Second Quick Start (No Docker Required)

PFIS is designed to run **local-first** with zero external dependencies required out of the box. An embedded relational store is included by default.

### 1. Clone the Repository
```bash
git clone https://github.com/satyamhq/Patient-Friction-Intelligence-System.git
cd Patient-Friction-Intelligence-System
```

### 2. Install Dependencies
```bash
# Installs root, client, and server dependencies
npm install
```

### 3. Start Development Servers
```bash
npm run dev
```

This starts:
- **Backend API**: `http://localhost:5000` (with mock/embedded JSON storage)
- **Frontend SPA**: `http://localhost:5173` (Vite dev server)

Open [http://localhost:5173](http://localhost:5173) in your browser to immediately explore the landing page and public demo without logging in!

---

## 🐳 Quick Start with Docker Compose

If you prefer running in isolated containers:

```bash
# Start backend, frontend, and PostgreSQL services
docker compose up -d

# Check service logs
docker compose logs -f
```

Access:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- API Health: `http://localhost:5000/api/health`

To shut down:
```bash
docker compose down
```

---

## 🎲 Seeding Synthetic Data

To generate and seed fresh synthetic cohorts (500 patients, 10 hospitals, 200 referrals, leakage funnel):

```bash
# Seed 500 deterministic synthetic patient journeys
npm run seed:demo

# Reset database to clean initial state
npm run reset:demo
```

---

## 🧭 Public vs. Operational Exploration

PFIS provides two distinct modes:

1. **Public Exploration (Zero Auth)**:
   - Landing Page: `/`
   - Public Interactive Demo: `/demo`
   - What-If Scenario Simulator: `/demo/simulator`
   - System Architecture: `/architecture`
   - Interactive API Spec: `/api-docs`

2. **Operational Role Portals**:
   - Access the role launchpad at `/portals`
   - Explore specialized workflows for Patients, Doctors, ASHA Community Health Workers, Facility Administrators, and District Health Authorities.

---

## Next Steps

- Read [Architecture Overview](./architecture.md)
- Learn about the [Friction & Intelligence Engines](./intelligence-engine.md)
- Configure [Environment Variables](./configuration.md)
