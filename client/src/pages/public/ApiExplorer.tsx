import React, { useState } from 'react';
import {
  FileCode2,
  Terminal,
  Play,
  CheckCircle2,
  ExternalLink,
  Copy,
  Layers,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<number>(0);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/health',
      title: 'System Health & Telemetry',
      desc: 'Returns system uptime, environment mode, active providers, and memory statistics.',
      auth: 'None (Public)',
      sampleQuery: '',
    },
    {
      method: 'GET',
      path: '/api/demo/overview',
      title: 'Public Demo Overview',
      desc: 'Returns summary metrics, 5-stage care leakage funnel, and synthetic cohort statistics.',
      auth: 'None (Public)',
      sampleQuery: '',
    },
    {
      method: 'POST',
      path: '/api/demo/simulate',
      title: 'Run Friction Simulation',
      desc: 'Simulates non-clinical friction, completion probability, and scenario projections.',
      auth: 'None (Public)',
      sampleBody: {
        distanceKm: 28,
        transportAvailability: 35,
        costBurden: 65,
        digitalLiteracy: 40,
        documentationReady: 45,
        appointmentTiming: 30,
      },
    },
    {
      method: 'GET',
      path: '/api/demo/patients',
      title: 'Synthetic Cohort List',
      desc: 'Returns paginated synthetic patient records with multi-dimensional friction vectors.',
      auth: 'None (Public)',
      sampleQuery: '?page=1&limit=5',
    },
    {
      method: 'GET',
      path: '/api/demo/leakage',
      title: 'Care Leakage Funnel',
      desc: 'Markov-like 5-stage transition attrition breakdown from referral to follow-up.',
      auth: 'None (Public)',
      sampleQuery: '?cohort=1000&transport=60&cost=55',
    },
    {
      method: 'GET',
      path: '/api/demo/interventions',
      title: 'Intervention Optimizer',
      desc: 'Knapsack resource allocation selecting optimal interventions for a given budget.',
      auth: 'None (Public)',
      sampleQuery: '?budget=200000',
    },
  ];

  const handleTest = async () => {
    const ep = endpoints[selectedEndpoint];
    setLoading(true);
    try {
      let url = `${ep.path}${ep.sampleQuery || ''}`;
      let res;
      if (ep.method === 'POST') {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ep.sampleBody || {}),
        });
      } else {
        res = await fetch(url);
      }
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const activeEp = endpoints[selectedEndpoint];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
            <FileCode2 className="w-3.5 h-3.5 text-teal-600" />
            <span>OpenAPI 3.0 Documentation</span>
          </span>
          <span className="text-xs text-slate-400">• Zero Auth Required for Demo Endpoints</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          PFIS REST API Explorer
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          Explore and test public non-clinical intelligence endpoints directly in your browser.
          OpenAPI specification is available in <code className="text-slate-800 font-mono">openapi/openapi.yaml</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Endpoint Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider px-2 pb-2">
            Available Endpoints
          </h3>
          {endpoints.map((ep, idx) => (
            <button
              key={ep.path}
              onClick={() => {
                setSelectedEndpoint(idx);
                setTestResult(null);
              }}
              className={`w-full text-left p-3 rounded-2xl transition-all flex flex-col gap-1 ${
                selectedEndpoint === idx
                  ? 'bg-teal-50 border border-teal-300 text-teal-900 shadow-2xs'
                  : 'hover:bg-slate-50 border border-transparent text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    ep.method === 'GET'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-xs font-semibold truncate">{ep.path}</span>
              </div>
              <p className="text-xs font-bold text-slate-800">{ep.title}</p>
            </button>
          ))}
        </div>

        {/* Endpoint Details & Interactive Test (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                    activeEp.method === 'GET'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {activeEp.method}
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">{activeEp.path}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-2">{activeEp.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeEp.desc}</p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleTest}
              isLoading={loading}
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              Send Request
            </Button>
          </div>

          {/* Request Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Example cURL Request</h4>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto">
              {activeEp.method === 'POST'
                ? `curl -X POST http://localhost:5000${activeEp.path} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(activeEp.sampleBody || {})}'`
                : `curl http://localhost:5000${activeEp.path}${activeEp.sampleQuery || ''}`}
            </div>
          </div>

          {/* Live Response Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Live Response Payload</h4>
              {testResult && (
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  HTTP 200 OK
                </span>
              )}
            </div>
            <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
              {testResult ? (
                <pre>{JSON.stringify(testResult, null, 2)}</pre>
              ) : (
                <p className="text-slate-500">// Click "Send Request" above to test this endpoint live</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
