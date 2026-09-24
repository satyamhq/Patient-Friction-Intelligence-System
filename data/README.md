# PFIS Synthetic Dataset & Data Architecture

## Overview
The **Patient Friction Intelligence System (PFIS)** is designed with a **synthetic-first** methodology. All public demonstrations, test suites, and default operational simulations run against mathematically reproducible synthetic data cohorts.

Zero real patient records, personal identities, or Protected Health Information (PHI) are included in this repository.

## Data Structure
```
data/
├── synthetic/
│   └── generateCohort.ts        # Deterministic generator (Mulberry32 PRNG seed)
├── examples/
│   ├── sample_friction_profile.json
│   ├── sample_digital_twin_scenario.json
│   └── sample_care_leakage_funnel.json
└── README.md                    # Data governance and usage guidelines
```

## Deterministic Seeding
To generate reproducible synthetic cohorts for testing and simulation:

```bash
npm run seed:demo
```

The generator uses a deterministic pseudo-random seed to yield consistent metrics for:
- Patient demographics (age, village, daily wage, primary language)
- Facility proximity and transit accessibility
- Multi-dimensional non-clinical friction vectors
- 5-stage care journey progression and leakage dropouts

## Privacy & Ethical Safety Principles
1. **Zero Real PHI**: Never commit or upload real patient records to public instances.
2. **Non-Clinical Boundary**: Non-clinical access barriers (distance, transit, financial loss, documentation) are measured for operational research; the system does not perform clinical diagnoses or medical treatment recommendations.
3. **Open Access**: Synthetic datasets are freely licensed under the MIT License for academic, policy, and open-source systems research.
