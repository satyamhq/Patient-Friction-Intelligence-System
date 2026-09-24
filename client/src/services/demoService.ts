import { api } from './api';

export interface PublicSimulationParams {
  distanceKm: number;
  transportAvailability: number;
  costBurden: number;
  digitalLiteracy: number;
  languageBarrier: number;
  familySupport: number;
  documentationReady: number;
  appointmentTiming: number;
}

export interface ScenarioResult {
  scenarioName: string;
  interventionApplied: string;
  projectedFriction: number;
  projectedCompletionProbability: number;
  frictionReduction: number;
  completionGain: number;
}

export interface PublicSimulationResponse {
  success: boolean;
  isSyntheticDemo: boolean;
  inputs: PublicSimulationParams;
  outputs: {
    baselineFrictionScore: number;
    baselineCompletionProbability: number;
    dominantBarrier: string;
    mostLikelyDropoutStage: string;
    attribution: {
      overallFrictionScore: number;
      dominantBarrier: string;
      attributionBreakdown: {
        name: string;
        category: string;
        rawScore: number;
        weight: number;
        pointsContributed: number;
        percentageOfFriction: number;
        severity: 'low' | 'moderate' | 'high' | 'critical';
        mitigationOpportunity: string;
      }[];
      explainabilityNarrative: string;
    };
    interactionEffects: {
      synergyDetected: boolean;
      compoundingMultiplier: number;
      explanation: string;
    };
    simulatedScenarios: ScenarioResult[];
    aiInsight?: {
      headline: string;
      keyDrivers: string[];
      recommendedInterventions: string[];
      narrativeExplanation: string;
    };
  };
}

export class DemoService {
  /**
   * Get public overview metrics and care leakage funnel
   */
  public static async getOverview(): Promise<any> {
    try {
      const res = await api.get('/demo/overview');
      return res.data;
    } catch {
      // Deterministic client-side fallback
      return {
        success: true,
        isSyntheticDemo: true,
        summary: {
          totalCohortPatients: 500,
          averageFrictionScore: 58,
          averageCareCompletionProbability: 42,
          monitoredFacilities: 12,
          highestCareLeakageStage: '2. Clinical Consultation',
          dropoutRetentionRate: 25.4,
        },
        careLeakageFunnel: {
          cohortSize: 500,
          overallJourneyCompletionRate: 25.4,
          highestDropoutStage: '2. Clinical Consultation',
          stages: [
            { stage: 'referral', stageLabel: '1. Referral Initiation', patientsEntered: 500, patientsCompleted: 390, patientsDropped: 110, stageRetentionRate: 78.0, cumulativeSurvivalRate: 78.0, primaryLeakageReason: 'Transit deficit & difficult facility reachability' },
            { stage: 'consultation', stageLabel: '2. Clinical Consultation', patientsEntered: 390, patientsCompleted: 260, patientsDropped: 130, stageRetentionRate: 66.7, cumulativeSurvivalRate: 52.0, primaryLeakageReason: 'Out-of-pocket test costs & clinic wait fatigue' },
            { stage: 'diagnostics', stageLabel: '3. Diagnostic Testing', patientsEntered: 260, patientsCompleted: 190, patientsDropped: 70, stageRetentionRate: 73.1, cumulativeSurvivalRate: 38.0, primaryLeakageReason: 'Delays in test report delivery' },
            { stage: 'treatment', stageLabel: '4. Treatment & Medication', patientsEntered: 190, patientsCompleted: 127, patientsDropped: 63, stageRetentionRate: 66.8, cumulativeSurvivalRate: 25.4, primaryLeakageReason: 'Work wage loss on repeat travel days' },
            { stage: 'followup', stageLabel: '5. Post-Care Follow-up', patientsEntered: 127, patientsCompleted: 127, patientsDropped: 0, stageRetentionRate: 100.0, cumulativeSurvivalRate: 25.4, primaryLeakageReason: 'Adherent completed cohort' },
          ],
        },
      };
    }
  }

