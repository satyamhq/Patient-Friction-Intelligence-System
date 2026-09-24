# PFIS Project Roadmap

This roadmap outlines planned capabilities and architectural milestones for the Patient Friction Intelligence System.

---

## 🎯 Milestone 1: Open-Source Foundation (Completed v2.1.0)
- [x] Zero-auth public landing page and interactive simulator
- [x] Elimination of mandatory SaaS/paid dependencies (Google Maps, OpenAI)
- [x] Pluggable provider architecture (`server/src/providers/`)
- [x] 100% deterministic intelligence engine suite with unit tests
- [x] 500-patient synthetic cohort generator with Mulberry32 PRNG
- [x] Local-first embedded relational storage mode
- [x] Separation of public exploration from operational role portals

---

## 🚀 Milestone 2: Interoperability & Local AI (v2.2.0)
- [ ] Direct offline integration with Ollama for automated narrative synthesis
- [ ] Export synthetic cohorts to FHIR R4 Bundle format
- [ ] GTFS (General Transit Feed Specification) import adapter for real municipal bus route friction
- [ ] Client-side caching of OpenStreetMap vector tiles for offline air-gapped field deployments

---

## 🌐 Milestone 3: Macro Population Modeling (v2.3.0)
- [ ] Geospatial clustering using H3 hexagonal hierarchical spatial index
- [ ] Multi-facility referral network equilibrium simulation
- [ ] Integration with open-source demographic census data loaders
- [ ] Micro-frontend modularization for independent role portal packaging

---

## 🤝 Community Requests & Discussions
Have ideas or feature proposals? Share them on [GitHub Discussions](https://github.com/satyamhq/Patient-Friction-Intelligence-System/discussions).
