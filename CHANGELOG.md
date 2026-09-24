# Changelog

All notable changes to the Patient Friction Intelligence System (PFIS) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2026-09-24

### Added
- **Public Zero-Auth Demo**: Added `/demo`, `/demo/simulator`, `/architecture`, and `/api-docs` accessible without login.
- **Modern Open-Source Landing Page**: Dynamic 8-factor friction slider, live what-if comparison preview, and architectural system diagrams.
- **Deterministic Intelligence Suite**: Added 5-stage Markov care leakage engine, additive barrier attribution engine, and patient digital twin simulator.
- **Pluggable Provider Architecture**: Added interface-driven adapters for Maps (`OpenStreetMapProvider`, `GoogleMapsProvider`), AI (`DeterministicAIProvider`, `OllamaProvider`), and Storage (`LocalStorageProvider`, `S3MinioProvider`).
- **Comprehensive Synthetic Data Pipeline**: Added Mulberry32 deterministic generator with realistic archetypes (`data/examples/`).
- **OpenAPI 3.0 Specification**: Created `openapi/openapi.yaml` documenting all public and operational endpoints.
- **Automated Intelligence Test Suite**: Added 27 unit tests verifying mathematical correctness and provider fallbacks.

### Changed
- **Authentication Separation**: Segregated internal role portals (`/portals`) from public product exploration.
- **Decoupled Database Layer**: Added support for fast embedded JSON storage alongside PostgreSQL and MongoDB.
- **Modernized Navigation & Footer**: Removed hackathon artifacts and unverified compliance claims in favor of transparent non-clinical operational phrasing.

### Removed
- Removed mandatory dependency on Google Maps API and cloud OpenAI keys for baseline operation.
- Removed hardcoded credentials and developer emails from seeders and configuration files.
- Removed SIH/hackathon-specific promotional copy.

---

## [1.0.0] - Historical Prototype
- Initial hackathon prototype demonstrating role portals and baseline friction concepts.
