import React from 'react';
import { History, GitCommit, Sparkles } from 'lucide-react';

export const ChangelogPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
          <History className="w-3.5 h-3.5 text-teal-600" />
          <span>Release Ledger</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Changelog</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Notable releases, architectural modernizations, and feature updates in the PFIS platform.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
        <div className="border-l-2 border-teal-600 pl-4 space-y-2">
          <span className="px-2.5 py-0.5 rounded bg-teal-50 text-teal-800 font-mono text-xs font-bold border border-teal-200">
            v1.0.0 — Open Source Core Release
          </span>
          <p className="text-xs text-slate-400 font-mono">September 2026</p>
          <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1 pt-1">
            <li>Zero-login landing page and unauthenticated public demo suite (/demo, /demo/simulator).</li>
            <li>Deterministic intelligence core: friction scoring, synergy interaction, attribution, and knapsack optimizer.</li>
            <li>Pluggable provider architecture: OpenStreetMap/Nominatim, Local storage, optional Ollama LLM.</li>
            <li>Embedded relational database engine allowing zero-setup local dev without external DB daemons.</li>
            <li>Clean OpenAPI 3.0 documentation and developer REST explorer (/api).</li>
            <li>Removed hardcoded credentials, personal emails, and hackathon presentation copy.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
