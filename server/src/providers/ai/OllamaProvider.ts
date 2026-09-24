import axios from 'axios';
import {
  IAIProvider,
  ExplainFrictionInput,
  ExplainFrictionResult,
  SynthesizeInterventionInput,
  SynthesizeInterventionResult,
} from './IAIProvider.js';
import { DeterministicAIProvider } from './DeterministicAIProvider.js';

export class OllamaProvider implements IAIProvider {
  public readonly name = 'Ollama Local LLM';
  private baseUrl: string;
  private model: string;
  private fallback: DeterministicAIProvider;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3:8b') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.model = model;
    this.fallback = new DeterministicAIProvider();
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const res = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 2000 });
      return res.status === 200;
    } catch {
      return false;
    }
  }

  public async explainFriction(input: ExplainFrictionInput): Promise<ExplainFrictionResult> {
    try {
      const prompt =
        `You are a healthcare operational intelligence analyst. Analyze these non-clinical access friction factors for a patient:\n` +
        `Overall Friction Score: ${input.overallScore}/100\n` +
        `Factors: ${JSON.stringify(input.factors)}\n\n` +
        `Respond in JSON format with keys:\n` +
        `"headline": short summary sentence,\n` +
        `"keyDrivers": array of top 3 barrier explanations,\n` +
        `"recommendedInterventions": array of 3 non-clinical action steps,\n` +
        `"narrativeExplanation": 2-sentence operational breakdown.`;

      const res = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt,
          format: 'json',
          stream: false,
        },
        { timeout: 12000 }
      );

      if (res.data?.response) {
        const parsed = JSON.parse(res.data.response);
        return {
          headline: parsed.headline || 'Local LLM Analysis Completed',
          keyDrivers: Array.isArray(parsed.keyDrivers) ? parsed.keyDrivers : [],
          recommendedInterventions: Array.isArray(parsed.recommendedInterventions)
            ? parsed.recommendedInterventions
            : [],
          narrativeExplanation: parsed.narrativeExplanation || '',
          provider: 'ollama',
        };
      }
    } catch {
      // Graceful fallback to deterministic engine
    }

    return this.fallback.explainFriction(input);
  }

  public async synthesizeIntervention(
    input: SynthesizeInterventionInput
  ): Promise<SynthesizeInterventionResult> {
    try {
      const prompt =
        `Analyze healthcare access friction baseline ${input.baselineFriction}/100 with barriers: ${input.barriers.join(', ')}.\n` +
        `Recommend optimal non-clinical intervention package in JSON with keys:\n` +
        `"recommendedPolicy": title,\n` +
        `"estimatedFrictionReduction": integer (5-45),\n` +
        `"estimatedCompletionBoost": integer (5-40),\n` +
        `"rationale": explanation.`;

      const res = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt,
          format: 'json',
          stream: false,
        },
        { timeout: 12000 }
      );

      if (res.data?.response) {
        const parsed = JSON.parse(res.data.response);
        return {
          recommendedPolicy: parsed.recommendedPolicy,
          estimatedFrictionReduction: parsed.estimatedFrictionReduction || 20,
          estimatedCompletionBoost: parsed.estimatedCompletionBoost || 15,
          rationale: parsed.rationale,
          provider: 'ollama',
        };
      }
    } catch {
      // Fallback
    }

    return this.fallback.synthesizeIntervention(input);
  }
}
