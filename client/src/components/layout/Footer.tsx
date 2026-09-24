import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartHandshake, Github, BookOpen, Terminal, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200/80 pt-12 sm:pt-16 pb-[max(2.5rem,env(safe-area-inset-bottom,2.5rem))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10 mb-12">
          {/* Col 1: Brand & Core Mission */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/favicon.svg"
                alt="PFIS Logo"
                className="w-8 h-8 rounded-xl shadow-xs shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                  PFIS
                </span>
                <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Patient Friction Intelligence Platform
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              An open-source intelligence platform for measuring non-clinical healthcare access barriers,
              simulating targeted interventions, and understanding where care journeys break.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/70">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                100% Deterministic Engine
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/70">
                <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                Non-Clinical Access Intelligence
              </span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">Product</h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to="/demo" className="hover:text-teal-600 transition-colors">
                  Explore Demo
                </Link>
              </li>
              <li>
                <Link to="/demo/simulator" className="hover:text-teal-600 transition-colors">
                  What-If Simulator
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-teal-600 transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link to="/api-docs" className="hover:text-teal-600 transition-colors">
                  REST & OpenAPI Spec
                </Link>
              </li>
              <li>
                <Link to="/portals" className="hover:text-teal-600 transition-colors">
                  Operational Portals
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Developers */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">Developers</h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <a
                  href="https://github.com/satyamhq/Patient-Friction-Intelligence-System"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-teal-600 transition-colors inline-flex items-center gap-1"
                >
                  <Github className="w-3 h-3 text-slate-400" />
                  GitHub Repository
                </a>
              </li>
              <li>
                <Link to="/docs" className="hover:text-teal-600 transition-colors inline-flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-slate-400" />
                  Documentation Hub
                </Link>
              </li>
              <li>
                <Link to="/contributing" className="hover:text-teal-600 transition-colors">
                  Contributing Guide
                </Link>
              </li>
              <li>
                <Link to="/api-docs" className="hover:text-teal-600 transition-colors inline-flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-slate-400" />
                  API Reference
                </Link>
              </li>
              <li>
                <Link to="/changelog" className="hover:text-teal-600 transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Community & Legal */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">Community & Legal</h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <a
                  href="https://github.com/satyamhq/Patient-Friction-Intelligence-System/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-teal-600 transition-colors inline-flex items-center gap-1"
                >
                  Issue Tracker
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/satyamhq/Patient-Friction-Intelligence-System/discussions"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-teal-600 transition-colors inline-flex items-center gap-1"
                >
                  Discussions
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              </li>
              <li>
                <Link to="/security" className="hover:text-teal-600 transition-colors">
                  Security & Privacy
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/satyamhq/Patient-Friction-Intelligence-System/blob/main/LICENSE"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-teal-600 transition-colors"
                >
                  MIT License
                </a>
              </li>
              <li>
                <Link to="/docs" className="hover:text-teal-600 transition-colors">
                  Project Roadmap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-6 text-[11px] text-slate-500 leading-relaxed">
          <strong className="text-slate-700 font-semibold">Healthcare Operational Disclaimer:</strong> PFIS is an open-source research and operational decision-support prototype for measuring non-clinical access friction (transit deficits, lost wages, digital literacy, documentation hurdles). All public demo data is synthetic. PFIS does not provide clinical diagnoses, medical advice, or therapeutic recommendations.
        </div>

        {/* Bottom Bar: Copyright & Telemetry Status */}
        <div className="border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">Open Source • Local First</span>
            <span className="text-slate-300">•</span>
            <span>No Proprietary SaaS Required</span>
          </div>
          <p>© {new Date().getFullYear()} Patient Friction Intelligence System (PFIS). Released under the MIT License.</p>
        </div>
      </div>
    </footer>
  );
};


