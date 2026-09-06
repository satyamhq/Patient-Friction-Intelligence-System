import React, { useState, useEffect } from 'react';
import { governmentService } from '../../services/governmentService';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { BarChart3, TrendingUp, AlertTriangle, Users, ShieldAlert, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GovernmentPopulationBarriers: React.FC = () => {
  const [barriers, setBarriers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await governmentService.getPopulationBarriers();
        if (res.success) {
          setBarriers(res.barriers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-amber-600" />
            Population Friction & Social Determinant Barriers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            District-wide prevalence of non-clinical healthcare access barriers across transport, daily wage loss, and supplies.
          </p>
        </div>
        <Link
          to="/government/interventions"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
        >
          <Sliders className="w-4 h-4" />
          Deploy Interventions
        </Link>
      </div>

      {/* Barriers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {barriers.map((b, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {b.category}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    b.severity === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      : b.severity === 'HIGH'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}
                >
                  {b.severity} Severity
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                    {b.prevalencePercent}%
                  </span>
                  <span className="text-xs text-slate-400 block">Prevalence in District</span>
                </div>
                {b.affectedCitizens && (
                  <div className="text-right">
                    <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                      ~{b.affectedCitizens.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 block">Affected Cohort</span>
                  </div>
                )}
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    b.prevalencePercent > 40
                      ? 'bg-rose-500'
                      : b.prevalencePercent > 25
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${b.prevalencePercent}%` }}
                />
              </div>
            </div>

            {b.trend && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
                <span>Seasonal Trend:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{b.trend}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