  /**
   * Run public digital twin simulation
   */
  public static async simulate(params: PublicSimulationParams): Promise<PublicSimulationResponse> {
    try {
      const res = await api.post('/demo/simulate', params);
      return res.data;
    } catch {
      // Deterministic client calculation fallback
      const distFriction = Math.min(100, Math.round(params.distanceKm * 2.2));
      const transFriction = Math.min(100, Math.max(0, 100 - params.transportAvailability));
      const costFriction = Math.min(100, Math.max(0, params.costBurden));
      const digFriction = Math.min(100, Math.max(0, 100 - params.digitalLiteracy));

      const baseFriction = Math.min(100, Math.round(
        transFriction * 0.28 + distFriction * 0.22 + costFriction * 0.25 + digFriction * 0.25
      ));
      const completionProb = Math.max(12, Math.min(95, Math.round(95 - baseFriction * 0.78)));

      return {
        success: true,
        isSyntheticDemo: true,
        inputs: params,
        outputs: {
          baselineFrictionScore: baseFriction,
          baselineCompletionProbability: completionProb,
          dominantBarrier: transFriction >= costFriction ? 'Rural Transit Availability' : 'Financial Strain & Lost Wages',
          mostLikelyDropoutStage: transFriction >= 65 ? '1. Referral Initiation (Travel Impedance)' : '2. Clinical Consultation',
          attribution: {
            overallFrictionScore: baseFriction,
            dominantBarrier: transFriction >= costFriction ? 'Transit Availability' : 'Cost Burden',
            attributionBreakdown: [
              { name: 'Transit Availability', category: 'transport', rawScore: transFriction, weight: 0.28, pointsContributed: Math.round(transFriction * 0.28), percentageOfFriction: 30, severity: 'high', mitigationOpportunity: 'Community transit voucher' },
              { name: 'Travel Distance', category: 'distance', rawScore: distFriction, weight: 0.22, pointsContributed: Math.round(distFriction * 0.22), percentageOfFriction: 25, severity: 'high', mitigationOpportunity: 'Route to closer secondary facility' },
              { name: 'Cost Burden', category: 'cost', rawScore: costFriction, weight: 0.25, pointsContributed: Math.round(costFriction * 0.25), percentageOfFriction: 25, severity: 'high', mitigationOpportunity: 'Diagnostic fee subsidy' },
              { name: 'Digital Access', category: 'digital', rawScore: digFriction, weight: 0.25, pointsContributed: Math.round(digFriction * 0.25), percentageOfFriction: 20, severity: 'moderate', mitigationOpportunity: 'Frontline ASHA assisted booking' },
            ],
            explainabilityNarrative: `Baseline friction is calculated at ${baseFriction}/100. Addressing transit and cost reduces impedance by up to 55%.`,
          },
          interactionEffects: {
            synergyDetected: transFriction >= 50 && distFriction >= 50,
            compoundingMultiplier: transFriction >= 50 && distFriction >= 50 ? 1.25 : 1.0,
            explanation: 'Compounding transit deficit and long distance creates severe journey dropout risk.',
          },
          simulatedScenarios: [
            {
              scenarioName: 'Community Transport Voucher',
              interventionApplied: 'Subsidized rural transit van connecting village to clinic',
              projectedFriction: Math.max(15, Math.round(baseFriction * 0.72)),
              projectedCompletionProbability: Math.min(95, Math.round(completionProb + 19)),
              frictionReduction: Math.round(baseFriction * 0.28),
              completionGain: 19,
            },
            {
              scenarioName: 'Transport + On-Site Diagnostics Voucher',
              interventionApplied: 'Travel subsidy + same-day diagnostic testing waiver',
              projectedFriction: Math.max(12, Math.round(baseFriction * 0.52)),
              projectedCompletionProbability: Math.min(95, Math.round(completionProb + 34)),
              frictionReduction: Math.round(baseFriction * 0.48),
              completionGain: 34,
            },
            {
              scenarioName: 'Full Multi-Modal Care Navigation',
              interventionApplied: 'Transit + ASHA accompaniment + audio vernacular guidance + evening slot',
              projectedFriction: Math.max(10, Math.round(baseFriction * 0.35)),
              projectedCompletionProbability: Math.min(98, Math.round(completionProb + 46)),
              frictionReduction: Math.round(baseFriction * 0.65),
              completionGain: 46,
            },
          ],
        },
      };
    }
  }

  /**
   * Get public synthetic patients list
   */
  public static async getSyntheticPatients(page = 1, limit = 15, search = ''): Promise<any> {
    try {
      const res = await api.get('/demo/patients', { params: { page, limit, search } });
      return res.data;
    } catch {
      return { success: true, isSyntheticDemo: true, total: 0, patients: [] };
    }
  }

  /**
   * Get single synthetic patient detail
   */
  public static async getSyntheticPatientDetail(id: string): Promise<any> {
    const res = await api.get(`/demo/patients/${id}`);
    return res.data;
  }

  /**
   * Get policy interventions and optimization
   */
  public static async getInterventions(budget = 150000): Promise<any> {
    const res = await api.get('/demo/interventions', { params: { budget } });
    return res.data;
  }

  /**
   * Get population friction map data
   */
  public static async getPopulationMap(): Promise<any> {
    const res = await api.get('/demo/map');
    return res.data;
  }

  /**
   * Reset local demo session
   */
  public static async resetDemo(): Promise<any> {
    const res = await api.post('/demo/reset');
    return res.data;
  }
}
