# Synthetic Dataset Architecture & Governance

The Patient Friction Intelligence System (PFIS) strictly adheres to a **Synthetic Data First** principle.

---

## Why Synthetic Data?

1. **Patient Privacy & Safety**: Real healthcare encounters contain Protected Health Information (PHI) and Personally Identifiable Information (PII). PFIS is designed for open-source exploration, algorithm evaluation, and developer contributions without legal or privacy hazards.
2. **Reproducibility**: Development environments, automated CI test suites, and public demos must produce deterministic, identical results across machines.
3. **Edge Case Coverage**: Synthetic generation allows deliberate modeling of underserved cohorts (e.g., remote rural communities, migrant workers lacking local identification documents).

---

## Mulberry32 Deterministic PRNG Generator

All synthetic cohorts are produced using a seeded Mulberry32 pseudo-random number generator (`data/synthetic/generateCohort.ts`).

### Running the Generator
```bash
# Generate 500 synthetic records with default seed 1337
npm run seed:demo
```

### Generator Parameters
```typescript
interface GeneratorConfig {
  cohortSize: number;       // Default: 500
  seed: number;             // Default: 1337
  geographicBoundingBox: {
    latMin: number;
    latMax: number;
    lngMin: number;
    lngMax: number;
  };
}
```

---

## Representative Archetypes in Example Fixtures

Located in `data/examples/`:

1. **`rural-transport-barrier.json`**:
   - High geographic distance (28 km)
   - Infrequent rural bus service
   - Severe transit friction driver
2. **`wage-loss-barrier.json`**:
   - Daily informal wage earner
   - High financial opportunity cost of taking a day off for medical visits
3. **`documentation-barrier.json`**:
   - Lacks active health insurance scheme card or government identity certificate
   - High administrative friction during intake
4. **`digital-illiteracy-barrier.json`**:
   - Feature phone user unable to navigate smartphone registration portals
   - Dependent on community health workers (ASHAs)
