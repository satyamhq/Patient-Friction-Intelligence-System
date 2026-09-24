export interface BarrierFactorInput {
  name: string;
  category: 'transport' | 'distance' | 'cost' | 'digital' | 'language' | 'documentation' | 'timing' | 'support' | 'other';
  rawScore: number; // 0-100
  weight: number;   // 0.0 - 1.0
  description?: string;
}

export interface BarrierContribution {
  name: string;
  category: string;
  rawScore: number;
  weight: number;
  pointsContributed: number;
  percentageOfFriction: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  mitigationOpportunity: string;
}

export interface AttributionReport {
  overallFrictionScore: number;
  calculatedFromPoints: number;
  dominantBarrier: string;
  attributionBreakdown: BarrierContribution[];
  explainabilityNarrative: string;
  totalExplainedPoints: number;
}

export class BarrierAttributionEngine {
  /**
   * Deterministically calculates exact additive points contributed by each barrier
   * ensuring that all numbers sum up to the total score and are 100% inspectable.
   */
  public static calculateAttribution(factors: BarrierFactorInput[]): AttributionReport {
    if (!factors || factors.length === 0) {
      return {
        overallFrictionScore: 0,
        calculatedFromPoints: 0,
        dominantBarrier: 'None',
        attributionBreakdown: [],
        explainabilityNarrative: 'No barrier factors specified.',
        totalExplainedPoints: 0,
      };
    }

    // Normalize weights if they don't sum to 1.0
    const totalWeight = factors.reduce((sum, f) => sum + Math.max(0.01, f.weight), 0);

    let totalPoints = 0;
    const rawContributions = factors.map((f) => {
      const normalizedWeight = f.weight / totalWeight;
      const points = Math.round(f.rawScore * normalizedWeight * 10) / 10;
      totalPoints += points;
      return {
        name: f.name,
        category: f.category,
        rawScore: f.rawScore,
        weight: parseFloat(normalizedWeight.toFixed(3)),
        pointsContributed: points,
      };
    });

    const roundedTotal = Math.min(100, Math.max(0, Math.round(totalPoints)));

    const attributionBreakdown: BarrierContribution[] = rawContributions
      .map((item) => {
        const pct = roundedTotal > 0
          ? Math.round((item.pointsContributed / roundedTotal) * 100)
          : 0;

        let severity: BarrierContribution['severity'] = 'low';
        if (item.rawScore >= 75) severity = 'critical';
        else if (item.rawScore >= 55) severity = 'high';
        else if (item.rawScore >= 35) severity = 'moderate';

        let mitigation = 'No immediate action required';
        if (item.category === 'transport') {
          mitigation = 'Deploy rural hospital shuttle voucher or coordinate local ASHA transit';
        } else if (item.category === 'distance') {
          mitigation = 'Route to nearest secondary sub-district hospital or community clinic';
        } else if (item.category === 'cost') {
          mitigation = 'Activate government healthcare benefits / diagnostic fee waiver';
        } else if (item.category === 'digital') {
          mitigation = 'Assign assisted in-person desk booking and audio-guided notifications';
        } else if (item.category === 'language') {
          mitigation = 'Provide vernacular language audio navigator and dialect translation';
        } else if (item.category === 'documentation') {
          mitigation = 'Fast-track digital identity onboarding and document digitization';
        } else if (item.category === 'timing') {
          mitigation = 'Provide evening/weekend appointment slots to protect daily wages';
        } else if (item.category === 'support') {
          mitigation = 'Assign community health volunteer companion for facility visits';
        }

        return {
          ...item,
          percentageOfFriction: pct,
          severity,
          mitigationOpportunity: mitigation,
        };
      })
      .sort((a, b) => b.pointsContributed - a.pointsContributed);

    const dominant = attributionBreakdown[0] || { name: 'Unknown', pointsContributed: 0 };
    const dominantPct = attributionBreakdown.length > 0
      ? attributionBreakdown[0].percentageOfFriction
      : 0;

    const explainabilityNarrative =
      `Overall friction score is ${roundedTotal}/100. ` +
      `The largest single contributor is "${dominant.name}" contributing +${dominant.pointsContributed.toFixed(1)} points ` +
      `(${dominantPct}% of total friction). ` +
      `Interventions targeting ${attributionBreakdown.slice(0, 2).map((b) => `"${b.name}"`).join(' and ')} ` +
      `can relieve up to ${attributionBreakdown.slice(0, 2).reduce((s, b) => s + b.pointsContributed, 0).toFixed(1)} friction points.`;

    return {
      overallFrictionScore: roundedTotal,
      calculatedFromPoints: parseFloat(totalPoints.toFixed(1)),
      dominantBarrier: dominant.name,
      attributionBreakdown,
      explainabilityNarrative,
      totalExplainedPoints: parseFloat(totalPoints.toFixed(1)),
    };
  }
}
