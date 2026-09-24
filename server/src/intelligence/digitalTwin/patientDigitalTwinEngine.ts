import { FrictionInteractionEngine } from '../causal/frictionInteractionEngine.js';
import { BarrierAttributionEngine, BarrierFactorInput } from '../attribution/barrierAttributionEngine.js';

export interface DigitalTwinParameters {
  distanceKm: number;            // 0 - 100+ km
  transportAvailability: number; // 0 (none) - 100 (excellent)
  costBurden: number;            // 0 (none) - 100 (extreme)
  digitalLiteracy: number;       // 0 (none) - 100 (expert)
  languageBarrier: number;       // 0 (full match) - 100 (severe mismatch)
  familySupport: number;         // 0 (alone) - 100 (high support)
  documentationReady: number;    // 0 (no documents) - 100 (fully verified)
  appointmentTiming: number;     // 0 (rigid work clash) - 100 (flexible/evening)
}

export interface DigitalTwinSimulationResult {
  baselineFrictionScore: number;
  baselineCompletionProbability: number;
  dominantBarrier: string;
  mostLikelyDropoutStage: string;
  attribution: ReturnType<typeof BarrierAttributionEngine.calculateAttribution>;
  interactionEffects: {
    synergyDetected: boolean;
    compoundingMultiplier: number;
    explanation: string;
  };
  simulatedScenarios: {
    scenarioName: string;
    interventionApplied: string;
    projectedFriction: number;
    projectedCompletionProbability: number;
    frictionReduction: number;
    completionGain: number;
  }[];
}

