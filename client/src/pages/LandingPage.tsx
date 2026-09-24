import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ArrowRight,
  Shield,
  Layers,
  Cpu,
  Sparkles,
  GitBranch,
  Terminal,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Database,
  BarChart3,
  Sliders,
  RefreshCw,
  Users,
  Stethoscope,
  Building2,
  ShieldCheck,
  FileCode2,
  Lock,
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  // Interactive Live Demo State
  const [distanceKm, setDistanceKm] = useState<number>(26);
  const [transportAvail, setTransportAvail] = useState<number>(30); // 0-100
  const [costBurden, setCostBurden] = useState<number>(65); // 0-100
  const [digitalAccess, setDigitalAccess] = useState<number>(35); // 0-100
  const [languageBarrier, setLanguageBarrier] = useState<number>(45); // 0-100
  const [documentationReady, setDocumentationReady] = useState<number>(40); // 0-100

  // Live Deterministic Calculations
  const simulationResults = useMemo(() => {
    const transitImpedance = 100 - transportAvail;
    const distanceImpedance = Math.min(100, Math.round(distanceKm * 2.3));
    const digitalBarrier = 100 - digitalAccess;
    const docDeficit = 100 - documentationReady;

    const baseFriction = Math.min(
      100,
      Math.max(
        15,
        Math.round(
          transitImpedance * 0.28 +
            distanceImpedance * 0.22 +
            costBurden * 0.24 +
            digitalBarrier * 0.14 +
            docDeficit * 0.12
        )
      )
    );

    // Non-linear synergy penalty if distance and transit are both critical
    const synergyBonus = transitImpedance >= 55 && distanceImpedance >= 50 ? 8 : 0;
    const finalFriction = Math.min(100, baseFriction + synergyBonus);

    // Care Completion estimate
    const completionProb = Math.max(14, Math.min(95, Math.round(95 - finalFriction * 0.78)));

    // Top Barrier
    let dominant = 'Rural Transit Availability';
    if (costBurden > transitImpedance && costBurden > distanceImpedance) {
      dominant = 'Out-of-Pocket Cost & Wage Loss';
    } else if (distanceImpedance > transitImpedance) {
      dominant = 'Travel Distance to Specialized Facility';
    } else if (digitalBarrier > 70) {
      dominant = 'Digital Token & App Interface Exclusion';
    }

    return {
      frictionScore: finalFriction,
      completionRate: completionProb,
      dominantBarrier: dominant,
      transitImpedance,
      distanceImpedance,
      costBurden,
      digitalBarrier,
      synergyDetected: synergyBonus > 0,
    };
  }, [distanceKm, transportAvail, costBurden, digitalAccess, languageBarrier, documentationReady]);

  // Journey stage friction accumulation
  const journeyStages = [
    {
      step: '01',
      title: 'Referral Initiation',
      description: 'Patient receives primary health center or ASHA referral.',
      barrier: 'Transit Deficit & Booking Confusion',
      frictionDrop: '22% dropout',
      severity: 'moderate',
    },
    {
      step: '02',
      title: 'Clinical Consultation',
      description: 'Physical transit, queue tokens, and initial OPD review.',
      barrier: 'Long Queue Wait & Daily Wage Loss',
      frictionDrop: '26% dropout',
      severity: 'critical',
    },
    {
      step: '03',
      title: 'Diagnostic Testing',
      description: 'Laboratory bloodwork, ultrasound, and pathology report delivery.',
      barrier: 'Out-of-Pocket Diagnostic Fees & Delays',
      frictionDrop: '14% dropout',
      severity: 'high',
    },
    {
      step: '04',
      title: 'Treatment & Meds',
      description: 'Prescription dispensing, therapy adherence, and surgery scheduling.',
      barrier: 'Medication Out-of-Stock & Return Transit',
      frictionDrop: '13% dropout',
      severity: 'high',
    },
    {
      step: '05',
      title: 'Post-Care Follow-up',
      description: 'Chronic monitoring and recovery reviews.',
      barrier: 'Caregiver Fatigue & Inability to Take Repeated Work Leaves',
      frictionDrop: 'Cumulative: 25.4% complete',
      severity: 'low',
    },
  ];

  // 9 Core Intelligence Capabilities Cards
  const intelligenceCapabilities = [
    {
      id: 'fingerprint',
      title: 'Patient Friction Fingerprint',
      what: 'Multi-dimensional non-clinical barrier modeling across geographic, financial, transit, digital, and social constraints.',
      why: 'Clinical teams cannot address dropouts without diagnosing the practical obstacles patients face before reaching the hospital.',
      output: '8-dimensional normalized friction vector (0-100) with confidence bounds.',
      icon: <Activity className="w-5 h-5 text-teal-600" />,
    },
    {
      id: 'interaction',
      title: 'Friction Interaction Engine',
      what: 'Detects non-linear barrier synergies where multiple moderate obstacles compound into catastrophic journey failure.',
      why: 'A 20km trip is manageable by bus; combined with morning clinic hours and daily wage labor, it becomes insurmountable.',
      output: 'Compounding multiplier (1.15x - 1.35x) and causal mechanism narrative.',
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'failure-risk',
      title: 'Care Failure Risk',
      what: 'Probabilistic estimation of patient care dropout before treatment completion.',
      why: 'Enables preventive outreach by frontline health workers before patients disengage.',
      output: 'Care completion probability percentage (e.g. 38%) and risk tier categorization.',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 'digital-twin',
      title: 'Friction Digital Twin',
      what: 'Parameterized computational model of a patient\'s access environment and journey pathway.',
      why: 'Allows healthcare planners to test policy and logistical changes risk-free before deployment.',
      output: 'Interactive virtual patient model supporting synthetic intervention simulations.',
      icon: <Cpu className="w-5 h-5 text-cyan-600" />,
    },
    {
      id: 'simulator',
      title: 'What-If Intervention Simulator',
      what: 'Counterfactual simulation evaluating single and bundled non-clinical interventions on journey retention.',
      why: 'Clarifies whether a rural transit shuttle or diagnostic fee waiver yields greater patient recovery.',
      output: 'Comparative completion rate projections (e.g. Baseline 42% -> Intervened 76%).',
      icon: <Sliders className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'optimizer',
      title: 'Intervention Optimizer',
      what: 'Knapsack and constrained optimization allocating health system resources for maximal care completion.',
      why: 'Public health systems have strictly finite budgets and must maximize completed journeys per rupee invested.',
      output: 'Optimal intervention portfolio, total cost in INR, and cost-per-patient-helped metric.',
      icon: <BarChart3 className="w-5 h-5 text-violet-600" />,
    },
    {
      id: 'population-map',
      title: 'Population Friction Map',
      what: 'Geospatial access barrier heatmaps highlighting systemic infrastructure and transit deserts across regions.',
      why: 'Reveals geographic clusters where healthcare facilities exist on paper but are inaccessible in reality.',
      output: 'Interactive OpenStreetMap layers showing friction hotspots and transit corridors.',
      icon: <Compass className="w-5 h-5 text-rose-600" />,
    },
    {
      id: 'leakage-funnel',
      title: 'Care Leakage Funnel',
      what: 'Stage-by-stage transition funnel quantifying patient attrition between referral, OPD, diagnostics, and treatment.',
      why: 'Pinpoints the exact clinical milestone where the largest share of patient volume is lost.',
      output: '5-stage survival curve with stage-specific primary dropout rationales.',
      icon: <GitBranch className="w-5 h-5 text-orange-600" />,
    },
    {
      id: 'why-failed',
      title: 'Why Did Care Fail? Attribution',
      what: 'Explainable rule-based feature contribution decomposing friction score into exact additive points.',
      why: 'Healthcare administrators need transparent, auditable factors rather than unexplainable black-box scores.',
      output: 'Waterfall attribution breakdown (+18 Transport, +14 Distance, +12 Cost) summing to total score.',
      icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden text-slate-800">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-18 bg-gradient-to-b from-teal-50/50 via-slate-50 to-white border-b border-slate-200/80">
        <div className="absolute inset-0 bg-[radial-gradient(#0d948812_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-5">
            {/* Trust Line Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-semibold border border-slate-200/90 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-slate-900 font-bold">Open-Source Healthcare Infrastructure</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 hidden sm:inline">Self-Hostable • 100% Deterministic</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Understand Why Patients{' '}
              <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Don't Complete Care
              </span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              An open-source intelligence platform for measuring non-clinical healthcare access barriers,
              simulating targeted interventions, and understanding where care journeys break.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <Link to="/demo">
                <Button
                  variant="primary"
                  size="md"
                  icon={<Activity className="w-4 h-4 shrink-0" />}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-xs"
                >
                  Open Demo
                </Button>
              </Link>

              <a href="#simulator">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Sliders className="w-4 h-4 shrink-0 text-teal-600" />}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold"
                >
                  Explore Simulator
                </Button>
              </a>

              <a href="#quickstart">
                <Button
                  variant="outline"
                  size="md"
                  icon={<Terminal className="w-3.5 h-3.5 shrink-0" />}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold"
                >
                  Run Locally
                </Button>
              </a>

              <a
                href="https://github.com/satyamhq/Patient-Friction-Intelligence-System"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="md"
                  icon={<ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                  className="px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700"
                >
                  GitHub
                </Button>
              </a>
            </div>

            {/* Key Architectural Highlights Strip */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto text-left">
              <div className="p-2.5 bg-white/90 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Map Stack</p>
                <p className="text-xs font-bold text-slate-800">OpenStreetMap + Leaflet</p>
                <span className="text-[10px] text-teal-600 font-medium">Zero paid API keys</span>
              </div>
              <div className="p-2.5 bg-white/90 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Architecture</p>
                <p className="text-xs font-bold text-slate-800">Deterministic First</p>
                <span className="text-[10px] text-teal-600 font-medium">Local Ollama optional</span>
              </div>
              <div className="p-2.5 bg-white/90 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Layer</p>
                <p className="text-xs font-bold text-slate-800">Embedded JSON / Postgres</p>
                <span className="text-[10px] text-teal-600 font-medium">Instant local execution</span>
              </div>
              <div className="p-2.5 bg-white/90 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deployment</p>
                <p className="text-xs font-bold text-slate-800">Docker & Node CLI</p>
                <span className="text-[10px] text-teal-600 font-medium">Runs in &lt; 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM SECTION: CARE JOURNEY LEAKAGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>The Access Bottleneck</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Healthcare access isn't just about whether a hospital exists.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Patients with valid referrals regularly drop out before completing treatment due to
            non-clinical friction: transport unavailability, travel distance, direct out-of-pocket costs,
            lost daily wages, digital exclusion, language discordance, and missing identity documents.
          </p>
        </div>

        {/* Visual 5-Stage Journey Breakdown */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {journeyStages.map((stage, idx) => (
            <div
              key={stage.step}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs relative flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-400">{stage.step}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      stage.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : stage.severity === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {stage.frictionDrop}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{stage.title}</h3>
                <p className="text-xs text-slate-500 leading-normal">{stage.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Primary Barrier</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{stage.barrier}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE DEMO WIDGET ON LANDING PAGE */}
      <section id="simulator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 bg-slate-900 text-white rounded-3xl shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 text-teal-300 text-xs font-bold border border-teal-700/60 mb-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Interactive Live Demo • Synthetic Calculation Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Simulate Non-Clinical Friction in Real Time
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Adjust fictional barriers below to observe how access friction and care completion probability react deterministically.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/80">
                Synthetic Data Only
              </span>
              <button
                onClick={() => {
                  setDistanceKm(26);
                  setTransportAvail(30);
                  setCostBurden(65);
                  setDigitalAccess(35);
                  setDocumentationReady(40);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Reset variables to default"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Sliders */}
            <div className="lg:col-span-7 space-y-5">
              {/* Distance Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">Distance to Referral Facility</span>
                  <span className="font-mono text-teal-400 font-bold">{distanceKm} km</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="80"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>4 km (Sub-center)</span>
                  <span>40 km (District)</span>
                  <span>80 km (Tertiary)</span>
                </div>
              </div>

              {/* Transit Availability */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">Public Transit Availability</span>
                  <span className="font-mono text-teal-400 font-bold">{transportAvail}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={transportAvail}
                  onChange={(e) => setTransportAvail(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Infrequent / No Bus</span>
                  <span>Moderate Shared Transit</span>
                  <span>Direct Hourly Route</span>
                </div>
              </div>

              {/* Cost Burden */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">Out-of-Pocket Cost Burden & Wage Loss</span>
                  <span className="font-mono text-rose-400 font-bold">{costBurden}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={costBurden}
                  onChange={(e) => setCostBurden(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Negligible Impact</span>
                  <span>Moderate Wage Threat</span>
                  <span>&gt; 50% Monthly Income</span>
                </div>
              </div>

              {/* Digital Literacy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">Digital Access & Token Literacy</span>
                  <span className="font-mono text-cyan-400 font-bold">{digitalAccess}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={digitalAccess}
                  onChange={(e) => setDigitalAccess(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>No Smartphone</span>
                  <span>Feature Phone / Assisted</span>
                  <span>Independent App User</span>
                </div>
              </div>

              {/* Documentation Readiness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">Identity / Welfare Documentation Readiness</span>
                  <span className="font-mono text-emerald-400 font-bold">{documentationReady}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={documentationReady}
                  onChange={(e) => setDocumentationReady(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {/* Right Column: Computed Outputs */}
            <div className="lg:col-span-5 bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Real-time Intelligence Output
                </span>
                <span className="text-[10px] text-slate-500">Deterministic Model</span>
              </div>

              {/* Gauges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400">Overall Friction Score</p>
                  <p className="text-3xl font-black text-rose-400 mt-1 font-mono">
                    {simulationResults.frictionScore}
                    <span className="text-sm font-normal text-slate-500">/100</span>
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {simulationResults.frictionScore > 65
                      ? 'Severe non-clinical barrier'
                      : 'Moderate friction level'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400">Care Completion Est.</p>
                  <p className="text-3xl font-black text-teal-400 mt-1 font-mono">
                    {simulationResults.completionRate}%
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {simulationResults.completionRate < 45 ? 'High risk of dropout' : 'Moderate adherence likelihood'}
                  </span>
                </div>
              </div>

              {/* Dominant Barrier Box */}
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dominant Access Barrier</p>
                <p className="text-sm font-bold text-amber-300">{simulationResults.dominantBarrier}</p>
                {simulationResults.synergyDetected && (
                  <p className="text-[11px] text-rose-400 font-medium pt-1">
                    ⚠️ Compounding penalty applied: Long transit deficit + remote distance synergy detected.
                  </p>
                )}
              </div>

              {/* Recommended Action */}
              <div className="p-3.5 bg-teal-950/40 rounded-xl border border-teal-800/60 space-y-1">
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                  Recommended Non-Clinical Intervention
                </p>
                <p className="text-xs text-slate-200">
                  {simulationResults.frictionScore > 60
                    ? 'Deploy Subsidized Rural Community Transit Shuttle & Frontline ASHA Booking Escort'
                    : 'Provide Afternoon Flexible OPD Slot & Vernacular Audio Guidance'}
                </p>
              </div>

              <Link to="/demo" className="block pt-2">
                <Button variant="primary" size="md" className="w-full text-xs font-bold py-2.5">
                  Open Comprehensive Demo Suite →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT-IF SIMULATOR PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Counterfactual Simulation</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Test Policies Before Spending Budget
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              PFIS simulates realistic public health interventions on synthetic cohorts, showing exactly
              how much care completion improves per intervention package.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Baseline */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Baseline Status Quo</span>
                <span className="px-2 py-0.5 bg-slate-200 rounded text-slate-700">No Intervention</span>
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono">42%</p>
              <p className="text-xs text-slate-600">
                Care completion rate across 500 patient cohort without dedicated transit support.
              </p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full w-[42%]" />
              </div>
            </div>

            {/* Scenario 1 */}
            <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-teal-800">
                <span>Scenario A</span>
                <span className="px-2 py-0.5 bg-teal-200/80 rounded text-teal-900 font-bold">+19% Gain</span>
              </div>
              <p className="text-3xl font-black text-teal-700 font-mono">61%</p>
              <p className="text-xs text-slate-700">
                Intervention: Scheduled rural community transit vouchers connecting villages to facility.
              </p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full w-[61%]" />
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-800">
                <span>Scenario B</span>
                <span className="px-2 py-0.5 bg-emerald-200 rounded text-emerald-900 font-bold">+34% Gain</span>
              </div>
              <p className="text-3xl font-black text-emerald-700 font-mono">76%</p>
              <p className="text-xs text-slate-700">
                Intervention: Transport vouchers combined with same-day local diagnostic testing clinics.
              </p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[76%]" />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            *Example simulated values calculated deterministically across synthetic cohorts. Not clinical predictions.
          </p>
        </div>
      </section>

      {/* 5. 9 CORE INTELLIGENCE CARDS SECTION */}
      <section id="intelligence" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Modular Platform Engines</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            The 9 Core Intelligence Capabilities of PFIS
          </h2>
          <p className="text-sm text-slate-600">
            Each capability is built as a typed, deterministic TypeScript module that runs without requiring paid cloud APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intelligenceCapabilities.map((card) => (
            <div
              key={card.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">{card.icon}</div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{card.title}</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">What it does</span>
                    <p className="text-slate-600 mt-0.5">{card.what}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Why it matters</span>
                    <p className="text-slate-600 mt-0.5">{card.why}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="font-bold text-teal-700 uppercase tracking-wider text-[10px]">Example Output</span>
                <p className="text-xs font-medium text-slate-800 mt-0.5">{card.output}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CLEAN SYSTEM ARCHITECTURE DIAGRAM */}
      <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Transparent Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How PFIS Processes Healthcare Access Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A clean decoupled pipeline separating presentation, deterministic intelligence engines, simulation models, and storage adapters.
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-2">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Layer 1</span>
              <h4 className="font-extrabold text-sm text-slate-900">Frontend App</h4>
              <p className="text-[11px] text-slate-600">React • TypeScript • Tailwind CSS • Lucide • Recharts</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Layer 2</span>
              <h4 className="font-extrabold text-sm text-slate-900">REST API Gateway</h4>
              <p className="text-[11px] text-slate-600">Node.js • Express • OpenAPI 3.0 • Rate Limiting</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-2">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Layer 3</span>
              <h4 className="font-extrabold text-sm text-slate-900">Intelligence Engine</h4>
              <p className="text-[11px] text-slate-600">Deterministic Weighted Scoring • Synergy Matrix • Knapsack</p>
            </div>
            <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-200 space-y-2">
              <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider">Layer 4</span>
              <h4 className="font-extrabold text-sm text-slate-900">Simulation Engine</h4>
              <p className="text-[11px] text-slate-600">Digital Twins • 5-Stage Funnel Transition • Intervention Models</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Layer 5</span>
              <h4 className="font-extrabold text-sm text-slate-900">Data & Storage</h4>
              <p className="text-[11px] text-slate-600">PostgreSQL • MongoDB • Embedded SQL • OpenStreetMap</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="font-semibold text-slate-700">Supported Map & Geo Stack:</span>
            <div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg">OpenStreetMap Nominatim</span>
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg">Leaflet / MapLibre</span>
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg">Local Haversine Fallback</span>
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg">Optional Google Maps Adapter</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. OPEN SOURCE EVERYTHING SECTION */}
      <section id="quickstart" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Freedom From Vendor Lock-In</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Everything You Need to Run PFIS Yourself
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Designed from day one to be self-hostable in under two minutes with zero required cloud accounts or proprietary subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="p-2 w-fit rounded-lg bg-teal-50 text-teal-700">
              <Terminal className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Quick Start (Without Docker)</h4>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs space-y-1 overflow-x-auto">
              <p className="text-slate-400"># Clone & install</p>
              <p>git clone https://github.com/satyamhq/Patient-Friction-Intelligence-System.git</p>
              <p>npm run install:all</p>
              <p className="text-slate-400 pt-1"># Start dev environment</p>
              <p className="text-teal-400">npm run dev</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="p-2 w-fit rounded-lg bg-cyan-50 text-cyan-700">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Docker-First Deployment</h4>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs space-y-1 overflow-x-auto">
              <p className="text-slate-400"># Single command startup</p>
              <p className="text-teal-400">docker compose up -d</p>
              <p className="text-slate-400 pt-2"># View platform</p>
              <p>http://localhost:5000</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="p-2 w-fit rounded-lg bg-indigo-50 text-indigo-700">
              <FileCode2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Open API & Extensibility</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard OpenAPI 3.0 endpoints, fully documented in <code className="text-slate-800 font-mono">openapi/openapi.yaml</code>.
              Pluggable adapters for AI (Ollama/OpenAI), Storage (MinIO/Local), and Maps (OSM/Google).
            </p>
            <div className="pt-2">
              <Link to="/api" className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1">
                Explore OpenAPI Specification →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. DATA SAFETY & HEALTHCARE DISCLAIMER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 bg-slate-100 rounded-3xl border border-slate-200 space-y-3 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Lock className="w-4 h-4 text-teal-700" />
            <span>Healthcare Data Privacy & Non-Clinical Intelligence Scope</span>
          </div>
          <p>
            <strong>Synthetic Data Guarantee:</strong> All patient profiles, locations, and journey records presented
            in this demonstration are mathematically generated synthetic data. Zero real Protected Health Information (PHI)
            is collected or stored in the public repository.
          </p>
          <p>
            <strong>Non-Clinical Scope:</strong> The Patient Friction Intelligence System (PFIS) is an operational research,
            systems engineering, and health-equity simulation platform. It models non-clinical logistical and socioeconomic
            barriers to care (transit distance, travel fares, digital access, clinic timing). It does not provide medical diagnoses,
            clinical treatment advice, or predict physiological outcomes.
          </p>
        </div>
      </section>

      {/* 9. ROLE PORTALS OPTIONAL ACCESS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Operational Role Portals (For Organization Deployments)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                For organizations running an operational deployment, dedicated role experiences remain fully supported:
              </p>
            </div>
            <Link to="/login" className="text-xs font-bold text-teal-700 hover:underline shrink-0">
              Sign in to Portal →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <Link
              to="/patient/dashboard"
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200 text-left transition-all group"
            >
              <p className="text-xs font-bold text-slate-900">Patient Portal</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Appointments & records</p>
            </Link>
            <Link
              to="/doctor/dashboard"
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200 text-left transition-all group"
            >
              <p className="text-xs font-bold text-slate-900">Doctor Desk</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Consultation & review</p>
            </Link>
            <Link
              to="/asha/dashboard"
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200 text-left transition-all group"
            >
              <p className="text-xs font-bold text-slate-900">ASHA Worker</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Village health visits</p>
            </Link>
            <Link
              to="/hospital/dashboard"
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200 text-left transition-all group"
            >
              <p className="text-xs font-bold text-slate-900">Hospital Facility</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Queue & referrals</p>
            </Link>
            <Link
              to="/government/dashboard"
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200 text-left transition-all group"
            >
              <p className="text-xs font-bold text-slate-900">Government</p>
              <p className="text-[10px] text-slate-500 mt-0.5">District health stats</p>
            </Link>
            <Link
              to="/admin/dashboard"
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200 text-left transition-all group"
            >
              <p className="text-xs font-bold text-slate-900">Admin Intelligence</p>
              <p className="text-[10px] text-slate-500 mt-0.5">System administration</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
