import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Landmark,
  MapPin,
  TrendingDown,
  Activity,
  GitFork,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Sparkles,
  Building2,
  Users,
} from 'lucide-react';
import { governmentService } from '../../services/governmentService';

export const GovernmentDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [barriers, setBarriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovRes, fnRes, brRes] = await Promise.all([
          governmentService.getDistrictOverview(),
          governmentService.getCareLeakageFunnel(),
          governmentService.getPopulationBarriers(),
        ]);
        setOverview(ovRes);
        setFunnel(fnRes.funnel);
        setBarriers(brRes.barriers);
      } catch (err) {
        console.error('Failed to load government dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const metrics = overview?.metrics;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-orange-800 p-6 sm:p-8 text-white shadow-xl shadow-amber-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-amber-100 mb-3 border border-white/20">
            <Landmark className="w-3.5 h-3.5" /> District Health Operational Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {overview?.district || 'Kapurthala & Phagwara Block'}, {overview?.state || 'Punjab'}
          </h1>
          <p className="text-sm text-amber-100 max-w-xl mt-1 leading-relaxed">
            Population-level friction tracking, non-clinical care leakage detection, and public health continuity
            surveillance.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/government/friction-map"
            className="px-5 py-2.5 rounded-xl bg-white text-amber-800 font-semibold text-sm hover:bg-amber-50 shadow-md transition-all flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" /> Block Friction Map
          </Link>
          <Link
            to="/government/interventions"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" /> Commission Resources
          </Link>
        </div>
      </div>

      {/* Privacy Guarantee Alert */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Aggregated Population Governance & Data Minimization:</span> Patient
          personally identifiable information (PII) is anonymized. Visualizations represent district cohort aggregations
          to guide health policy, transit subsidies, and supply chain allocations.
        </div>
      </div>

      {/* Key District Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Population Monitored</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {metrics?.totalPopulationMonitored?.toLocaleString() || '482,000'}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 block">
            Cohort sample: 500+ surveyed citizens
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Friction Index</span>
            <Activity className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {metrics?.averageDistrictFrictionIndex || 58} / 100
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 block">
            Moderate-High operational resistance
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Care Completion Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics?.careCompletionRatePercent || 71.4}%
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
            +3.8% improvement since ASHA app rollout
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Care Leakage Rate</span>
            <TrendingDown className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {metrics?.careLeakageRatePercent || 28.6}%
          </div>
          <span className="text-[11px] text-orange-600 dark:text-orange-400 font-medium mt-1 block">
            Primary drop-off: Diagnostics stage
          </span>
        </div>
      </div>

      {/* 5-Stage Care Leakage Funnel */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitFork className="w-5 h-5 text-amber-500" /> 5-Stage Patient Care Continuity & Leakage Funnel
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drop-out rates across: Referral &rarr; Consultation &rarr; Diagnostics &rarr; Treatment &rarr; Follow-up
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 font-bold text-xs">
            38.9% Closed-Loop Retention
          </span>
        </div>

        <div className="space-y-4">
          {funnel.map((step, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{step.stage}</span>
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {step.patientsReached.toLocaleString()} patients reached
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                    {step.retentionRatePercent}% retained
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${step.retentionRatePercent}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  Primary friction drivers:{' '}
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {step.primaryLeakageDrivers.join(', ')}
                  </span>
                </span>
                {step.dropoffCount > 0 && (
                  <span className="text-rose-500 font-semibold">
                    -{step.dropoffCount.toLocaleString()} dropped out
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Population Barrier Breakdown */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" /> Aggregate Non-Clinical Population Barriers
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Prevalence of travel, financial, documentation, and digital barriers across district blocks
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {barriers.map((barrier, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                  {barrier.category}
                </span>
                <span className="text-xs text-slate-400">
                  {barrier.affectedCitizens.toLocaleString()} citizens affected &bull; Trend: {barrier.trend}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400 block">
                  {barrier.prevalencePercent}%
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    barrier.severity === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-600'
                      : barrier.severity === 'HIGH'
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-blue-500/10 text-blue-600'
                  }`}
                >
                  {barrier.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
