import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import { Button } from '../../components/common/Button';
import { CompletionGauge } from '../../components/charts/CompletionGauge';
import { TTSButton } from '../../components/common/TTSButton';
import {
  Activity,
  Sparkles,
  MapPin,
  Bus,
  Building2,
  Stethoscope,
  Pill,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  Pause,
  ShieldAlert,
  Users2,
  Laptop,
  Coins,
  ArrowRight,
  FileCheck2,
  Languages,
} from 'lucide-react';

interface JourneyStep {
  id: number;
  title: string;
  stageName: string;
  description: string;
  baseFriction: string;
  mitigatedBy: string;
  icon: any;
  status: 'pending' | 'active' | 'passed' | 'failed';
  failureReason?: string;
}

export const DigitalTwinSimulator: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Patient Profile State for Digital Twin
  const [patientName, setPatientName] = useState('Sunita Devi (Digital Twin)');
  const [distanceKm, setDistanceKm] = useState(65);
  const [transportAccess, setTransportAccess] = useState<'none' | 'low' | 'moderate' | 'high'>('low');
  const [digitalLiteracy, setDigitalLiteracy] = useState<'none' | 'basic' | 'moderate' | 'high'>('none');
  const [familySupport, setFamilySupport] = useState<'none' | 'low' | 'moderate' | 'high'>('low');
  const [wageCommitment, setWageCommitment] = useState<'inflexible_daily_wage' | 'rigid_hours' | 'flexible'>('inflexible_daily_wage');
  const [docReadiness, setDocReadiness] = useState<'incomplete' | 'partial' | 'complete'>('partial');

  // Active Interventions Toggles
  const [hasTransportShuttle, setHasTransportShuttle] = useState(false);
  const [hasSatelliteDiagnostics, setHasSatelliteDiagnostics] = useState(false);
  const [hasAshaEscort, setHasAshaEscort] = useState(false);
  const [hasTeleconsultation, setHasTeleconsultation] = useState(false);
  const [hasMedicineDelivery, setHasMedicineDelivery] = useState(false);
  const [hasVoiceIVR, setHasVoiceIVR] = useState(false);
  const [hasOfflineDesk, setHasOfflineDesk] = useState(false);

  // Simulation Timeline State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [simulationOutcome, setSimulationOutcome] = useState<'IN_PROGRESS' | 'COMPLETED' | 'LEAKED_DROPOUT'>('IN_PROGRESS');

  // Dynamic Metrics Calculation
  const calculateProbability = () => {
    let score = 30; // base for rural constrained
    if (distanceKm < 20) score += 20;
    else if (distanceKm < 40) score += 10;

    if (transportAccess === 'high') score += 25;
    else if (transportAccess === 'moderate') score += 15;
    else if (transportAccess === 'low') score += 5;

    if (familySupport === 'high') score += 15;
    else if (familySupport === 'moderate') score += 8;

    if (digitalLiteracy === 'high') score += 10;
    else if (digitalLiteracy === 'moderate') score += 5;

    if (wageCommitment === 'flexible') score += 10;

    // Apply Active Interventions
    if (hasTransportShuttle) score += 26;
    if (hasSatelliteDiagnostics) score += 18;
    if (hasAshaEscort) score += 14;
    if (hasTeleconsultation) score += 12;
    if (hasMedicineDelivery) score += 8;
    if (hasVoiceIVR) score += 7;
    if (hasOfflineDesk) score += 6;

    return Math.min(96, Math.max(12, score));
  };

  const completionProb = calculateProbability();

  // Steps in Virtual Healthcare Journey
  const journeySteps: JourneyStep[] = [
    {
      id: 1,
      title: '1. Home Origin & Triage',
      stageName: 'Referral & Token Booking',
      description: 'Patient experiences chronic symptoms at home and seeks initial hospital intake.',
      baseFriction: digitalLiteracy === 'none' ? 'Cannot use mobile slot booking app' : 'Standard digital slot booked',
      mitigatedBy: hasVoiceIVR || hasAshaEscort ? 'Voice IVR / ASHA booked token locally' : 'None',
      icon: MapPin,
      status: currentStepIndex > 0 ? 'passed' : currentStepIndex === 0 ? 'active' : 'pending',
    },
    {
      id: 2,
      title: '2. Transit & Travel Route',
      stageName: 'Geographic Transit (65 km)',
      description: 'Navigating rural roads to reach the district hospital with irregular bus timings.',
      baseFriction: !hasTransportShuttle && transportAccess !== 'high' ? 'No direct bus; 3-hour walk / costly shared auto' : 'Shuttle connected',
      mitigatedBy: hasTransportShuttle ? 'Scheduled Community Health Shuttle provided' : 'None',
      icon: Bus,
      status: currentStepIndex > 1 ? 'passed' : currentStepIndex === 1 ? 'active' : 'pending',
    },
    {
      id: 3,
      title: '3. Hospital Intake & Registration',
      stageName: 'Queue & Token Verification',
      description: 'Physical OPD registration, Ayushman Bharat scheme verification, and department queue.',
      baseFriction: docReadiness === 'incomplete' && !hasOfflineDesk ? 'Physical card missing; queue token exhausted' : 'Verified',
      mitigatedBy: hasOfflineDesk || hasAshaEscort ? 'ASHA Escort navigated queues & verified scheme' : 'None',
      icon: Building2,
      status: currentStepIndex > 2 ? 'passed' : currentStepIndex === 2 ? 'active' : 'pending',
    },
    {
      id: 4,
      title: '4. Diagnostic Investigations',
      stageName: 'Pathology & Digital X-Ray',
      description: 'Specialist orders baseline blood tests and chest imaging before prescribing treatment.',
      baseFriction: !hasSatelliteDiagnostics ? 'Lab reports require 2-day return trip back to city' : 'PoC tests conducted',
      mitigatedBy: hasSatelliteDiagnostics ? 'Point-of-Care satellite diagnostic camp provided instant report' : 'None',
      icon: Activity,
      status: currentStepIndex > 3 ? 'passed' : currentStepIndex === 3 ? 'active' : 'pending',
    },
    {
      id: 5,
      title: '5. Doctor Consultation',
      stageName: 'Clinical Specialist Review',
      description: 'Consultation with Cardiology/Orthopedic specialist for diagnosis & prescription.',
      baseFriction: wageCommitment === 'inflexible_daily_wage' && !hasTeleconsultation ? 'Morning clinic clashes with daily wage work' : 'Completed',
      mitigatedBy: hasTeleconsultation ? 'Teleconsultation triage completed seamlessly' : 'None',
      icon: Stethoscope,
      status: currentStepIndex > 4 ? 'passed' : currentStepIndex === 4 ? 'active' : 'pending',
    },
    {
      id: 6,
      title: '6. Medicine Delivery & Adherence',
      stageName: 'Pharmacy Fulfillment',
      description: 'Receiving 60-day maintenance hypertension/cardiac prescription medicines.',
      baseFriction: !hasMedicineDelivery ? 'Pharmacy queue exhausted; out-of-pocket high cost' : 'Delivered to doorstep',
      mitigatedBy: hasMedicineDelivery ? 'Essential postal medicine delivery dispatched' : 'None',
      icon: Pill,
      status: currentStepIndex > 5 ? 'passed' : currentStepIndex === 5 ? 'active' : 'pending',
    },
    {
      id: 7,
      title: '7. 30-Day Follow-up & Care Completed',
      stageName: 'Full Journey Completion',
      description: 'Patient successfully adheres to care protocol without premature dropout.',
      baseFriction: 'Post-treatment abandonment',
      mitigatedBy: 'Complete Community Care Continuum',
      icon: CheckCircle2,
      status: currentStepIndex > 6 ? 'passed' : currentStepIndex === 6 ? 'active' : 'pending',
    },
  ];

  // Simulation Loop
  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= journeySteps.length - 1) {
            setIsRunning(false);
            setSimulationOutcome(completionProb >= 60 ? 'COMPLETED' : 'LEAKED_DROPOUT');
            return prev;
          }

          // Check for dropouts during step 2 (transit) or step 4 (diagnostics)
          if (prev === 1 && !hasTransportShuttle && transportAccess === 'none' && Math.random() > 0.4) {
            setIsRunning(false);
            setSimulationOutcome('LEAKED_DROPOUT');
            setSimulationLog((l) => [...l, '⚠️ [DROPOUT at Step 2] Patient abandoned journey due to lack of transport & 65km distance barrier.']);
            return prev;
          }

          if (prev === 3 && !hasSatelliteDiagnostics && docReadiness === 'incomplete' && Math.random() > 0.5) {
            setIsRunning(false);
            setSimulationOutcome('LEAKED_DROPOUT');
            setSimulationLog((l) => [...l, '⚠️ [DROPOUT at Step 4] Patient could not afford repeat diagnostic trip to city center.']);
            return prev;
          }

          const next = prev + 1;
          setSimulationLog((l) => [...l, `✅ [Step ${next}] ${journeySteps[next].title} successfully navigated.`]);
          return next;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isRunning, completionProb, hasTransportShuttle, hasSatelliteDiagnostics, docReadiness, transportAccess]);

  const handleStartSimulation = () => {
    setCurrentStepIndex(0);
    setSimulationOutcome('IN_PROGRESS');
    setSimulationLog(['🚀 Starting Virtual Patient Digital Twin Journey Simulation...']);
    setIsRunning(true);
  };

  const handleResetSimulation = () => {
    setIsRunning(false);
    setCurrentStepIndex(0);
    setSimulationOutcome('IN_PROGRESS');
    setSimulationLog([]);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-tr from-slate-900 via-navy-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 text-teal-300 text-xs font-bold border border-teal-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>PFIS Core Engine: Friction Digital Twin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Patient Friction Digital Twin Simulator
            </h1>
            <p className="text-xs text-slate-300">
              Simulate a real-world virtual patient journey through healthcare barriers, testing practical interventions in real time
            </p>
          </div>

          <div className="flex items-center gap-2">
            <TTSButton
              text={`Patient Friction Digital Twin Simulator. Current estimated care completion probability is ${completionProb} percent.`}
            />
            <Button
              variant="outline"
              size="sm"
              className="text-slate-900 bg-white hover:bg-slate-100"
              onClick={handleResetSimulation}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Simulation
            </Button>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="p-3 bg-slate-800/90 rounded-xl text-xs text-slate-300 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>
            <strong className="text-teal-300">Non-Clinical Digital Twin:</strong> Models socio-geographic,
            transit, and operational bottlenecks. Does NOT model disease pathophysiology or medical outcomes.
          </span>
        </div>
      </div>

      {/* 2-Column: Left (Twin Parameters & Interventions) | Right (Live Gauge & Journey Stepper) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Patient Parameters & Interventions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Virtual Patient Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-sm">
                  👤
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{patientName}</h3>
                  <p className="text-[11px] text-slate-500">Virtual Patient Parameters</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                60 Yrs • Rural
              </span>
            </div>

            {/* Config Sliders & Selectors */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Distance to Hospital:</span>
                  <span className="text-teal-700 dark:text-teal-400 font-bold">{distanceKm} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Transport:</label>
                  <select
                    value={transportAccess}
                    onChange={(e: any) => setTransportAccess(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="none">None / Walk</option>
                    <option value="low">Low (Infrequent Bus)</option>
                    <option value="moderate">Moderate Public Transit</option>
                    <option value="high">Personal Vehicle</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Digital Literacy:</label>
                  <select
                    value={digitalLiteracy}
                    onChange={(e: any) => setDigitalLiteracy(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="none">None (Feature Phone)</option>
                    <option value="basic">Basic Smartphone</option>
                    <option value="moderate">Moderate Literacy</option>
                    <option value="high">Self-Sufficient</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Family Support:</label>
                  <select
                    value={familySupport}
                    onChange={(e: any) => setFamilySupport(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="none">Lives Alone</option>
                    <option value="low">Caregiver Constrained</option>
                    <option value="moderate">Weekend Support</option>
                    <option value="high">Dedicated Escort</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Wage Timing:</label>
                  <select
                    value={wageCommitment}
                    onChange={(e: any) => setWageCommitment(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="inflexible_daily_wage">Daily Wage Loss</option>
                    <option value="rigid_hours">Rigid Shift</option>
                    <option value="flexible">Flexible Timing</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Practical Interventions Toggles */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Deploy Practical Interventions
              </h3>
              <span className="text-[10px] text-teal-600 font-bold">Toggle to Mitigate</span>
            </div>

            <div className="space-y-2 text-xs">
              <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                hasTransportShuttle ? 'bg-teal-50/80 border-teal-300 dark:bg-teal-950/40 dark:border-teal-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Community Health Shuttle</span>
                    <span className="text-[10px] text-slate-500">Fixed-schedule rural mini-bus</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasTransportShuttle}
                  onChange={(e) => setHasTransportShuttle(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>

              <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                hasSatelliteDiagnostics ? 'bg-teal-50/80 border-teal-300 dark:bg-teal-950/40 dark:border-teal-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Point-of-Care Diagnostic Camp</span>
                    <span className="text-[10px] text-slate-500">Satellite mobile blood tests & X-ray</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasSatelliteDiagnostics}
                  onChange={(e) => setHasSatelliteDiagnostics(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>

              <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                hasAshaEscort ? 'bg-teal-50/80 border-teal-300 dark:bg-teal-950/40 dark:border-teal-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Dedicated ASHA Worker Escort</span>
                    <span className="text-[10px] text-slate-500">Queue navigation & scheme guidance</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasAshaEscort}
                  onChange={(e) => setHasAshaEscort(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>

              <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                hasTeleconsultation ? 'bg-teal-50/80 border-teal-300 dark:bg-teal-950/40 dark:border-teal-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Village Teleconsultation Kiosk</span>
                    <span className="text-[10px] text-slate-500">Video triage to avoid physical travel</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasTeleconsultation}
                  onChange={(e) => setHasTeleconsultation(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>

              <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                hasMedicineDelivery ? 'bg-teal-50/80 border-teal-300 dark:bg-teal-950/40 dark:border-teal-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Home Essential Drug Delivery</span>
                    <span className="text-[10px] text-slate-500">Postal 60-day prescription delivery</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasMedicineDelivery}
                  onChange={(e) => setHasMedicineDelivery(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Live Gauge, Journey Timeline & Live Log */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Digital Twin Gauge & Simulation Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-1 flex justify-center">
                <CompletionGauge
                  score={completionProb}
                  size={160}
                  label="Care Completion"
                  sublabel="Digital Twin Index"
                />
              </div>

              <div className="sm:col-span-2 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Simulation Status:</span>
                  <span className={`px-2.5 py-1 rounded-full font-black ${
                    simulationOutcome === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : simulationOutcome === 'LEAKED_DROPOUT'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {simulationOutcome === 'COMPLETED'
                      ? '✅ Care Completed Successfully'
                      : simulationOutcome === 'LEAKED_DROPOUT'
                      ? '🔴 Care Leakage Dropout Detected'
                      : isRunning
                      ? '⏳ Simulating Healthcare Journey...'
                      : 'Ready to Run'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Forecast: {completionProb >= 70 ? 'High Completion Likelihood' : completionProb >= 45 ? 'Moderate Risk of Drop-out' : 'High Operational Leakage Risk'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {hasTransportShuttle && hasSatelliteDiagnostics
                      ? 'Active transport shuttle and satellite diagnostics remove 84% of transit friction, enabling successful journey completion.'
                      : 'Without transport and diagnostic mitigation, patient has high probability of dropping out before prescription fulfillment.'}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    onClick={handleStartSimulation}
                    disabled={isRunning}
                    icon={isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  >
                    {isRunning ? 'Running Journey...' : 'Run Live Virtual Journey'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Virtual Patient Journey Timeline Stepper */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                Virtual Healthcare Journey Pathway (7 Milestones)
              </h3>
              <span className="text-[11px] text-slate-400">Step {currentStepIndex + 1} of 7</span>
            </div>

            <div className="space-y-3">
              {journeySteps.map((step, idx) => {
                const Icon = step.icon;
                const isCurrent = currentStepIndex === idx && isRunning;
                const isPassed = currentStepIndex > idx || simulationOutcome === 'COMPLETED';
                const isFailed = simulationOutcome === 'LEAKED_DROPOUT' && currentStepIndex === idx;

                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 text-xs ${
                      isCurrent
                        ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-400 ring-2 ring-teal-500/20 shadow-sm'
                        : isPassed
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                        : isFailed
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300'
                        : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-70'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                        isPassed
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : isFailed
                          ? 'bg-rose-600 text-white border-rose-700'
                          : isCurrent
                          ? 'bg-teal-600 text-white border-teal-700 animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 dark:text-white">{step.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          isPassed
                            ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950'
                            : isFailed
                            ? 'text-rose-700 bg-rose-100 dark:bg-rose-950'
                            : isCurrent
                            ? 'text-teal-700 bg-teal-100 dark:bg-teal-950'
                            : 'text-slate-400'
                        }`}>
                          {isPassed ? 'PASSED' : isFailed ? 'DROPOUT' : isCurrent ? 'NAVIGATING...' : 'PENDING'}
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">{step.description}</p>

                      <div className="pt-1 flex items-center gap-3 text-[10px]">
                        <span className="text-slate-500">
                          <strong>Active Friction:</strong> {step.baseFriction}
                        </span>
                        {step.mitigatedBy !== 'None' && (
                          <span className="text-teal-700 dark:text-teal-300 font-bold">
                            ✨ Mitigated by: {step.mitigatedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Journey Event Log */}
            {simulationLog.length > 0 && (
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1 max-h-32 overflow-y-auto">
                <div className="text-[10px] text-teal-400 uppercase font-bold tracking-wider">
                  Digital Twin Real-Time Telemetry Log:
                </div>
                {simulationLog.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
