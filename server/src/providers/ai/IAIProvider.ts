export interface ExplainFrictionInput {
  overallScore: number;
  factors: {
    name: string;
    score: number;
    weight: number;
    details?: string;
  }[];
  demographics?: {
    age?: number;
    gender?: string;
    location?: string;
    language?: string;
  };
}

export interface ExplainFrictionResult {
  headline: string;
  keyDrivers: string[];
  recommendedInterventions: string[];
  narrativeExplanation: string;
  provider: 'deterministic' | 'ollama' | 'openai';
}

export interface SynthesizeInterventionInput {
  patientId?: string;
  baselineFriction: number;
  barriers: string[];
  availableBudget?: number;
}

export interface SynthesizeInterventionResult {
  recommendedPolicy: string;
  estimatedFrictionReduction: number;
  estimatedCompletionBoost: number;
  rationale: string;
  provider: 'deterministic' | 'ollama' | 'openai';
}

export interface IAIProvider {
  readonly name: string;
  explainFriction(input: ExplainFrictionInput): Promise<ExplainFrictionResult>;
  synthesizeIntervention(input: SynthesizeInterventionInput): Promise<SynthesizeInterventionResult>;
  isAvailable(): Promise<boolean>;
}
