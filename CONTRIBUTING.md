# Contributing to PFIS

Thank you for your interest in contributing to the **Patient Friction Intelligence System (PFIS)**!

PFIS is an open-source, local-first platform designed to measure and simulate non-clinical barriers in healthcare journeys. We welcome contributions from researchers, software engineers, public health analysts, and UX designers.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Development Principles

1. **Local-First & Zero Mandatory SaaS**: Features should not require proprietary paid APIs (like Google Maps or OpenAI) for baseline operation. Use our pluggable adapter architecture in `server/src/providers/`.
2. **Transparent & Deterministic Intelligence**: Math and scoring models should be explainable with typed inputs and outputs.
3. **Synthetic Data Safety**: All demo and testing workflows must use synthetic data. Never commit real patient information.
4. **No Authentication Walls on Demo**: Public landing and simulation routes must remain accessible without mandatory login.

---

## Getting Started

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/Patient-Friction-Intelligence-System.git
cd Patient-Friction-Intelligence-System

# 2. Install dependencies
npm install

# 3. Run unit tests
npm test

# 4. Run typecheck
npm run typecheck

# 5. Start dev server
npm run dev
```

---

## Pull Request Guidelines

1. Create a feature branch: `git checkout -b feature/my-feature-name`.
2. Ensure `npm test` and `npm run typecheck` pass with zero errors.
3. If introducing an external service, create an interface and a mock/offline provider.
4. Submit your pull request with a concise description of changes and test results.
