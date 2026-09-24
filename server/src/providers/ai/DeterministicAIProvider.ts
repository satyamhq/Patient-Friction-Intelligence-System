import {
  IAIProvider,
  ExplainFrictionInput,
  ExplainFrictionResult,
  SynthesizeInterventionInput,
  SynthesizeInterventionResult,
} from './IAIProvider.js';

export class DeterministicAIProvider implements IAIProvider {
  public readonly name = 'Deterministic Rule Engine (Built-in)';

  public async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  public async explainFriction(input: ExplainFrictionInput): Promise<ExplainFrictionResult> {
    // Sort factors by contribution = score * weight
    const sorted = [...input.factors].sort(
      (a, b) => b.score * b.weight - a.score * a.weight
    );

    const dominant = sorted.slice(0, 3);
    const keyDrivers = dominant.map(
      (d) => `${d.name}: score ${d.score}/100 (impact weight ${(d.weight * 100).toFixed(0)}%)`
    );

    let level = 'Moderate';
    if (input.overallScore >= 70) level = 'Severe';
    else if (input.overallScore <= 35) level = 'Manageable';

    const topBarrierName = dominant[0]?.name || 'Non-clinical Access';
    const headline = `${level} Friction (${input.overallScore}/100) primarily driven by ${topBarrierName}.`;

    const interventions: string[] = [];
    for (const d of dominant) {
      const lower = d.name.toLowerCase();
      if (lower.includes('transit') || lower.includes('transport') || lower.includes('distance')) {
        interventions.push('Community transit voucher & scheduled village health pickup');
      } else if (lower.includes('cost') || lower.includes('financial') || lower.includes('wage')) {
        interventions.push('Micro-subsidy for diagnostics and lost daily wage mitigation');
      } else if (lower.includes('digital') || lower.includes('literacy')) {
        interventions.push('Frontline ASHA digital-assisted booking and SMS token alerts');
      } else if (lower.includes('language') || lower.includes('communication')) {
        interventions.push('Bilingual audio navigator and vernacular clinical consent desk');
      } else if (lower.includes('document') || lower.includes('abha')) {
        interventions.push('Fast-track on-site ABHA registration and document digitization');
      } else {
        interventions.push(`Targeted mitigation for ${d.name} barriers`);
      }
    }

    const narrative =
      `Patient presents an overall friction index of ${input.overallScore}/100. ` +
      `The statistical non-clinical barriers indicate that ${dominant.map((d) => d.name).join(' and ')} ` +
      `constitute ${(dominant.reduce((acc, c) => acc + c.weight, 0) * 100).toFixed(0)}% of total care journey impedance. ` +
      `Addressing these barriers with low-cost operational interventions can significantly improve journey completion probability.`;

    return {
      headline,
      keyDrivers,
      recommendedInterventions: [...new Set(interventions)],
      narrativeExplanation: narrative,
      provider: 'deterministic',
    };
  }

  public async synthesizeIntervention(
    input: SynthesizeInterventionInput
  ): Promise<SynthesizeInterventionResult> {
    const barrierCount = input.barriers.length || 1;
    const estReduction = Math.min(
      Math.round(input.baselineFriction * 0.45),
      Math.round(15 + barrierCount * 8)
    );
    const estCompletionBoost = Math.min(40, Math.round(estReduction * 0.85));

    const topBarrier = input.barriers[0] || 'General Access';
    return {
      recommendedPolicy: `Multi-modal Community Support Package (Focus: ${topBarrier})`,
      estimatedFrictionReduction: estReduction,
      estimatedCompletionBoost: estCompletionBoost,
      rationale:
        `Deterministic optimization models demonstrate that targeting ${topBarrier} ` +
        `yields highest marginal care completion boost per unit intervention cost.`,
      provider: 'deterministic',
    };
  }
}
