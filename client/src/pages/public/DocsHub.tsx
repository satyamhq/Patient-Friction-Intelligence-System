import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Terminal,
  Cpu,
  Database,
  Shield,
  Layers,
  ExternalLink,
  Code2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const DocsHub: React.FC = () => {
  const docSections = [
    {
      title: 'Getting Started',
      desc: 'Quick start guide for running PFIS locally with or without Docker in under 2 minutes.',
      link: '#quickstart',
      tag: 'Core Guide',
    },
    {
      title: 'System Architecture',
      desc: 'Decoupled 5-layer pipeline separating intelligence, simulation, and pluggable storage.',
      link: '/architecture',
      tag: 'Architecture',
    },
    {
      title: 'Intelligence Engines',
      desc: 'Mathematical formulations for weighted friction scoring, non-linear synergy, and attribution.',
      link: '/demo',
      tag: 'Intelligence',
    },
    {
      title: 'What-If Simulation',
      desc: 'Parameterized patient digital twins, Markov care leakage transition, and counterfactuals.',
      link: '/demo/simulator',
      tag: 'Simulation',
    },
    {
      title: 'REST API & OpenAPI',
      desc: 'Interactive OpenAPI 3.0 specification for public demo and operational endpoints.',
      link: '/api',
      tag: 'API',
    },
    {
      title: 'Synthetic Data Architecture',
      desc: 'Deterministic cohort generation, pseudorandom seeds, and non-clinical privacy safeguards.',
      link: '/demo?tab=dataset',
      tag: 'Data',
    },
    {
      title: 'Security & Privacy Policy',
      desc: 'Zero-PHI guarantees, non-clinical research boundaries, and secure self-hosting guidelines.',
      link: '/security',
      tag: 'Governance',
    },
    {
      title: 'Contributing to PFIS',
      desc: 'Guidelines for submitting pull requests, testing intelligence engines, and reporting issues.',
      link: '/contributing',
      tag: 'Community',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
          <span>Documentation Center</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          PFIS Documentation & Developer Guides
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          The Patient Friction Intelligence System (PFIS) is an open-source platform for modeling,
          measuring, visualizing, and simulating non-clinical barriers that prevent patients from completing healthcare journeys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {docSections.map((sec) => (
          <Link
            key={sec.title}
            to={sec.link}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded">
                {sec.tag}
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                {sec.title}
              </h3>
              <p className="text-xs text-slate-500 leading-normal">{sec.desc}</p>
            </div>
            <span className="text-xs font-bold text-teal-600 flex items-center gap-1 pt-2">
              Read Guide →
            </span>
          </Link>
        ))}
      </div>

      {/* Quick Setup Block */}
      <div id="quickstart" className="bg-slate-900 text-white p-8 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Terminal className="w-5 h-5 text-teal-400" />
          <span>Quick Start in 2 Minutes</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          PFIS runs out-of-the-box using built-in deterministic algorithms and embedded SQL storage.
          Zero required paid cloud accounts, zero mandatory API keys.
        </p>

        <div className="p-4 bg-slate-950 rounded-2xl font-mono text-xs text-slate-200 space-y-1.5 overflow-x-auto border border-slate-800">
          <p className="text-slate-500"># 1. Clone repository</p>
          <p>git clone https://github.com/satyamhq/Patient-Friction-Intelligence-System.git</p>
          <p className="text-slate-500 pt-2"># 2. Install all dependencies</p>
          <p>npm run install:all</p>
          <p className="text-slate-500 pt-2"># 3. Seed synthetic demo cohort</p>
          <p>npm run seed:demo</p>
          <p className="text-slate-500 pt-2"># 4. Start local development server</p>
          <p className="text-teal-400 font-bold">npm run dev</p>
        </div>
      </div>
    </div>
  );
};
