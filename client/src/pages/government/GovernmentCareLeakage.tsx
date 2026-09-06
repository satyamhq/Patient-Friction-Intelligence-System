import React, { useState, useEffect } from 'react';
import { governmentService } from '../../services/governmentService';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { GitFork, AlertTriangle, TrendingDown, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export const GovernmentCareLeakage: React.FC = () => {
  const [funnel, setFunnel] = useState<any[]>([]);
  const [continuityScore, setContinuityScore] = useState<number>(38.9);
  const [leakageWarning, setLeakageWarning] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await governmentService.getCareLeakageFunnel();
        if (res.success) {
          setFunnel(res.funnel || []);
          setContinuityScore(res.overallContinuityScore || 38.9);
          setLeakageWarning(res.leakageWarning || '');
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
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <GitFork className="w-7 h-7 text-amber-600" />
              District Care Continuity & Leakage Funnel
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Cohort tracking across 5 clinical referral and treatment milestones to pinpoint journey drop-offs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Closed-Loop Continuity: {continuityScore}%
            </span>
          </div>
        </div>

        {leakageWarning && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{leakageWarning}</span>
          </div>
        )}
      </div>

      {/* Funnel Stages */}
      <div className="space-y-4">
        {funnel.map((stage, idx) => {
          const retention = stage.retentionRatePercent ?? 100;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{stage.stage}</h3>
                    <span className="text-xs text-slate-400">
                      Reached: <strong>{stage.patientsReached?.toLocaleString()}</strong> citizens
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                    {retention}%
                  </span>
                  <span className="text-xs text-slate-400 block">Retention</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    retention > 70 ? 'bg-emerald-500' : retention > 45 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${retention}%` }}
                />
              </div>

              {/* Primary Drivers */}
              {stage.primaryLeakageDrivers && stage.primaryLeakageDrivers.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Observed Friction Drivers: </span>
                  {stage.primaryLeakageDrivers.join(' • ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
