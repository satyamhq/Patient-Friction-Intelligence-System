export interface JourneyStageMetric {
  stage: 'referral' | 'consultation' | 'diagnostics' | 'treatment' | 'followup';
  stageLabel: string;
  stageOrder: number;
  patientsEntered: number;
  patientsCompleted: number;
  patientsDropped: number;
  stageRetentionRate: number; // percentage (0-100)
  cumulativeSurvivalRate: number; // percentage (0-100)
  primaryLeakageReason: string;
  contributingBarriers: { barrier: string; contributionPercent: number }[];
}

export interface CareLeakageAnalysis {
  cohortSize: number;
  overallJourneyCompletionRate: number;
  highestDropoutStage: string;
  stages: JourneyStageMetric[];
  operationalInsights: string[];
}

export class CareLeakageEngine {
  public static readonly STAGES: { key: JourneyStageMetric['stage']; label: string }[] = [
    { key: 'referral', label: '1. Referral Initiation' },
    { key: 'consultation', label: '2. Clinical Consultation' },
    { key: 'diagnostics', label: '3. Diagnostic Testing' },
    { key: 'treatment', label: '4. Treatment & Medication' },
    { key: 'followup', label: '5. Post-Care Follow-up' },
  ];

  /**
   * Deterministically calculates Markov-like stage transition dropouts
   * based on non-clinical friction parameters across the patient cohort.
   */
  public static calculateFunnel(
    totalCohort: number = 1000,
    frictionModifiers: {
      transportFriction?: number; // 0-100
      costFriction?: number;      // 0-100
      digitalFriction?: number;   // 0-100
      documentationFriction?: number; // 0-100
      timingFriction?: number;    // 0-100
    } = {}
  ): CareLeakageAnalysis {
    const transport = frictionModifiers.transportFriction ?? 58;
    const cost = frictionModifiers.costFriction ?? 52;
    const digital = frictionModifiers.digitalFriction ?? 45;
    const docs = frictionModifiers.documentationFriction ?? 38;
    const timing = frictionModifiers.timingFriction ?? 42;

    // Stage 1: Referral to Consultation
    // Heavily impacted by: Transportation, Distance, Digital booking
    const drop1Rate = Math.min(0.40, 0.10 + (transport * 0.0018) + (digital * 0.0012));

    // Stage 2: Consultation to Diagnostics
    // Heavily impacted by: Same-day diagnostics availability, Cost burden, Timing
    const drop2Rate = Math.min(0.45, 0.12 + (cost * 0.0022) + (timing * 0.0014));

    // Stage 3: Diagnostics to Treatment
    // Heavily impacted by: Test report delays, Medical documentation, Cost of therapy
    const drop3Rate = Math.min(0.35, 0.08 + (docs * 0.0016) + (cost * 0.0015));

    // Stage 4: Treatment to Follow-up
    // Heavily impacted by: Return transit distance, Daily wage loss, Caregiver presence
    const drop4Rate = Math.min(0.50, 0.15 + (transport * 0.0020) + (cost * 0.0018));

    const stageDropRates = [
      {
        rate: drop1Rate,
        reason: 'Transit deficit & difficult facility reachability',
        barriers: [
          { barrier: 'Transportation & Distance', contributionPercent: 54 },
          { barrier: 'Digital literacy / Appointment slot access', contributionPercent: 32 },
          { barrier: 'Documentation gaps', contributionPercent: 14 },
        ],
      },
      {
        rate: drop2Rate,
        reason: 'Out-of-pocket test costs & diagnostic queue fatigue',
        barriers: [
          { barrier: 'Diagnostic testing fee burden', contributionPercent: 60 },
          { barrier: 'Long clinic wait & daily wage loss', contributionPercent: 26 },
          { barrier: 'Offsite testing facility distance', contributionPercent: 14 },
        ],
      },
      {
        rate: drop3Rate,
        reason: 'Delays in pathology return & prescription procurement',
        barriers: [
          { barrier: 'Documentation / missing lab records', contributionPercent: 44 },
          { barrier: 'Medication stock unavailability', contributionPercent: 36 },
          { barrier: 'Language discordance with instructions', contributionPercent: 20 },
        ],
      },
      {
        rate: drop4Rate,
        reason: 'Inability to take repeat work leaves & return travel barrier',
        barriers: [
          { barrier: 'Lost daily wages / financial exhaustion', contributionPercent: 50 },
          { barrier: 'Repeated long transit travel fatigue', contributionPercent: 35 },
          { barrier: 'Lack of family/caregiver escort', contributionPercent: 15 },
        ],
      },
    ];

    let currentCohort = totalCohort;
    const stages: JourneyStageMetric[] = [];

    // Stage 1 entry
    const enteredS1 = currentCohort;
    const droppedS1 = Math.round(enteredS1 * stageDropRates[0].rate);
    const completedS1 = enteredS1 - droppedS1;
    stages.push({
      stage: 'referral',
      stageLabel: '1. Referral Initiation',
      stageOrder: 1,
      patientsEntered: enteredS1,
      patientsCompleted: completedS1,
      patientsDropped: droppedS1,
      stageRetentionRate: parseFloat(((completedS1 / enteredS1) * 100).toFixed(1)),
      cumulativeSurvivalRate: parseFloat(((completedS1 / totalCohort) * 100).toFixed(1)),
      primaryLeakageReason: stageDropRates[0].reason,
      contributingBarriers: stageDropRates[0].barriers,
    });
    currentCohort = completedS1;

    // Stage 2
    const enteredS2 = currentCohort;
    const droppedS2 = Math.round(enteredS2 * stageDropRates[1].rate);
    const completedS2 = enteredS2 - droppedS2;
    stages.push({
      stage: 'consultation',
      stageLabel: '2. Clinical Consultation',
      stageOrder: 2,
      patientsEntered: enteredS2,
      patientsCompleted: completedS2,
      patientsDropped: droppedS2,
      stageRetentionRate: parseFloat(((completedS2 / enteredS2) * 100).toFixed(1)),
      cumulativeSurvivalRate: parseFloat(((completedS2 / totalCohort) * 100).toFixed(1)),
      primaryLeakageReason: stageDropRates[1].reason,
      contributingBarriers: stageDropRates[1].barriers,
    });
    currentCohort = completedS2;

    // Stage 3
    const enteredS3 = currentCohort;
    const droppedS3 = Math.round(enteredS3 * stageDropRates[2].rate);
    const completedS3 = enteredS3 - droppedS3;
    stages.push({
      stage: 'diagnostics',
      stageLabel: '3. Diagnostic Testing',
      stageOrder: 3,
      patientsEntered: enteredS3,
      patientsCompleted: completedS3,
      patientsDropped: droppedS3,
      stageRetentionRate: parseFloat(((completedS3 / enteredS3) * 100).toFixed(1)),
      cumulativeSurvivalRate: parseFloat(((completedS3 / totalCohort) * 100).toFixed(1)),
      primaryLeakageReason: stageDropRates[2].reason,
      contributingBarriers: stageDropRates[2].barriers,
    });
    currentCohort = completedS3;

    // Stage 4
    const enteredS4 = currentCohort;
    const droppedS4 = Math.round(enteredS4 * stageDropRates[3].rate);
    const completedS4 = enteredS4 - droppedS4;
    stages.push({
      stage: 'treatment',
      stageLabel: '4. Treatment & Medication',
      stageOrder: 4,
      patientsEntered: enteredS4,
      patientsCompleted: completedS4,
      patientsDropped: droppedS4,
      stageRetentionRate: parseFloat(((completedS4 / enteredS4) * 100).toFixed(1)),
      cumulativeSurvivalRate: parseFloat(((completedS4 / totalCohort) * 100).toFixed(1)),
      primaryLeakageReason: stageDropRates[3].reason,
      contributingBarriers: stageDropRates[3].barriers,
    });
    currentCohort = completedS4;

    // Stage 5: Follow-up stage completion
    stages.push({
      stage: 'followup',
      stageLabel: '5. Post-Care Follow-up',
      stageOrder: 5,
      patientsEntered: currentCohort,
      patientsCompleted: currentCohort,
      patientsDropped: 0,
      stageRetentionRate: 100,
      cumulativeSurvivalRate: parseFloat(((currentCohort / totalCohort) * 100).toFixed(1)),
      primaryLeakageReason: 'Adherent cohort with continuous care loop',
      contributingBarriers: [],
    });

    const maxDrop = [...stages].sort((a, b) => b.patientsDropped - a.patientsDropped)[0];
    const overallRate = parseFloat(((currentCohort / totalCohort) * 100).toFixed(1));

    return {
      cohortSize: totalCohort,
      overallJourneyCompletionRate: overallRate,
      highestDropoutStage: maxDrop.stageLabel,
      stages,
      operationalInsights: [
        `Primary care leakage point is "${maxDrop.stageLabel}" with ${maxDrop.patientsDropped} dropouts (${maxDrop.primaryLeakageReason}).`,
        `Cumulative care completion across full 5-stage pathway is ${overallRate}%.`,
        `Targeting the top two stage bottlenecks can recover up to ${Math.round(totalCohort * 0.28)} additional completed patient journeys.`,
      ],
    };
  }
}
