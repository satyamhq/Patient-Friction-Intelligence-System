import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Activity,
  Layers,
  Compass,
  GitBranch,
  BarChart3,
  Database,
  Sliders,
  FileCode2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Users,
  Building2,
  Lock,
  Download,
  Terminal,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { DemoService } from '../../services/demoService';

export const PublicDemo: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [overview, setOverview] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [interventionsData, setInterventionsData] = useState<any>(null);
  const [budget, setBudget] = useState<number>(200000);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovData, patData, intData] = await Promise.all([
        DemoService.getOverview(),
        DemoService.getSyntheticPatients(1, 20),
        DemoService.getInterventions(budget),
      ]);
      setOverview(ovData);
      setPatients(patData?.patients || []);
      if (patData?.patients?.length > 0) {
        setSelectedPatient(patData.patients[0]);
      }
      setInterventionsData(intData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    await DemoService.resetDemo();
    await loadData();
  };

  const handleBudgetChange = async (newBudget: number) => {
    setBudget(newBudget);
    try {
      const data = await DemoService.getInterventions(newBudget);
      setInterventionsData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'patients', label: 'Synthetic Patients', icon: <Users className="w-4 h-4" /> },
    { id: 'leakage', label: 'Care Leakage Funnel', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'interventions', label: 'Policy Optimizer', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'dataset', label: 'Synthetic Dataset', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Public Intelligence Suite</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
              SYNTHETIC DEMO DATA
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">• Zero Auth Required</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Patient Friction Intelligence Demo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Explore non-clinical access friction models, simulated care pathways, and intervention optimization on synthetic data.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDemo}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Reset Demo
          </Button>
          <Link to="/demo/simulator">
            <Button variant="primary" size="sm" icon={<Sliders className="w-4 h-4" />}>
              Open What-If Simulator →
            </Button>
          </Link>
        </div>
      </div>

      {/* Demo Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              currentTab === tab.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cohort Size</span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
                {overview?.summary?.totalCohortPatients || 500}
              </p>
              <span className="text-[10px] text-teal-600">Synthetic Patients</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Friction Score</span>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 font-mono mt-1">
                {overview?.summary?.averageFrictionScore || 58}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </p>
              <span className="text-[10px] text-slate-500">Across 8 access factors</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Care Completion</span>
              <p className="text-2xl sm:text-3xl font-black text-teal-600 font-mono mt-1">
                {overview?.summary?.averageCareCompletionProbability || 42}%
              </p>
              <span className="text-[10px] text-slate-500">Unmitigated baseline</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Primary Leakage</span>
              <p className="text-sm font-bold text-amber-700 mt-2 truncate">
                {overview?.summary?.highestCareLeakageStage || '2. Consultation'}
              </p>
              <span className="text-[10px] text-slate-500">Largest dropout bottleneck</span>
            </div>
          </div>

          {/* Care Leakage Funnel Overview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-teal-600" />
                  <span>5-Stage Care Leakage Funnel</span>
                </h3>
                <p className="text-xs text-slate-500">Tracking synthetic cohort volume through referral to post-care</p>
              </div>
              <button
                onClick={() => setSearchParams({ tab: 'leakage' })}
                className="text-xs font-bold text-teal-700 hover:underline"
              >
                Inspect Full Funnel Data →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {overview?.careLeakageFunnel?.stages?.map((s: any) => (
                <div key={s.stage} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-900">{s.stageLabel}</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black font-mono text-slate-800">{s.patientsCompleted}</span>
                    <span className="text-[11px] font-bold text-teal-700">{s.cumulativeSurvivalRate}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full" style={{ width: `${s.cumulativeSurvivalRate}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 line-clamp-2">{s.primaryLeakageReason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYNTHETIC PATIENTS & FRICTION FINGERPRINT */}
      {currentTab === 'patients' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Patient List (5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Synthetic Patient Cohort</h3>
              <span className="text-xs text-slate-400">{patients.length} loaded</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {patients.map((p) => (
                <div
                  key={p.id || p._id}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    (selectedPatient?.id === p.id || selectedPatient?._id === p._id)
                      ? 'bg-teal-50/80 border-teal-300 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{p.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{p.patientCode}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {p.age}y • {p.gender} • {p.location?.city || 'Rural District'}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Transit: {p.transportMode || 'Public bus'}</span>
                    <span className="font-bold text-teal-700">Select Profile →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Detail & Fingerprint (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            {selectedPatient ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900">{selectedPatient.name}</h2>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-xs font-bold">
                        {selectedPatient.patientCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedPatient.location?.village || selectedPatient.location?.city} • Language: {selectedPatient.preferredLanguage || 'Punjabi'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Care Stage</span>
                    <span className="text-xs font-bold text-teal-700 capitalize bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                      {selectedPatient.currentStage || 'Referral'}
                    </span>
                  </div>
                </div>

                {/* Barrier Attribution Decomposition */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                    Non-Clinical Barrier Decomposition
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Distance</span>
                      <span className="text-sm font-bold text-slate-800">
                        {selectedPatient.location?.distanceToNearestHospitalKm || 28} km
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Daily Wage</span>
                      <span className="text-sm font-bold text-slate-800">
                        ₹{selectedPatient.socioeconomic?.dailyWageINR || 320}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Digital Tier</span>
                      <span className="text-sm font-bold text-slate-800 capitalize">
                        {selectedPatient.socioeconomic?.digitalLiteracyTier || 'basic'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Ration Card</span>
                      <span className="text-sm font-bold text-teal-700 font-mono">
                        {selectedPatient.socioeconomic?.rationCardCategory || 'BPL'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-2">
                  <h4 className="font-bold text-xs text-teal-900">Explainable Digital Twin Recommendation</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Patient experiences compound transit and lost-wage friction when attending morning clinic visits.
                    Allocating an afternoon appointment with an ASHA transport companion increases estimated visit completion by 28%.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                Select a synthetic patient from the left column to view their digital twin friction profile.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CARE LEAKAGE FUNNEL */}
      {currentTab === 'leakage' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Markov Attrition Analysis</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              5-Stage Healthcare Journey Attrition Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Modeling how friction points compound across referral, clinical consultation, laboratory diagnostics,
              medication adherence, and follow-up reviews.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {overview?.careLeakageFunnel?.stages?.map((stage: any) => (
              <div
                key={stage.stage}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-400 mr-2">STAGE {stage.stageOrder}</span>
                    <span className="font-extrabold text-sm text-slate-900">{stage.stageLabel}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">Entered: <strong>{stage.patientsEntered}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span className="text-rose-600 font-bold">Dropped: {stage.patientsDropped}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-teal-700 font-bold">Retained: {stage.cumulativeSurvivalRate}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full transition-all"
                    style={{ width: `${stage.cumulativeSurvivalRate}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 pt-1">
                  <span><strong>Primary Leakage Driver:</strong> {stage.primaryLeakageReason}</span>
                  <span className="text-[11px] text-slate-400">Stage Retention: {stage.stageRetentionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INTERVENTION OPTIMIZER */}
      {currentTab === 'interventions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Knapsack Resource Allocation</span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Intervention Budget Optimizer</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select available budget in INR to calculate the mathematically optimal portfolio of non-clinical interventions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[100000, 200000, 500000].map((b) => (
                  <button
                    key={b}
                    onClick={() => handleBudgetChange(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      budget === b
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ₹{(b / 1000).toFixed(0)}k Budget
                  </button>
                ))}
              </div>
            </div>

            {interventionsData?.optimization && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Allocated Cost</span>
                  <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                    ₹{interventionsData.optimization.totalAllocatedCostINR?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Completion Gain</span>
                  <p className="text-lg font-black text-emerald-600 font-mono mt-0.5">
                    +{interventionsData.optimization.projectedGainPercent}%
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Patients Helped</span>
                  <p className="text-lg font-black text-teal-700 font-mono mt-0.5">
                    {interventionsData.optimization.estimatedPatientsHelped}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Cost Per Patient</span>
                  <p className="text-lg font-black text-indigo-700 font-mono mt-0.5">
                    ₹{interventionsData.optimization.costPerPatientHelpedINR}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Selected Interventions Portfolio */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900">Optimally Selected Interventions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {interventionsData?.optimization?.selectedInterventions?.map((item: any) => (
                <div key={item.code} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-bold text-[10px]">
                    {item.code}
                  </span>
                  <h5 className="font-bold text-xs text-slate-900">{item.name}</h5>
                  <p className="text-[11px] text-slate-500 leading-normal">{item.description}</p>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px]">
                    <span className="text-slate-400">Unit Cost:</span>
                    <span className="font-mono font-bold text-slate-800">₹{item.unitCostINR}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SYNTHETIC DATASET */}
      {currentTab === 'dataset' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Open Research Artifacts</span>
              <h2 className="text-xl font-black text-slate-900 mt-1">PFIS Synthetic Access Friction Cohort</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                500 patient cohort generated via deterministic pseudorandom seed. Zero Protected Health Information.
              </p>
            </div>
            <a
              href="/api/demo/dataset"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Raw JSON</span>
            </a>
          </div>

          <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs space-y-2 overflow-x-auto max-h-96">
            <p className="text-slate-400">// Sample Record from PFIS Synthetic Cohort</p>
            <pre>{JSON.stringify(patients[0] || {}, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
