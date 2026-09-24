import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
  Compass,
  Bus,
  Coins,
  FileCheck,
  Clock,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { DemoService, PublicSimulationParams, PublicSimulationResponse } from '../../services/demoService';

export const PublicSimulator: React.FC = () => {
  const [params, setParams] = useState<PublicSimulationParams>({
    distanceKm: 28,
    transportAvailability: 30,
    costBurden: 65,
    digitalLiteracy: 35,
    languageBarrier: 45,
    familySupport: 40,
    documentationReady: 40,
    appointmentTiming: 30,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PublicSimulationResponse['outputs'] | null>(null);

  const runSim = async (p: PublicSimulationParams) => {
    setLoading(true);
    try {
      const res = await DemoService.simulate(p);
      setResult(res.outputs);
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSim(params);
  }, []);

  const handleSliderChange = (key: keyof PublicSimulationParams, val: number) => {
    const updated = { ...params, [key]: val };
    setParams(updated);
    runSim(updated);
  };

  const handleReset = () => {
    const defaults: PublicSimulationParams = {
      distanceKm: 28,
      transportAvailability: 30,
      costBurden: 65,
      digitalLiteracy: 35,
      languageBarrier: 45,
      familySupport: 40,
      documentationReady: 40,
      appointmentTiming: 30,
    };
    setParams(defaults);
    runSim(defaults);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
              <Sliders className="w-3.5 h-3.5 text-teal-600" />
              <span>Counterfactual Policy Simulator</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
              SYNTHETIC DEMO DATA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Non-Clinical Friction & What-If Intervention Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Simulate how changes in non-clinical access barriers (distance, transit availability, cost burden, documentation)
            influence care completion rates and stage-by-stage dropouts across synthetic patient journeys.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Reset Baseline
          </Button>
          <Link to="/demo">
            <Button variant="secondary" size="sm">
              View Cohort Overview →
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Patient & Environmental Barriers</span>
            </h3>
            <span className="text-[11px] font-medium text-slate-400">Sliders update live</span>
          </div>

          <div className="space-y-4">
            {/* Distance */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Facility Distance</span>
                <span className="font-mono text-teal-700 font-bold">{params.distanceKm} km</span>
              </div>
              <input
                type="range"
                min="4"
                max="80"
                value={params.distanceKm}
                onChange={(e) => handleSliderChange('distanceKm', Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>4 km (Sub-center)</span>
                <span>80 km (Tertiary Hospital)</span>
              </div>
            </div>

            {/* Transport Availability */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Public Transit Availability</span>
                <span className="font-mono text-teal-700 font-bold">{params.transportAvailability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.transportAvailability}
                onChange={(e) => handleSliderChange('transportAvailability', Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (No transit / remote)</span>
                <span>100% (Frequent direct bus)</span>
              </div>
            </div>

            {/* Cost Burden */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Out-of-Pocket Cost Burden & Wage Threat</span>
                <span className="font-mono text-rose-700 font-bold">{params.costBurden}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.costBurden}
                onChange={(e) => handleSliderChange('costBurden', Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (Fully subsidized)</span>
                <span>100% (Severe daily wage loss)</span>
              </div>
            </div>

            {/* Digital Literacy */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Digital Literacy & Token Access</span>
                <span className="font-mono text-cyan-700 font-bold">{params.digitalLiteracy}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.digitalLiteracy}
                onChange={(e) => handleSliderChange('digitalLiteracy', Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (No smartphone / offline)</span>
                <span>100% (Independent user)</span>
              </div>
            </div>

            {/* Documentation Readiness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Documentation & Scheme Verification</span>
                <span className="font-mono text-emerald-700 font-bold">{params.documentationReady}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.documentationReady}
                onChange={(e) => handleSliderChange('documentationReady', Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Appointment Timing Flexibility */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Appointment Timing Flexibility</span>
                <span className="font-mono text-violet-700 font-bold">{params.appointmentTiming}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.appointmentTiming}
                onChange={(e) => handleSliderChange('appointmentTiming', Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>
          </div>
        </div>

        {/* Results & Scenario Comparisons (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Baseline Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <p className="text-[11px] font-semibold text-slate-500">Baseline Friction</p>
              <p className="text-3xl font-black text-rose-600 font-mono">
                {result?.baselineFrictionScore ?? 68}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </p>
              <p className="text-[10px] text-slate-500">Total non-clinical impedance</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <p className="text-[11px] font-semibold text-slate-500">Completion Estimate</p>
              <p className="text-3xl font-black text-teal-600 font-mono">
                {result?.baselineCompletionProbability ?? 42}%
              </p>
              <p className="text-[10px] text-slate-500">Full 5-stage adherence</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <p className="text-[11px] font-semibold text-slate-500">Highest Dropout Risk</p>
              <p className="text-xs font-bold text-amber-700 mt-1 line-clamp-2">
                {result?.mostLikelyDropoutStage ?? '2. Clinical Consultation'}
              </p>
              <p className="text-[10px] text-slate-400">Critical attrition point</p>
            </div>
          </div>

          {/* Explainable Attribution Breakdown ("What caused this result?") */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Explainability: What Caused This Score?</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transparent additive contribution summing directly to total friction score
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600">
                Total: {result?.baselineFrictionScore ?? 68}/100
              </span>
            </div>

            <div className="space-y-2">
              {result?.attribution?.attributionBreakdown?.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.severity === 'critical'
                          ? 'bg-rose-500'
                          : item.severity === 'high'
                          ? 'bg-amber-500'
                          : 'bg-teal-500'
                      }`}
                    />
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{item.percentageOfFriction}% of total</span>
                    <span className="font-mono font-bold text-slate-900">
                      +{item.pointsContributed.toFixed(1)} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {result?.attribution?.explainabilityNarrative && (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                💡 <strong>Narrative:</strong> {result.attribution.explainabilityNarrative}
              </p>
            )}
          </div>

          {/* Scenario Comparison Cards */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>What-If Scenario Projections</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Counterfactual care completion gains under potential intervention packages
              </p>
            </div>

            <div className="space-y-3">
              {/* Baseline Row */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">Baseline (Status Quo)</p>
                  <p className="text-[11px] text-slate-500">Unmitigated friction barriers</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-800 font-mono">
                    {result?.baselineCompletionProbability ?? 42}%
                  </span>
                  <span className="block text-[10px] text-slate-400">Completion</span>
                </div>
              </div>

              {/* Scenario Cards */}
              {result?.simulatedScenarios?.map((scen, idx) => (
                <div
                  key={scen.scenarioName}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    idx === 2
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : idx === 1
                      ? 'bg-teal-50/70 border-teal-200'
                      : 'bg-cyan-50/70 border-cyan-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">{scen.scenarioName}</p>
                      <span className="px-2 py-0.2 bg-white/90 text-emerald-800 rounded font-bold text-[10px] border border-emerald-200">
                        +{scen.completionGain}% Gain
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{scen.interventionApplied}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:text-right">
                    <div>
                      <span className="text-xs text-slate-500 block">Friction</span>
                      <span className="font-mono font-bold text-slate-800">{scen.projectedFriction}/100</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Projected Completion</span>
                      <span className="text-base font-black text-emerald-700 font-mono">
                        {scen.projectedCompletionProbability}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
