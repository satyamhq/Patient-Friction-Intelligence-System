import React from 'react';
import { Shield, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SecurityPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          <span>Security & Governance Policy</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Security & Privacy Governance</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          The Patient Friction Intelligence System is architected with strict boundaries between operational research intelligence,
          synthetic test environments, and self-hosted clinical deployments.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Synthetic Data & Zero-PHI Architecture</h2>
          <p>
            All demo environments, integration test suites, and sample exports contain purely synthetic, mathematically generated
            data cohorts. No real Protected Health Information (PHI) or identifiable individuals are stored in the public repository.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Non-Clinical Operational Scope</h2>
          <p>
            PFIS measures access barriers such as physical distance, transit deficits, diagnostic out-of-pocket costs, and clinic timing.
            It does not perform clinical diagnosis, analyze physiological bio-markers, or prescribe treatments.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Reporting Vulnerabilities</h2>
          <p>
            If you identify a security vulnerability or credential leak, please report it privately via GitHub Security Advisories
            or email the maintainers at <code className="bg-slate-100 px-2 py-0.5 rounded text-teal-800 font-mono">security@pfis.org</code>.
          </p>
        </section>
      </div>
    </div>
  );
};
