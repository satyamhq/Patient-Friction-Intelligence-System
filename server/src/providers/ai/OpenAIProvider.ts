import axios from 'axios';
import {
  IAIProvider,
  ExplainFrictionInput,
  ExplainFrictionResult,
  SynthesizeInterventionInput,
  SynthesizeInterventionResult,
} from './IAIProvider.js';
import { DeterministicAIProvider } from './DeterministicAIProvider.js';

export class OpenAIProvider implements IAIProvider {
  public readonly name = 'OpenAI (Optional Cloud Adapter)';
  private apiKey: string;
  private model: string;
  private fallback: DeterministicAIProvider;

  constructor(apiKey: string = '', model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
    this.fallback = new DeterministicAIProvider();
  }

  public async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async explainFriction(input: ExplainFrictionInput): Promise<ExplainFrictionResult> {
    if (!this.apiKey) {
      return this.fallback.explainFriction(input);
    }

    try {
      const messages = [
        {
          role: 'system',
          content:
            'You are a healthcare operational intelligence analyst. Respond in JSON with keys: headline, keyDrivers, recommendedInterventions, narrativeExplanation.',
        },
        {
          role: 'user',
          content: `Analyze patient non-clinical friction: Overall Score: ${input.overallScore}/100. Factors: ${JSON.stringify(input.factors)}`,
        },
      ];

      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.3,
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          timeout: 8000,
        }
      );

      const content = res.data?.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return {
          headline: parsed.headline || 'Analysis Completed',
          keyDrivers: Array.isArray(parsed.keyDrivers) ? parsed.keyDrivers : [],
          recommendedInterventions: Array.isArray(parsed.recommendedInterventions)
            ? parsed.recommendedInterventions
            : [],
          narrativeExplanation: parsed.narrativeExplanation || '',
          provider: 'openai',
        };
      }
    } catch {
      // Fallback
    }

    return this.fallback.explainFriction(input);
  }

  public async synthesizeIntervention(
    input: SynthesizeInterventionInput
  ): Promise<SynthesizeInterventionResult> {
    if (!this.apiKey) {
      return this.fallback.synthesizeIntervention(input);
    }

    try {
      const messages = [
        {
          role: 'system',
          content:
            'Respond in JSON with keys: recommendedPolicy, estimatedFrictionReduction, estimatedCompletionBoost, rationale.',
        },
        {
          role: 'user',
          content: `Intervention planning for baseline friction ${input.baselineFriction} with barriers: ${input.barriers.join(', ')}`,
        },
      ];

      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.3,
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          timeout: 8000,
        }
      );

      const content = res.data?.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return {
          recommendedPolicy: parsed.recommendedPolicy,
          estimatedFrictionReduction: parsed.estimatedFrictionReduction || 20,
          estimatedCompletionBoost: parsed.estimatedCompletionBoost || 15,
          rationale: parsed.rationale,
          provider: 'openai',
        };
      }
    } catch {
      // Fallback
    }

    return this.fallback.synthesizeIntervention(input);
  }
}
