# Simulation & What-If Engine

The PFIS Simulation Engine allows program managers, researchers, and public health administrators to simulate the operational impact of proposed interventions before allocating field budgets.

---

## What-If Counterfactual Modeling

The simulation engine models counterfactual patient trajectories:

```
[ Baseline Trajectory ]
Transit: 85 (High) | Lost Wages: 70 | Doc Barrier: 60
  ➔ Friction: 72/100
  ➔ Completion Rate: 34%

           │
           ▼ Apply Intervention: "Community Transit Voucher" (-40 Transit)
[ Counterfactual Trajectory A ]
Transit: 45 | Lost Wages: 70 | Doc Barrier: 60
  ➔ Friction: 56/100
  ➔ Completion Rate: 58% (+24% improvement)

           │
           ▼ Apply Intervention: "Decentralized Point-of-Care Diagnostics"
[ Counterfactual Trajectory B ]
Transit: 25 | Lost Wages: 30 | Doc Barrier: 60
  ➔ Friction: 38/100
  ➔ Completion Rate: 79% (+45% improvement)
```

---

## Constrained Intervention Optimizer (`knapsackOptimizer.ts`)

Given a finite operational budget ($B$) and a set of candidate interventions $\{I_1, I_2, \dots, I_m\}$ with costs $c_j$ and friction reduction yields $\delta_j$, the optimizer solves a 0/1 Knapsack problem:

$$\max \sum_{j=1}^{m} x_j \cdot \delta_j \quad \text{subject to} \quad \sum_{j=1}^{m} x_j \cdot c_j \le B, \quad x_j \in \{0, 1\}$$

This automatically presents the highest-leverage combination of operational programs for any given resource budget.

---

## Synthetic Digital Twin (`patientDigitalTwinEngine.ts`)

A Digital Twin in PFIS is an in-memory parameter bundle representing an archetypal patient's socio-logistics profile:
- Age and caregiver dependency
- Distance to tier-1 vs. tier-2 medical facilities
- Daily wage earning structure (casual daily laborer vs. salaried)
- Vernacular language fluency and literacy levels

Users can clone an archetypal digital twin, modify environmental variables (e.g., transit route frequency or clinic hours), and immediately visualize how friction shifts across the care journey.
