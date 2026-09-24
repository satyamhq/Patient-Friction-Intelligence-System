import React from 'react';
import { GitPullRequest, Terminal, CheckCircle2, Code2 } from 'lucide-react';

export const ContributingGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
          <GitPullRequest className="w-3.5 h-3.5 text-teal-600" />
          <span>Community Contribution Guide</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contributing to PFIS</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          We welcome contributions to intelligence algorithms, data adapters, UI accessibility, and documentation.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">Developer Workflow</h2>
          <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs space-y-1 overflow-x-auto">
            <p>git clone https://github.com/satyamhq/Patient-Friction-Intelligence-System.git</p>
            <p>npm run install:all</p>
            <p>npm test            # Run deterministic intelligence test suite</p>
            <p>npm run typecheck   # Validate TypeScript types across frontend and backend</p>
            <p>npm run dev         # Start local full-stack development environment</p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">Code Standards</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>Keep core intelligence functions deterministic and strictly typed in TypeScript.</li>
            <li>Do not introduce mandatory paid SaaS or cloud-only API dependencies.</li>
            <li>All new intelligence engines must include automated unit tests in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">server/tests/</code>.</li>
            <li>Maintain zero-PHI safety: never commit real patient records or personal identities.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
