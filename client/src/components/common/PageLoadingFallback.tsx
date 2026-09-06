import React from 'react';
import { Activity } from 'lucide-react';

export const PageLoadingFallback: React.FC = () => {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide">
          Loading Health Intelligence Portal...
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Optimizing low-bandwidth clinical telemetry
        </p>
      </div>
    </div>
  );
};
