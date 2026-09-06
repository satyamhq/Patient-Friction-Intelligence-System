import React, { useState } from 'react';
import {
  Stethoscope,
  AlertCircle,
  PhoneCall,
  Clock,
  MapPin,
  Ambulance,
  Volume2,
  Sparkles,
  Baby,
  HeartPulse,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { offlineDb } from '../../offline/db';
import { syncManager } from '../../offline/syncManager';
import api from '../../services/api';

interface AshaTriageWizardProps {
  onComplete?: () => void;
}

export const AshaTriageWizard: React.FC<AshaTriageWizardProps> = ({ onComplete }) => {
  const [patientName, setPatientName] = useState('Sunita Devi');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState('Female');
  const [isPregnant, setIsPregnant] = useState(true);
  const [chiefComplaint, setChiefComplaint] = useState('Severe headache with blurry vision in 3rd trimester');
  const [systolicBP, setSystolicBP] = useState('155');
  const [diastolicBP, setDiastolicBP] = useState('98');
  const [selectedDangerSigns, setSelectedDangerSigns] = useState<string[]>([
    'Severe persistent headache',
    'Pedal edema (Swollen feet/face)',
  ]);
  const [selectedCategory, setSelectedCategory] = useState<'MATERNAL' | 'CHILD' | 'CARDIAC' | 'GENERAL'>('MATERNAL');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Category based danger sign options
  const dangerOptionsByCategory = {
    MATERNAL: [
      { id: 'mat-1', label: 'Severe persistent headache', redFlag: true },
      { id: 'mat-2', label: 'Pedal edema (Swollen feet/face)', redFlag: false },
      { id: 'mat-3', label: 'Vaginal bleeding or watery discharge', redFlag: true },
      { id: 'mat-4', label: 'Decreased or absent fetal movements', redFlag: true },
      { id: 'mat-5', label: 'Severe upper abdominal pain / Vomiting', redFlag: true },
      { id: 'mat-6', label: 'Convulsions / Fits', redFlag: true },
    ],
    CHILD: [
      { id: 'ch-1', label: 'Chest indrawing / Rapid breathing', redFlag: true },
      { id: 'ch-2', label: 'Inability to breastfeed or drink', redFlag: true },
      { id: 'ch-3', label: 'Severe watery diarrhea with sunken eyes', redFlag: true },
      { id: 'ch-4', label: 'Lethargy or unconsciousness', redFlag: true },
      { id: 'ch-5', label: 'High fever for more than 3 days', redFlag: false },
      { id: 'ch-6', label: 'Stridor or wheezing while calm', redFlag: true },
    ],
    CARDIAC: [
      { id: 'card-1', label: 'Crushing chest pain radiating to left arm/jaw', redFlag: true },
      { id: 'card-2', label: 'Severe acute shortness of breath at rest', redFlag: true },
      { id: 'card-3', label: 'Sudden weakness on one side of face/body', redFlag: true },
      { id: 'card-4', label: 'Fainting / Syncope episode', redFlag: true },
      { id: 'card-5', label: 'Irregular palpitations with dizziness', redFlag: false },
    ],
    GENERAL: [
      { id: 'gen-1', label: 'Persistent high fever with chills', redFlag: false },
      { id: 'gen-2', label: 'Cough for more than 2 weeks (TB suspect)', redFlag: false },
      { id: 'gen-3', label: 'Chronic non-healing ulcer / wound', redFlag: false },
      { id: 'gen-4', label: 'Accidental trauma / Heavy bleeding', redFlag: true },
      { id: 'gen-5', label: 'Severe body dehydration', redFlag: false },
    ],
  };

  const toggleDangerSign = (label: string) => {
    if (selectedDangerSigns.includes(label)) {
      setSelectedDangerSigns(selectedDangerSigns.filter((s) => s !== label));
    } else {
      setSelectedDangerSigns([...selectedDangerSigns, label]);
    }
  };

  // TTS audio guidance
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Run Triage
  const handleRunTriage = async () => {
    setEvaluating(true);

    const payload = {
      patientName,
      age: parseInt(age) || 30,
      gender,
      isPregnant,
      chiefComplaint,
      vitals: {
        systolicBP: parseInt(systolicBP) || 120,
        diastolicBP: parseInt(diastolicBP) || 80,
      },
      dangerSigns: selectedDangerSigns,
      patientCoordinates: {
        latitude: 23.3644,
        longitude: 85.3411,
      },
    };

    try {
      // 1. Try online server evaluation
      const res = await api.post('/triage/evaluate', payload);
      if (res.data?.success) {
        setResult(res.data);
        speakText(res.data.triage.primaryRecommendation);
      }
    } catch {
      // 2. Offline deterministic fallback
      const hasEmergency = selectedDangerSigns.some((s) =>
        ['Chest indrawing', 'Vaginal bleeding', 'Crushing chest pain', 'Convulsions'].some((k) =>
          s.includes(k)
        )
      );

      const localResult = {
        success: true,
        triage: {
          urgency: hasEmergency ? 'EMERGENCY_108' : 'PHC_VISIT',
          confidenceScore: 0.94,
          primaryRecommendation: hasEmergency
            ? 'Emergency 108 Ambulance Dispatch Required — Immediate Hospital Transfer'
            : 'Primary Health Centre (PHC) Medical Officer Consultation Recommended',
          recommendedFacilityLevel: hasEmergency ? 'DISTRICT_HOSPITAL' : 'PRIMARY_HEALTH_CENTRE',
          actionableSteps: hasEmergency
            ? [
                'Call 108 ambulance hotline immediately',
                'Keep patient in semi-upright resting position',
                'Ensure family caregiver escorts patient with MCP card and past records',
              ]
            : [
                'Visit Angara Primary Health Centre between 9:00 AM - 1:00 PM',
                'Carry Ayushman Bharat ABHA card for fast-track OPD token',
                'Ensure adherence to salt-restricted diet and take prescribed IFA tablets',
              ],
        },
        routing: {
          selectedFacility: {
            name: hasEmergency ? 'Ranchi District Hospital' : 'Angara Primary Health Centre',
            distanceKm: hasEmergency ? 32 : 4.5,
            travelMinutes: hasEmergency ? 55 : 15,
            doctorsOnDuty: hasEmergency ? 12 : 2,
          },
          transportAdvice: hasEmergency
            ? 'Free emergency transit guaranteed under National Ambulance Service (NAS 108).'
            : 'Shared rural auto available from village market chowk every 30 minutes.',
          estimatedWaitMinutes: 20,
        },
      };

      setResult(localResult);
      speakText(localResult.triage.primaryRecommendation);
    } finally {
      // Record locally in IndexedDB
      await offlineDb.triageAssessments.put({
        id: 'tri-' + Date.now().toString(36),
        patientName,
        urgency: result?.triage?.urgency || 'PHC_VISIT',
        chiefComplaint,
        recommendation: result?.triage?.primaryRecommendation || 'Consult MO',
        facilityLevel: result?.triage?.recommendedFacilityLevel || 'PHC',
        synced: navigator.onLine,
        createdAt: new Date().toISOString(),
      });

      // Queue sync
      await syncManager.enqueueMutation('TRIAGE_ASSESSMENT', payload);
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {!result ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6 text-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  डिजिटल लक्षण जांच (NHM Clinical Triage)
                </h2>
                <p className="text-xs text-slate-500">
                  Icon-guided, voice-assisted symptom evaluation for frontline workers.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => speakText('मरीज के मुख्य लक्षण और खतरे के निशान चुनें')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-xs text-teal-800 font-bold border border-teal-200 transition"
            >
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span>आवाज में सुनें</span>
            </button>
          </div>

          {/* 1. Category Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              श्रेणी चुनें (Select Category):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'MATERNAL', label: 'गर्भवती महिला (Pregnancy/ANC)', icon: HeartPulse, color: 'text-pink-600' },
                { id: 'CHILD', label: 'छोटा बच्चा (Child < 5y)', icon: Baby, color: 'text-amber-600' },
                { id: 'CARDIAC', label: 'दिल / सांस (Cardiac/Emergency)', icon: Activity, color: 'text-rose-600' },
                { id: 'GENERAL', label: 'सुगर / बीपी / सामान्य (NCD)', icon: Stethoscope, color: 'text-teal-600' },
              ].map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id as any);
                      setIsPregnant(cat.id === 'MATERNAL');
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${
                      active
                        ? 'bg-teal-50 border-teal-500 shadow-xs ring-2 ring-teal-500/20 text-teal-900'
                        : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${cat.color}`} />
                    <span className="text-xs font-bold leading-snug">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Basic Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">मरीज का नाम</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">उम्र (Age)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                रक्तचाप (Blood Pressure mmHg)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Sys 120"
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="text-slate-400">/</span>
                <input
                  type="number"
                  placeholder="Dia 80"
                  value={diastolicBP}
                  onChange={(e) => setDiastolicBP(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Danger Signs Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>खतरे के निशान (Danger Signs / Red Flags):</span>
              <span className="text-slate-500 font-normal lowercase">(लागू होने पर टिक करें)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dangerOptionsByCategory[selectedCategory].map((opt) => {
                const checked = selectedDangerSigns.includes(opt.label);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleDangerSign(opt.label)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                      checked
                        ? opt.redFlag
                          ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs font-semibold'
                          : 'bg-teal-50 border-teal-300 text-teal-900 shadow-2xs font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        checked ? 'bg-teal-600 border-teal-600 text-white font-bold text-[10px]' : 'border-slate-300'
                      }`}
                    >
                      {checked && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Action Button */}
          <div className="pt-3">
            <button
              type="button"
              disabled={evaluating}
              onClick={handleRunTriage}
              className="w-full py-4 rounded-2xl bg-teal-600 text-white font-extrabold text-sm shadow-xs hover:bg-teal-700 transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>
                {evaluating ? 'जांच हो रही है...' : 'मरीज की जांच करें (Run Triage Assessment)'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* TRIAGE RESULT CARD (4-TIER DISPLAY) */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6 text-slate-900">
          {/* Top Urgency Classification Banner */}
          <div
            className={`p-6 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
              result.triage.urgency === 'EMERGENCY_108'
                ? 'bg-rose-50 border-rose-200 text-rose-950 shadow-xs'
                : result.triage.urgency === 'PHC_VISIT'
                ? 'bg-amber-50 border-amber-200 text-amber-950 shadow-xs'
                : result.triage.urgency === 'TELECONSULT'
                ? 'bg-blue-50 border-blue-200 text-blue-950 shadow-xs'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-xs'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs shrink-0 ${
                  result.triage.urgency === 'EMERGENCY_108'
                    ? 'bg-rose-600 animate-pulse'
                    : result.triage.urgency === 'PHC_VISIT'
                    ? 'bg-amber-600'
                    : result.triage.urgency === 'TELECONSULT'
                    ? 'bg-blue-600'
                    : 'bg-emerald-600'
                }`}
              >
                {result.triage.urgency === 'EMERGENCY_108' ? (
                  <AlertCircle className="w-8 h-8" />
                ) : result.triage.urgency === 'TELECONSULT' ? (
                  <PhoneCall className="w-8 h-8" />
                ) : (
                  <Stethoscope className="w-8 h-8" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white border border-slate-200/80 text-slate-800 shadow-2xs">
                    {result.triage.urgency}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Confidence: {(result.triage.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {result.triage.primaryRecommendation}
                </h3>
              </div>
            </div>

            {result.triage.urgency === 'EMERGENCY_108' && (
              <a
                href="tel:108"
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md flex items-center space-x-2 shrink-0 animate-bounce"
              >
                <Ambulance className="w-5 h-5" />
                <span>108 एम्बुलेंस बुलाएं (Call 108)</span>
              </a>
            )}
          </div>

          {/* Clinical Rationale & Action Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                आवश्यक कदम (Actionable Steps)
              </span>
              <ul className="space-y-2 text-xs text-slate-700">
                {result.triage.actionableSteps?.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-teal-600 font-bold">✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Routed Facility Information */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                अनुशंसित स्वास्थ्य केंद्र (Recommended Facility)
              </span>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-base">
                  {result.routing.selectedFacility.name}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>{result.routing.selectedFacility.distanceKm} km दूर (~{result.routing.selectedFacility.travelMinutes} मिनट यात्रा)</span>
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>प्रतीक्षा समय: ~{result.routing.estimatedWaitMinutes} मिनट (Duty Doctors: {result.routing.selectedFacility.doctorsOnDuty})</span>
                </p>
                <div className="mt-3 p-2.5 rounded-xl bg-white text-[11px] text-slate-700 border border-slate-200">
                  <strong className="text-slate-900">यातायात सुझाव:</strong> {result.routing.transportAdvice}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Button Tray */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setResult(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition"
            >
              ← पुनः जांच करें (New Triage)
            </button>

            {onComplete && (
              <button
                onClick={onComplete}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>जांच पूर्ण (Complete)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