export class PatientDigitalTwinEngine {
  /**
   * Deterministically computes the full non-clinical friction fingerprint,
   * journey completion probability, and intervention scenario outcomes
   * for a parameterized patient digital twin.
   */
  public static simulate(params: DigitalTwinParameters): DigitalTwinSimulationResult {
    // 1. Convert parameters into normalized friction factor vectors (0 - 100 scale of impedance)
    const distanceFriction = Math.min(100, Math.round(params.distanceKm * 2.2));
    const transitFriction = Math.min(100, Math.max(0, 100 - params.transportAvailability));
    const financialFriction = Math.min(100, Math.max(0, params.costBurden));
    const digitalFriction = Math.min(100, Math.max(0, 100 - params.digitalLiteracy));
    const languageFriction = Math.min(100, Math.max(0, params.languageBarrier));
    const socialFriction = Math.min(100, Math.max(0, 100 - params.familySupport));
    const docFriction = Math.min(100, Math.max(0, 100 - params.documentationReady));
    const timingFriction = Math.min(100, Math.max(0, 100 - params.appointmentTiming));

    const factorInputs: BarrierFactorInput[] = [
      { name: 'Transit Availability', category: 'transport', rawScore: transitFriction, weight: 0.22 },
      { name: 'Travel Distance', category: 'distance', rawScore: distanceFriction, weight: 0.18 },
      { name: 'Cost & Wage Loss', category: 'cost', rawScore: financialFriction, weight: 0.18 },
      { name: 'Digital Access', category: 'digital', rawScore: digitalFriction, weight: 0.12 },
      { name: 'Documentation Readiness', category: 'documentation', rawScore: docFriction, weight: 0.10 },
      { name: 'Appointment Timing', category: 'timing', rawScore: timingFriction, weight: 0.08 },
      { name: 'Language Barrier', category: 'language', rawScore: languageFriction, weight: 0.06 },
      { name: 'Caregiver Support', category: 'support', rawScore: socialFriction, weight: 0.06 },
    ];

    const attribution = BarrierAttributionEngine.calculateAttribution(factorInputs);
    const baseFriction = attribution.overallFrictionScore;

    // 2. Compute non-linear interaction effects (e.g. transit deficit + wage loss compound)
    const makeFactor = (dimension: string, score: number, weight: number): any => ({
      dimension,
      score,
      weight,
      level: score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW',
      reason: `Factor ${dimension} evaluated at score ${score}`,
    });

    const interactions = FrictionInteractionEngine.detectInteractions({
      travel: makeFactor('Travel Distance', distanceFriction, 0.18),
      transport: makeFactor('Transport', transitFriction, 0.22),
      digitalAccess: makeFactor('Digital Access', digitalFriction, 0.12),
      language: makeFactor('Language', languageFriction, 0.06),
      familySupport: makeFactor('Family Support', socialFriction, 0.06),
      documentation: makeFactor('Documentation', docFriction, 0.10),
      cost: makeFactor('Financial Cost', financialFriction, 0.18),
      appointmentTiming: makeFactor('Appointment Timing', timingFriction, 0.08),
    });

    const synergyMultiplier = interactions.length > 0 ? Math.min(1.3, 1 + interactions.length * 0.05) : 1.0;
    const penaltyPoints = Math.round(baseFriction * (synergyMultiplier - 1.0));
    const adjustedFriction = Math.min(100, baseFriction + penaltyPoints);


    // 3. Deterministic Care Journey Completion Function
    // Inverse logistic-like decay from 95% at 0 friction to ~15% at 100 friction
    const completionProb = Math.max(
      12,
      Math.min(95, Math.round(95 - adjustedFriction * 0.78))
    );

    // 4. Identify most likely dropout stage
    let mostLikelyDropoutStage = '2. Clinical Consultation';
    if (transitFriction >= 65 || distanceFriction >= 70) {
      mostLikelyDropoutStage = '1. Referral Initiation (Travel Impedance)';
    } else if (financialFriction >= 65) {
      mostLikelyDropoutStage = '3. Diagnostic Testing (Out-of-Pocket Cost)';
    } else if (timingFriction >= 65 || socialFriction >= 70) {
      mostLikelyDropoutStage = '4. Treatment & Medication (Work Schedule Conflict)';
    } else if (adjustedFriction < 35) {
      mostLikelyDropoutStage = '5. Follow-up Adherence (Low Overall Risk)';
    }

    // 5. Simulate 3 standard intervention scenarios
    // Scenario 1: Community Transport Voucher
    const s1Friction = Math.max(15, Math.round(adjustedFriction - (transitFriction * 0.45)));
    const s1Completion = Math.min(95, Math.round(completionProb + (adjustedFriction - s1Friction) * 0.82));

    // Scenario 2: Community Transport + Fast-Track Documentation
    const s2Friction = Math.max(12, Math.round(s1Friction - (docFriction * 0.40)));
    const s2Completion = Math.min(95, Math.round(completionProb + (adjustedFriction - s2Friction) * 0.85));

    // Scenario 3: Comprehensive Multi-Modal Support (Transport + Tele-Triage + Flexible Timing)
    const s3Friction = Math.max(10, Math.round(s2Friction - (timingFriction * 0.35) - (digitalFriction * 0.30)));
    const s3Completion = Math.min(98, Math.round(completionProb + (adjustedFriction - s3Friction) * 0.88));

    return {
      baselineFrictionScore: adjustedFriction,
      baselineCompletionProbability: completionProb,
      dominantBarrier: attribution.dominantBarrier,
      mostLikelyDropoutStage,
      attribution,
      interactionEffects: {
        synergyDetected: interactions.length > 0,
        compoundingMultiplier: parseFloat(synergyMultiplier.toFixed(2)),
        explanation:
          interactions.length > 0
            ? interactions.map((i) => i.mechanismExplanation).slice(0, 2).join(' ')
            : 'Linear additive accumulation across active barrier dimensions.',
      },
      simulatedScenarios: [
        {
          scenarioName: 'Community Transport Voucher',
          interventionApplied: 'Free or subsidized transit link between village and sub-district facility',
          projectedFriction: s1Friction,
          projectedCompletionProbability: s1Completion,
          frictionReduction: adjustedFriction - s1Friction,
          completionGain: s1Completion - completionProb,
        },
        {
          scenarioName: 'Transport + On-site Diagnostic Waiver',
          interventionApplied: 'Subsidized travel paired with same-day digital health clinic testing voucher',
          projectedFriction: s2Friction,
          projectedCompletionProbability: s2Completion,
          frictionReduction: adjustedFriction - s2Friction,
          completionGain: s2Completion - completionProb,
        },
        {
          scenarioName: 'Full Multi-Modal Care Navigation',
          interventionApplied: 'Transit voucher + ASHA escort + vernacular audio navigation + evening clinic slot',
          projectedFriction: s3Friction,
          projectedCompletionProbability: s3Completion,
          frictionReduction: adjustedFriction - s3Friction,
          completionGain: s3Completion - completionProb,
        },
      ],
    };
  }
}
