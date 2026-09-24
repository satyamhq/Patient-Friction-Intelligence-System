# Core Intelligence Engines

PFIS uses transparent, deterministic mathematical algorithms to model non-clinical barriers. Unlike opaque black-box models, all PFIS intelligence modules produce inspectable numerical breakdowns.

```
┌────────────────────────────────────────────────────────┐
│               PFIS Intelligence Suite                  │
├──────────────────────────┬─────────────────────────────┤
│ 8D Friction Fingerprint  │ 8 weighted socio-logistics  │
├──────────────────────────┼─────────────────────────────┤
│ Interaction Engine       │ Non-linear compounding      │
├──────────────────────────┼─────────────────────────────┤
│ Care Failure Risk        │ Logistic sigmoid hazard     │
├──────────────────────────┼─────────────────────────────┤
│ Care Leakage Engine      │ 5-stage Markov transition   │
├──────────────────────────┼─────────────────────────────┤
│ Knapsack Optimizer       │ Budget-constrained ROI      │
├──────────────────────────┼─────────────────────────────┤
│ Attribution Engine       │ Additive point contribution │
├──────────────────────────┼─────────────────────────────┤
│ Patient Digital Twin     │ Parameterized counterfactual│
└──────────────────────────┴─────────────────────────────┘
```

---

## 1. 8-Dimensional Friction Fingerprint (`frictionEngine.ts`)

The baseline friction score ($F_{\text{base}}$) is evaluated on a $0 - 100$ scale across 8 dimensions:

| Dimension | Typical Weight | Non-Clinical Rationale |
|:---|:---|:---|
| **Transit & Distance** | 0.22 | Physical distance, road quality, public transport frequency |
| **Financial / Wage Loss** | 0.18 | Direct out-of-pocket costs and lost daily wages |
| **Documentation** | 0.14 | Identity cards, insurance cards, referrals |
| **Digital Literacy** | 0.12 | Ability to navigate smartphone apps or online booking |
| **Wait Time Burden** | 0.10 | Facility wait times vs. patient opportunity cost |
| **Language & Cultural** | 0.08 | Vernacular disconnect with care providers |
| **Family / Caregiver** | 0.08 | Need for an accompanying caregiver |
| **Clinic Timing** | 0.08 | Alignment with working hours or agricultural cycles |

Formula:
$$F_{\text{base}} = \sum_{i=1}^{8} w_i \cdot d_i$$

---

## 2. Friction Interaction Engine (`interactionEngine.ts`)

Barriers do not act in isolation. For example, a severe transit barrier compounded by high daily wage loss creates an exponentially higher risk of appointment abandonment than either factor alone.

The Interaction Engine applies non-linear cross-modifiers:
$$\Delta_{\text{compounding}} = \sum_{(j, k) \in \text{Pairs}} \gamma_{jk} \cdot (d_j \times d_k)$$

---

## 3. Care Failure Risk Model (`failureRiskEngine.ts`)

Converts total friction into a calibrated probability of care abandonment ($P_{\text{abandon}}$) using a logistic response curve:

$$P_{\text{abandon}} = \frac{1}{1 + e^{-k(F_{\text{total}} - F_0)}}$$

Where:
- $F_{\text{total}} = \min(100, F_{\text{base}} + \Delta_{\text{compounding}})$
- $F_0 = 50.0$ (inflection threshold)
- $k = 0.07$ (steepness coefficient)

---

## 4. Barrier Attribution & Explainability (`barrierAttributionEngine.ts`)

Every simulation output includes an exact point-by-point decomposition:
```
Friction Score: 68/100
  ├── Transit Deficit:        +22 pts (32.4%)
  ├── Opportunity Cost:       +16 pts (23.5%)
  ├── Missing Identity Docs:  +12 pts (17.6%)
  ├── Compounding Effects:    +10 pts (14.7%)
  └── Digital Barrier:        +8 pts  (11.8%)
```
This enables administrators to understand **why** care failed and identify the exact intervention levers that will yield the highest completion gains.
