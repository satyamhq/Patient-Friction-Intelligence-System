import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartHandshake, CheckCircle, FileText, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200/80 pt-12 sm:pt-16 pb-[max(2.5rem,env(safe-area-inset-bottom,2.5rem))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Col 1: Brand, Purpose & Compliance */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-xs">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  PFIS Platform
                </span>
                <span className="text-[11px] font-medium text-slate-500 -mt-0.5">
                  Patient Friction Intelligence System
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Healthcare services may be physically present, but are they practically accessible? PFIS systematically
              identifies real-world socio-geographic barriers—from transit deficits to daily wage loss—and enables
              data-driven operational interventions.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/70">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Deterministic Explainability
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/70">
                <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                Zero Medical Diagnostic AI
              </span>
            </div>
          </div>

          {/* Col 2: Clinical & Field Portals */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">Portals</h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to="/patient/dashboard" className="hover:text-teal-600 transition-colors">
                  Patient Care Hub
                </Link>
              </li>
              <li>
                <Link to="/doctor/dashboard" className="hover:text-teal-600 transition-colors">
                  Doctor Consultation Desk
                </Link>
              </li>
              <li>
                <Link to="/asha/dashboard" className="hover:text-teal-600 transition-colors">
                  ASHA Field Operations
                </Link>
              </li>
              <li>
                <Link to="/hospital/dashboard" className="hover:text-teal-600 transition-colors">
                  Hospital Referral Desk
                </Link>
              </li>
              <li>
                <Link to="/government/dashboard" className="hover:text-teal-600 transition-colors">
                  District Health Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence Modules */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">Intelligence</h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to="/patient/hospitals" className="hover:text-teal-600 transition-colors">
                  Find Verified PHCs
                </Link>
              </li>
              <li>
                <Link to="/patient/friction" className="hover:text-teal-600 transition-colors">
                  8D Friction Fingerprint
                </Link>
              </li>
              <li>
                <Link to="/admin/simulator" className="hover:text-teal-600 transition-colors">
                  What-If Scenario Simulator
                </Link>
              </li>
              <li>
                <Link to="/admin/care-leakage" className="hover:text-teal-600 transition-colors">
                  Care Leakage Funnel
                </Link>
              </li>
              <li>
                <Link to="/admin/friction-map" className="hover:text-teal-600 transition-colors">
                  Geospatial Friction Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Standards & Trust */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">Governance</h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to="/about" className="hover:text-teal-600 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Non-Clinical Mandate
                </Link>
              </li>
              <li>
                <Link to="/system-architecture" className="hover:text-teal-600 transition-colors flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  System Architecture
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-600 transition-colors">
                  Facility Onboarding
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                ABDM M3 Compliant
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                PM-JAY Scheme Aware
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Telemetry Status */}
        <div className="border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">All Systems Operational</span>
            <span className="text-slate-300">•</span>
            <span>MongoDB Atlas Cluster Live</span>
          </div>
          <p>© {new Date().getFullYear()} Patient Friction Intelligence System (PFIS). Built for National Public Health Delivery.</p>
        </div>
      </div>
    </footer>
  );
};

