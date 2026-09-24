# Contributing to PFIS

We welcome contributions from open-source developers, health informaticians, researchers, and designers!

---

## Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](../CODE_OF_CONDUCT.md). Please treat all community members with respect and empathy.

---

## Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/<your-username>/Patient-Friction-Intelligence-System.git
   cd Patient-Friction-Intelligence-System
   ```
2. **Install & Verify**
   ```bash
   npm install
   npm test
   npm run typecheck
   ```
3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/improved-leakage-algorithm
   ```
4. **Implement & Test**
   - Write unit tests for new intelligence modules in `server/tests/`.
   - Maintain strict TypeScript typings.
   - Ensure zero hardcoded external API keys or vendor lock-in.
5. **Commit & Push**
   Follow conventional commit messages (e.g., `feat: add OSM tile cache layer`, `fix: correct Markov stage transition`).
6. **Submit a Pull Request**
   Open a PR against the `main` branch using our PR template.
