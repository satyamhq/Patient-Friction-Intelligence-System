import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const DemoModeBanner: React.FC<{ message?: string }> = ({
  message = 'Non-Clinical Operational Intelligence Layer • Focuses exclusively on transit, cost, and logistics barriers. Does not diagnose diseases or prescribe medication.',
}) => {
  return (
    <div className="bg-teal-50/80 text-teal-900 border-b border-teal-200/70 text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 text-left sm:text-center leading-snug">
        <div className="flex items-center gap-1.5 sm:gap-2 mx-auto">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-100/80 text-teal-800 font-bold text-[10px] tracking-wide uppercase border border-teal-200/60 shrink-0">
            <ShieldCheck className="w-3 h-3 text-teal-700" />
            Verified
          </span>
          <span className="font-medium text-slate-700">
            <strong className="text-teal-900 font-bold">PFIS</strong> — {message}
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-teal-700/90 shrink-0">
          <CheckCircle2 className="w-3 h-3 text-teal-600" />
          <span>National Healthcare Stack</span>
        </div>
      </div>
    </div>
  );
};

